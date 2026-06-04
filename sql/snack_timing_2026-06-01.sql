-- snack_timing_2026-06-01.sql
-- ----------------------------------------------------------------------
-- Adds an optional timing flag to recipes so snacks can be tagged as
-- Pre-Training / Post-Training / Anytime. Nullable — existing rows
-- stay untouched and continue to filter cleanly.
--
-- Coach UI only surfaces the field when meal_type = 'snack'; the
-- column is permitted on any row for forward-compat (e.g. pre-
-- training breakfasts later) but the constraint enforces the three
-- documented values + NULL.
-- ----------------------------------------------------------------------

ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS snack_timing text;

ALTER TABLE public.recipes
  DROP CONSTRAINT IF EXISTS recipes_snack_timing_check;

ALTER TABLE public.recipes
  ADD CONSTRAINT recipes_snack_timing_check
  CHECK (snack_timing IS NULL OR snack_timing IN ('pre_training','post_training','anytime'));

CREATE INDEX IF NOT EXISTS idx_recipes_snack_timing
  ON public.recipes (snack_timing)
  WHERE snack_timing IS NOT NULL;
