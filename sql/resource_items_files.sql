-- ─────────────────────────────────────────────────────────────────────────────
-- Resources v2 — file uploads (PDF + cover image).
--
--   * Adds cover_image_url / file_url / file_name to resource_items.
--   * Drops the NOT NULL on `content` (structured-block resources stay
--     supported, but a coach can now author a resource that's just a
--     PDF + cover image, with no rich-text body).
--   * Creates a public Storage bucket `resources` for both file types.
--     Public read so the athlete app can render <img> covers and link
--     to the PDF directly. Authenticated coaches have full write access.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.resource_items
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS file_url        text,
  ADD COLUMN IF NOT EXISTS file_name       text;

ALTER TABLE public.resource_items
  ALTER COLUMN content DROP NOT NULL;

-- Idempotent bucket creation.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resources',
  'resources',
  true,
  52428800,                                 -- 50 MB per file
  ARRAY['application/pdf','image/png','image/jpeg','image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS policies — anon can read any object in the bucket,
-- authenticated coaches can do everything.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND policyname='resources_anon_read'
  ) THEN
    CREATE POLICY resources_anon_read
      ON storage.objects FOR SELECT TO anon, authenticated
      USING (bucket_id = 'resources');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND policyname='resources_authed_write'
  ) THEN
    CREATE POLICY resources_authed_write
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'resources');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND policyname='resources_authed_update'
  ) THEN
    CREATE POLICY resources_authed_update
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'resources') WITH CHECK (bucket_id = 'resources');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND policyname='resources_authed_delete'
  ) THEN
    CREATE POLICY resources_authed_delete
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'resources');
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
