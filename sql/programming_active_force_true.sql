-- ─────────────────────────────────────────────────────────────────────────────
-- Brief: Overview tabs + Programme weekly view (Part 3)
--
-- Tidies programming_settings: every athlete gets a row, every row has
-- programming_active = true. The app is moving to "always-on" — the toggle
-- has been removed from the UI but the table + column are kept so existing
-- code paths that read `programming_active` keep working.
--
-- Idempotent. Safe to re-run. No destructive changes — only INSERTs the
-- missing rows and flips any false → true.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Backfill: any athlete without a programming_settings row gets one.
INSERT INTO public.programming_settings (athlete_id, programming_active)
SELECT a.id, true
FROM   public.athletes a
LEFT JOIN public.programming_settings ps ON ps.athlete_id = a.id
WHERE  ps.athlete_id IS NULL;

-- 2. Force every existing row to active.
UPDATE public.programming_settings
   SET programming_active = true
 WHERE programming_active IS DISTINCT FROM true;

-- Refresh PostgREST cache.
NOTIFY pgrst, 'reload schema';
