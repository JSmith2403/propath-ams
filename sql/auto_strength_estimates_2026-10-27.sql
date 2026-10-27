-- ============================================================================
-- Automatic 3RM estimates from training logs (Mayhew).            2026-10-27
-- APPLIED to live as migration "auto_strength_estimates".
--
-- When an athlete logs a heavy working set of a mapped lift (barbell back squat, barbell bench press), the
-- best set of the day is turned into an estimated 3RM and saved as a normal result for the matching test
-- ("Back Squat 3RM Estimation" / "Bench Press 3RM Estimation"), tagged source = 'estimate'. It shows on the
-- athlete's Progress tab and the KPI tiles like any other result. A manually tested 3RM on the same day
-- replaces the estimate (done in the screens).
--
--   Mayhew:  1RM = 100·w / (52.2 + 41.9·e^(-0.055·reps))      (same formula as calculate_e1rm / strengthMath.js)
--   3RM load = weight × (52.2 + 41.9·e^(-0.055·3)) / (52.2 + 41.9·e^(-0.055·reps)),  rounded to 0.5 kg
--
--   "Heavy working set" = 1–8 reps with a weight on the bar. Best estimate per athlete per day.
--   Which exercises count is a small table (strength_estimate_map) so it can be extended without code.
--
-- Undo: DROP TRIGGER trg_set_logs_strength_estimate ON public.set_logs;
--       DELETE FROM public.performance_test_results WHERE source = 'estimate';
-- ============================================================================

-- 1. Where a result came from
ALTER TABLE public.performance_test_results ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'performance_test_results_source_check') THEN
    ALTER TABLE public.performance_test_results
      ADD CONSTRAINT performance_test_results_source_check CHECK (source IN ('manual', 'estimate', 'vald', 'import'));
  END IF;
END $$;

-- 2. Which logged exercises feed which test
CREATE TABLE IF NOT EXISTS public.strength_estimate_map (
  metric_key  text NOT NULL,
  exercise_id uuid NOT NULL REFERENCES public.exercise_library(id) ON DELETE CASCADE,
  PRIMARY KEY (metric_key, exercise_id)
);
ALTER TABLE public.strength_estimate_map ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.strength_estimate_map FROM anon;
DROP POLICY IF EXISTS staff_all ON public.strength_estimate_map;
CREATE POLICY staff_all ON public.strength_estimate_map FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

INSERT INTO public.strength_estimate_map (metric_key, exercise_id) VALUES
  ('backSquat3RM',  '3abac28a-fb63-4c1e-b547-be472a5b29bf'),   -- Back Squat
  ('backSquat3RM',  'a180fc7d-d6ed-4584-b103-1b7b28dc5c02'),   -- BB Back Squat
  ('benchPress3RM', 'a5777e70-5172-4d0b-9e36-f051b6342ca3'),   -- Barbell Bench Press
  ('benchPress3RM', '53ea0d44-2427-4ec4-8f51-b50d85420e5f')    -- Bench Press
ON CONFLICT DO NOTHING;

-- 3. Recompute one athlete / test / day
CREATE OR REPLACE FUNCTION public.refresh_strength_estimate(p_athlete text, p_metric text, p_day date)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE best numeric;
BEGIN
  SELECT round(max(s.weight_kg * (52.2 + 41.9 * exp(-0.165)) / (52.2 + 41.9 * exp(-0.055 * s.reps))) * 2) / 2
    INTO best
  FROM public.set_logs s
  JOIN public.session_logs sl ON sl.id = s.session_log_id
  LEFT JOIN public.session_exercises se ON se.id = s.session_exercise_id
  JOIN public.strength_estimate_map m ON m.metric_key = p_metric AND m.exercise_id = COALESCE(s.exercise_id, se.exercise_id)
  WHERE sl.athlete_id = p_athlete
    AND s.weight_kg > 0 AND s.reps BETWEEN 1 AND 8
    AND (COALESCE(sl.started_at, sl.created_at) AT TIME ZONE 'Asia/Dubai')::date = p_day;

  IF best IS NULL THEN
    DELETE FROM public.performance_test_results
     WHERE athlete_id = p_athlete AND metric_key = p_metric AND legacy_entry_id = 'auto:' || p_day::text AND source = 'estimate';
  ELSE
    INSERT INTO public.performance_test_results (athlete_id, metric_key, date, value, source, legacy_entry_id, updated_at)
    VALUES (p_athlete, p_metric, p_day, best, 'estimate', 'auto:' || p_day::text, now())
    ON CONFLICT (athlete_id, metric_key, legacy_entry_id) WHERE legacy_entry_id IS NOT NULL
    DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  END IF;
END $$;

-- 4. Keep it current as sets are logged, edited or removed
CREATE OR REPLACE FUNCTION public.refresh_estimates_for_set(s public.set_logs)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE ath text; d date; ex uuid; metric text;
BEGIN
  ex := COALESCE(s.exercise_id, (SELECT se.exercise_id FROM public.session_exercises se WHERE se.id = s.session_exercise_id));
  IF ex IS NULL THEN RETURN; END IF;
  SELECT sl.athlete_id, (COALESCE(sl.started_at, sl.created_at) AT TIME ZONE 'Asia/Dubai')::date
    INTO ath, d FROM public.session_logs sl WHERE sl.id = s.session_log_id;
  IF ath IS NULL THEN RETURN; END IF;
  FOR metric IN SELECT m.metric_key FROM public.strength_estimate_map m WHERE m.exercise_id = ex LOOP
    PERFORM public.refresh_strength_estimate(ath, metric, d);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.set_logs_refresh_estimate()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN PERFORM public.refresh_estimates_for_set(OLD); END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') THEN PERFORM public.refresh_estimates_for_set(NEW); END IF;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_set_logs_strength_estimate ON public.set_logs;
CREATE TRIGGER trg_set_logs_strength_estimate
  AFTER INSERT OR UPDATE OF weight_kg, reps, session_log_id, session_exercise_id, exercise_id OR DELETE
  ON public.set_logs FOR EACH ROW EXECUTE FUNCTION public.set_logs_refresh_estimate();

-- Internal only — not callable through the API.
REVOKE ALL ON FUNCTION public.refresh_strength_estimate(text, text, date) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.refresh_estimates_for_set(public.set_logs)  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_logs_refresh_estimate()                  FROM PUBLIC, anon, authenticated;

-- 5. Backfill from the sets already logged
INSERT INTO public.performance_test_results (athlete_id, metric_key, date, value, source, legacy_entry_id)
SELECT sl.athlete_id, m.metric_key,
       (COALESCE(sl.started_at, sl.created_at) AT TIME ZONE 'Asia/Dubai')::date AS day,
       round(max(s.weight_kg * (52.2 + 41.9 * exp(-0.165)) / (52.2 + 41.9 * exp(-0.055 * s.reps))) * 2) / 2,
       'estimate',
       'auto:' || (COALESCE(sl.started_at, sl.created_at) AT TIME ZONE 'Asia/Dubai')::date::text
FROM public.set_logs s
JOIN public.session_logs sl ON sl.id = s.session_log_id
LEFT JOIN public.session_exercises se ON se.id = s.session_exercise_id
JOIN public.strength_estimate_map m ON m.exercise_id = COALESCE(s.exercise_id, se.exercise_id)
WHERE s.weight_kg > 0 AND s.reps BETWEEN 1 AND 8
GROUP BY sl.athlete_id, m.metric_key, (COALESCE(sl.started_at, sl.created_at) AT TIME ZONE 'Asia/Dubai')::date
ON CONFLICT (athlete_id, metric_key, legacy_entry_id) WHERE legacy_entry_id IS NOT NULL
DO UPDATE SET value = EXCLUDED.value, updated_at = now();
