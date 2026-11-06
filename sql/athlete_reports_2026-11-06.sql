-- ─────────────────────────────────────────────────────────────────────────────
-- Reports log: a list of report files kept against each athlete
-- (e.g. "Pre-season testing" PDF). Replaces the in-app report builder.
--
--   * athlete_reports  — one row per file: a name the coach chooses, a date, the file.
--   * Storage bucket 'athlete-reports' — PRIVATE (reports are read through short-lived signed links).
--   * Staff only (admin / co_admin via public.is_staff()). Athletes and parents see nothing from this.
--
-- Additive and safe to re-run. Nothing existing is changed.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.athlete_reports (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id   text        NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  title        text        NOT NULL,
  report_date  date        NOT NULL DEFAULT current_date,
  file_path    text        NOT NULL,          -- path inside the 'athlete-reports' bucket
  file_name    text,
  mime_type    text,
  size_bytes   bigint,
  uploaded_by  uuid        DEFAULT auth.uid(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS athlete_reports_athlete_idx ON public.athlete_reports (athlete_id, report_date DESC);

ALTER TABLE public.athlete_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS athlete_reports_staff_all ON public.athlete_reports;
CREATE POLICY athlete_reports_staff_all ON public.athlete_reports
  FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Private bucket, 25 MB per file, documents and images only.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'athlete-reports', 'athlete-reports', false, 26214400,
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/csv', 'image/png', 'image/jpeg', 'image/webp'
  ]
)
ON CONFLICT (id) DO UPDATE
  SET public = false,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS athlete_reports_files_staff_all ON storage.objects;
CREATE POLICY athlete_reports_files_staff_all ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'athlete-reports' AND public.is_staff())
  WITH CHECK (bucket_id = 'athlete-reports' AND public.is_staff());
