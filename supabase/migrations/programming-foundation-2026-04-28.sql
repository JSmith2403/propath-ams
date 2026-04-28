-- ============================================================================
-- Programming Foundation — Schema migration
-- Date: 2026-04-28
-- Branch: dev/programming-foundation
-- Idempotent: safe to re-run.
-- ============================================================================

-- ─── 1. programming_settings ───────────────────────────────────────────────
-- Note: athletes.id is `text` in this schema (short slug ids like 'ef2'),
-- so all athlete_id columns are `text` to match. Other FKs use uuid as normal.
CREATE TABLE IF NOT EXISTS programming_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id text NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  programming_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (athlete_id)
);
CREATE INDEX IF NOT EXISTS idx_programming_settings_athlete
  ON programming_settings(athlete_id);

-- ─── 2. exercise_library ───────────────────────────────────────────────────
-- Note: cooldown removed from category enum (mobility absorbs it).
CREATE TABLE IF NOT EXISTS exercise_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN (
    'warm_up','strength','power','ballistic','jumps_plyos',
    'capacity','speed','mobility','accessory'
  )),
  movement_patterns text[] NOT NULL DEFAULT '{}',
  bilateral_unilateral text NOT NULL CHECK (bilateral_unilateral IN (
    'bilateral','unilateral','alternating'
  )),
  default_prescription_type text NOT NULL CHECK (default_prescription_type IN (
    'kg','percent_1rm','velocity_zone','rir','rpe','time','reps_only','band_colour'
  )),
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_exercise_library_category
  ON exercise_library(category);
CREATE INDEX IF NOT EXISTS idx_exercise_library_patterns
  ON exercise_library USING gin(movement_patterns);
CREATE INDEX IF NOT EXISTS idx_exercise_library_active
  ON exercise_library(is_active);

-- ─── 3. athlete_calendar_events ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS athlete_calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id text NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN (
    'competition','training_camp','testing','other'
  )),
  priority text CHECK (priority IS NULL OR priority IN ('A','B','C')),
  start_date date NOT NULL,
  end_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR end_date >= start_date)
);
CREATE INDEX IF NOT EXISTS idx_calendar_events_athlete_date
  ON athlete_calendar_events(athlete_id, start_date);

-- ─── 4. training_blocks ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id text NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  block_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  duration_weeks int NOT NULL CHECK (duration_weeks > 0),
  target_event_id uuid REFERENCES athlete_calendar_events(id) ON DELETE SET NULL,
  notes text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

-- Reordering pattern: shift to negative within a transaction to avoid unique-violation.
ALTER TABLE training_blocks
  DROP CONSTRAINT IF EXISTS training_blocks_athlete_order_uniq;
ALTER TABLE training_blocks
  ADD  CONSTRAINT training_blocks_athlete_order_uniq UNIQUE (athlete_id, display_order);

CREATE INDEX IF NOT EXISTS idx_training_blocks_athlete_date
  ON training_blocks(athlete_id, start_date);
CREATE INDEX IF NOT EXISTS idx_training_blocks_target_event
  ON training_blocks(target_event_id);

-- ─── 5. block_sessions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS block_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid NOT NULL REFERENCES training_blocks(id) ON DELETE CASCADE,
  session_name text NOT NULL,
  session_order int NOT NULL,
  coach_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (block_id, session_order)
);
CREATE INDEX IF NOT EXISTS idx_block_sessions_block
  ON block_sessions(block_id);

-- ─── 6. session_exercises ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_session_id uuid NOT NULL REFERENCES block_sessions(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercise_library(id) ON DELETE RESTRICT,
  display_order int NOT NULL,
  group_label text,
  group_colour text,
  prescription_type text CHECK (prescription_type IS NULL OR prescription_type IN (
    'kg','percent_1rm','velocity_zone','rir','rpe','time','reps_only','band_colour'
  )),
  notes text,
  is_warm_up boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE session_exercises
  DROP CONSTRAINT IF EXISTS session_exercises_session_order_uniq;
ALTER TABLE session_exercises
  ADD  CONSTRAINT session_exercises_session_order_uniq
       UNIQUE (block_session_id, display_order);

CREATE INDEX IF NOT EXISTS idx_session_exercises_session
  ON session_exercises(block_session_id);
CREATE INDEX IF NOT EXISTS idx_session_exercises_exercise
  ON session_exercises(exercise_id);

-- ─── 7. exercise_week_prescriptions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exercise_week_prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_exercise_id uuid NOT NULL REFERENCES session_exercises(id) ON DELETE CASCADE,
  week_number int NOT NULL CHECK (week_number > 0),
  sets int NOT NULL CHECK (sets > 0),
  reps text NOT NULL,
  target_value text,
  rest_seconds int CHECK (rest_seconds IS NULL OR rest_seconds >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_exercise_id, week_number)
);
CREATE INDEX IF NOT EXISTS idx_week_prescriptions_session_ex
  ON exercise_week_prescriptions(session_exercise_id);

-- ─── 8. session_logs ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_session_id uuid NOT NULL REFERENCES block_sessions(id) ON DELETE RESTRICT,
  athlete_id text NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  session_date date NOT NULL,
  week_number int NOT NULL CHECK (week_number > 0),
  attended boolean NOT NULL DEFAULT true,
  duration_minutes int,
  session_rpe int CHECK (session_rpe IS NULL OR session_rpe BETWEEN 1 AND 10),
  srpe_load int,
  coach_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Capped duration_minutes (0..600)
ALTER TABLE session_logs
  DROP CONSTRAINT IF EXISTS session_logs_duration_minutes_check;
ALTER TABLE session_logs
  ADD  CONSTRAINT session_logs_duration_minutes_check
       CHECK (duration_minutes IS NULL OR (duration_minutes >= 0 AND duration_minutes <= 600));

CREATE INDEX IF NOT EXISTS idx_session_logs_athlete_date
  ON session_logs(athlete_id, session_date);
CREATE INDEX IF NOT EXISTS idx_session_logs_block_session
  ON session_logs(block_session_id);

-- Auto-calculate srpe_load (duration × session_rpe)
CREATE OR REPLACE FUNCTION compute_srpe_load() RETURNS trigger AS $$
BEGIN
  IF NEW.duration_minutes IS NOT NULL AND NEW.session_rpe IS NOT NULL THEN
    NEW.srpe_load := NEW.duration_minutes * NEW.session_rpe;
  ELSE
    NEW.srpe_load := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_compute_srpe_load ON session_logs;
CREATE TRIGGER trg_compute_srpe_load
  BEFORE INSERT OR UPDATE ON session_logs
  FOR EACH ROW EXECUTE FUNCTION compute_srpe_load();

-- ─── 9. set_logs ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS set_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_log_id uuid NOT NULL REFERENCES session_logs(id) ON DELETE CASCADE,
  session_exercise_id uuid NOT NULL REFERENCES session_exercises(id) ON DELETE RESTRICT,
  set_number int NOT NULL CHECK (set_number > 0),
  side text CHECK (side IS NULL OR side IN ('left','right')),
  actual_reps int CHECK (actual_reps IS NULL OR actual_reps >= 0),
  actual_load_kg numeric(6,2) CHECK (actual_load_kg IS NULL OR actual_load_kg >= 0),
  actual_rpe numeric(3,1) CHECK (actual_rpe IS NULL OR actual_rpe BETWEEN 1 AND 10),
  actual_rir int CHECK (actual_rir IS NULL OR actual_rir BETWEEN 0 AND 10),
  actual_velocity_ms numeric(4,2) CHECK (actual_velocity_ms IS NULL OR actual_velocity_ms >= 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_set_logs_session_log
  ON set_logs(session_log_id);
CREATE INDEX IF NOT EXISTS idx_set_logs_session_exercise
  ON set_logs(session_exercise_id);

-- ─── 10. athlete_e1rm ──────────────────────────────────────────────────────
-- Append-only: every new highest e1RM creates a new row. No unique constraint
-- on source_set_log_id (allows e.g. an edited set producing a fresh PR).
CREATE TABLE IF NOT EXISTS athlete_e1rm (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id text NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercise_library(id) ON DELETE RESTRICT,
  e1rm_kg numeric(6,2) NOT NULL CHECK (e1rm_kg > 0),
  source_set_log_id uuid REFERENCES set_logs(id) ON DELETE SET NULL,
  calculated_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_athlete_e1rm_lookup
  ON athlete_e1rm(athlete_id, exercise_id, calculated_date DESC);

-- Drop the old partial unique index if it exists from a prior run
DROP INDEX IF EXISTS idx_athlete_e1rm_unique_source;

-- ─── Mayhew e1RM function ──────────────────────────────────────────────────
-- e1RM = (100 × load) / (52.2 + 41.9 × exp(-0.055 × reps))
CREATE OR REPLACE FUNCTION calculate_e1rm(load numeric, reps int)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF load IS NULL OR reps IS NULL OR load <= 0 OR reps <= 0 THEN
    RETURN NULL;
  END IF;
  RETURN ROUND(
    (100.0 * load) / (52.2 + 41.9 * exp(-0.055 * reps)),
    2
  );
END;
$$;

-- Trigger: append on new highest e1RM
CREATE OR REPLACE FUNCTION update_athlete_e1rm() RETURNS trigger AS $$
DECLARE
  v_athlete_id text;
  v_exercise_id uuid;
  v_e1rm numeric;
  v_latest numeric;
BEGIN
  IF NEW.actual_load_kg IS NULL OR NEW.actual_reps IS NULL OR NEW.actual_reps <= 0 THEN
    RETURN NEW;
  END IF;

  SELECT sl.athlete_id, se.exercise_id
    INTO v_athlete_id, v_exercise_id
    FROM session_logs sl
    JOIN session_exercises se ON se.id = NEW.session_exercise_id
   WHERE sl.id = NEW.session_log_id;

  IF v_athlete_id IS NULL OR v_exercise_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_e1rm := calculate_e1rm(NEW.actual_load_kg, NEW.actual_reps);
  IF v_e1rm IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT e1rm_kg INTO v_latest
    FROM athlete_e1rm
   WHERE athlete_id = v_athlete_id
     AND exercise_id = v_exercise_id
   ORDER BY calculated_date DESC, created_at DESC
   LIMIT 1;

  IF v_latest IS NULL OR v_e1rm > v_latest THEN
    INSERT INTO athlete_e1rm
      (athlete_id, exercise_id, e1rm_kg, source_set_log_id, calculated_date)
    VALUES
      (v_athlete_id, v_exercise_id, v_e1rm, NEW.id, current_date);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_athlete_e1rm ON set_logs;
CREATE TRIGGER trg_update_athlete_e1rm
  AFTER INSERT OR UPDATE OF actual_load_kg, actual_reps ON set_logs
  FOR EACH ROW EXECUTE FUNCTION update_athlete_e1rm();

-- ─── updated_at touch trigger ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'programming_settings','exercise_library','athlete_calendar_events',
    'training_blocks','block_sessions','session_exercises',
    'exercise_week_prescriptions','session_logs','set_logs'
  ]) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_touch_updated_at ON %I', t);
    EXECUTE format(
      'CREATE TRIGGER trg_touch_updated_at BEFORE UPDATE ON %I '
      'FOR EACH ROW EXECUTE FUNCTION touch_updated_at()', t
    );
  END LOOP;
END $$;

-- ─── RLS policies ──────────────────────────────────────────────────────────
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'programming_settings','exercise_library','athlete_calendar_events',
    'training_blocks','block_sessions','session_exercises',
    'exercise_week_prescriptions','session_logs','set_logs','athlete_e1rm'
  ]) LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS allow_all ON %I', t);
    -- TO public covers both anon and authenticated. The AMS uses anon (with
    -- DEV_BYPASS skipping Supabase Auth) so policies scoped to authenticated
    -- alone block normal app usage. Matches the wellness_schema.sql pattern.
    EXECUTE format(
      'CREATE POLICY allow_all ON %I FOR ALL TO public USING (true) WITH CHECK (true)',
      t
    );
  END LOOP;
END $$;

-- End of schema migration.
