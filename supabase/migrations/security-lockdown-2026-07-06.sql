-- ============================================================================
-- ProPath AMS — Security lockdown (2026-07-06 audit remediation)
-- Run the whole file in the Supabase SQL Editor. Idempotent.
--
-- WHAT THIS FIXES
--   1. Every table that previously had  allow_all FOR ALL TO public
--      USING (true)  loses that policy. Anyone with the anon key (which
--      ships in the JS bundle) could read AND write those tables.
--   2. athlete_app_tokens / wellness_tokens are no longer readable by
--      anon at all. Token validation moves to SECURITY DEFINER RPCs
--      (validate_athlete_token / validate_wellness_token) that return
--      only the row matching the token the caller already holds —
--      tokens are no longer enumerable.
--   3. Coach-authoring tables become staff-only (admin / co_admin via
--      user_roles). Shared content the athlete app renders becomes
--      anon READ-ONLY. Log tables the athlete app writes keep the
--      minimum anon write surface.
--
-- KNOWN INTERIM GAP (needs the token-exchange edge function, tracked
-- separately): anon can still read planned/log tables across athletes,
-- because an anon JWT carries no athlete identity for RLS to scope on.
-- This migration removes anon WRITE access everywhere it isn't needed
-- and all anon DELETE except the athlete's own set_logs editing flow.
--
-- After running: the coach app requires a real login even on localhost
-- unless you keep using the dev bypass with a local Supabase instance.
-- ============================================================================


-- ── 0. Helper: is the caller staff (admin / co_admin)? ──────────────────────
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'co_admin')
  );
$$;
REVOKE ALL ON FUNCTION public.is_staff() FROM public;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;


-- ── 1. Token-validation RPCs (replace anon SELECT on token tables) ──────────
-- Returns at most the single row matching the supplied token, plus the
-- athlete display fields the public pages need — so the athletes table
-- itself needs no anon policy.

CREATE OR REPLACE FUNCTION public.validate_athlete_token(p_token text)
RETURNS TABLE (
  athlete_id text, is_active boolean, name text, photo text, sport text,
  use_custom_wellness boolean, wellness_token text
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.athlete_id, t.is_active,
         a.data->>'name', a.data->>'photo', a.data->>'sport',
         COALESCE(t.use_custom_wellness, false),
         (SELECT w.token FROM wellness_tokens w
          WHERE w.athlete_id = t.athlete_id AND w.is_active = true
          LIMIT 1)
  FROM athlete_app_tokens t
  LEFT JOIN athletes a ON a.id = t.athlete_id
  WHERE t.token = p_token;
$$;
REVOKE ALL ON FUNCTION public.validate_athlete_token(text) FROM public;
GRANT EXECUTE ON FUNCTION public.validate_athlete_token(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.validate_wellness_token(p_token text)
RETURNS TABLE (athlete_id text, is_active boolean, name text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.athlete_id, t.is_active, a.data->>'name'
  FROM wellness_tokens t
  LEFT JOIN athletes a ON a.id = t.athlete_id
  WHERE t.token = p_token;
$$;
REVOKE ALL ON FUNCTION public.validate_wellness_token(text) FROM public;
GRANT EXECUTE ON FUNCTION public.validate_wellness_token(text) TO anon, authenticated;


-- ── 2. Drop EVERY existing policy on the tables we re-scope ─────────────────
-- (Removes the allow_all TO public policies and all the old anon grants.)
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'athlete_app_tokens','wellness_tokens',
        'programming_settings','athlete_calendar_events','training_blocks',
        'athlete_e1rm','vald_test_results',
        'block_templates','block_template_sessions','session_templates',
        'session_template_exercises','session_template_week_prescriptions',
        'training_phases','meal_events','wellness_questions',
        'exercise_library','planned_sessions','block_sessions',
        'session_exercises','session_sections','session_step_notes',
        'exercise_week_prescriptions','recipes','resource_items',
        'wellness_question_library','athlete_wellness_questions',
        'nutrition_settings','meal_structure_guidance',
        'session_logs','set_logs','meal_entries','meal_photos',
        'wellness_submissions','wellness_responses'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                   pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;


-- ── 3. Token tables — authenticated staff only, no anon access at all ───────
-- Every loop below skips tables that don't exist in this database —
-- the sql/ folder accumulated schemas over time and some (e.g. the old
-- wellness_questions) were later dropped or never created.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['athlete_app_tokens','wellness_tokens'] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY staff_all ON %I FOR ALL TO authenticated
       USING (public.is_staff()) WITH CHECK (public.is_staff())', t);
  END LOOP;
END $$;


-- ── 4. Coach-only tables — staff write, authenticated read ──────────────────
-- (External providers can read via the profile screens; only staff mutate.)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'programming_settings','athlete_calendar_events','training_blocks',
    'athlete_e1rm','vald_test_results',
    'block_templates','block_template_sessions','session_templates',
    'session_template_exercises','session_template_week_prescriptions',
    'training_phases','meal_events'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY auth_select ON %I FOR SELECT TO authenticated USING (true)', t);
    EXECUTE format(
      'CREATE POLICY staff_insert ON %I FOR INSERT TO authenticated WITH CHECK (public.is_staff())', t);
    EXECUTE format(
      'CREATE POLICY staff_update ON %I FOR UPDATE TO authenticated
       USING (public.is_staff()) WITH CHECK (public.is_staff())', t);
    EXECUTE format(
      'CREATE POLICY staff_delete ON %I FOR DELETE TO authenticated USING (public.is_staff())', t);
  END LOOP;
END $$;


-- ── 5. Shared content the athlete app renders — anon READ-ONLY ──────────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'exercise_library','planned_sessions','block_sessions',
    'session_exercises','session_sections','session_step_notes',
    'exercise_week_prescriptions','recipes','resource_items',
    'wellness_question_library','athlete_wellness_questions',
    'nutrition_settings','meal_structure_guidance'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY anon_select ON %I FOR SELECT TO anon USING (true)', t);
    EXECUTE format(
      'CREATE POLICY auth_select ON %I FOR SELECT TO authenticated USING (true)', t);
    EXECUTE format(
      'CREATE POLICY staff_insert ON %I FOR INSERT TO authenticated WITH CHECK (public.is_staff())', t);
    EXECUTE format(
      'CREATE POLICY staff_update ON %I FOR UPDATE TO authenticated
       USING (public.is_staff()) WITH CHECK (public.is_staff())', t);
    EXECUTE format(
      'CREATE POLICY staff_delete ON %I FOR DELETE TO authenticated USING (public.is_staff())', t);
  END LOOP;
END $$;


-- ── 6. Athlete-app log tables — anon insert/update, no delete ────────────────
-- (set_logs additionally allows delete: the session logger removes a set
--  row when the athlete deletes it mid-session.)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'session_logs','set_logs','meal_entries','meal_photos'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY anon_select ON %I FOR SELECT TO anon USING (true)', t);
    EXECUTE format(
      'CREATE POLICY anon_insert ON %I FOR INSERT TO anon WITH CHECK (true)', t);
    EXECUTE format(
      'CREATE POLICY anon_update ON %I FOR UPDATE TO anon USING (true) WITH CHECK (true)', t);
    EXECUTE format(
      'CREATE POLICY auth_all ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

DO $$
BEGIN
  IF to_regclass('public.set_logs') IS NOT NULL THEN
    CREATE POLICY anon_delete ON set_logs FOR DELETE TO anon USING (true);
  END IF;
END $$;


-- ── 7. Wellness submissions/responses — token-scoped anon access ────────────
DO $$
BEGIN
  IF to_regclass('public.wellness_submissions') IS NOT NULL THEN
    ALTER TABLE wellness_submissions ENABLE ROW LEVEL SECURITY;
    CREATE POLICY anon_select ON wellness_submissions FOR SELECT TO anon
      USING (token IN (SELECT token FROM wellness_tokens WHERE is_active = true));
    CREATE POLICY anon_insert ON wellness_submissions FOR INSERT TO anon
      WITH CHECK (token IN (SELECT token FROM wellness_tokens WHERE is_active = true));
    CREATE POLICY anon_update ON wellness_submissions FOR UPDATE TO anon
      USING (token IN (SELECT token FROM wellness_tokens WHERE is_active = true))
      WITH CHECK (token IN (SELECT token FROM wellness_tokens WHERE is_active = true));
    CREATE POLICY auth_all ON wellness_submissions FOR ALL TO authenticated
      USING (true) WITH CHECK (true);
  END IF;

  IF to_regclass('public.wellness_responses') IS NOT NULL THEN
    ALTER TABLE wellness_responses ENABLE ROW LEVEL SECURITY;
    CREATE POLICY anon_select ON wellness_responses FOR SELECT TO anon USING (true);
    CREATE POLICY anon_insert ON wellness_responses FOR INSERT TO anon WITH CHECK (true);
    CREATE POLICY anon_update ON wellness_responses FOR UPDATE TO anon
      USING (true) WITH CHECK (true);
    CREATE POLICY auth_all ON wellness_responses FOR ALL TO authenticated
      USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- POST-RUN CHECKLIST
--   • Storage buckets (recipe-images, resources): verify in Dashboard →
--     Storage → Policies that anon has at most SELECT; uploads staff-only.
--   • Smoke-test: /athlete/:token loads, logs a set, logs a meal, submits
--     wellness; coach app can still author programmes.
--   • Follow-up project: token-exchange edge function so anon reads are
--     scoped per-athlete instead of table-wide.
-- ============================================================================
