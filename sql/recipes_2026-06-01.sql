-- recipes_2026-06-01.sql
-- ----------------------------------------------------------------------
-- Recipes module — a coach-curated library surfaced on the athlete app
-- ("Need inspiration? Check out our recipes") filterable by meal type.
--
-- Shape favours editability: ingredients + steps as JSON arrays of
-- short strings so the UI can render them as lists without a separate
-- table-per-line. AI-extracted recipes use the same shape so the
-- import-from-PDF flow round-trips cleanly into the manual editor.
-- ----------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.recipes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  meal_type       text NOT NULL
                  CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  description     text,
  ingredients     jsonb NOT NULL DEFAULT '[]'::jsonb,
  instructions    jsonb NOT NULL DEFAULT '[]'::jsonb,
  prep_time_min   integer,
  cook_time_min   integer,
  servings        integer,
  tags            text[] NOT NULL DEFAULT '{}',
  image_url       text,
  source          text,           -- 'manual' | 'pdf_import' | etc.
  is_active       boolean NOT NULL DEFAULT true,
  created_by      uuid,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON public.recipes (meal_type) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_recipes_title     ON public.recipes (lower(title));

-- RLS — same permissive pattern as the other meal-logging tables.
-- Athletes (anon) need SELECT to render the library on their app;
-- writes happen from the coach's authenticated session.
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS anon_all_recipes ON public.recipes;
CREATE POLICY anon_all_recipes ON public.recipes
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS auth_all_recipes ON public.recipes;
CREATE POLICY auth_all_recipes ON public.recipes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
