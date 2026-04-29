-- Picker + Planned Days (Brief 5d/5e)
-- Date: 2026-04-30
-- Branch: dev/picker-and-planned-days
-- Idempotent: safe to re-run.
--
-- Two new tables:
--   1. session_step_notes   — inline coach notes interleaved with
--      exercises in a session. Polymorphic over block_sessions and
--      session_templates (XOR check). Notes share the same
--      display_order space as session_exercises, so an exercise at
--      order 1 followed by a note at order 2 followed by an exercise
--      at order 3 renders in interleaved order.
--   2. planned_sessions     — when a template is assigned to an
--      athlete, generate one row per session per week so the
--      per-athlete calendar can show "Session 1 falls on Mon May 5".
--      status is reserved for Brief 7's logging flow; for now
--      everything stays at 'planned'.
--
-- Both tables follow the project conventions:
--   • allow_all RLS policy (TO public)
--   • touch_updated_at trigger to keep updated_at fresh
--   • named CHECK constraints inline so re-runs settle predictably

-- ─── 1. session_step_notes ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_step_notes (
  id                  uuid       PRIMARY KEY DEFAULT gen_random_uuid(),
  block_session_id    uuid       REFERENCES block_sessions(id)    ON DELETE CASCADE,
  session_template_id uuid       REFERENCES session_templates(id) ON DELETE CASCADE,
  display_order       int        NOT NULL,
  content             text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CHECK ((block_session_id IS NULL) <> (session_template_id IS NULL))
);

CREATE INDEX IF NOT EXISTS idx_step_notes_block_session
  ON session_step_notes(block_session_id)
  WHERE block_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_step_notes_template
  ON session_step_notes(session_template_id)
  WHERE session_template_id IS NOT NULL;

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_touch_updated_at ON session_step_notes;
CREATE TRIGGER trg_touch_updated_at
  BEFORE UPDATE ON session_step_notes
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- RLS allow_all (TO public)
ALTER TABLE session_step_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allow_all ON session_step_notes;
CREATE POLICY allow_all ON session_step_notes
  FOR ALL TO public USING (true) WITH CHECK (true);

-- 1b. Note ↔ section attachment (added during build). Without this we
-- can't reliably reconstruct which section a note belongs to at load
-- time when sections are empty or notes sit at section boundaries.
ALTER TABLE session_step_notes
  ADD COLUMN IF NOT EXISTS section_id uuid REFERENCES session_sections(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_step_notes_section
  ON session_step_notes(section_id)
  WHERE section_id IS NOT NULL;

-- ─── 2. planned_sessions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planned_sessions (
  id               uuid       PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id       text       NOT NULL REFERENCES athletes(id)        ON DELETE CASCADE,
  block_id         uuid       NOT NULL REFERENCES training_blocks(id) ON DELETE CASCADE,
  block_session_id uuid       NOT NULL REFERENCES block_sessions(id)  ON DELETE CASCADE,
  week_number      int        NOT NULL CHECK (week_number > 0),
  planned_date     date       NOT NULL,
  status           text       NOT NULL DEFAULT 'planned'
                              CHECK (status IN ('planned','completed','missed')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_planned_sessions_athlete_date
  ON planned_sessions(athlete_id, planned_date);
CREATE INDEX IF NOT EXISTS idx_planned_sessions_block
  ON planned_sessions(block_id);
CREATE INDEX IF NOT EXISTS idx_planned_sessions_session
  ON planned_sessions(block_session_id);

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_touch_updated_at ON planned_sessions;
CREATE TRIGGER trg_touch_updated_at
  BEFORE UPDATE ON planned_sessions
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- RLS allow_all (TO public)
ALTER TABLE planned_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allow_all ON planned_sessions;
CREATE POLICY allow_all ON planned_sessions
  FOR ALL TO public USING (true) WITH CHECK (true);
