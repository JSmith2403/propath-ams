-- water_intake_and_drink_2026-08-20.sql
-- ----------------------------------------------------------------------
-- Two small additions to the nutrition surface:
--   1. Water intake tracking — one row per athlete per day, tap-to-fill
--      in the athlete app. Glass size is fixed at 500ml; only the
--      per-day glass count and the daily glass target vary.
--   2. 'drink' meal_type — a fifth option alongside breakfast / lunch /
--      snack / dinner in the meal capture picker.
-- ----------------------------------------------------------------------

-- ── 1. Water intake ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.water_intake_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id  text NOT NULL
              REFERENCES public.athletes(id) ON DELETE CASCADE,
  log_date    date NOT NULL,
  glasses     smallint NOT NULL DEFAULT 0 CHECK (glasses >= 0),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (athlete_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_water_intake_athlete_date
  ON public.water_intake_logs (athlete_id, log_date DESC);

ALTER TABLE public.nutrition_settings
  ADD COLUMN IF NOT EXISTS water_daily_target smallint NOT NULL DEFAULT 6
  CHECK (water_daily_target > 0);

ALTER TABLE public.water_intake_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS anon_all_water_intake_logs ON public.water_intake_logs;
CREATE POLICY anon_all_water_intake_logs ON public.water_intake_logs
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS auth_all_water_intake_logs ON public.water_intake_logs;
CREATE POLICY auth_all_water_intake_logs ON public.water_intake_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 2. 'drink' meal type ─────────────────────────────────────────────

ALTER TABLE public.meal_entries DROP CONSTRAINT IF EXISTS meal_entries_meal_type_check;
ALTER TABLE public.meal_entries ADD CONSTRAINT meal_entries_meal_type_check
  CHECK (meal_type IN ('breakfast','snack_1','lunch','snack_2','dinner','snack_3','drink'));

-- ── 3. Refresh PostgREST schema cache ───────────────────────────────

NOTIFY pgrst, 'reload schema';
