-- Phase schema migration (Brief 3.5)
-- Date: 2026-04-29
-- Branch: dev/programme-module-shell
-- Idempotent: safe to re-run.

-- 1. training_phases
-- athlete_id is text to match athletes.id.
CREATE TABLE IF NOT EXISTS training_phases (
  id              uuid       PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id      text       NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  phase_name      text       NOT NULL,
  programme_type  text       NOT NULL DEFAULT 'periodised'
                             CHECK (programme_type IN ('periodised','free_form')),
  notes           text,
  display_order   int        NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (athlete_id, display_order)
);

CREATE INDEX IF NOT EXISTS idx_training_phases_athlete
  ON training_phases(athlete_id);

-- 2. training_blocks.phase_id (nullable FK)
ALTER TABLE training_blocks
  ADD COLUMN IF NOT EXISTS phase_id uuid
  REFERENCES training_phases(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_training_blocks_phase
  ON training_blocks(phase_id);

-- 3. training_blocks.pacing column with CHECK constraint
ALTER TABLE training_blocks
  ADD COLUMN IF NOT EXISTS pacing text NOT NULL DEFAULT 'self_paced';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'training_blocks_pacing_check'
  ) THEN
    ALTER TABLE training_blocks
      ADD CONSTRAINT training_blocks_pacing_check
      CHECK (pacing IN ('self_paced','day_assigned'));
  END IF;
END $$;

-- 4. updated_at trigger on training_phases (touch_updated_at exists from
-- the original programming-foundation migration)
DROP TRIGGER IF EXISTS trg_touch_updated_at ON training_phases;
CREATE TRIGGER trg_touch_updated_at
  BEFORE UPDATE ON training_phases
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- 5. RLS -- match the existing allow_all (TO public) pattern
ALTER TABLE training_phases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allow_all ON training_phases;
CREATE POLICY allow_all ON training_phases
  FOR ALL TO public USING (true) WITH CHECK (true);
