-- Programme Build schema (Brief 4)
-- Date: 2026-04-30
-- Branch: dev/programme-build
-- Idempotent: safe to re-run.
--
-- Adds five template tables. Athlete-attached programming continues to
-- live in the existing block_sessions / session_exercises /
-- exercise_week_prescriptions tables (created in Brief 1). Templates
-- are independent snapshots — saving a template copies data; applying a
-- template copies data back. No reference linking between the two.
--
-- Verified: block_sessions.coach_notes and session_exercises.notes both
-- already exist from Brief 1, so no ALTERs needed for them.

-- 1. session_templates
CREATE TABLE IF NOT EXISTS session_templates (
  id          uuid       PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text       NOT NULL,
  description text,
  created_by  uuid,
  is_active   boolean    NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_session_templates_active ON session_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_session_templates_name   ON session_templates(name);

-- 2. session_template_exercises
CREATE TABLE IF NOT EXISTS session_template_exercises (
  id                  uuid       PRIMARY KEY DEFAULT gen_random_uuid(),
  session_template_id uuid       NOT NULL REFERENCES session_templates(id) ON DELETE CASCADE,
  exercise_id         uuid       NOT NULL REFERENCES exercise_library(id)  ON DELETE RESTRICT,
  display_order       int        NOT NULL,
  group_label         text,
  group_colour        text,
  prescription_type   text       CHECK (prescription_type IS NULL OR prescription_type IN (
    'kg','percent_1rm','velocity_zone','rir','rpe','time','reps_only','band_colour'
  )),
  notes               text,
  is_warm_up          boolean    NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_template_id, display_order)
);
CREATE INDEX IF NOT EXISTS idx_session_tpl_ex_template ON session_template_exercises(session_template_id);
CREATE INDEX IF NOT EXISTS idx_session_tpl_ex_exercise ON session_template_exercises(exercise_id);

-- 3. session_template_week_prescriptions
CREATE TABLE IF NOT EXISTS session_template_week_prescriptions (
  id                          uuid       PRIMARY KEY DEFAULT gen_random_uuid(),
  session_template_exercise_id uuid      NOT NULL REFERENCES session_template_exercises(id) ON DELETE CASCADE,
  week_number                 int        NOT NULL CHECK (week_number > 0),
  sets                        int        NOT NULL CHECK (sets > 0),
  reps                        text       NOT NULL,
  target_value                text,
  rest_seconds                int        CHECK (rest_seconds IS NULL OR rest_seconds >= 0),
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_template_exercise_id, week_number)
);
CREATE INDEX IF NOT EXISTS idx_session_tpl_wkpr_ex
  ON session_template_week_prescriptions(session_template_exercise_id);

-- 4. block_templates
CREATE TABLE IF NOT EXISTS block_templates (
  id                      uuid       PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    text       NOT NULL,
  description             text,
  default_duration_weeks  int        NOT NULL DEFAULT 4 CHECK (default_duration_weeks > 0),
  created_by              uuid,
  is_active               boolean    NOT NULL DEFAULT true,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_block_templates_active ON block_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_block_templates_name   ON block_templates(name);

-- 5. block_template_sessions
CREATE TABLE IF NOT EXISTS block_template_sessions (
  id                  uuid       PRIMARY KEY DEFAULT gen_random_uuid(),
  block_template_id   uuid       NOT NULL REFERENCES block_templates(id)   ON DELETE CASCADE,
  session_template_id uuid       NOT NULL REFERENCES session_templates(id) ON DELETE CASCADE,
  session_order       int        NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (block_template_id, session_order)
);
CREATE INDEX IF NOT EXISTS idx_block_tpl_sessions_block   ON block_template_sessions(block_template_id);
CREATE INDEX IF NOT EXISTS idx_block_tpl_sessions_session ON block_template_sessions(session_template_id);

-- 6. updated_at touch triggers (block_template_sessions has no updated_at)
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'session_templates',
    'session_template_exercises',
    'session_template_week_prescriptions',
    'block_templates'
  ]) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_touch_updated_at ON %I', t);
    EXECUTE format(
      'CREATE TRIGGER trg_touch_updated_at BEFORE UPDATE ON %I '
      'FOR EACH ROW EXECUTE FUNCTION touch_updated_at()', t
    );
  END LOOP;
END $$;

-- 7. RLS -- allow_all (TO public) on all five tables
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'session_templates',
    'session_template_exercises',
    'session_template_week_prescriptions',
    'block_templates',
    'block_template_sessions'
  ]) LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS allow_all ON %I', t);
    EXECUTE format(
      'CREATE POLICY allow_all ON %I FOR ALL TO public USING (true) WITH CHECK (true)',
      t
    );
  END LOOP;
END $$;
