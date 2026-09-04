-- ============================================================================
-- New athlete: Aria Harris, plus today's Strength Session
-- Date: 2026-09-04
-- Data-only. Safe to re-run: skips entirely if an athlete named
-- "Aria Harris" already exists.
--
-- Mirrors exactly what AddAthleteModal + useAthletes.addAthlete would
-- produce (same default fields, same phase2 shape), so the coach app's
-- Overview/Physical/Psych/etc tabs all find the keys they expect.
--
-- Session is a single "Strength Session" today (2026-09-04) with three
-- sections in order: First Block Activation, Strength, Finisher —
-- matching the coach's written program exactly.
--
-- Note: "ASH Iso" had no sets/reps given in the brief, so it's added
-- with no prescription (a single tick-off item) — add real sets/reps
-- for it in the builder. "Captain Morgans 2 x 2x15s Each Side" reads
-- as 2 sets of 15s per side; adjust in the builder if that's not what
-- was meant. "TRX Row to Crucific" is entered as "TRX Row to Crucifix"
-- (assumed spelling).
-- ============================================================================

DO $$
DECLARE
  v_athlete_id uuid := gen_random_uuid();
  v_block_id   uuid;
  v_session_id uuid;
  v_sec_id     uuid;
  v_ex uuid;
  v_se uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM athletes WHERE data->>'name' = 'Aria Harris') THEN
    RAISE NOTICE 'Aria Harris already exists — skipping, nothing inserted.';
    RETURN;
  END IF;

  INSERT INTO athletes (id, data, updated_at)
  VALUES (
    v_athlete_id::text,
    jsonb_build_object(
      'id', v_athlete_id::text,
      'name', 'Aria Harris',
      'dob', '',
      'sport', 'Rugby',
      'cohort', 'Elite',
      'gender', 'Female',
      'maturationStage', 'Pre-PHV',
      'phvPercent', 0,
      'biography', '',
      'coach', '',
      'affiliation', '',
      'emergencyName', '',
      'emergencyPhone', '',
      'photo', null,
      'rag', jsonb_build_object('physical','grey','psych','grey','nutrition','grey','lifestyle','grey'),
      'ragLog', jsonb_build_object('physical','[]'::jsonb,'psych','[]'::jsonb,'nutrition','[]'::jsonb,'lifestyle','[]'::jsonb),
      'quarterlyReviews', '[]'::jsonb,
      'checkIns', '[]'::jsonb,
      'phase2', jsonb_build_object(
        'maturation', jsonb_build_object('entries', '[]'::jsonb),
        'mobility', jsonb_build_object('entries', '{}'::jsonb),
        'performance', jsonb_build_object('entries', '{}'::jsonb),
        'physio', jsonb_build_object('entries', '[]'::jsonb),
        'physical', '{}'::jsonb,
        'lifestyle', '{}'::jsonb,
        'performanceBrag', '{}'::jsonb,
        'nutrition', jsonb_build_object('entries', jsonb_build_object(
          'screeningNotes','[]'::jsonb,'hydrationNotes','[]'::jsonb,'fuellingNotes','[]'::jsonb,
          'supplementLog','[]'::jsonb,'sessionNotes','[]'::jsonb
        )),
        'psych', jsonb_build_object(
          'acsi28','[]'::jsonb,'sessionNotes','[]'::jsonb,'goalSettingLog','[]'::jsonb,
          'mentalPerformanceNotes','[]'::jsonb,'generalObservations','[]'::jsonb
        )
      )
    ),
    now()
  );

  -- ── One-off training block for today ────────────────────────────────
  INSERT INTO training_blocks (athlete_id, block_name, start_date, end_date, duration_weeks, display_order)
  VALUES (v_athlete_id::text, 'FreeForm', DATE '2026-09-04', DATE '2026-09-04', 1, 1)
  RETURNING id INTO v_block_id;

  INSERT INTO block_sessions (block_id, session_name, session_order)
  VALUES (v_block_id, 'Strength Session', 1)
  RETURNING id INTO v_session_id;

  -- display_order is unique per session across ALL sections (sections
  -- are just a grouping label, not a separate numbering scope) — so it
  -- climbs 1..11 straight through, not restarting per section.

  -- ── Section 1: First Block Activation ───────────────────────────────
  INSERT INTO session_sections (block_session_id, name, display_order)
  VALUES (v_session_id, 'First Block Activation', 1)
  RETURNING id INTO v_sec_id;

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Hip Hitch';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Hip Hitch', 'accessory', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type)
  VALUES (v_session_id, v_sec_id, v_ex, 1, 'reps_only') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 2, '15');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Captain Morgans';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Captain Morgans', 'accessory', 'unilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_sec_id, v_ex, 2, 'time', 'Each side') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 2, '15s');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Acceleration Hold';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Acceleration Hold', 'speed', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type)
  VALUES (v_session_id, v_sec_id, v_ex, 3, 'time') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 2, '15s');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Banded A-Frame Hold';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Banded A-Frame Hold', 'warm_up', 'unilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_sec_id, v_ex, 4, 'time', 'Each side') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 2, '15s');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'GHD Hold';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('GHD Hold', 'accessory', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type)
  VALUES (v_session_id, v_sec_id, v_ex, 5, 'time') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 2, '20s');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Star Plank';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Star Plank', 'accessory', 'unilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_sec_id, v_ex, 6, 'reps_only', 'Each leg') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 2, '5');

  -- ── Section 2: Strength ──────────────────────────────────────────────
  INSERT INTO session_sections (block_session_id, name, display_order)
  VALUES (v_session_id, 'Strength', 2)
  RETURNING id INTO v_sec_id;

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Bulgarian Split Squat';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Bulgarian Split Squat', 'strength', 'unilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type)
  VALUES (v_session_id, v_sec_id, v_ex, 7, 'reps_only') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 3, '10');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Rocket Launcher';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Rocket Launcher', 'power', 'unilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_sec_id, v_ex, 8, 'reps_only', 'Each leg') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 3, '5');

  -- No sets/reps given for this one — leave unprescribed (tick-off only).
  SELECT id INTO v_ex FROM exercise_library WHERE name = 'ASH Iso';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('ASH Iso', 'accessory', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_sec_id, v_ex, 9, 'time', 'No sets/reps given — add prescription in the builder');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'TRX Row to Crucifix';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('TRX Row to Crucifix', 'strength', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type)
  VALUES (v_session_id, v_sec_id, v_ex, 10, 'reps_only') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 3, '10');

  -- ── Section 3: Finisher ──────────────────────────────────────────────
  INSERT INTO session_sections (block_session_id, name, display_order)
  VALUES (v_session_id, 'Finisher', 3)
  RETURNING id INTO v_sec_id;

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Seated Calf';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Seated Calf', 'accessory', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_sec_id, v_ex, 11, 'reps_only', 'Heavy') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 3, '6');

  -- ── Place it on today's calendar ─────────────────────────────────────
  INSERT INTO planned_sessions (athlete_id, block_id, block_session_id, week_number, planned_date)
  VALUES (v_athlete_id::text, v_block_id, v_session_id, 1, DATE '2026-09-04');

  RAISE NOTICE 'Aria Harris created (id %) with today''s Strength Session.', v_athlete_id;
END $$;

-- End of migration.
