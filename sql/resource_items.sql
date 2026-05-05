-- ─────────────────────────────────────────────────────────────────────────────
-- Athlete-app Resources module — coach-authored content delivered to every
-- athlete via the bottom-nav Resources tab.
--
-- Each row is one item under a category (Nutrition / Psychology / Lifestyle /
-- Future Preparation). Content lives in a JSONB array of typed blocks so the
-- renderer can support paragraphs, headings, card groups (used by this first
-- Performance Plate guide for the plate-method and hand-portion sections),
-- and images (later).
--
-- RLS: published items are readable by anon (athlete-app uses a token, so it
-- speaks Supabase as anon). Authenticated coaches have full read/write.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.resource_items (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  category       text        NOT NULL CHECK (category IN ('nutrition','psychology','lifestyle','future')),
  title          text        NOT NULL,
  summary        text,
  content        jsonb       NOT NULL DEFAULT '[]'::jsonb,
  display_order  integer     NOT NULL DEFAULT 0,
  is_published   boolean     NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resource_items_cat_order
  ON public.resource_items (category, display_order);

CREATE INDEX IF NOT EXISTS idx_resource_items_published
  ON public.resource_items (is_published);

-- Touch updated_at on every UPDATE.
CREATE OR REPLACE FUNCTION public.touch_resource_items_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_resource_items_touch ON public.resource_items;
CREATE TRIGGER trg_resource_items_touch
  BEFORE UPDATE ON public.resource_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_resource_items_updated_at();

-- ─── Row-level security ─────────────────────────────────────────────────
ALTER TABLE public.resource_items ENABLE ROW LEVEL SECURITY;

-- Anon (athlete app) — read published only.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='resource_items'
      AND policyname='resource_items_anon_read_published'
  ) THEN
    CREATE POLICY resource_items_anon_read_published
      ON public.resource_items FOR SELECT TO anon
      USING (is_published = true);
  END IF;
END $$;

-- Authenticated (coaches) — full access.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='resource_items'
      AND policyname='resource_items_authed_all'
  ) THEN
    CREATE POLICY resource_items_authed_all
      ON public.resource_items FOR ALL TO authenticated
      USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ─── Seed: first Nutrition resource — Build Your Athlete's Plate ───────
-- Idempotent on title within nutrition category.
INSERT INTO public.resource_items (category, title, summary, content, display_order, is_published)
SELECT
  'nutrition',
  'Build Your Athlete''s Plate',
  'Plate method, hand portions, and pre/post-training snacks — fuel your body without weighing or tracking.',
  $json$[
    {
      "type": "paragraph",
      "text": "Proper nutrition plays an essential role in supporting training, growth, recovery and overall performance. As a young athlete, your body is not only exercising, it is also growing, developing and managing the demands of school and daily life. Because of this, your body requires enough energy and nutrients to keep up with everything you ask it to do."
    },
    {
      "type": "paragraph",
      "text": "This guide will help you understand how to build balanced meals using the athlete plate method, and how to estimate appropriate portion sizes using simple visual tools. These strategies will allow you to fuel your body effectively without the need to weigh or track food."
    },
    {
      "type": "card_group",
      "title": "The Athlete's Plate",
      "cards": [
        {
          "title": "Rest / Light Training Day",
          "subtitle": "How much?",
          "bullets": ["½ plate: Vegetables", "¼ plate: Protein", "¼ plate: Carbohydrates"]
        },
        {
          "title": "Moderate Training Day",
          "subtitle": "How much?",
          "bullets": ["⅓ plate: Carbohydrates", "⅓ plate: Protein", "⅓ plate: Vegetables"]
        },
        {
          "title": "Hard / Double Training Day",
          "subtitle": "How much?",
          "bullets": ["½ plate: Carbohydrates", "¼ plate: Protein", "¼ plate: Vegetables"]
        }
      ]
    },
    {
      "type": "card_group",
      "title": "Hand Portions",
      "cards": [
        {
          "title": "1–1.5 palms",
          "subtitle": "Protein",
          "bullets": [
            "~1 chicken breast (size of your palm)",
            "2–3 eggs",
            "1 full Greek yogurt pot (170–200g)",
            "1 tin of tuna",
            "1 block tofu (about palm size)"
          ]
        },
        {
          "title": "2 cupped hands",
          "subtitle": "Carbohydrates",
          "bullets": [
            "1 large bowl rice",
            "2 medium potatoes",
            "2 wraps",
            "2 slices thick bread",
            "1.5–2 cups pasta",
            "1 large bowl cereal"
          ]
        },
        {
          "title": "1 fist",
          "subtitle": "Vegetables",
          "bullets": [
            "1 cup cooked vegetables",
            "1 side salad",
            "1 handful raw veg"
          ]
        },
        {
          "title": "1 thumb",
          "subtitle": "Fats",
          "bullets": [
            "1 tsp olive oil",
            "1 tbsp nut butter",
            "Small handful nuts",
            "¼ avocado"
          ]
        }
      ]
    },
    {
      "type": "card_group",
      "title": "Pre / Post-Training Snacks",
      "cards": [
        {
          "title": "Pre-Training",
          "subtitle": "1–1.5 cupped hands of carbs",
          "bullets": [
            "Banana",
            "Toast + jam",
            "Cereal + milk",
            "Dates",
            "Crumpet + honey",
            "Rice cakes"
          ]
        },
        {
          "title": "Post-Training",
          "subtitle": "1 palm protein + 1–1.5 cupped hands carbs",
          "bullets": [
            "Cereal bar + yogurt pouch",
            "Wrap + turkey",
            "Chocolate milk",
            "Smoothie (milk/yogurt + fruit)"
          ]
        }
      ]
    }
  ]$json$::jsonb,
  0,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.resource_items
  WHERE category = 'nutrition' AND title = 'Build Your Athlete''s Plate'
);

NOTIFY pgrst, 'reload schema';
