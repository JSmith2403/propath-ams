-- ============================================================================
-- Kaiden Higgins (em1) — Driver Specific GPP Block (8 Weeks)
-- Date: 2026-07-05
--
-- Motorsport S&C block: base strength + grip endurance + neck stability
-- + VO2 max conditioning. Tue / Thu (gym) + Sat (interval run) for 8 weeks
-- starting Tue 7 Jul 2026.
--
-- Structure:
--   • 1 training_block
--   • 3 block_sessions:
--       Session A — Tuesday (Squat + Push/Pull + Neck)
--       Session B — Thursday (Trap Bar + Chin + Landmine + Neck)
--       Session C — Saturday (Interval Run)
--   • Sections per Tue/Thu: Prep · Main · Neck
--   • Section for Sat: Conditioning
--   • Week-by-week prescriptions on every lift (reps + sets change through
--     the block; load hints live in the notes column)
--   • 24 planned_sessions pinning each block_session to its calendar date
--
-- New library rows (idempotent via unique name):
--   • Plate Pinch Carry
--   • Single-Leg Balance with Tennis Ball Catch
--   • Neck Isometrics (Flex/Ext/Lat)
--   • Interval Run (Hard/Easy)
--
-- Guard: aborts if a block already exists on this athlete with this name.
-- Safe to re-run.
-- ============================================================================

BEGIN;

-- ------------------------------------------------------------------
-- New library rows (name-unique so ON CONFLICT is a no-op on re-run)
-- ------------------------------------------------------------------
INSERT INTO public.exercise_library (name, category, bilateral_unilateral, is_active, notes)
VALUES
  ('Plate Pinch Carry',                       'strength',  'bilateral', true,
   'Grip-endurance carry pinching two smooth plates together in each hand.'),
  ('Single-Leg Balance with Tennis Ball Catch','warm_up',  'unilateral', true,
   'Stand on one leg, partner or wall tosses a tennis ball to catch — proprioceptive drill for driver reflex/balance.'),
  ('Neck Isometrics (Flex/Ext/Lat)',          'accessory', 'bilateral', true,
   'Manual/self-administered isometric holds — flexion, extension, and lateral flexion each side. Motorsport neck stability.'),
  ('Interval Run (Hard/Easy)',                'capacity',  'bilateral', true,
   'Hard-run / easy-run alternating intervals for VO2 max development.')
ON CONFLICT (name) DO NOTHING;


DO $seed$
DECLARE
  v_athlete_id text := 'em1';
  v_block_name text := 'Driver Specific GPP Block (8 Weeks)';
  blk uuid;
  bs_tue uuid;
  bs_thu uuid;
  bs_sat uuid;
  sec_tue_prep uuid;
  sec_tue_main uuid;
  sec_tue_neck uuid;
  sec_thu_prep uuid;
  sec_thu_main uuid;
  sec_thu_neck uuid;
  sec_sat_main uuid;

  -- Library ids resolved by name
  ex_skip uuid;   ex_hipflex uuid;   ex_pullapart uuid;
  ex_extrot uuid; ex_introt uuid;    ex_deadbug uuid;
  ex_pallof uuid; ex_slb uuid;

  ex_bs uuid;     ex_rdl uuid;       ex_bench uuid;
  ex_row uuid;    ex_pinch uuid;
  ex_tbdl uuid;   ex_chin uuid;      ex_landmine uuid;
  ex_calf uuid;   ex_neck uuid;      ex_run uuid;

  -- Prescription-carrying session_exercise ids (per exercise, per session)
  seT_bs uuid; seT_rdl uuid; seT_bench uuid; seT_row uuid; seT_pinch uuid; seT_neck uuid;
  seH_tbdl uuid; seH_chin uuid; seH_landmine uuid; seH_calf uuid; seH_neck uuid;
  seS_run uuid;

  v_existing int;
BEGIN
  -- Guard
  SELECT count(*) INTO v_existing
    FROM public.training_blocks
   WHERE athlete_id = v_athlete_id
     AND block_name = v_block_name;
  IF v_existing > 0 THEN
    RAISE NOTICE 'Driver Specific GPP Block already exists for Kaiden. Skipping.';
    RETURN;
  END IF;

  -- Resolve library ids
  SELECT id INTO ex_skip     FROM public.exercise_library WHERE name = 'Continuous Skipping';
  SELECT id INTO ex_hipflex  FROM public.exercise_library WHERE name = 'Half-Kneeling Hip Flexor with Reach';
  SELECT id INTO ex_pullapart FROM public.exercise_library WHERE name = 'Banded Pull-Aparts';
  SELECT id INTO ex_extrot   FROM public.exercise_library WHERE name = 'External Rotation (Band; 90/90)';
  SELECT id INTO ex_introt   FROM public.exercise_library WHERE name = 'Internal Rotation (Band; Elbow at Side)';
  SELECT id INTO ex_deadbug  FROM public.exercise_library WHERE name = 'Dead Bug';
  SELECT id INTO ex_pallof   FROM public.exercise_library WHERE name = 'Pallof Press';
  SELECT id INTO ex_slb      FROM public.exercise_library WHERE name = 'Single-Leg Balance with Tennis Ball Catch';

  SELECT id INTO ex_bs       FROM public.exercise_library WHERE name = 'Back Squat';
  SELECT id INTO ex_rdl      FROM public.exercise_library WHERE name = 'Romanian Deadlift';
  SELECT id INTO ex_bench    FROM public.exercise_library WHERE name = 'Bench Press';
  SELECT id INTO ex_row      FROM public.exercise_library WHERE name = 'Seated Row';
  SELECT id INTO ex_pinch    FROM public.exercise_library WHERE name = 'Plate Pinch Carry';
  SELECT id INTO ex_tbdl     FROM public.exercise_library WHERE name = 'Trap Bar Deadlift';
  SELECT id INTO ex_chin     FROM public.exercise_library WHERE name = 'Chin Up';
  SELECT id INTO ex_landmine FROM public.exercise_library WHERE name = 'Half Kneeling Landmine Press';
  SELECT id INTO ex_calf     FROM public.exercise_library WHERE name = 'Calf Raise';
  SELECT id INTO ex_neck     FROM public.exercise_library WHERE name = 'Neck Isometrics (Flex/Ext/Lat)';
  SELECT id INTO ex_run      FROM public.exercise_library WHERE name = 'Interval Run (Hard/Easy)';

  -- ---- Training block ----
  INSERT INTO public.training_blocks
    (athlete_id, block_name, start_date, end_date, duration_weeks, display_order, notes)
  VALUES
    (v_athlete_id, v_block_name, '2026-07-07', '2026-08-30', 8, 3,
     '8-week strength + conditioning block for motorsport driver. Base strength, grip endurance, neck stability, VO2 max conditioning. Tue/Thu gym + Sat interval run.')
  RETURNING id INTO blk;

  -- ---- Block sessions ----
  INSERT INTO public.block_sessions (block_id, session_order, session_name, coach_notes)
  VALUES (blk, 0, 'Session A — Tuesday (Squat + Push/Pull)',
          'Prep · Main strength (BS / RDL / Bench / Row / Pinch Carry) · Neck isometrics.')
  RETURNING id INTO bs_tue;

  INSERT INTO public.block_sessions (block_id, session_order, session_name, coach_notes)
  VALUES (blk, 1, 'Session B — Thursday (Trap Bar + Chin + Landmine)',
          'Prep · Main strength (TBDL / Chin / Half-Kneel Landmine / Calf) · Neck isometrics.')
  RETURNING id INTO bs_thu;

  INSERT INTO public.block_sessions (block_id, session_order, session_name, coach_notes)
  VALUES (blk, 2, 'Session C — Saturday (Interval Run)',
          'Wks 1–4: 8 × 2 min hard / 1 min easy.  Wks 5–8: 8 × 3 min hard / 1 min 30 sec easy.')
  RETURNING id INTO bs_sat;

  -- ---- Sections ----
  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up)
  VALUES (bs_tue, 'Prep', 0, true) RETURNING id INTO sec_tue_prep;
  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up)
  VALUES (bs_tue, 'Main', 1, false) RETURNING id INTO sec_tue_main;
  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up)
  VALUES (bs_tue, 'Neck', 2, false) RETURNING id INTO sec_tue_neck;

  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up)
  VALUES (bs_thu, 'Prep', 0, true) RETURNING id INTO sec_thu_prep;
  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up)
  VALUES (bs_thu, 'Main', 1, false) RETURNING id INTO sec_thu_main;
  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up)
  VALUES (bs_thu, 'Neck', 2, false) RETURNING id INTO sec_thu_neck;

  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up)
  VALUES (bs_sat, 'Conditioning', 0, false) RETURNING id INTO sec_sat_main;

  -- =================================================================
  -- TUESDAY
  -- =================================================================

  -- Prep (same all 8 weeks — single prescription attached)
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, is_warm_up)
  VALUES
    (bs_tue, sec_tue_prep, ex_skip,      0, 'time',      true),
    (bs_tue, sec_tue_prep, ex_hipflex,   1, 'reps_only', true),
    (bs_tue, sec_tue_prep, ex_pullapart, 2, 'reps_only', true),
    (bs_tue, sec_tue_prep, ex_extrot,    3, 'reps_only', true),
    (bs_tue, sec_tue_prep, ex_introt,    4, 'reps_only', true),
    (bs_tue, sec_tue_prep, ex_deadbug,   5, 'reps_only', true),
    (bs_tue, sec_tue_prep, ex_slb,       6, 'time',      true);

  -- Main lifts — capture ids for per-week prescriptions
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type)
  VALUES (bs_tue, sec_tue_main, ex_bs, 7, 'kg') RETURNING id INTO seT_bs;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type)
  VALUES (bs_tue, sec_tue_main, ex_rdl, 8, 'kg') RETURNING id INTO seT_rdl;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type)
  VALUES (bs_tue, sec_tue_main, ex_bench, 9, 'kg') RETURNING id INTO seT_bench;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type)
  VALUES (bs_tue, sec_tue_main, ex_row, 10, 'kg') RETURNING id INTO seT_row;
  INSERT INTO public.session_exercises
    (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (bs_tue, sec_tue_main, ex_pinch, 11, 'reps_only',
          'Pinch two smooth plates in each hand. Walk the prescribed distance. Add load week-to-week if achieved.')
  RETURNING id INTO seT_pinch;

  -- Neck
  INSERT INTO public.session_exercises
    (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (bs_tue, sec_tue_neck, ex_neck, 12, 'reps_only',
          '2 rounds: Flexion ×15 · Extension ×15 · Lateral Flexion ×15/side. Manual/self-administered.')
  RETURNING id INTO seT_neck;

  -- =================================================================
  -- THURSDAY
  -- =================================================================
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, is_warm_up)
  VALUES
    (bs_thu, sec_thu_prep, ex_skip,      0, 'time',      true),
    (bs_thu, sec_thu_prep, ex_hipflex,   1, 'reps_only', true),
    (bs_thu, sec_thu_prep, ex_pullapart, 2, 'reps_only', true),
    (bs_thu, sec_thu_prep, ex_extrot,    3, 'reps_only', true),
    (bs_thu, sec_thu_prep, ex_introt,    4, 'reps_only', true),
    (bs_thu, sec_thu_prep, ex_pallof,    5, 'reps_only', true),
    (bs_thu, sec_thu_prep, ex_slb,       6, 'time',      true);

  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type)
  VALUES (bs_thu, sec_thu_main, ex_tbdl, 7, 'kg') RETURNING id INTO seH_tbdl;
  INSERT INTO public.session_exercises
    (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (bs_thu, sec_thu_main, ex_chin, 8, 'kg', 'Loaded chin-ups — belt or DB between feet as needed.')
  RETURNING id INTO seH_chin;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type)
  VALUES (bs_thu, sec_thu_main, ex_landmine, 9, 'kg') RETURNING id INTO seH_landmine;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type)
  VALUES (bs_thu, sec_thu_main, ex_calf, 10, 'kg') RETURNING id INTO seH_calf;

  INSERT INTO public.session_exercises
    (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (bs_thu, sec_thu_neck, ex_neck, 11, 'reps_only',
          '2 rounds: Flexion ×15 · Extension ×15 · Lateral Flexion ×15/side. Self-administered.')
  RETURNING id INTO seH_neck;

  -- =================================================================
  -- SATURDAY
  -- =================================================================
  INSERT INTO public.session_exercises
    (block_session_id, section_id, exercise_id, display_order, prescription_type, notes)
  VALUES (bs_sat, sec_sat_main, ex_run, 0, 'time',
          'Hard/easy alternating intervals. Warm up 10 min before, cool down 5 min after.')
  RETURNING id INTO seS_run;

  -- =================================================================
  -- Prescriptions (weeks 1–8)
  -- =================================================================
  -- --- Tuesday warm-up (constant across weeks) ---
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value)
  SELECT se.id, w, s.sets, s.reps, s.target_value
    FROM (VALUES
      (ex_skip, 1, '1', '2 min'),
      (ex_hipflex, 1, '5/side', NULL),
      (ex_pullapart, 1, '12', NULL),
      (ex_extrot, 1, '10', NULL),
      (ex_introt, 1, '10', NULL),
      (ex_deadbug, 1, '6/side', NULL),
      (ex_slb, 1, '30 sec/leg', NULL)
    ) AS s(ex_id, sets, reps, target_value)
    JOIN public.session_exercises se
      ON se.section_id = sec_tue_prep AND se.exercise_id = s.ex_id
    CROSS JOIN generate_series(1,8) w;

  -- Thursday warm-up
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value)
  SELECT se.id, w, s.sets, s.reps, s.target_value
    FROM (VALUES
      (ex_skip, 1, '2 min', NULL),
      (ex_hipflex, 1, '5/side', NULL),
      (ex_pullapart, 1, '12', NULL),
      (ex_extrot, 1, '10', NULL),
      (ex_introt, 1, '10', NULL),
      (ex_pallof, 1, '8/side', NULL),
      (ex_slb, 1, '30 sec/leg', NULL)
    ) AS s(ex_id, sets, reps, target_value)
    JOIN public.session_exercises se
      ON se.section_id = sec_thu_prep AND se.exercise_id = s.ex_id
    CROSS JOIN generate_series(1,8) w;

  -- --- TUESDAY strength (per-week) ---
  --   Back Squat
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value) VALUES
    (seT_bs, 1, 4, '6', NULL),
    (seT_bs, 2, 4, '6', '+2.5–5 kg from wk 1 if achieved'),
    (seT_bs, 3, 5, '5', NULL),
    (seT_bs, 4, 5, '5', '+2.5–5 kg from wk 3 if achieved'),
    (seT_bs, 5, 5, '4', NULL),
    (seT_bs, 6, 5, '4', '+2.5–5 kg from wk 5 if achieved'),
    (seT_bs, 7, 5, '3', NULL),
    (seT_bs, 8, 5, '3', '+2.5–5 kg from wk 7 if achieved');

  --   Romanian Deadlift
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value) VALUES
    (seT_rdl, 1, 3, '8', NULL),
    (seT_rdl, 2, 3, '8', '+2.5–5 kg if achieved'),
    (seT_rdl, 3, 3, '8', NULL),
    (seT_rdl, 4, 3, '8', '+2.5–5 kg'),
    (seT_rdl, 5, 3, '6', NULL),
    (seT_rdl, 6, 3, '6', '+2.5–5 kg'),
    (seT_rdl, 7, 3, '6', NULL),
    (seT_rdl, 8, 3, '6', '+2.5–5 kg');

  --   Bench Press
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value) VALUES
    (seT_bench, 1, 3, '8', NULL),
    (seT_bench, 2, 3, '8', '+2.5 kg if achieved'),
    (seT_bench, 3, 4, '6', NULL),
    (seT_bench, 4, 4, '6', '+2.5 kg'),
    (seT_bench, 5, 4, '5', NULL),
    (seT_bench, 6, 4, '5', '+2.5 kg'),
    (seT_bench, 7, 4, '4', NULL),
    (seT_bench, 8, 4, '4', '+2.5 kg');

  --   Seated Row
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value) VALUES
    (seT_row, 1, 3, '10', NULL),
    (seT_row, 2, 3, '10', '+load if achieved'),
    (seT_row, 3, 3, '10', NULL),
    (seT_row, 4, 3, '10', NULL),
    (seT_row, 5, 3, '8', NULL),
    (seT_row, 6, 3, '8', NULL),
    (seT_row, 7, 3, '8', NULL),
    (seT_row, 8, 3, '8', NULL);

  --   Plate Pinch Carry (distance in target_value)
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value) VALUES
    (seT_pinch, 1, 3, '1', '20–30 m'),
    (seT_pinch, 2, 3, '1', '25–30 m'),
    (seT_pinch, 3, 3, '1', '30 m'),
    (seT_pinch, 4, 3, '1', '30 m — heavier'),
    (seT_pinch, 5, 3, '1', '30 m'),
    (seT_pinch, 6, 3, '1', '35 m'),
    (seT_pinch, 7, 3, '1', '35 m'),
    (seT_pinch, 8, 3, '1', '40 m or heavier load');

  --   Neck (Tue) — same every week
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value)
  SELECT seT_neck, w, 2, '15 each direction', 'Flex / Ext / Lat Flex ×15/side'
    FROM generate_series(1,8) w;

  -- --- THURSDAY strength (per-week) ---
  --   Trap Bar Deadlift
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value) VALUES
    (seH_tbdl, 1, 4, '6', NULL),
    (seH_tbdl, 2, 4, '6', '+2.5–5 kg if achieved'),
    (seH_tbdl, 3, 5, '5', NULL),
    (seH_tbdl, 4, 5, '5', '+2.5–5 kg'),
    (seH_tbdl, 5, 5, '4', NULL),
    (seH_tbdl, 6, 5, '4', '+2.5–5 kg'),
    (seH_tbdl, 7, 5, '3', NULL),
    (seH_tbdl, 8, 5, '3', '+2.5–5 kg');

  --   Loaded Chin-Ups
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value) VALUES
    (seH_chin, 1, 4, '6', NULL),
    (seH_chin, 2, 4, '6', '+load if achieved'),
    (seH_chin, 3, 5, '5', NULL),
    (seH_chin, 4, 5, '5', '+load'),
    (seH_chin, 5, 5, '4', NULL),
    (seH_chin, 6, 5, '4', '+load'),
    (seH_chin, 7, 5, '3', NULL),
    (seH_chin, 8, 5, '3', '+load');

  --   Half-Kneeling Landmine Press
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value) VALUES
    (seH_landmine, 1, 3, '8/side', NULL),
    (seH_landmine, 2, 3, '8/side', '+load if achieved'),
    (seH_landmine, 3, 3, '8/side', NULL),
    (seH_landmine, 4, 3, '8/side', '+load'),
    (seH_landmine, 5, 4, '6/side', NULL),
    (seH_landmine, 6, 4, '6/side', '+load'),
    (seH_landmine, 7, 4, '6/side', NULL),
    (seH_landmine, 8, 4, '6/side', '+load');

  --   Standing Calf Raise
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value) VALUES
    (seH_calf, 1, 3, '12', NULL),
    (seH_calf, 2, 3, '12–15', NULL),
    (seH_calf, 3, 3, '15', NULL),
    (seH_calf, 4, 3, '15', NULL),
    (seH_calf, 5, 4, '10', NULL),
    (seH_calf, 6, 4, '10–12', NULL),
    (seH_calf, 7, 4, '12', NULL),
    (seH_calf, 8, 4, '12', NULL);

  --   Neck (Thu) — same every week
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value)
  SELECT seH_neck, w, 2, '15 each direction', 'Flex / Ext / Lat Flex ×15/side'
    FROM generate_series(1,8) w;

  -- --- SATURDAY interval run ---
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value) VALUES
    (seS_run, 1, 8, '1', '2 min hard / 1 min easy'),
    (seS_run, 2, 8, '1', '2 min hard / 1 min easy'),
    (seS_run, 3, 8, '1', '2 min hard / 1 min easy'),
    (seS_run, 4, 8, '1', '2 min hard / 1 min easy'),
    (seS_run, 5, 8, '1', '3 min hard / 1 min 30 sec easy'),
    (seS_run, 6, 8, '1', '3 min hard / 1 min 30 sec easy'),
    (seS_run, 7, 8, '1', '3 min hard / 1 min 30 sec easy'),
    (seS_run, 8, 8, '1', '3 min hard / 1 min 30 sec easy');

  -- =================================================================
  -- Planned sessions — 24 dates
  -- =================================================================
  INSERT INTO public.planned_sessions
    (athlete_id, block_id, block_session_id, week_number, planned_date)
  VALUES
    (v_athlete_id, blk, bs_tue, 1, '2026-07-07'),
    (v_athlete_id, blk, bs_thu, 1, '2026-07-09'),
    (v_athlete_id, blk, bs_sat, 1, '2026-07-11'),

    (v_athlete_id, blk, bs_tue, 2, '2026-07-14'),
    (v_athlete_id, blk, bs_thu, 2, '2026-07-16'),
    (v_athlete_id, blk, bs_sat, 2, '2026-07-18'),

    (v_athlete_id, blk, bs_tue, 3, '2026-07-21'),
    (v_athlete_id, blk, bs_thu, 3, '2026-07-23'),
    (v_athlete_id, blk, bs_sat, 3, '2026-07-25'),

    (v_athlete_id, blk, bs_tue, 4, '2026-07-28'),
    (v_athlete_id, blk, bs_thu, 4, '2026-07-30'),
    (v_athlete_id, blk, bs_sat, 4, '2026-08-01'),

    (v_athlete_id, blk, bs_tue, 5, '2026-08-04'),
    (v_athlete_id, blk, bs_thu, 5, '2026-08-06'),
    (v_athlete_id, blk, bs_sat, 5, '2026-08-08'),

    (v_athlete_id, blk, bs_tue, 6, '2026-08-11'),
    (v_athlete_id, blk, bs_thu, 6, '2026-08-13'),
    (v_athlete_id, blk, bs_sat, 6, '2026-08-15'),

    (v_athlete_id, blk, bs_tue, 7, '2026-08-18'),
    (v_athlete_id, blk, bs_thu, 7, '2026-08-20'),
    (v_athlete_id, blk, bs_sat, 7, '2026-08-22'),

    (v_athlete_id, blk, bs_tue, 8, '2026-08-25'),
    (v_athlete_id, blk, bs_thu, 8, '2026-08-27'),
    (v_athlete_id, blk, bs_sat, 8, '2026-08-29');

  RAISE NOTICE 'Kaiden Driver GPP seeded: block=%, 3 sessions, 7 sections, ~20 exercises, ~150 prescriptions, 24 planned dates.', blk;
END
$seed$;

COMMIT;
