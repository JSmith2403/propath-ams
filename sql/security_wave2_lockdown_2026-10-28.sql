-- ============================================================================
-- SECURITY WAVE 2 — the public key gets nothing; athletes see only their own rows.     2026-10-28
--
-- What this does
--   1. BACKUP: every current rule is copied into ops_backup (a schema the API cannot see) and
--      ops_backup.restore_wave2() puts the old rules back in one call.
--   2. Athletes: each athlete (their own login) can read their own data and write only what the app lets them —
--      session logs + sets, meals + photos, water, wellness answers, their own goals, moving their own session,
--      their own attendance. Nothing of anyone else's. Coaches (is_staff) keep full access; allocated providers
--      keep read access to their athletes.
--   3. The public key (anon): every rule removed, every table privilege revoked, every function execute revoked.
--      The old private-link athlete app and the public wellness form stop working (by design — they need it).
--   4. Storage: meal photos only in the athlete's own folder (<athlete_id>/...); recipe images + resources are
--      staff-write. Public reading by URL for recipe images / resources is unchanged (public buckets).
--   5. set_session_attendance / set_water_daily_target now check the caller owns the athlete.
--
-- Undo:  SELECT ops_backup.restore_wave2();
-- ============================================================================

-- ── 0. Backup ───────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS ops_backup;
REVOKE ALL ON SCHEMA ops_backup FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS ops_backup.policies_before_wave2 AS
  SELECT schemaname, tablename, policyname, permissive, roles::text[] AS roles, cmd, qual, with_check
  FROM pg_policies WHERE schemaname IN ('public', 'storage');
CREATE TABLE IF NOT EXISTS ops_backup.anon_table_grants_before_wave2 AS
  SELECT table_name, privilege_type FROM information_schema.role_table_grants
  WHERE grantee = 'anon' AND table_schema = 'public';
REVOKE ALL ON ops_backup.policies_before_wave2, ops_backup.anon_table_grants_before_wave2 FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION ops_backup.restore_wave2() RETURNS void LANGUAGE plpgsql AS $fn$
DECLARE p record; r record; stmt text;
BEGIN
  FOR p IN SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname IN ('public', 'storage') LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
  END LOOP;
  FOR r IN SELECT * FROM ops_backup.policies_before_wave2 LOOP
    stmt := format('CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s', r.policyname, r.schemaname, r.tablename, r.permissive, r.cmd, array_to_string(r.roles, ', '));
    IF r.qual IS NOT NULL THEN stmt := stmt || ' USING (' || r.qual || ')'; END IF;
    IF r.with_check IS NOT NULL THEN stmt := stmt || ' WITH CHECK (' || r.with_check || ')'; END IF;
    EXECUTE stmt;
  END LOOP;
  FOR r IN SELECT * FROM ops_backup.anon_table_grants_before_wave2 LOOP
    EXECUTE format('GRANT %s ON public.%I TO anon', r.privilege_type, r.table_name);
  END LOOP;
  GRANT EXECUTE ON FUNCTION public.validate_athlete_token(text), public.validate_wellness_token(text),
                            public.set_session_attendance(uuid, text, text, text), public.set_water_daily_target(text, smallint) TO anon, authenticated;
  CREATE OR REPLACE FUNCTION public.set_session_attendance(p_planned_session_id uuid, p_athlete_id text, p_status text, p_note text DEFAULT NULL)
    RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $b$
  BEGIN
    IF p_status IS NOT NULL AND p_status NOT IN ('attending', 'not_attending') THEN RAISE EXCEPTION 'invalid attendance status'; END IF;
    UPDATE public.planned_sessions SET attendance = p_status,
      attendance_note = CASE WHEN p_status = 'not_attending' THEN NULLIF(btrim(p_note), '') ELSE NULL END,
      attendance_at = CASE WHEN p_status IS NULL THEN NULL ELSE now() END
    WHERE id = p_planned_session_id AND athlete_id = p_athlete_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'session not found for this athlete'; END IF;
  END; $b$;
  CREATE OR REPLACE FUNCTION public.set_water_daily_target(p_athlete_id text, p_target smallint)
    RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $b$
  BEGIN
    IF p_target < 1 OR p_target > 30 THEN RAISE EXCEPTION 'Target must be between 1 and 30 glasses'; END IF;
    INSERT INTO public.nutrition_settings (athlete_id, water_daily_target) VALUES (p_athlete_id, p_target)
    ON CONFLICT (athlete_id) DO UPDATE SET water_daily_target = EXCLUDED.water_daily_target, updated_at = now();
  END; $b$;
END $fn$;
REVOKE ALL ON FUNCTION ops_backup.restore_wave2() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION ops_backup.drop_policies(s text, t text) RETURNS void LANGUAGE plpgsql AS $fn$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = s AND tablename = t LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', p.policyname, s, t);
  END LOOP;
END $fn$;
REVOKE ALL ON FUNCTION ops_backup.drop_policies(text, text) FROM PUBLIC, anon, authenticated;

-- ── 1. Who-can-see helpers (definer functions so lookups don't recurse through the rules) ──
CREATE OR REPLACE FUNCTION public.owns_athlete(a text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT a IS NOT NULL AND a = public.my_athlete_id() $$;

CREATE OR REPLACE FUNCTION public.can_see_athlete(a text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a IS NOT NULL AND (
    public.is_staff() OR a = public.my_athlete_id()
    OR EXISTS (SELECT 1 FROM public.provider_allocations pa WHERE pa.user_id = auth.uid() AND pa.athlete_id = a));
$$;

CREATE OR REPLACE FUNCTION public.entry_athlete(e uuid) RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT athlete_id FROM public.meal_entries WHERE id = e $$;
CREATE OR REPLACE FUNCTION public.log_athlete(l uuid) RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT athlete_id FROM public.session_logs WHERE id = l $$;
CREATE OR REPLACE FUNCTION public.block_athlete(b uuid) RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT athlete_id FROM public.training_blocks WHERE id = b $$;
CREATE OR REPLACE FUNCTION public.bsession_athlete(bs uuid) RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tb.athlete_id FROM public.block_sessions s JOIN public.training_blocks tb ON tb.id = s.block_id WHERE s.id = bs $$;
CREATE OR REPLACE FUNCTION public.sexercise_athlete(se uuid) RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tb.athlete_id FROM public.session_exercises e JOIN public.block_sessions s ON s.id = e.block_session_id
  JOIN public.training_blocks tb ON tb.id = s.block_id WHERE e.id = se $$;

-- ── 2. Replace the rules on every table the app uses ───────────────────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'exercise_library','recipes','resource_items','meal_structures','meal_structure_guidance','wellness_question_library','training_phases','mf_modules','mf_module_steps',
    'session_templates','session_template_exercises','session_template_week_prescriptions','block_templates','block_template_sessions',
    'training_blocks','programming_settings','nutrition_settings','athlete_wellness_questions','vald_test_results','athlete_e1rm','performance_test_results','athlete_kpi_board','development_plans',
    'planned_sessions','session_logs','meal_entries','water_intake_logs','wellness_responses','wellness_submissions','goals','athlete_calendar_events',
    'meal_photos','meal_events','set_logs','block_sessions','session_exercises','session_sections','session_step_notes','exercise_week_prescriptions',
    'user_roles','push_subscriptions','app_settings'
  ] LOOP
    PERFORM ops_backup.drop_policies('public', t);
  END LOOP;
END $$;

-- Reference content: any ProPath account reads; staff write
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['exercise_library','recipes','resource_items','meal_structures','meal_structure_guidance','wellness_question_library','training_phases','mf_modules','mf_module_steps'] LOOP
    EXECUTE format('CREATE POLICY w2_read ON public.%I FOR SELECT TO authenticated USING (public.is_app_user())', t);
    EXECUTE format('CREATE POLICY w2_staff_write ON public.%I FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff())', t);
  END LOOP;
  -- Coach-only templates
  FOREACH t IN ARRAY ARRAY['session_templates','session_template_exercises','session_template_week_prescriptions','block_templates','block_template_sessions','push_subscriptions'] LOOP
    EXECUTE format('CREATE POLICY w2_staff_all ON public.%I FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff())', t);
  END LOOP;
  -- Athlete-owned, athlete reads own, staff write
  FOREACH t IN ARRAY ARRAY['training_blocks','programming_settings','nutrition_settings','athlete_wellness_questions','vald_test_results','athlete_e1rm','performance_test_results','athlete_kpi_board','development_plans'] LOOP
    EXECUTE format('CREATE POLICY w2_read ON public.%I FOR SELECT TO authenticated USING (public.can_see_athlete(athlete_id))', t);
    EXECUTE format('CREATE POLICY w2_staff_write ON public.%I FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff())', t);
  END LOOP;
  -- Athlete-owned, athlete also writes own (insert + update)
  FOREACH t IN ARRAY ARRAY['session_logs','meal_entries','water_intake_logs','wellness_responses','wellness_submissions'] LOOP
    EXECUTE format('CREATE POLICY w2_read ON public.%I FOR SELECT TO authenticated USING (public.can_see_athlete(athlete_id))', t);
    EXECUTE format('CREATE POLICY w2_staff_write ON public.%I FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff())', t);
    EXECUTE format('CREATE POLICY w2_own_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (public.owns_athlete(athlete_id))', t);
    EXECUTE format('CREATE POLICY w2_own_update ON public.%I FOR UPDATE TO authenticated USING (public.owns_athlete(athlete_id)) WITH CHECK (public.owns_athlete(athlete_id))', t);
  END LOOP;
  -- Programme content: reachable only through the athlete's own block
  CREATE POLICY w2_read ON public.block_sessions FOR SELECT TO authenticated USING (public.can_see_athlete(public.block_athlete(block_id)));
  FOREACH t IN ARRAY ARRAY['session_exercises','session_sections','session_step_notes'] LOOP
    EXECUTE format('CREATE POLICY w2_read ON public.%I FOR SELECT TO authenticated USING (public.can_see_athlete(public.bsession_athlete(block_session_id)))', t);
  END LOOP;
  CREATE POLICY w2_read ON public.exercise_week_prescriptions FOR SELECT TO authenticated USING (public.can_see_athlete(public.sexercise_athlete(session_exercise_id)));
  FOREACH t IN ARRAY ARRAY['block_sessions','session_exercises','session_sections','session_step_notes','exercise_week_prescriptions'] LOOP
    EXECUTE format('CREATE POLICY w2_staff_write ON public.%I FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff())', t);
  END LOOP;
END $$;

-- Planned sessions: athlete reads own, may move their own (and attendance), staff everything
CREATE POLICY w2_read ON public.planned_sessions FOR SELECT TO authenticated USING (public.can_see_athlete(athlete_id));
CREATE POLICY w2_staff_write ON public.planned_sessions FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY w2_own_update ON public.planned_sessions FOR UPDATE TO authenticated USING (public.owns_athlete(athlete_id)) WITH CHECK (public.owns_athlete(athlete_id));

-- Goals: athletes add / edit only their OWN goals on their own plan
CREATE POLICY w2_read ON public.goals FOR SELECT TO authenticated USING (public.can_see_athlete(athlete_id));
CREATE POLICY w2_staff_write ON public.goals FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY w2_own_insert ON public.goals FOR INSERT TO authenticated WITH CHECK (public.owns_athlete(athlete_id) AND owner = 'athlete');
CREATE POLICY w2_own_update ON public.goals FOR UPDATE TO authenticated USING (public.owns_athlete(athlete_id) AND owner = 'athlete') WITH CHECK (public.owns_athlete(athlete_id) AND owner = 'athlete');

-- Calendar: own events + team events
CREATE POLICY w2_read ON public.athlete_calendar_events FOR SELECT TO authenticated USING (public.can_see_athlete(athlete_id) OR (is_team_event IS TRUE AND public.is_app_user()));
CREATE POLICY w2_staff_write ON public.athlete_calendar_events FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Meals: photos + events hang off an entry
CREATE POLICY w2_read ON public.meal_photos FOR SELECT TO authenticated USING (public.can_see_athlete(public.entry_athlete(entry_id)));
CREATE POLICY w2_staff_write ON public.meal_photos FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY w2_own_insert ON public.meal_photos FOR INSERT TO authenticated WITH CHECK (public.owns_athlete(public.entry_athlete(entry_id)));
CREATE POLICY w2_own_update ON public.meal_photos FOR UPDATE TO authenticated USING (public.owns_athlete(public.entry_athlete(entry_id))) WITH CHECK (public.owns_athlete(public.entry_athlete(entry_id)));
CREATE POLICY w2_read ON public.meal_events FOR SELECT TO authenticated USING (public.can_see_athlete(public.entry_athlete(entry_id)));
CREATE POLICY w2_staff_write ON public.meal_events FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY w2_own_insert ON public.meal_events FOR INSERT TO authenticated WITH CHECK (public.owns_athlete(public.entry_athlete(entry_id)) AND event_type = 'submitted');

-- Logged sets hang off a session log
CREATE POLICY w2_read ON public.set_logs FOR SELECT TO authenticated USING (public.can_see_athlete(public.log_athlete(session_log_id)));
CREATE POLICY w2_staff_write ON public.set_logs FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY w2_own_insert ON public.set_logs FOR INSERT TO authenticated WITH CHECK (public.owns_athlete(public.log_athlete(session_log_id)));
CREATE POLICY w2_own_update ON public.set_logs FOR UPDATE TO authenticated USING (public.owns_athlete(public.log_athlete(session_log_id))) WITH CHECK (public.owns_athlete(public.log_athlete(session_log_id)));
CREATE POLICY w2_own_delete ON public.set_logs FOR DELETE TO authenticated USING (public.owns_athlete(public.log_athlete(session_log_id)));

-- Roles: your own row (coaches see all)
CREATE POLICY w2_read ON public.user_roles FOR SELECT TO authenticated USING (public.is_staff() OR user_id = (SELECT auth.uid()));

-- App settings: only the metric labels are shared; everything else staff / providers
CREATE POLICY w2_metrics_read ON public.app_settings FOR SELECT TO authenticated USING (key = 'custom_metrics' AND public.is_app_user());
CREATE POLICY w2_staff_all ON public.app_settings FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY w2_provider_read ON public.app_settings FOR SELECT TO authenticated USING (public.is_provider());

-- ── 3. Functions that took an athlete id now check who is calling ──────────
CREATE OR REPLACE FUNCTION public.set_session_attendance(p_planned_session_id uuid, p_athlete_id text, p_status text, p_note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT (public.is_staff() OR public.owns_athlete(p_athlete_id)) THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  IF p_status IS NOT NULL AND p_status NOT IN ('attending', 'not_attending') THEN RAISE EXCEPTION 'invalid attendance status'; END IF;
  UPDATE public.planned_sessions SET attendance = p_status,
    attendance_note = CASE WHEN p_status = 'not_attending' THEN NULLIF(btrim(p_note), '') ELSE NULL END,
    attendance_at = CASE WHEN p_status IS NULL THEN NULL ELSE now() END
  WHERE id = p_planned_session_id AND athlete_id = p_athlete_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'session not found for this athlete'; END IF;
END; $$;

CREATE OR REPLACE FUNCTION public.set_water_daily_target(p_athlete_id text, p_target smallint)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT (public.is_staff() OR public.owns_athlete(p_athlete_id)) THEN RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501'; END IF;
  IF p_target < 1 OR p_target > 30 THEN RAISE EXCEPTION 'Target must be between 1 and 30 glasses'; END IF;
  INSERT INTO public.nutrition_settings (athlete_id, water_daily_target) VALUES (p_athlete_id, p_target)
  ON CONFLICT (athlete_id) DO UPDATE SET water_daily_target = EXCLUDED.water_daily_target, updated_at = now();
END; $$;

-- ── 4. Storage ──────────────────────────────────────────────────────────────
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', p.policyname);
  END LOOP;
END $$;
CREATE POLICY w2_meal_photos ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'meal-photos' AND (public.is_staff() OR (storage.foldername(name))[1] = public.my_athlete_id()))
  WITH CHECK (bucket_id = 'meal-photos' AND (public.is_staff() OR (storage.foldername(name))[1] = public.my_athlete_id()));
CREATE POLICY w2_recipe_images ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'recipe-images' AND public.is_staff()) WITH CHECK (bucket_id = 'recipe-images' AND public.is_staff());
CREATE POLICY w2_resources ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'resources' AND public.is_staff()) WITH CHECK (bucket_id = 'resources' AND public.is_staff());

-- ── 5. Take the public key out for good ────────────────────────────────────
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT schemaname, tablename, policyname FROM pg_policies
           WHERE schemaname IN ('public', 'storage') AND (roles::text ~ 'anon' OR roles::text ~ 'public') LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
  END LOOP;
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.validate_athlete_token(text), public.validate_wellness_token(text) FROM authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon;
