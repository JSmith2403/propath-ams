-- ============================================================================
-- Titus McKnight — one-off week program, Wed 2 Sep – Sat 5 Sep 2026
-- Date: 2026-09-02
-- Data-only (no schema changes). Safe to re-run: it checks for this
-- exact FreeForm block before inserting anything, so running it twice
-- is a no-op the second time rather than a duplicate week.
--
-- Modelled as a "FreeForm" training_block (the same lightweight,
-- single-week block the Programme calendar's own "Plan for a week"
-- button creates) containing 9 sessions across 4 days:
--
--   Wed  Prep, Rugby, Conditioning, Uppers
--   Thu  Rugby Handling, Lower Body & Core
--   Fri  Down Day
--   Sat  Aerobic Run, Supplementary Uppers
--
-- Prep / Rugby / Conditioning / Rugby Handling / Down Day / Aerobic Run
-- have no exercise/set prescription at all — they're field/technical
-- work, authored as a single coach note per session (session_step_notes)
-- describing what to do. The athlete app now recognises a session with
-- zero exercises as "technical": it shows the note, skips the set-by-
-- set grid entirely, and drops straight into the duration + RPE finish
-- flow (session_logs.srpe_load = duration_minutes × session_rpe is
-- computed automatically by the existing trigger either way).
--
-- Uppers / Lower Body & Core / Supplementary Uppers are real gym
-- sessions with exercises + week-1 prescriptions, logged set-by-set
-- exactly like every other strength session in the app.
-- ============================================================================

DO $$
DECLARE
  v_athlete_id text;
  v_block_id   uuid;
  v_display_order int;
  v_session_id uuid;
  v_ex uuid;
  v_se uuid;
  v_ssid uuid;
BEGIN
  SELECT id INTO v_athlete_id
  FROM athletes
  WHERE data->>'name' ILIKE '%titus%' AND data->>'name' ILIKE '%mcknight%'
  LIMIT 1;

  IF v_athlete_id IS NULL THEN
    RAISE EXCEPTION 'Could not find an athlete named Titus McKnight (athletes.data->>name) — nothing was inserted.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM training_blocks
    WHERE athlete_id = v_athlete_id
      AND block_name = 'FreeForm'
      AND start_date = DATE '2026-09-02'
      AND end_date   = DATE '2026-09-05'
  ) THEN
    RAISE NOTICE 'This week''s FreeForm block already exists for Titus — skipping, nothing inserted.';
    RETURN;
  END IF;

  SELECT COALESCE(MAX(display_order), 0) + 1 INTO v_display_order
  FROM training_blocks WHERE athlete_id = v_athlete_id;

  INSERT INTO training_blocks (athlete_id, block_name, start_date, end_date, duration_weeks, display_order)
  VALUES (v_athlete_id, 'FreeForm', DATE '2026-09-02', DATE '2026-09-05', 1, v_display_order)
  RETURNING id INTO v_block_id;

  -- ── Wed 2 Sep — Prep (technical) ────────────────────────────────────
  INSERT INTO block_sessions (block_id, session_name, session_order)
  VALUES (v_block_id, 'Prep', 1) RETURNING id INTO v_session_id;
  INSERT INTO session_step_notes (block_session_id, display_order, content) VALUES (
    v_session_id, 1,
    '2 rounds:
Pelvic tucks x15
Glute bridges x15
Bird dog x10/side
Side plank clam x15s/side
Bear Crawl Shoulder Taps x10'
  );
  INSERT INTO planned_sessions (athlete_id, block_id, block_session_id, week_number, planned_date)
  VALUES (v_athlete_id, v_block_id, v_session_id, 1, DATE '2026-09-02');

  -- ── Wed 2 Sep — Rugby (technical) ───────────────────────────────────
  INSERT INTO block_sessions (block_id, session_name, session_order)
  VALUES (v_block_id, 'Rugby', 2) RETURNING id INTO v_session_id;
  INSERT INTO session_step_notes (block_session_id, display_order, content) VALUES (
    v_session_id, 1, 'Join team warm-up & passing'
  );
  INSERT INTO planned_sessions (athlete_id, block_id, block_session_id, week_number, planned_date)
  VALUES (v_athlete_id, v_block_id, v_session_id, 1, DATE '2026-09-02');

  -- ── Wed 2 Sep — Conditioning (technical) ────────────────────────────
  INSERT INTO block_sessions (block_id, session_name, session_order)
  VALUES (v_block_id, 'Conditioning', 3) RETURNING id INTO v_session_id;
  INSERT INTO session_step_notes (block_session_id, display_order, content) VALUES (
    v_session_id, 1,
    'Warm-up: 4 x pitch laps, easy conversational pace (~1km in 6:00)

Run Block 1: 6 x 100m inside 20-25s, walk/jog recovery
Rest 2:00
Run Block 2: 6 x 100m inside 25-30s, walk/jog recovery

Cool-down: 4 x pitch laps, easy conversational pace (~1km in 6:00)

Cue: stay tall throughout
Total: ~3.2km
Avoid: Kicking & rotational work beyond short passing'
  );
  INSERT INTO planned_sessions (athlete_id, block_id, block_session_id, week_number, planned_date)
  VALUES (v_athlete_id, v_block_id, v_session_id, 1, DATE '2026-09-02');

  -- ── Wed 2 Sep — Uppers (gym) ─────────────────────────────────────────
  INSERT INTO block_sessions (block_id, session_name, session_order)
  VALUES (v_block_id, 'Uppers', 4) RETURNING id INTO v_session_id;

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Flat Bench Press';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Flat Bench Press', 'strength', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, exercise_id, display_order, prescription_type)
  VALUES (v_session_id, v_ex, 1, 'kg') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value)
  VALUES (v_se, 1, 4, '5', '60+');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Chest Supported Row';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Chest Supported Row', 'strength', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, exercise_id, display_order, prescription_type)
  VALUES (v_session_id, v_ex, 2, 'reps_only') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 3, '8');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Chin-Ups';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Chin-Ups', 'strength', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_ex, 3, 'kg', 'Assisted') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value)
  VALUES (v_se, 1, 4, '5', '-27');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Cable Face Pulls';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Cable Face Pulls', 'accessory', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, exercise_id, display_order, prescription_type)
  VALUES (v_session_id, v_ex, 4, 'reps_only') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 3, '12');

  INSERT INTO planned_sessions (athlete_id, block_id, block_session_id, week_number, planned_date)
  VALUES (v_athlete_id, v_block_id, v_session_id, 1, DATE '2026-09-02');

  -- ── Thu 3 Sep — Rugby Handling (technical) ──────────────────────────
  INSERT INTO block_sessions (block_id, session_name, session_order)
  VALUES (v_block_id, 'Rugby Handling', 5) RETURNING id INTO v_session_id;
  INSERT INTO session_step_notes (block_session_id, display_order, content) VALUES (
    v_session_id, 1,
    'Prep: Pelvic tucks x15, Glute bridges x15, Bird dog x10/side, Side plank clam x15s/side, Bear Crawl Shoulder Taps x10, Y&T Holds (chest-supported) 2x6/side

Join easy bits, keep it technical, low volume'
  );
  INSERT INTO planned_sessions (athlete_id, block_id, block_session_id, week_number, planned_date)
  VALUES (v_athlete_id, v_block_id, v_session_id, 1, DATE '2026-09-03');

  -- ── Thu 3 Sep — Lower Body & Core (gym) ──────────────────────────────
  INSERT INTO block_sessions (block_id, session_name, session_order)
  VALUES (v_block_id, 'Lower Body & Core', 6) RETURNING id INTO v_session_id;

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'SL Leg Press';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('SL Leg Press', 'accessory', 'unilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_ex, 1, 'reps_only', 'Per leg') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 2, '10');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'DB Step-up';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('DB Step-up', 'accessory', 'unilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_ex, 2, 'reps_only', 'Per leg') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 2, '10');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Glute Bridge or Lateral Lunge';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Glute Bridge or Lateral Lunge', 'accessory', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_ex, 3, 'reps_only', 'Bodyweight or goblet') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 2, '12');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Seated Calf Raise';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Seated Calf Raise', 'accessory', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, exercise_id, display_order, prescription_type)
  VALUES (v_session_id, v_ex, 4, 'reps_only') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 2, '15');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Plank';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Plank', 'accessory', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, exercise_id, display_order, prescription_type)
  VALUES (v_session_id, v_ex, 5, 'time') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 2, '20-30s');

  INSERT INTO planned_sessions (athlete_id, block_id, block_session_id, week_number, planned_date)
  VALUES (v_athlete_id, v_block_id, v_session_id, 1, DATE '2026-09-03');

  -- ── Fri 4 Sep — Down Day (technical) ─────────────────────────────────
  INSERT INTO block_sessions (block_id, session_name, session_order)
  VALUES (v_block_id, 'Down Day', 7) RETURNING id INTO v_session_id;
  INSERT INTO session_step_notes (block_session_id, display_order, content) VALUES (
    v_session_id, 1, 'Walking only, nothing structured'
  );
  INSERT INTO planned_sessions (athlete_id, block_id, block_session_id, week_number, planned_date)
  VALUES (v_athlete_id, v_block_id, v_session_id, 1, DATE '2026-09-04');

  -- ── Sat 5 Sep — Aerobic Run (technical) ──────────────────────────────
  INSERT INTO block_sessions (block_id, session_name, session_order)
  VALUES (v_block_id, 'Aerobic Run', 8) RETURNING id INTO v_session_id;
  INSERT INTO session_step_notes (block_session_id, display_order, content) VALUES (
    v_session_id, 1,
    'Prep: Foam roll & floss

Run (Treadmill, aerobic):
Warm-up 1km, 6:00 conversational pace.
Main set: 4-6 x 2 min easy-moderate jog / 1 min walk.
Cool-down 1km, 6:00 conversational.
Total ~3.5-4km.'
  );
  INSERT INTO planned_sessions (athlete_id, block_id, block_session_id, week_number, planned_date)
  VALUES (v_athlete_id, v_block_id, v_session_id, 1, DATE '2026-09-05');

  -- ── Sat 5 Sep — Supplementary Uppers (gym) ───────────────────────────
  INSERT INTO block_sessions (block_id, session_name, session_order)
  VALUES (v_block_id, 'Supplementary Uppers', 9) RETURNING id INTO v_session_id;

  SELECT id INTO v_ex FROM exercise_library WHERE name = '3 Point Row';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('3 Point Row', 'accessory', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, exercise_id, display_order, prescription_type)
  VALUES (v_session_id, v_ex, 1, 'reps_only') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 3, '10');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Lateral Raise';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Lateral Raise', 'accessory', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, exercise_id, display_order, prescription_type)
  VALUES (v_session_id, v_ex, 2, 'reps_only') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 3, '10');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Cable Straight Arm Pulldown (Ribs Down)';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES (, , )', 'accessory', 'bilateral', 'reps_only') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, exercise_id, display_order, prescription_type)
  VALUES (v_session_id, v_ex, 3, 'reps_only') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 3, '10');

  -- Tricep push-down + bicep curl are supersetted ("3x15 each") — share
  -- a superset_group_id so the athlete app stacks them as one pair.
  v_ssid := gen_random_uuid();

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Cable Tricep Push-Down';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Cable Tricep Push-Down', 'accessory', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, exercise_id, display_order, prescription_type, superset_group_id)
  VALUES (v_session_id, v_ex, 4, 'reps_only', v_ssid) RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 3, '15');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Cable Bicep Curl';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Cable Bicep Curl', 'accessory', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, exercise_id, display_order, prescription_type, superset_group_id)
  VALUES (v_session_id, v_ex, 5, 'reps_only', v_ssid) RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 3, '15');

  INSERT INTO planned_sessions (athlete_id, block_id, block_session_id, week_number, planned_date)
  VALUES (v_athlete_id, v_block_id, v_session_id, 1, DATE '2026-09-05');

  RAISE NOTICE 'Titus McKnight''s week (Wed 2 – Sat 5 Sep) inserted: 9 sessions across 4 days.';
END $$;

-- End of migration.
