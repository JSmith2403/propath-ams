-- ============================================================================
-- New athlete: Lulu Mubarak, plus tomorrow's Injury Prevention + Power session
-- Date: 2026-09-14
-- Data-only. Safe to re-run: skips entirely if an athlete named
-- "Lulu Mubarak" already exists.
--
-- Session is a single block_session with five sections in order:
-- General Mobility, Activation, Plyometrics, Strength, Finisher — matching
-- the coach's written program exactly, including the asymmetric left-side
-- notes (e.g. "left gets a 3rd set", "left leads") and the RPE-based
-- Strength block's two supersets (RDL+TRX Row, Incline Push-up+Calf Raise).
-- Goblet Split Lunge (A1) has no A2 partner in the brief, so it's entered
-- standalone, not supersetted.
-- ============================================================================

DO $$
DECLARE
  v_athlete_id uuid := gen_random_uuid();
  v_block_id   uuid;
  v_session_id uuid;
  v_sec_mobility  uuid;
  v_sec_activation uuid;
  v_sec_plyo      uuid;
  v_sec_strength  uuid;
  v_sec_finisher  uuid;
  v_ex uuid;
  v_se uuid;
  v_ssid_b uuid;
  v_ssid_c uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM athletes WHERE data->>'name' = 'Lulu Mubarak') THEN
    RAISE NOTICE 'Lulu Mubarak already exists — skipping, nothing inserted.';
    RETURN;
  END IF;

  INSERT INTO athletes (id, data, updated_at)
  VALUES (
    v_athlete_id::text,
    jsonb_build_object(
      'id', v_athlete_id::text,
      'name', 'Lulu Mubarak',
      'dob', '2012-06-13',
      'sport', 'Football',
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

  -- ── One-off training block for tomorrow ─────────────────────────────
  INSERT INTO training_blocks (athlete_id, block_name, start_date, end_date, duration_weeks, display_order)
  VALUES (v_athlete_id::text, 'FreeForm', DATE '2026-09-14', DATE '2026-09-14', 1, 1)
  RETURNING id INTO v_block_id;

  INSERT INTO block_sessions (block_id, session_name, session_order)
  VALUES (v_block_id, 'Injury Prevention + Power', 1)
  RETURNING id INTO v_session_id;

  INSERT INTO session_sections (block_session_id, name, display_order) VALUES
    (v_session_id, 'General Mobility', 1) RETURNING id INTO v_sec_mobility;
  INSERT INTO session_sections (block_session_id, name, display_order) VALUES
    (v_session_id, 'Activation', 2) RETURNING id INTO v_sec_activation;
  INSERT INTO session_sections (block_session_id, name, display_order) VALUES
    (v_session_id, 'Plyometrics', 3) RETURNING id INTO v_sec_plyo;
  INSERT INTO session_sections (block_session_id, name, display_order) VALUES
    (v_session_id, 'Strength', 4) RETURNING id INTO v_sec_strength;
  INSERT INTO session_sections (block_session_id, name, display_order) VALUES
    (v_session_id, 'Finisher', 5) RETURNING id INTO v_sec_finisher;

  -- display_order is unique per session across every section combined
  -- (sections are just a grouping label) — climbs 1..20 straight
  -- through: 2 session-level notes + 18 exercises.

  -- Session-level framing note (no section — applies to the whole thing).
  INSERT INTO session_step_notes (block_session_id, display_order, content)
  VALUES (v_session_id, 1, 'Session focus: Injury prevention + power, ~60-70 min');

  -- ── 1. General Mobility ──────────────────────────────────────────────
  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Hip 90/90 Rocks';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Hip 90/90 Rocks', 'mobility', 'unilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_sec_mobility, v_ex, 2, 'reps_only', 'Each side') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 1, '6');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Thread the Needle';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Thread the Needle', 'mobility', 'unilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_sec_mobility, v_ex, 3, 'reps_only', 'Each side — thoracic rotation') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 1, '6');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Cat-Cow into Segmental Extension';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Cat-Cow into Segmental Extension', 'mobility', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type)
  VALUES (v_session_id, v_sec_mobility, v_ex, 4, 'reps_only') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 1, '8');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Standing Lower Back Rotational Mobility';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Standing Lower Back Rotational Mobility', 'mobility', 'unilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_sec_mobility, v_ex, 5, 'reps_only', 'Each side') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 1, '8');

  -- ── 2. Activation (2 sets, controlled tempo) ────────────────────────
  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Sidelying Hip Adduction';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Sidelying Hip Adduction', 'warm_up', 'unilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_sec_activation, v_ex, 6, 'reps_only', 'Each side, left first') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 2, '10');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Banded Lateral Walks';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Banded Lateral Walks', 'warm_up', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_sec_activation, v_ex, 7, 'reps_only', 'Each direction') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 2, '8 steps');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Single Leg Holds';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Single Leg Holds', 'accessory', 'unilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_sec_activation, v_ex, 8, 'time', 'Each side — left gets a 3rd set') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 2, '30s');

  -- ── 3. Plyometrics (dosed — landing quality over volume) ────────────
  INSERT INTO session_step_notes (block_session_id, section_id, display_order, content)
  VALUES (v_session_id, v_sec_plyo, 9, 'Dosed — landing quality over volume');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Snap Downs';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Snap Downs', 'jumps_plyos', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type)
  VALUES (v_session_id, v_sec_plyo, v_ex, 10, 'reps_only') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 3, '5');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Low Intensity Pogos';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Low Intensity Pogos', 'jumps_plyos', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_sec_plyo, v_ex, 11, 'reps_only', 'Both feet') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 3, '8');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'SL Line Hops';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('SL Line Hops', 'jumps_plyos', 'unilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_sec_plyo, v_ex, 12, 'reps_only', 'Each side — left leads') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 3, '6');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Broad Jump to Stick';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Broad Jump to Stick', 'jumps_plyos', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_sec_plyo, v_ex, 13, 'reps_only', 'Full recovery between reps') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 4, '3');

  -- ── 4. Strength ──────────────────────────────────────────────────────
  -- A1 has no A2 partner in the brief — entered standalone.
  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Goblet Split Lunge';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Goblet Split Lunge', 'strength', 'unilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_sec_strength, v_ex, 14, 'rpe', 'Each leg, left first — extra focus on stance stability') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value)
  VALUES (v_se, 1, 3, '6', '7');

  -- B1 + B2 supersetted.
  v_ssid_b := gen_random_uuid();

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Romanian Deadlift';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Romanian Deadlift', 'strength', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, superset_group_id)
  VALUES (v_session_id, v_sec_strength, v_ex, 15, 'rpe', v_ssid_b) RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value)
  VALUES (v_se, 1, 3, '8', '7');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'TRX Row';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('TRX Row', 'strength', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, superset_group_id)
  VALUES (v_session_id, v_sec_strength, v_ex, 16, 'reps_only', v_ssid_b) RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 3, '10');

  -- C1 + C2 supersetted.
  v_ssid_c := gen_random_uuid();

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Incline Push-up';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Incline Push-up', 'strength', 'bilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, superset_group_id)
  VALUES (v_session_id, v_sec_strength, v_ex, 17, 'reps_only', v_ssid_c) RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 3, '8-10');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Calf Raise';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Calf Raise', 'accessory', 'unilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, superset_group_id, notes)
  VALUES (v_session_id, v_sec_strength, v_ex, 18, 'reps_only', v_ssid_c, 'Each side — left gets +2 reps') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 3, '12');

  -- ── 5. Finisher ──────────────────────────────────────────────────────
  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Copenhagen Plank';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Copenhagen Plank', 'accessory', 'unilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_sec_finisher, v_ex, 19, 'time', 'Each side, left first') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 3, '20s');

  SELECT id INTO v_ex FROM exercise_library WHERE name = 'Deadbug';
  IF v_ex IS NULL THEN
    INSERT INTO exercise_library (name, category, bilateral_unilateral)
    VALUES ('Deadbug', 'accessory', 'unilateral') RETURNING id INTO v_ex;
  END IF;
  INSERT INTO session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (v_session_id, v_sec_finisher, v_ex, 20, 'reps_only', 'Each side') RETURNING id INTO v_se;
  INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps)
  VALUES (v_se, 1, 3, '8');

  -- ── Place it on tomorrow's calendar ──────────────────────────────────
  INSERT INTO planned_sessions (athlete_id, block_id, block_session_id, week_number, planned_date)
  VALUES (v_athlete_id::text, v_block_id, v_session_id, 1, DATE '2026-09-14');

  RAISE NOTICE 'Lulu Mubarak created (id %) with tomorrow''s Injury Prevention + Power session.', v_athlete_id;
END $$;

-- End of migration.
