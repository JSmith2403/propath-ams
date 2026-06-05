-- recipe_diet_type_2026-06-01.sql
-- ----------------------------------------------------------------------
-- Adds an optional dietary classification to recipes so coaches can
-- tag and athletes can filter by Poultry / Pescatarian / Vegetarian /
-- Vegan. Nullable — existing rows stay untouched and continue to
-- filter cleanly when no diet has been set.
--
-- Diet types are mutually exclusive (a recipe is one of the four, or
-- unclassified). Tag relationships between them are handled in the UI
-- (e.g. a vegan recipe is implicitly vegetarian) — the DB just stores
-- the most specific value the coach picked.
-- ----------------------------------------------------------------------

ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS diet_type text;

ALTER TABLE public.recipes
  DROP CONSTRAINT IF EXISTS recipes_diet_type_check;

ALTER TABLE public.recipes
  ADD CONSTRAINT recipes_diet_type_check
  CHECK (diet_type IS NULL OR diet_type IN ('poultry','pescatarian','vegetarian','vegan'));

CREATE INDEX IF NOT EXISTS idx_recipes_diet_type
  ON public.recipes (diet_type)
  WHERE diet_type IS NOT NULL;
