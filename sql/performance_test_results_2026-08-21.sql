-- performance_test_results_2026-08-21.sql
-- ----------------------------------------------------------------------
-- Normalizes manual/session/custom-metric performance test results out
-- of the athletes.data JSONB blob (phase2.performance.entries) into a
-- proper table. Driven by the need to show a coach-curated set of KPIs
-- live on the athlete's own Progress tab — the athlete app runs as the
-- anon role and had no way to read individual results out of a
-- per-athlete blob it doesn't otherwise touch.
--
-- VALD-imported results already live in their own vald_test_results
-- table and are NOT part of this migration. Custom-metric *definitions*
-- stay in app_settings; only their result *entries* move here, using
-- the exact same shape as built-in metrics.
--
-- This is step 1 of a dual-write migration: the JSONB blob keeps being
-- written to as a safety net while reads cut over to this table. The
-- blob write path can be retired later once this has run clean for a
-- while.
-- ----------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.performance_test_results (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id  text NOT NULL
              REFERENCES public.athletes(id) ON DELETE CASCADE,
  metric_key  text NOT NULL,
  date        date NOT NULL,
  value       numeric,
  value_left  numeric,
  value_right numeric,
  session_id  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_performance_test_results_athlete_metric_date
  ON public.performance_test_results (athlete_id, metric_key, date DESC);

ALTER TABLE public.performance_test_results ENABLE ROW LEVEL SECURITY;

-- Coach app — full CRUD, same posture as vald_test_results / athlete_kpi_board.
DROP POLICY IF EXISTS performance_test_results_authed_all ON public.performance_test_results;
CREATE POLICY performance_test_results_authed_all ON public.performance_test_results
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Athlete app — read-only, same trust model as meal_entries / nutrition_settings /
-- water_intake_logs: the anon key is only ever reached through a private
-- per-athlete token URL, and every query is scoped app-side with
-- .eq('athlete_id', athleteId). Which metrics actually get shown to the
-- athlete is a UI curation concern (progress_metrics on the athlete
-- record), not an RLS concern — same distinction the app already draws
-- elsewhere (an athlete can read all their own meal/water history too).
DROP POLICY IF EXISTS performance_test_results_anon_select ON public.performance_test_results;
CREATE POLICY performance_test_results_anon_select ON public.performance_test_results
  FOR SELECT TO anon USING (true);

NOTIFY pgrst, 'reload schema';
