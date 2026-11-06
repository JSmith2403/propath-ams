-- ─────────────────────────────────────────────────────────────────────────────
-- Support level per athlete: how much of the platform applies to them.
--
--   full        physical programming + a wearable (Garmin)
--   programmed  physical programming, no wearable
--   tracked     wears a wearable, no programme needed
--   hands_off   no programming, no wearable (online work, light check-ins)
--
-- Drives the coach dashboard: "needs programming" only counts programmed levels, watch
-- data is only expected from tracked levels, and hands-off athletes sit in their own
-- small list instead of the main overview.
--
-- One new column on the existing programming_settings table. Everyone starts as 'full',
-- which is how the dashboard already treats them, so nothing changes until a coach sets it.
-- Existing row-level security on the table is unchanged. Safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.programming_settings
  ADD COLUMN IF NOT EXISTS support_level text NOT NULL DEFAULT 'full';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'programming_settings_support_level_check') THEN
    ALTER TABLE public.programming_settings
      ADD CONSTRAINT programming_settings_support_level_check
      CHECK (support_level IN ('full', 'programmed', 'tracked', 'hands_off'));
  END IF;
END $$;
