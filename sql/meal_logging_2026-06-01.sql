-- meal_logging_2026-06-01.sql
-- ----------------------------------------------------------------------
-- Meal-logging feature: athlete-side "snap and send" + coach-side
-- review wired into the Food Diary surface.
--
-- Tables
--   nutrition_settings — per-athlete toggle. Nutritionist switches
--                        meal logging on/off and decides whether a
--                        photo is required for submit.
--   meal_entries       — one row per submitted meal (with type and date).
--   meal_photos        — up to 4 storage paths per entry.
--   meal_events        — audit trail surfaced by the coach History
--                        panel (submitted / reviewed / note_added).
--
-- Storage
--   meal-photos bucket (private). Athletes upload via the anon role
--   with the storage path scoped to {athlete_id}/{entry_id}/<uuid>.jpg
--   so coaches/nutritionists can confidently render signed URLs.
--
-- Security
--   Mirrors the existing session_logs / set_logs pattern in this
--   project — RLS is enabled but permissive at the role level, with
--   the app layer (token-based athlete flow + Supabase auth on the
--   coach side) gating who sees what.
-- ----------------------------------------------------------------------

-- ── 1. Tables ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.nutrition_settings (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id             text NOT NULL UNIQUE
                         REFERENCES public.athletes(id) ON DELETE CASCADE,
  meal_logging_enabled   boolean NOT NULL DEFAULT false,
  require_photo          boolean NOT NULL DEFAULT true,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meal_entries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id    text NOT NULL
                REFERENCES public.athletes(id) ON DELETE CASCADE,
  log_date      date NOT NULL,
  meal_type     text NOT NULL
                CHECK (meal_type IN ('breakfast','snack_1','lunch','snack_2','dinner','snack_3')),
  description   text,
  notes         text,
  status        text NOT NULL DEFAULT 'submitted'
                CHECK (status IN ('submitted','reviewed')),
  source        text NOT NULL DEFAULT 'mobile_app',
  submitted_at  timestamptz NOT NULL DEFAULT now(),
  created_by    uuid,  -- nullable: athlete token submits don't carry an auth user
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meal_entries_athlete_date
  ON public.meal_entries (athlete_id, log_date DESC);

CREATE TABLE IF NOT EXISTS public.meal_photos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id        uuid NOT NULL
                  REFERENCES public.meal_entries(id) ON DELETE CASCADE,
  storage_path    text NOT NULL,
  thumbnail_path  text,
  width           integer,
  height          integer,
  uploaded_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meal_photos_entry ON public.meal_photos (entry_id);

CREATE TABLE IF NOT EXISTS public.meal_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id    uuid NOT NULL
              REFERENCES public.meal_entries(id) ON DELETE CASCADE,
  event_type  text NOT NULL
              CHECK (event_type IN ('submitted','reviewed','note_added')),
  actor_id    uuid,        -- nullable for athlete-token actions
  note        text,        -- carries the coach note for note_added events
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meal_events_entry ON public.meal_events (entry_id, created_at);

-- ── 2. Cap photos at 4 per entry ─────────────────────────────────────
-- Enforced via a BEFORE INSERT trigger rather than a constraint so we
-- can return a clean error to the client.

CREATE OR REPLACE FUNCTION public.enforce_meal_photo_cap()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF (SELECT count(*) FROM public.meal_photos WHERE entry_id = NEW.entry_id) >= 4 THEN
    RAISE EXCEPTION 'A meal entry can have at most 4 photos';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_meal_photos_cap ON public.meal_photos;
CREATE TRIGGER trg_meal_photos_cap
BEFORE INSERT ON public.meal_photos
FOR EACH ROW EXECUTE FUNCTION public.enforce_meal_photo_cap();

-- ── 3. Auto-write the 'submitted' event on every new meal entry ─────

CREATE OR REPLACE FUNCTION public.log_meal_entry_submitted()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.meal_events (entry_id, event_type, actor_id)
  VALUES (NEW.id, 'submitted', NEW.created_by);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_meal_entries_submitted ON public.meal_entries;
CREATE TRIGGER trg_meal_entries_submitted
AFTER INSERT ON public.meal_entries
FOR EACH ROW EXECUTE FUNCTION public.log_meal_entry_submitted();

-- ── 4. RLS ───────────────────────────────────────────────────────────
-- Permissive at the role level, matching session_logs / set_logs etc.
-- The athlete app gates access via /athlete/:token; the coach UI
-- already requires Supabase auth.

ALTER TABLE public.nutrition_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_entries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_photos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_events        ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS anon_read_nutrition_settings ON public.nutrition_settings;
CREATE POLICY anon_read_nutrition_settings ON public.nutrition_settings
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS auth_all_nutrition_settings ON public.nutrition_settings;
CREATE POLICY auth_all_nutrition_settings ON public.nutrition_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS anon_all_meal_entries ON public.meal_entries;
CREATE POLICY anon_all_meal_entries ON public.meal_entries
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS auth_all_meal_entries ON public.meal_entries;
CREATE POLICY auth_all_meal_entries ON public.meal_entries
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS anon_all_meal_photos ON public.meal_photos;
CREATE POLICY anon_all_meal_photos ON public.meal_photos
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS auth_all_meal_photos ON public.meal_photos;
CREATE POLICY auth_all_meal_photos ON public.meal_photos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS anon_all_meal_events ON public.meal_events;
CREATE POLICY anon_all_meal_events ON public.meal_events
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS auth_all_meal_events ON public.meal_events;
CREATE POLICY auth_all_meal_events ON public.meal_events
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 5. Private storage bucket for meal photos ────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'meal-photos',
  'meal-photos',
  false,           -- private — coach uses short-lived signed URLs
  10485760,        -- 10 MB per file
  ARRAY['image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies — anon + authenticated can upload / read / delete
-- objects in the meal-photos bucket. Path-level scoping happens app-
-- side so we keep the policy simple and predictable.

DROP POLICY IF EXISTS meal_photos_anon_select ON storage.objects;
CREATE POLICY meal_photos_anon_select ON storage.objects
  FOR SELECT TO anon USING (bucket_id = 'meal-photos');

DROP POLICY IF EXISTS meal_photos_anon_insert ON storage.objects;
CREATE POLICY meal_photos_anon_insert ON storage.objects
  FOR INSERT TO anon WITH CHECK (bucket_id = 'meal-photos');

DROP POLICY IF EXISTS meal_photos_anon_update ON storage.objects;
CREATE POLICY meal_photos_anon_update ON storage.objects
  FOR UPDATE TO anon USING (bucket_id = 'meal-photos') WITH CHECK (bucket_id = 'meal-photos');

DROP POLICY IF EXISTS meal_photos_auth_all ON storage.objects;
CREATE POLICY meal_photos_auth_all ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'meal-photos') WITH CHECK (bucket_id = 'meal-photos');
