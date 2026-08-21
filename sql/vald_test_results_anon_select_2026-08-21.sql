-- vald_test_results_anon_select_2026-08-21.sql
-- ----------------------------------------------------------------------
-- A coach can pin a VALD-imported metric to the athlete's progress tab
-- the same way as any manual/custom one (same KPI tile toggle). Without
-- this, useVALDMetrics — reused as-is on the athlete-app side — would
-- silently return nothing for anon. Read-only, same trust model as
-- performance_test_results: private per-athlete token URL, app-layer
-- scoped by athlete_id.
-- ----------------------------------------------------------------------

DROP POLICY IF EXISTS vald_test_results_anon_select ON public.vald_test_results;
CREATE POLICY vald_test_results_anon_select ON public.vald_test_results
  FOR SELECT TO anon USING (true);

NOTIFY pgrst, 'reload schema';
