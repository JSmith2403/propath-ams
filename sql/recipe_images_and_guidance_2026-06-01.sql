-- recipe_images_and_guidance_2026-06-01.sql
-- ----------------------------------------------------------------------
-- Two add-ons to the meal-logging surface:
--
--   1. Public recipe-images storage bucket so coaches can upload
--      photos for each recipe. Athlete app uses the bare image_url
--      directly — no signed URL needed since the bucket is public.
--
--   2. meal_structure_guidance table: one row per athlete carrying
--      the recommended-plate text the nutritionist writes from the
--      Meal Structure & Guidance sub-tab. Structured as JSON sections
--      (general, breakfast, lunch, snack, dinner, hydration) so the
--      athlete app can render each section cleanly.
-- ----------------------------------------------------------------------

-- ── 1. Storage: public recipe-images bucket ─────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recipe-images',
  'recipe-images',
  true,           -- public reads: athlete app fetches images directly
  10485760,       -- 10 MB per file
  ARRAY['image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS recipe_images_anon_select ON storage.objects;
CREATE POLICY recipe_images_anon_select ON storage.objects
  FOR SELECT TO anon USING (bucket_id = 'recipe-images');

DROP POLICY IF EXISTS recipe_images_anon_insert ON storage.objects;
CREATE POLICY recipe_images_anon_insert ON storage.objects
  FOR INSERT TO anon WITH CHECK (bucket_id = 'recipe-images');

DROP POLICY IF EXISTS recipe_images_anon_update ON storage.objects;
CREATE POLICY recipe_images_anon_update ON storage.objects
  FOR UPDATE TO anon USING (bucket_id = 'recipe-images') WITH CHECK (bucket_id = 'recipe-images');

DROP POLICY IF EXISTS recipe_images_anon_delete ON storage.objects;
CREATE POLICY recipe_images_anon_delete ON storage.objects
  FOR DELETE TO anon USING (bucket_id = 'recipe-images');

DROP POLICY IF EXISTS recipe_images_auth_all ON storage.objects;
CREATE POLICY recipe_images_auth_all ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'recipe-images') WITH CHECK (bucket_id = 'recipe-images');

-- ── 2. meal_structure_guidance table ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.meal_structure_guidance (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id   text NOT NULL UNIQUE
               REFERENCES public.athletes(id) ON DELETE CASCADE,
  content      jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- shape:
  --   { "general": "...", "breakfast": "...", "lunch": "...",
  --     "snack": "...", "dinner": "...", "hydration": "..." }
  -- All sections optional; the athlete app skips empty ones.
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.meal_structure_guidance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS anon_all_meal_structure_guidance ON public.meal_structure_guidance;
CREATE POLICY anon_all_meal_structure_guidance ON public.meal_structure_guidance
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS auth_all_meal_structure_guidance ON public.meal_structure_guidance;
CREATE POLICY auth_all_meal_structure_guidance ON public.meal_structure_guidance
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
