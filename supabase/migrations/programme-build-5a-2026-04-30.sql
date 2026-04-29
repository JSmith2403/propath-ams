-- Programme Build 5a — per-athlete block editing + team-level events
-- Date: 2026-04-30
-- Branch: dev/programme-build-5a (off dev/programme-build)
-- Idempotent: safe to re-run.
--
-- Changes:
--  1. athlete_calendar_events.athlete_id becomes nullable so a row can
--     represent a team-level event (no athlete attribution).
--  2. athlete_calendar_events gains is_team_event boolean (default
--     false) plus a CHECK constraint enforcing the relationship:
--         is_team_event = true   →  athlete_id IS NULL
--         is_team_event = false  →  athlete_id IS NOT NULL
--     Existing rows default to is_team_event = false and already have
--     athlete_id NOT NULL, so they pass the constraint as-is.
--  3. training_blocks gains source_template_id (nullable FK into
--     block_templates) for internal source-tracking. NOT surfaced in
--     UI per Brief 5a — analytics use only.

-- 1. athlete_calendar_events.athlete_id nullable
ALTER TABLE athlete_calendar_events
  ALTER COLUMN athlete_id DROP NOT NULL;

-- 2. is_team_event column (default false → existing rows compliant)
ALTER TABLE athlete_calendar_events
  ADD COLUMN IF NOT EXISTS is_team_event boolean NOT NULL DEFAULT false;

-- 3. team-event ↔ athlete_id mutual-exclusion constraint
ALTER TABLE athlete_calendar_events
  DROP CONSTRAINT IF EXISTS athlete_calendar_events_team_check;
ALTER TABLE athlete_calendar_events
  ADD  CONSTRAINT athlete_calendar_events_team_check
  CHECK (
    (is_team_event = true  AND athlete_id IS NULL) OR
    (is_team_event = false AND athlete_id IS NOT NULL)
  );

-- 4. Helpful partial index for team-event queries on Shared Calendar
CREATE INDEX IF NOT EXISTS idx_athlete_calendar_events_team
  ON athlete_calendar_events (start_date)
  WHERE is_team_event = true;

-- 5. training_blocks.source_template_id (analytics only, not surfaced)
ALTER TABLE training_blocks
  ADD COLUMN IF NOT EXISTS source_template_id uuid
  REFERENCES block_templates(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_training_blocks_source_template
  ON training_blocks(source_template_id)
  WHERE source_template_id IS NOT NULL;
