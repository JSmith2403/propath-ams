-- ============================================================================
-- SECURITY WAVE 1 — stop the public key reaching the core tables.   2026-10-27
-- APPLIED to live 2026-10-27 as migration 20261027084653.
-- Undo with: sql/security_wave1_ROLLBACK_2026-10-27.sql  (restores the old open rules)
--
-- FOUND (live DB, 27 Oct): `athletes`, `sessions` and `app_settings` still had the original
--   "allow_all  FOR ALL TO public  USING (true)"  rule from the very first schema, and
-- `provider_allocations` had row-level security switched off. With only the public key that
-- ships inside the website's JavaScript, anyone could read, change or delete every athlete
-- record (photo, notes, physio, injuries, psych, DOB…). A count-only request confirmed it:
-- athletes=17, sessions=7 reachable with no login.
--
-- WHY THIS IS SAFE (checked against the code):
--   athletes / sessions / provider_allocations  → only ever touched by coach/provider screens
--       (signed in) or by the server with the service key (which ignores these rules).
--       The athlete app never reads `athletes`; it uses validate_athlete_token / my_* functions.
--   app_settings → the athlete Progress tab still needs `custom_metrics` (metric labels), so that
--       ONE key stays readable by everyone; `providers` (staff names) becomes staff/provider-only.
--   mf_* → ten tables for the parked "mindset" feature, referenced by no code on master, yet
--       wide open to anonymous read/WRITE. Anonymous rules removed; data untouched.
--
-- Everything here is rules only — no rows are changed or deleted. Safe to re-run.
-- ============================================================================

BEGIN;

-- Helper: is the caller an external provider (physio etc.)?  (admin/co_admin = is_staff() already exists)
CREATE OR REPLACE FUNCTION public.is_provider()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'external');
$$;
REVOKE ALL ON FUNCTION public.is_provider() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_provider() TO authenticated;


-- ── athletes: coaches full control; allocated providers read + add notes ────
DROP POLICY IF EXISTS allow_all ON public.athletes;
DROP POLICY IF EXISTS athletes_staff_all ON public.athletes;
CREATE POLICY athletes_staff_all ON public.athletes
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS athletes_provider_select ON public.athletes;
CREATE POLICY athletes_provider_select ON public.athletes
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.provider_allocations pa WHERE pa.user_id = auth.uid() AND pa.athlete_id = athletes.id));

DROP POLICY IF EXISTS athletes_provider_update ON public.athletes;
CREATE POLICY athletes_provider_update ON public.athletes
  FOR UPDATE TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.provider_allocations pa WHERE pa.user_id = auth.uid() AND pa.athlete_id = athletes.id))
  WITH CHECK (EXISTS (SELECT 1 FROM public.provider_allocations pa WHERE pa.user_id = auth.uid() AND pa.athlete_id = athletes.id));

REVOKE ALL ON public.athletes FROM anon;


-- ── sessions (testing sessions): coaches full; providers read ───────────────
DROP POLICY IF EXISTS allow_all ON public.sessions;
DROP POLICY IF EXISTS sessions_staff_all ON public.sessions;
CREATE POLICY sessions_staff_all ON public.sessions
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS sessions_provider_select ON public.sessions;
CREATE POLICY sessions_provider_select ON public.sessions
  FOR SELECT TO authenticated USING (public.is_provider());

REVOKE ALL ON public.sessions FROM anon;


-- ── app_settings: custom_metrics stays public-read; everything else restricted ─
DROP POLICY IF EXISTS allow_all ON public.app_settings;
DROP POLICY IF EXISTS app_settings_metrics_read ON public.app_settings;
CREATE POLICY app_settings_metrics_read ON public.app_settings
  FOR SELECT TO anon, authenticated USING (key = 'custom_metrics');
DROP POLICY IF EXISTS app_settings_staff_all ON public.app_settings;
CREATE POLICY app_settings_staff_all ON public.app_settings
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS app_settings_provider_read ON public.app_settings;
CREATE POLICY app_settings_provider_read ON public.app_settings
  FOR SELECT TO authenticated USING (public.is_provider());

REVOKE INSERT, UPDATE, DELETE ON public.app_settings FROM anon;


-- ── provider_allocations: switch row-level security ON ──────────────────────
ALTER TABLE public.provider_allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS provider_allocations_staff_all ON public.provider_allocations;
CREATE POLICY provider_allocations_staff_all ON public.provider_allocations
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS provider_allocations_own_select ON public.provider_allocations;
CREATE POLICY provider_allocations_own_select ON public.provider_allocations
  FOR SELECT TO authenticated USING (user_id = auth.uid());

REVOKE ALL ON public.provider_allocations FROM anon;


-- ── mf_* (parked feature, unused by the live app): remove ANONYMOUS rules only ─
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename LIKE 'mf\_%' AND roles::text ~ 'anon'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

COMMIT;
