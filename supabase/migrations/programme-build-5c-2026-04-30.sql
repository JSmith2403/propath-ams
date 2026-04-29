-- Programme Build 5c — exercise_library schema expansion
-- Date: 2026-04-30
-- Branch: dev/programme-build-5c
-- Idempotent: safe to re-run.
--
-- Three concerns:
--   1. Drop the unused default_prescription_type column. Brief 5c
--      hardcodes 'kg' as the system-wide default — coach overrides
--      per-exercise via the prescription pill in the builder.
--   2. Add ten new attribute columns describing each exercise more
--      completely (equipment, complexity, muscles, joint pattern, etc.)
--      so the library can be filtered/searched on them in future briefs.
--   3. Add GIN indexes on the array-shaped attributes plus a btree on
--      complexity to keep filter queries cheap.
--
-- CHECK constraints are added under DROP CONSTRAINT IF EXISTS / ADD
-- CONSTRAINT pairs so re-runs leave the table in a known state — the
-- same pattern we use elsewhere in this project.
--
-- movement_patterns stays as text[] with no enum constraint. The
-- controlled vocabulary is documented at the bottom of this file and
-- enforced in app code, not the DB. This avoids the maintenance cost
-- of frequent enum churn as the taxonomy evolves.

-- ─── 1. Drop unused column ────────────────────────────────────────────
ALTER TABLE exercise_library
  DROP COLUMN IF EXISTS default_prescription_type;

-- ─── 2. Add new attribute columns (no inline CHECKs — added below) ────
ALTER TABLE exercise_library
  ADD COLUMN IF NOT EXISTS posterior_anterior  text,
  ADD COLUMN IF NOT EXISTS complexity          int,
  ADD COLUMN IF NOT EXISTS equipment           text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS primary_muscle      text,
  ADD COLUMN IF NOT EXISTS supporting_muscles  text[],
  ADD COLUMN IF NOT EXISTS muscle_bias         text,
  ADD COLUMN IF NOT EXISTS joint_count_level   text,
  ADD COLUMN IF NOT EXISTS dynamic_isometric   text,
  ADD COLUMN IF NOT EXISTS movement_plane      text,
  ADD COLUMN IF NOT EXISTS primary_joints      text[];

-- ─── 3. CHECK constraints (drop + recreate for idempotency) ───────────
ALTER TABLE exercise_library
  DROP CONSTRAINT IF EXISTS exercise_library_posterior_anterior_check;
ALTER TABLE exercise_library
  ADD  CONSTRAINT exercise_library_posterior_anterior_check
  CHECK (posterior_anterior IS NULL OR posterior_anterior IN ('posterior','anterior','mixed'));

ALTER TABLE exercise_library
  DROP CONSTRAINT IF EXISTS exercise_library_complexity_check;
ALTER TABLE exercise_library
  ADD  CONSTRAINT exercise_library_complexity_check
  CHECK (complexity IS NULL OR complexity BETWEEN 1 AND 3);

ALTER TABLE exercise_library
  DROP CONSTRAINT IF EXISTS exercise_library_muscle_bias_check;
ALTER TABLE exercise_library
  ADD  CONSTRAINT exercise_library_muscle_bias_check
  CHECK (muscle_bias IS NULL OR muscle_bias IN ('shortened','mid','lengthened'));

ALTER TABLE exercise_library
  DROP CONSTRAINT IF EXISTS exercise_library_joint_count_level_check;
ALTER TABLE exercise_library
  ADD  CONSTRAINT exercise_library_joint_count_level_check
  CHECK (joint_count_level IS NULL OR joint_count_level IN ('local','regional','global'));

ALTER TABLE exercise_library
  DROP CONSTRAINT IF EXISTS exercise_library_dynamic_isometric_check;
ALTER TABLE exercise_library
  ADD  CONSTRAINT exercise_library_dynamic_isometric_check
  CHECK (dynamic_isometric IS NULL OR dynamic_isometric IN ('dynamic','isometric','stretch'));

ALTER TABLE exercise_library
  DROP CONSTRAINT IF EXISTS exercise_library_movement_plane_check;
ALTER TABLE exercise_library
  ADD  CONSTRAINT exercise_library_movement_plane_check
  CHECK (movement_plane IS NULL OR movement_plane IN ('horizontal','vertical','sagittal','frontal','transverse','other'));

-- ─── 4. Indexes ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_exercise_library_equipment
  ON exercise_library USING gin(equipment);
CREATE INDEX IF NOT EXISTS idx_exercise_library_supporting
  ON exercise_library USING gin(supporting_muscles);
CREATE INDEX IF NOT EXISTS idx_exercise_library_complexity
  ON exercise_library(complexity);

-- ─── 5. movement_patterns controlled vocabulary (documented, not enforced) ─
--
-- exercise_library.movement_patterns stays as text[] with no enum
-- constraint. The controlled set used by the import and the app is:
--
--   Existing:
--     squat
--     hinge
--     lunge
--     vertical_push
--     vertical_pull
--     horizontal_push
--     horizontal_pull
--     rotational
--     carry
--     core_anti_extension
--     core_anti_rotation
--     core_anti_lateral_flexion
--     core_rotation
--     core_lateral_flexion
--     core_flexion
--
--   New (Brief 5c):
--     hip_extension
--     step_up
--     ankle_extension
--     cyclical
--     spinal_extension
--     jumps_plyos
--
-- App code that constructs filter UIs / picker dropdowns should pull
-- from this list. Adding new patterns is a code change, not a schema
-- change — the column accepts any text array.
