-- Standalone Sessions — individual training sessions that aren't part of
-- a training_block.
-- Date: 2026-08-23
-- Idempotent: safe to re-run.
--
-- Used by the Programme calendar's "Plan for 1 Session" / "Plan for a
-- week" actions. Deliberately no per-week prescriptions table and no
-- exercise breakdown yet (v1 is name + date + notes) — a standalone
-- session has exactly one date, so there's no "week" to prescribe
-- against. Exercise-level detail can be added later without touching
-- this shape.
--
-- planned_sessions already links a date to a block_session; it now
-- also links (mutually exclusively) to a standalone_session so the
-- existing calendar / mutation code keeps working unchanged for
-- block-based rows.

CREATE TABLE IF NOT EXISTS standalone_sessions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id   text        NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  session_name text        NOT NULL,
  session_date date        NOT NULL,
  coach_notes  text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_standalone_sessions_athlete_date
  ON standalone_sessions(athlete_id, session_date);

DROP TRIGGER IF EXISTS trg_touch_updated_at ON standalone_sessions;
CREATE TRIGGER trg_touch_updated_at
  BEFORE UPDATE ON standalone_sessions
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

ALTER TABLE standalone_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allow_all ON standalone_sessions;
CREATE POLICY allow_all ON standalone_sessions
  FOR ALL TO public USING (true) WITH CHECK (true);

-- ─── planned_sessions: allow standalone lineage ────────────────────────
-- Existing rows are unaffected (block_session_id stays NOT NULL for
-- all of them going forward via the XOR check, week_number stays as
-- it was) — this only opens the door for new rows with no block.
ALTER TABLE planned_sessions ALTER COLUMN block_id DROP NOT NULL;
ALTER TABLE planned_sessions ALTER COLUMN block_session_id DROP NOT NULL;
ALTER TABLE planned_sessions ALTER COLUMN week_number DROP NOT NULL;

ALTER TABLE planned_sessions
  ADD COLUMN IF NOT EXISTS standalone_session_id uuid
  REFERENCES standalone_sessions(id) ON DELETE CASCADE;

ALTER TABLE planned_sessions
  DROP CONSTRAINT IF EXISTS planned_sessions_lineage_xor;
ALTER TABLE planned_sessions
  ADD CONSTRAINT planned_sessions_lineage_xor
  CHECK ((block_session_id IS NULL) <> (standalone_session_id IS NULL));

CREATE INDEX IF NOT EXISTS idx_planned_sessions_standalone
  ON planned_sessions(standalone_session_id)
  WHERE standalone_session_id IS NOT NULL;

-- End of migration.
