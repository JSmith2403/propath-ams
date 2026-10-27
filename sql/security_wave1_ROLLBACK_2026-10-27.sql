-- ============================================================================
-- ROLLBACK for security_wave1_close_open_tables_2026-10-27.sql
-- Puts the OLD open rules back (everything reachable with the public key again).
-- Only use this if the coach app or athlete app breaks and you need it working *right now*;
-- tell Claude what broke so the proper rule can be fixed instead.
-- mf_* anonymous rules are not restored (nothing in the app uses those tables).
-- ============================================================================
BEGIN;

DROP POLICY IF EXISTS athletes_staff_all ON public.athletes;
DROP POLICY IF EXISTS athletes_provider_select ON public.athletes;
DROP POLICY IF EXISTS athletes_provider_update ON public.athletes;
GRANT ALL ON public.athletes TO anon;
CREATE POLICY allow_all ON public.athletes FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS sessions_staff_all ON public.sessions;
DROP POLICY IF EXISTS sessions_provider_select ON public.sessions;
GRANT ALL ON public.sessions TO anon;
CREATE POLICY allow_all ON public.sessions FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS app_settings_metrics_read ON public.app_settings;
DROP POLICY IF EXISTS app_settings_staff_all ON public.app_settings;
DROP POLICY IF EXISTS app_settings_provider_read ON public.app_settings;
GRANT ALL ON public.app_settings TO anon;
CREATE POLICY allow_all ON public.app_settings FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS provider_allocations_staff_all ON public.provider_allocations;
DROP POLICY IF EXISTS provider_allocations_own_select ON public.provider_allocations;
GRANT ALL ON public.provider_allocations TO anon;
ALTER TABLE public.provider_allocations DISABLE ROW LEVEL SECURITY;

COMMIT;
