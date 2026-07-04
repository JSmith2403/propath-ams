-- ============================================================================
-- Maggie Urda · Summer 2026 programme seed
-- Athlete: ef5 · Sprinter, born 2011
-- Programme: Mon 6 Jul → Sun 27 Sep 2026 (12 weeks)
-- Champs: Sat 3 + Sun 4 Oct 2026 (outside seed window)
--
-- Blocks:
--   1. GPP            (7 weeks · Mon 6 Jul → Sun 23 Aug · display_order 300)
--      Wk 4 (Mon 27 Jul – Sun 2 Aug) = deload · sessions on Mon 27 + Wed 29
--      Wk 7 (Mon 17 – Sun 23 Aug)   = deload/test · Session C only on Tue 18 Aug
--   2. Strength-Speed (3 weeks · Mon 24 Aug → Sun 13 Sep · display_order 310)
--      Wk 3 (Mon 7 – Sun 13 Sep) = unload/test · Session B only
--   3. Taper          (2 weeks · Mon 14 – Sun 27 Sep · display_order 320)
--
-- Manifest → coach calendar mapping (agreed):
--   GPP:  Wk 5 = manifest Wk 5, Wk 6 = manifest Wk 6, manifest Wk 7 dropped.
--   Taper: Wk 1 = manifest Wk 2, Wk 2 = manifest Wk 3 (champs micro-dose).
--
-- Idempotent: guarded on (athlete_id, block_name). Re-running is a NO-OP if
-- any of the three blocks already exist for Maggie. Library inserts use
-- ON CONFLICT (name) DO NOTHING so they're safe to re-run in isolation.
--
-- Single transaction. Rolls back cleanly on any error.
-- ============================================================================

BEGIN;

-- ─── 1. Library rows to create (10 new exercises) ────────────────────────────
-- Names are UNIQUE — ON CONFLICT DO NOTHING makes this safe to re-run.
-- All values conform to the CHECK enums on exercise_library.
INSERT INTO public.exercise_library
  (name, category, movement_patterns, bilateral_unilateral, equipment, is_active, notes, demo_video_url)
VALUES
  ('90/90 Hip Switch with Reach', 'mobility', ARRAY['hip_rotation','thoracic_rotation'], 'alternating', ARRAY['bodyweight'], true,
    'Prep. Seated 90/90, switch legs slowly + reach opposite arm across.', NULL),
  ('Banded Lateral Walk', 'warm_up', ARRAY['hip_abduction'], 'bilateral', ARRAY['band'], true,
    'Prep. Band above knees, quarter squat, small steps sideways with tension.', NULL),
  ('Clean from Plates', 'power', ARRAY['pull','triple_extension'], 'bilateral', ARRAY['barbell','plates'], true,
    'Bar starts on plates at plate height. Aggressive triple extension, catch in quarter squat.', NULL),
  ('Calf Raise (Foam Roller Between Legs)', 'strength', ARRAY['ankle_extension'], 'bilateral', ARRAY['foam_roller','bodyweight'], true,
    'Foam roller between knees for adductor cue. Slow eccentric, full ROM.', NULL),
  ('DB Squat Jump', 'power', ARRAY['squat','triple_extension'], 'bilateral', ARRAY['dumbbell'], true,
    'DBs at sides, quarter-squat, explosive vertical jump. Land soft, reset each rep.', NULL),
  ('Hack Squat', 'strength', ARRAY['squat'], 'bilateral', ARRAY['machine'], true,
    'Machine hack squat, medium stance. Leg Press is the approved substitute.', NULL),
  ('Hamstring Iso Catch', 'strength', ARRAY['hip_extension'], 'bilateral', ARRAY['bodyweight'], true,
    'Nordic descent, catch mid-range with 5s isometric hold. Return controlled.', NULL),
  ('Push-Up with Shoulder Tap', 'strength', ARRAY['horizontal_press','anti_rotation'], 'bilateral', ARRAY['bodyweight'], true,
    'Push-up position, alternate shoulder taps between reps. Hips still.', NULL),
  ('Crossover Reach Flexion', 'mobility', ARRAY['spinal_flexion'], 'alternating', ARRAY['bodyweight'], true,
    'Core control drill. See demo video for setup and tempo.',
    'https://www.youtube.com/watch?v=1ww3EuwX4P4'),
  ('Hamstring Bridge with Crossover Reach', 'strength', ARRAY['hip_extension','spinal_flexion'], 'alternating', ARRAY['bodyweight'], true,
    'Bridge hold + slow crossover reach for core-hamstring integration. See demo.',
    'https://www.youtube.com/watch?v=-uEg-EsDxMs')
ON CONFLICT (name) DO NOTHING;

-- ─── 2. Programme seed (guarded, wrapped in DO block for variable use) ──────
DO $seed$
DECLARE
  -- Athlete
  v_athlete_id CONSTANT text := 'ef5';

  -- Library ids (resolved after INSERT above)
  ex_90_90            uuid; ex_banded_walk      uuid; ex_pogo_hops         uuid;
  ex_wall_open_book   uuid; -- Thoracic Opener maps here
  ex_broad_jump       uuid; ex_clean_plates     uuid; ex_split_squat       uuid;
  ex_rdl              uuid; ex_chin_up          uuid; -- Chin-Up + Chin-Up Eccentric both use this
  ex_calf_raise_fr    uuid; ex_db_squat_jump    uuid; ex_hang_clean        uuid; -- for Hang Power Clean (Option A)
  ex_hack_squat       uuid; ex_hamstring_iso    uuid; ex_seated_row        uuid;
  ex_z_press          uuid; -- Dumbbell Z Press (straddle)
  ex_pushup_st        uuid; ex_side_plank_hab   uuid; ex_dead_bug          uuid;
  ex_crossover_reach  uuid; ex_ham_bridge_cr    uuid; ex_copenhagen_plank  uuid;

  -- Block ids
  blk_gpp   uuid; blk_ss    uuid; blk_taper uuid;

  -- Block-session ids
  gpp_a uuid; gpp_b uuid; gpp_c uuid;
  ss_a  uuid; ss_b  uuid;
  tp    uuid;

  -- Section ids (18 total: 6 sessions × 3 sections)
  sec_gpp_a_prep uuid; sec_gpp_a_main uuid; sec_gpp_a_core uuid;
  sec_gpp_b_prep uuid; sec_gpp_b_main uuid; sec_gpp_b_core uuid;
  sec_gpp_c_prep uuid; sec_gpp_c_main uuid; sec_gpp_c_core uuid;
  sec_ss_a_prep  uuid; sec_ss_a_main  uuid; sec_ss_a_core  uuid;
  sec_ss_b_prep  uuid; sec_ss_b_main  uuid; sec_ss_b_core  uuid;
  sec_tp_prep    uuid; sec_tp_main    uuid; sec_tp_core    uuid;

  -- Session-exercise ids for Block 1 Session A (16 exercises)
  se_gpp_a_9090 uuid; se_gpp_a_bw uuid; se_gpp_a_pogo uuid; se_gpp_a_wob uuid;
  se_gpp_a_bj uuid; se_gpp_a_clean uuid; se_gpp_a_split uuid; se_gpp_a_rdl uuid;
  se_gpp_a_chin uuid; se_gpp_a_calf uuid;
  se_gpp_a_pushup uuid; se_gpp_a_sp uuid; se_gpp_a_db uuid;
  se_gpp_a_cross uuid; se_gpp_a_hbcr uuid; se_gpp_a_copen uuid;

  -- Session-exercise ids for Block 1 Session B (16 exercises)
  se_gpp_b_9090 uuid; se_gpp_b_bw uuid; se_gpp_b_pogo uuid; se_gpp_b_wob uuid;
  se_gpp_b_dbsj uuid; se_gpp_b_hpc uuid; se_gpp_b_hack uuid; se_gpp_b_hiso uuid;
  se_gpp_b_row uuid; se_gpp_b_z uuid;
  se_gpp_b_pushup uuid; se_gpp_b_sp uuid; se_gpp_b_db uuid;
  se_gpp_b_cross uuid; se_gpp_b_hbcr uuid; se_gpp_b_copen uuid;

  -- Session-exercise ids for Block 1 Session C (14 exercises)
  se_gpp_c_9090 uuid; se_gpp_c_bw uuid; se_gpp_c_pogo uuid; se_gpp_c_wob uuid;
  se_gpp_c_bj uuid; se_gpp_c_hpc uuid; se_gpp_c_split uuid; se_gpp_c_row uuid;
  se_gpp_c_pushup uuid; se_gpp_c_sp uuid; se_gpp_c_db uuid;
  se_gpp_c_cross uuid; se_gpp_c_hbcr uuid; se_gpp_c_copen uuid;

  -- Session-exercise ids for Block 2 Session A (16)
  se_ss_a_9090 uuid; se_ss_a_bw uuid; se_ss_a_pogo uuid; se_ss_a_wob uuid;
  se_ss_a_bj uuid; se_ss_a_clean uuid; se_ss_a_split uuid; se_ss_a_rdl uuid;
  se_ss_a_chin uuid; se_ss_a_calf uuid;
  se_ss_a_pushup uuid; se_ss_a_sp uuid; se_ss_a_db uuid;
  se_ss_a_cross uuid; se_ss_a_hbcr uuid; se_ss_a_copen uuid;

  -- Session-exercise ids for Block 2 Session B (16)
  se_ss_b_9090 uuid; se_ss_b_bw uuid; se_ss_b_pogo uuid; se_ss_b_wob uuid;
  se_ss_b_dbsj uuid; se_ss_b_hpc uuid; se_ss_b_hack uuid; se_ss_b_hiso uuid;
  se_ss_b_row uuid; se_ss_b_z uuid;
  se_ss_b_pushup uuid; se_ss_b_sp uuid; se_ss_b_db uuid;
  se_ss_b_cross uuid; se_ss_b_hbcr uuid; se_ss_b_copen uuid;

  -- Session-exercise ids for Block 3 Taper (11)
  se_tp_9090 uuid; se_tp_bw uuid; se_tp_pogo uuid; se_tp_wob uuid;
  se_tp_bj uuid; se_tp_hpc uuid; se_tp_split uuid; se_tp_hiso uuid;
  se_tp_db uuid; se_tp_sp uuid; se_tp_copen uuid;

BEGIN
  -- ─── Guard ──────────────────────────────────────────────────────────────
  IF EXISTS (
    SELECT 1 FROM public.training_blocks
     WHERE athlete_id = v_athlete_id
       AND block_name IN ('GPP','Strength-Speed','Taper')
  ) THEN
    RAISE NOTICE 'Maggie GPP / Strength-Speed / Taper blocks already exist — seed skipped.';
    RETURN;
  END IF;

  -- ─── Resolve library ids (all guaranteed to exist after the INSERT above) ─
  SELECT id INTO ex_90_90            FROM public.exercise_library WHERE name = '90/90 Hip Switch with Reach';
  SELECT id INTO ex_banded_walk      FROM public.exercise_library WHERE name = 'Banded Lateral Walk';
  SELECT id INTO ex_pogo_hops        FROM public.exercise_library WHERE name = 'Pogo Hops';
  SELECT id INTO ex_wall_open_book   FROM public.exercise_library WHERE name = 'Wall Open Book';
  SELECT id INTO ex_broad_jump       FROM public.exercise_library WHERE name = 'Broad Jump';
  SELECT id INTO ex_clean_plates     FROM public.exercise_library WHERE name = 'Clean from Plates';
  SELECT id INTO ex_split_squat      FROM public.exercise_library WHERE name = 'Split Squat';
  SELECT id INTO ex_rdl              FROM public.exercise_library WHERE name = 'Romanian Deadlift';
  SELECT id INTO ex_chin_up          FROM public.exercise_library WHERE name = 'Chin Up';
  SELECT id INTO ex_calf_raise_fr    FROM public.exercise_library WHERE name = 'Calf Raise (Foam Roller Between Legs)';
  SELECT id INTO ex_db_squat_jump    FROM public.exercise_library WHERE name = 'DB Squat Jump';
  SELECT id INTO ex_hang_clean       FROM public.exercise_library WHERE name = 'Hang Clean';
  SELECT id INTO ex_hack_squat       FROM public.exercise_library WHERE name = 'Hack Squat';
  SELECT id INTO ex_hamstring_iso    FROM public.exercise_library WHERE name = 'Hamstring Iso Catch';
  SELECT id INTO ex_seated_row       FROM public.exercise_library WHERE name = 'Seated Row';
  SELECT id INTO ex_z_press          FROM public.exercise_library WHERE name = 'Dumbbell Z Press (straddle)';
  SELECT id INTO ex_pushup_st        FROM public.exercise_library WHERE name = 'Push-Up with Shoulder Tap';
  SELECT id INTO ex_side_plank_hab   FROM public.exercise_library WHERE name = 'Side Plank with Hip Abduction';
  SELECT id INTO ex_dead_bug         FROM public.exercise_library WHERE name = 'Dead Bug';
  SELECT id INTO ex_crossover_reach  FROM public.exercise_library WHERE name = 'Crossover Reach Flexion';
  SELECT id INTO ex_ham_bridge_cr    FROM public.exercise_library WHERE name = 'Hamstring Bridge with Crossover Reach';
  SELECT id INTO ex_copenhagen_plank FROM public.exercise_library WHERE name = 'Copenhagen Plank';

  -- Fail loudly if any lookup returned NULL (shouldn't happen after the INSERT)
  IF ex_90_90 IS NULL OR ex_broad_jump IS NULL OR ex_hang_clean IS NULL
     OR ex_z_press IS NULL OR ex_dead_bug IS NULL OR ex_wall_open_book IS NULL THEN
    RAISE EXCEPTION 'Library ID resolution failed — check exercise_library for missing rows';
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════
  -- BLOCK 1: GPP — Mon 6 Jul → Sun 23 Aug 2026 · 7 weeks
  -- ═══════════════════════════════════════════════════════════════════════
  INSERT INTO public.training_blocks
    (athlete_id, block_name, start_date, end_date, duration_weeks, display_order, notes)
  VALUES
    (v_athlete_id, 'GPP', '2026-07-06', '2026-08-23', 7, 300,
     'Maggie summer prep. GPP + Fundamental. Deloads Wk 4 (Mon+Wed) and Wk 7 (Session C only, Tue 18 Aug). '
     'Wk 7 note: nothing heavy within 72 h of the Sat 22 Aug 300-200-100 run test.')
  RETURNING id INTO blk_gpp;

  -- ── Session A ──────────────────────────────────────────────────────────
  INSERT INTO public.block_sessions (block_id, session_name, session_order)
    VALUES (blk_gpp, 'Session A', 0) RETURNING id INTO gpp_a;

  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up) VALUES
    (gpp_a, 'Prep', 0, true) RETURNING id INTO sec_gpp_a_prep;
  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up) VALUES
    (gpp_a, 'Main', 1, false) RETURNING id INTO sec_gpp_a_main;
  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up) VALUES
    (gpp_a, 'Core', 2, false) RETURNING id INTO sec_gpp_a_core;

  -- Session A · Prep exercises (display_order 0-3)
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up) VALUES
    (gpp_a, sec_gpp_a_prep, ex_90_90,          0, 'reps_only', NULL, true) RETURNING id INTO se_gpp_a_9090;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up) VALUES
    (gpp_a, sec_gpp_a_prep, ex_banded_walk,    1, 'reps_only', 'Each way = one out, one back', true) RETURNING id INTO se_gpp_a_bw;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up) VALUES
    (gpp_a, sec_gpp_a_prep, ex_pogo_hops,      2, 'reps_only', 'Low amplitude, stiff ankle', true) RETURNING id INTO se_gpp_a_pogo;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up) VALUES
    (gpp_a, sec_gpp_a_prep, ex_wall_open_book, 3, 'reps_only', 'Thoracic Opener — bench variant OK', true) RETURNING id INTO se_gpp_a_wob;

  -- Session A · Main exercises (display_order 4-9)
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (gpp_a, sec_gpp_a_main, ex_broad_jump,    4, 'reps_only', 'Max intent every rep. Full recovery.') RETURNING id INTO se_gpp_a_bj;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (gpp_a, sec_gpp_a_main, ex_clean_plates,  5, 'rpe',       'Bar on plates at plate height. Full recoveries.') RETURNING id INTO se_gpp_a_clean;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (gpp_a, sec_gpp_a_main, ex_split_squat,   6, 'rpe',       NULL) RETURNING id INTO se_gpp_a_split;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (gpp_a, sec_gpp_a_main, ex_rdl,           7, 'rpe',       NULL) RETURNING id INTO se_gpp_a_rdl;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (gpp_a, sec_gpp_a_main, ex_chin_up,       8, 'reps_only', 'Chin-Up ECCENTRIC — 5 s lower every rep') RETURNING id INTO se_gpp_a_chin;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (gpp_a, sec_gpp_a_main, ex_calf_raise_fr, 9, 'reps_only', 'Slow tempo, full ROM') RETURNING id INTO se_gpp_a_calf;

  -- Session A · Core exercises (display_order 10-15)
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (gpp_a, sec_gpp_a_core, ex_pushup_st,       10, 'reps_only', NULL) RETURNING id INTO se_gpp_a_pushup;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (gpp_a, sec_gpp_a_core, ex_side_plank_hab, 11, 'reps_only', NULL) RETURNING id INTO se_gpp_a_sp;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (gpp_a, sec_gpp_a_core, ex_dead_bug,        12, 'reps_only', NULL) RETURNING id INTO se_gpp_a_db;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (gpp_a, sec_gpp_a_core, ex_crossover_reach, 13, 'reps_only', NULL) RETURNING id INTO se_gpp_a_cross;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (gpp_a, sec_gpp_a_core, ex_ham_bridge_cr,   14, 'reps_only', NULL) RETURNING id INTO se_gpp_a_hbcr;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (gpp_a, sec_gpp_a_core, ex_copenhagen_plank,15, 'time',      NULL) RETURNING id INTO se_gpp_a_copen;

  -- Session A · Prescriptions
  -- Weeks: 1,2,3,4(deload),5,6 — manifest Wk 7 dropped per agreed mapping
  -- Prep: constant across all 6 weeks
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value) VALUES
    (se_gpp_a_9090, 1, 1, '5 es', NULL), (se_gpp_a_9090, 2, 1, '5 es', NULL), (se_gpp_a_9090, 3, 1, '5 es', NULL),
    (se_gpp_a_9090, 4, 1, '5 es', NULL), (se_gpp_a_9090, 5, 1, '5 es', NULL), (se_gpp_a_9090, 6, 1, '5 es', NULL),
    (se_gpp_a_bw,   1, 2, '10 each way', NULL), (se_gpp_a_bw, 2, 2, '10 each way', NULL), (se_gpp_a_bw, 3, 2, '10 each way', NULL),
    (se_gpp_a_bw,   4, 2, '10 each way', NULL), (se_gpp_a_bw, 5, 2, '10 each way', NULL), (se_gpp_a_bw, 6, 2, '10 each way', NULL),
    (se_gpp_a_pogo, 1, 2, '10', 'Low amplitude'), (se_gpp_a_pogo, 2, 2, '10', 'Low amplitude'), (se_gpp_a_pogo, 3, 2, '10', 'Low amplitude'),
    (se_gpp_a_pogo, 4, 2, '10', 'Low amplitude'), (se_gpp_a_pogo, 5, 2, '10', 'Low amplitude'), (se_gpp_a_pogo, 6, 2, '10', 'Low amplitude'),
    (se_gpp_a_wob,  1, 1, '6 es', NULL), (se_gpp_a_wob, 2, 1, '6 es', NULL), (se_gpp_a_wob, 3, 1, '6 es', NULL),
    (se_gpp_a_wob,  4, 1, '6 es', NULL), (se_gpp_a_wob, 5, 1, '6 es', NULL), (se_gpp_a_wob, 6, 1, '6 es', NULL);

  -- Session A · Main — Broad Jump
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value, rest_seconds) VALUES
    (se_gpp_a_bj, 1, 3, '3', 'Max intent', 180),
    (se_gpp_a_bj, 2, 3, '3', 'Max intent', 180),
    (se_gpp_a_bj, 3, 3, '3', 'Max intent', 180),
    (se_gpp_a_bj, 4, 2, '3', 'Max intent · deload', 180),
    (se_gpp_a_bj, 5, 3, '3', 'Max intent', 180),
    (se_gpp_a_bj, 6, 3, '3', 'Max intent', 180);

  -- Session A · Main — Clean from Plates
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value, rest_seconds) VALUES
    (se_gpp_a_clean, 1, 4, '3', 'RPE 7',   180),
    (se_gpp_a_clean, 2, 4, '3', 'RPE 8',   180),
    (se_gpp_a_clean, 3, 4, '3', 'RPE 8-9', 180),
    (se_gpp_a_clean, 4, 2, '3', 'RPE 6 · deload', 180),
    (se_gpp_a_clean, 5, 5, '2', 'RPE 8',   180),
    (se_gpp_a_clean, 6, 5, '2', 'RPE 8-9', 180);

  -- Session A · Main — Split Squat
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value, rest_seconds) VALUES
    (se_gpp_a_split, 1, 4, '5 es', 'RPE 8',   120),
    (se_gpp_a_split, 2, 4, '5 es', 'RPE 8',   120),
    (se_gpp_a_split, 3, 4, '5 es', 'RPE 8-9', 120),
    (se_gpp_a_split, 4, 2, '5 es', 'RPE 6 · deload', 120),
    (se_gpp_a_split, 5, 4, '4 es', 'RPE 8',   120),
    (se_gpp_a_split, 6, 4, '4 es', 'RPE 8-9', 120);

  -- Session A · Main — Romanian Deadlift
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value, rest_seconds) VALUES
    (se_gpp_a_rdl, 1, 3, '6', 'RPE 7', 120),
    (se_gpp_a_rdl, 2, 3, '6', 'RPE 8', 120),
    (se_gpp_a_rdl, 3, 3, '6', 'RPE 8', 120),
    (se_gpp_a_rdl, 4, 2, '6', 'RPE 6 · deload', 120),
    (se_gpp_a_rdl, 5, 3, '5', 'RPE 8', 120),
    (se_gpp_a_rdl, 6, 3, '5', 'RPE 8', 120);

  -- Session A · Main — Chin-Up (with 5s eccentric tempo across all weeks)
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value, rest_seconds) VALUES
    (se_gpp_a_chin, 1, 3, '4', '5 s lower',          120),
    (se_gpp_a_chin, 2, 3, '4', '5 s lower',          120),
    (se_gpp_a_chin, 3, 3, '4', '5 s lower',          120),
    (se_gpp_a_chin, 4, 2, '4', '5 s lower · deload', 120),
    (se_gpp_a_chin, 5, 3, '4', '5 s lower · add load if 5 s controlled', 120),
    (se_gpp_a_chin, 6, 3, '4', '5 s lower',          120);

  -- Session A · Main — Calf Raise (Foam Roller Between Legs)
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value) VALUES
    (se_gpp_a_calf, 1, 3, '12', 'Slow'),
    (se_gpp_a_calf, 2, 3, '12', 'Slow'),
    (se_gpp_a_calf, 3, 3, '12', 'Slow'),
    (se_gpp_a_calf, 4, 2, '12', 'Slow · deload'),
    (se_gpp_a_calf, 5, 3, '12', 'Slow'),
    (se_gpp_a_calf, 6, 3, '12', 'Slow');

  -- Session A · Core — full prescription weeks 1-3 and 5-6, reduced (1 set) in week 4
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps) VALUES
    (se_gpp_a_pushup, 1, 2, '8'),   (se_gpp_a_pushup, 2, 2, '8'),   (se_gpp_a_pushup, 3, 2, '8'),
    (se_gpp_a_pushup, 4, 1, '8'),   (se_gpp_a_pushup, 5, 2, '8'),   (se_gpp_a_pushup, 6, 2, '8'),
    (se_gpp_a_sp,     1, 2, '8 es'),(se_gpp_a_sp,     2, 2, '8 es'),(se_gpp_a_sp,     3, 2, '8 es'),
    (se_gpp_a_sp,     4, 1, '8 es'),(se_gpp_a_sp,     5, 2, '8 es'),(se_gpp_a_sp,     6, 2, '8 es'),
    (se_gpp_a_db,     1, 2, '10'),  (se_gpp_a_db,     2, 2, '10'),  (se_gpp_a_db,     3, 2, '10'),
    (se_gpp_a_db,     4, 1, '10'),  (se_gpp_a_db,     5, 2, '10'),  (se_gpp_a_db,     6, 2, '10'),
    (se_gpp_a_cross,  1, 2, '6 es'),(se_gpp_a_cross,  2, 2, '6 es'),(se_gpp_a_cross,  3, 2, '6 es'),
    (se_gpp_a_cross,  4, 1, '6 es'),(se_gpp_a_cross,  5, 2, '6 es'),(se_gpp_a_cross,  6, 2, '6 es'),
    (se_gpp_a_hbcr,   1, 2, '6 es'),(se_gpp_a_hbcr,   2, 2, '6 es'),(se_gpp_a_hbcr,   3, 2, '6 es'),
    (se_gpp_a_hbcr,   4, 1, '6 es'),(se_gpp_a_hbcr,   5, 2, '6 es'),(se_gpp_a_hbcr,   6, 2, '6 es'),
    (se_gpp_a_copen,  1, 2, '20 s es'),(se_gpp_a_copen, 2, 2, '20 s es'),(se_gpp_a_copen, 3, 2, '20 s es'),
    (se_gpp_a_copen,  4, 1, '20 s es'),(se_gpp_a_copen, 5, 2, '20 s es'),(se_gpp_a_copen, 6, 2, '20 s es');

  -- ── Session B ──────────────────────────────────────────────────────────
  INSERT INTO public.block_sessions (block_id, session_name, session_order)
    VALUES (blk_gpp, 'Session B', 1) RETURNING id INTO gpp_b;

  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up) VALUES
    (gpp_b, 'Prep', 0, true) RETURNING id INTO sec_gpp_b_prep;
  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up) VALUES
    (gpp_b, 'Main', 1, false) RETURNING id INTO sec_gpp_b_main;
  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up) VALUES
    (gpp_b, 'Core', 2, false) RETURNING id INTO sec_gpp_b_core;

  -- Session B · Prep (display_order 0-3)
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, is_warm_up) VALUES
    (gpp_b, sec_gpp_b_prep, ex_90_90,          0, 'reps_only', true) RETURNING id INTO se_gpp_b_9090;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up) VALUES
    (gpp_b, sec_gpp_b_prep, ex_banded_walk,    1, 'reps_only', 'Each way = one out, one back', true) RETURNING id INTO se_gpp_b_bw;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up) VALUES
    (gpp_b, sec_gpp_b_prep, ex_pogo_hops,      2, 'reps_only', 'Low amplitude, stiff ankle', true) RETURNING id INTO se_gpp_b_pogo;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up) VALUES
    (gpp_b, sec_gpp_b_prep, ex_wall_open_book, 3, 'reps_only', 'Thoracic Opener — bench variant OK', true) RETURNING id INTO se_gpp_b_wob;

  -- Session B · Main (display_order 4-9)
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (gpp_b, sec_gpp_b_main, ex_db_squat_jump,  4, 'reps_only', 'Approx 10% BW wks 1-4, ~15% wks 5-6') RETURNING id INTO se_gpp_b_dbsj;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (gpp_b, sec_gpp_b_main, ex_hang_clean,     5, 'rpe',       'Hang Power Clean — power catch (quarter squat)') RETURNING id INTO se_gpp_b_hpc;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (gpp_b, sec_gpp_b_main, ex_hack_squat,     6, 'rpe',       'Sub: Leg Press if hack squat unavailable') RETURNING id INTO se_gpp_b_hack;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (gpp_b, sec_gpp_b_main, ex_hamstring_iso,  7, 'reps_only', '5 s hold on the catch') RETURNING id INTO se_gpp_b_hiso;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (gpp_b, sec_gpp_b_main, ex_seated_row,     8, 'rpe',       NULL) RETURNING id INTO se_gpp_b_row;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (gpp_b, sec_gpp_b_main, ex_z_press,        9, 'rpe',       'DB Z Press (straddle)') RETURNING id INTO se_gpp_b_z;

  -- Session B · Core (display_order 10-15)
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (gpp_b, sec_gpp_b_core, ex_pushup_st,       10, 'reps_only') RETURNING id INTO se_gpp_b_pushup;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (gpp_b, sec_gpp_b_core, ex_side_plank_hab, 11, 'reps_only') RETURNING id INTO se_gpp_b_sp;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (gpp_b, sec_gpp_b_core, ex_dead_bug,        12, 'reps_only') RETURNING id INTO se_gpp_b_db;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (gpp_b, sec_gpp_b_core, ex_crossover_reach, 13, 'reps_only') RETURNING id INTO se_gpp_b_cross;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (gpp_b, sec_gpp_b_core, ex_ham_bridge_cr,   14, 'reps_only') RETURNING id INTO se_gpp_b_hbcr;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (gpp_b, sec_gpp_b_core, ex_copenhagen_plank,15, 'time')      RETURNING id INTO se_gpp_b_copen;

  -- Session B · Prep prescriptions (constant, weeks 1-6)
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value) VALUES
    (se_gpp_b_9090, 1, 1, '5 es', NULL), (se_gpp_b_9090, 2, 1, '5 es', NULL), (se_gpp_b_9090, 3, 1, '5 es', NULL),
    (se_gpp_b_9090, 4, 1, '5 es', NULL), (se_gpp_b_9090, 5, 1, '5 es', NULL), (se_gpp_b_9090, 6, 1, '5 es', NULL),
    (se_gpp_b_bw,   1, 2, '10 each way', NULL), (se_gpp_b_bw, 2, 2, '10 each way', NULL), (se_gpp_b_bw, 3, 2, '10 each way', NULL),
    (se_gpp_b_bw,   4, 2, '10 each way', NULL), (se_gpp_b_bw, 5, 2, '10 each way', NULL), (se_gpp_b_bw, 6, 2, '10 each way', NULL),
    (se_gpp_b_pogo, 1, 2, '10', 'Low amplitude'), (se_gpp_b_pogo, 2, 2, '10', 'Low amplitude'), (se_gpp_b_pogo, 3, 2, '10', 'Low amplitude'),
    (se_gpp_b_pogo, 4, 2, '10', 'Low amplitude'), (se_gpp_b_pogo, 5, 2, '10', 'Low amplitude'), (se_gpp_b_pogo, 6, 2, '10', 'Low amplitude'),
    (se_gpp_b_wob,  1, 1, '6 es', NULL), (se_gpp_b_wob, 2, 1, '6 es', NULL), (se_gpp_b_wob, 3, 1, '6 es', NULL),
    (se_gpp_b_wob,  4, 1, '6 es', NULL), (se_gpp_b_wob, 5, 1, '6 es', NULL), (se_gpp_b_wob, 6, 1, '6 es', NULL);

  -- Session B · Main — DB Squat Jump
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value, rest_seconds) VALUES
    (se_gpp_b_dbsj, 1, 3, '4', '~10% BW · Max intent', 180),
    (se_gpp_b_dbsj, 2, 3, '4', '~10% BW · Max intent', 180),
    (se_gpp_b_dbsj, 3, 3, '4', '~10% BW · Max intent', 180),
    (se_gpp_b_dbsj, 4, 2, '3', '~10% BW · deload',     180),
    (se_gpp_b_dbsj, 5, 3, '3', '~15% BW · Max intent', 180),
    (se_gpp_b_dbsj, 6, 3, '3', '~15% BW · Max intent', 180);

  -- Session B · Main — Hang Power Clean
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value, rest_seconds) VALUES
    (se_gpp_b_hpc, 1, 4, '3', 'RPE 7',   180),
    (se_gpp_b_hpc, 2, 4, '3', 'RPE 8',   180),
    (se_gpp_b_hpc, 3, 4, '3', 'RPE 8-9', 180),
    (se_gpp_b_hpc, 4, 2, '3', 'RPE 6 · deload', 180),
    (se_gpp_b_hpc, 5, 5, '2', 'RPE 8',   180),
    (se_gpp_b_hpc, 6, 5, '2', 'RPE 8-9', 180);

  -- Session B · Main — Hack Squat
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value, rest_seconds) VALUES
    (se_gpp_b_hack, 1, 4, '6', 'RPE 8',   150),
    (se_gpp_b_hack, 2, 4, '6', 'RPE 8',   150),
    (se_gpp_b_hack, 3, 4, '6', 'RPE 8-9', 150),
    (se_gpp_b_hack, 4, 2, '6', 'RPE 6 · deload', 150),
    (se_gpp_b_hack, 5, 4, '5', 'RPE 8',   150),
    (se_gpp_b_hack, 6, 4, '5', 'RPE 8-9', 150);

  -- Session B · Main — Hamstring Iso Catch
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value, rest_seconds) VALUES
    (se_gpp_b_hiso, 1, 3, '3 es', '5 s hold',          120),
    (se_gpp_b_hiso, 2, 3, '3 es', '5 s hold',          120),
    (se_gpp_b_hiso, 3, 3, '4 es', '5 s hold',          120),
    (se_gpp_b_hiso, 4, 2, '3 es', '5 s hold · deload', 120),
    (se_gpp_b_hiso, 5, 3, '4 es', '5 s hold',          120),
    (se_gpp_b_hiso, 6, 3, '4 es', '5 s hold',          120);

  -- Session B · Main — Seated Row
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value, rest_seconds) VALUES
    (se_gpp_b_row, 1, 3, '8', 'RPE 8',           90),
    (se_gpp_b_row, 2, 3, '8', 'RPE 8',           90),
    (se_gpp_b_row, 3, 3, '8', 'RPE 8',           90),
    (se_gpp_b_row, 4, 2, '8', 'RPE 6 · deload',  90),
    (se_gpp_b_row, 5, 3, '8', 'RPE 8 · heavier', 90),
    (se_gpp_b_row, 6, 3, '8', 'RPE 8',           90);

  -- Session B · Main — Z Press
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value, rest_seconds) VALUES
    (se_gpp_b_z, 1, 3, '6', 'RPE 7',           90),
    (se_gpp_b_z, 2, 3, '6', 'RPE 8',           90),
    (se_gpp_b_z, 3, 3, '6', 'RPE 8',           90),
    (se_gpp_b_z, 4, 2, '6', 'RPE 6 · deload',  90),
    (se_gpp_b_z, 5, 3, '6', 'RPE 8 · heavier', 90),
    (se_gpp_b_z, 6, 3, '6', 'RPE 8',           90);

  -- Session B · Core — same prescription as Session A (full wks 1-3, 5-6; reduced wk 4)
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps) VALUES
    (se_gpp_b_pushup, 1, 2, '8'),   (se_gpp_b_pushup, 2, 2, '8'),   (se_gpp_b_pushup, 3, 2, '8'),
    (se_gpp_b_pushup, 4, 1, '8'),   (se_gpp_b_pushup, 5, 2, '8'),   (se_gpp_b_pushup, 6, 2, '8'),
    (se_gpp_b_sp,     1, 2, '8 es'),(se_gpp_b_sp,     2, 2, '8 es'),(se_gpp_b_sp,     3, 2, '8 es'),
    (se_gpp_b_sp,     4, 1, '8 es'),(se_gpp_b_sp,     5, 2, '8 es'),(se_gpp_b_sp,     6, 2, '8 es'),
    (se_gpp_b_db,     1, 2, '10'),  (se_gpp_b_db,     2, 2, '10'),  (se_gpp_b_db,     3, 2, '10'),
    (se_gpp_b_db,     4, 1, '10'),  (se_gpp_b_db,     5, 2, '10'),  (se_gpp_b_db,     6, 2, '10'),
    (se_gpp_b_cross,  1, 2, '6 es'),(se_gpp_b_cross,  2, 2, '6 es'),(se_gpp_b_cross,  3, 2, '6 es'),
    (se_gpp_b_cross,  4, 1, '6 es'),(se_gpp_b_cross,  5, 2, '6 es'),(se_gpp_b_cross,  6, 2, '6 es'),
    (se_gpp_b_hbcr,   1, 2, '6 es'),(se_gpp_b_hbcr,   2, 2, '6 es'),(se_gpp_b_hbcr,   3, 2, '6 es'),
    (se_gpp_b_hbcr,   4, 1, '6 es'),(se_gpp_b_hbcr,   5, 2, '6 es'),(se_gpp_b_hbcr,   6, 2, '6 es'),
    (se_gpp_b_copen,  1, 2, '20 s es'),(se_gpp_b_copen, 2, 2, '20 s es'),(se_gpp_b_copen, 3, 2, '20 s es'),
    (se_gpp_b_copen,  4, 1, '20 s es'),(se_gpp_b_copen, 5, 2, '20 s es'),(se_gpp_b_copen, 6, 2, '20 s es');

  -- ── Session C (week 7 only — Deload/Test week, Session C only) ────────
  INSERT INTO public.block_sessions (block_id, session_name, session_order, coach_notes)
    VALUES (blk_gpp, 'Session C — Deload / Test Week', 2,
            'Deload plus test week. Nothing heavy within 72 hours of the weekend running test. Runs Tue 18 Aug.')
    RETURNING id INTO gpp_c;

  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up) VALUES
    (gpp_c, 'Prep', 0, true) RETURNING id INTO sec_gpp_c_prep;
  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up) VALUES
    (gpp_c, 'Main', 1, false) RETURNING id INTO sec_gpp_c_main;
  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up) VALUES
    (gpp_c, 'Core', 2, false) RETURNING id INTO sec_gpp_c_core;

  -- Session C · Prep (display_order 0-3)
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, is_warm_up) VALUES
    (gpp_c, sec_gpp_c_prep, ex_90_90,          0, 'reps_only', true) RETURNING id INTO se_gpp_c_9090;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up) VALUES
    (gpp_c, sec_gpp_c_prep, ex_banded_walk,    1, 'reps_only', 'Each way = one out, one back', true) RETURNING id INTO se_gpp_c_bw;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up) VALUES
    (gpp_c, sec_gpp_c_prep, ex_pogo_hops,      2, 'reps_only', 'Low amplitude, stiff ankle', true) RETURNING id INTO se_gpp_c_pogo;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up) VALUES
    (gpp_c, sec_gpp_c_prep, ex_wall_open_book, 3, 'reps_only', 'Thoracic Opener — bench variant OK', true) RETURNING id INTO se_gpp_c_wob;

  -- Session C · Main (display_order 4-7)
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (gpp_c, sec_gpp_c_main, ex_broad_jump, 4, 'reps_only') RETURNING id INTO se_gpp_c_bj;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (gpp_c, sec_gpp_c_main, ex_hang_clean, 5, 'rpe',       'Hang Power Clean — power catch') RETURNING id INTO se_gpp_c_hpc;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (gpp_c, sec_gpp_c_main, ex_split_squat,6, 'rpe') RETURNING id INTO se_gpp_c_split;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (gpp_c, sec_gpp_c_main, ex_seated_row, 7, 'rpe') RETURNING id INTO se_gpp_c_row;

  -- Session C · Core (display_order 8-13)
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (gpp_c, sec_gpp_c_core, ex_pushup_st,       8, 'reps_only') RETURNING id INTO se_gpp_c_pushup;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (gpp_c, sec_gpp_c_core, ex_side_plank_hab, 9, 'reps_only') RETURNING id INTO se_gpp_c_sp;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (gpp_c, sec_gpp_c_core, ex_dead_bug,       10, 'reps_only') RETURNING id INTO se_gpp_c_db;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (gpp_c, sec_gpp_c_core, ex_crossover_reach,11, 'reps_only') RETURNING id INTO se_gpp_c_cross;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (gpp_c, sec_gpp_c_core, ex_ham_bridge_cr,  12, 'reps_only') RETURNING id INTO se_gpp_c_hbcr;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (gpp_c, sec_gpp_c_core, ex_copenhagen_plank,13,'time')      RETURNING id INTO se_gpp_c_copen;

  -- Session C prescriptions (week 7 only)
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value) VALUES
    (se_gpp_c_9090,  7, 1, '5 es', NULL),
    (se_gpp_c_bw,    7, 2, '10 each way', NULL),
    (se_gpp_c_pogo,  7, 2, '10', 'Low amplitude'),
    (se_gpp_c_wob,   7, 1, '6 es', NULL),
    (se_gpp_c_bj,    7, 2, '3', NULL),
    (se_gpp_c_hpc,   7, 2, '3', 'RPE 6'),
    (se_gpp_c_split, 7, 2, '5 es', 'RPE 6'),
    (se_gpp_c_row,   7, 2, '8', 'RPE 6'),
    (se_gpp_c_pushup,7, 1, '8', NULL),
    (se_gpp_c_sp,    7, 1, '8 es', NULL),
    (se_gpp_c_db,    7, 1, '10', NULL),
    (se_gpp_c_cross, 7, 1, '6 es', NULL),
    (se_gpp_c_hbcr,  7, 1, '6 es', NULL),
    (se_gpp_c_copen, 7, 1, '20 s es', NULL);

  -- ═══════════════════════════════════════════════════════════════════════
  -- BLOCK 2: Strength-Speed — Mon 24 Aug → Sun 13 Sep 2026 · 3 weeks
  -- Wk 1-2: Sessions A + B. Wk 3: Session B only (unload/test).
  -- ═══════════════════════════════════════════════════════════════════════
  INSERT INTO public.training_blocks
    (athlete_id, block_name, start_date, end_date, duration_weeks, display_order, notes)
  VALUES
    (v_athlete_id, 'Strength-Speed', '2026-08-24', '2026-09-13', 3, 310,
     'Strength-Speed block. Session A + B in weeks 1-2. Week 3 = Session B only, unload/test. '
     'Nothing heavy within 72 h of the weekend test.')
  RETURNING id INTO blk_ss;

  -- ── Session A ──────────────────────────────────────────────────────────
  INSERT INTO public.block_sessions (block_id, session_name, session_order)
    VALUES (blk_ss, 'Session A', 0) RETURNING id INTO ss_a;

  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up) VALUES
    (ss_a, 'Prep', 0, true) RETURNING id INTO sec_ss_a_prep;
  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up) VALUES
    (ss_a, 'Main', 1, false) RETURNING id INTO sec_ss_a_main;
  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up) VALUES
    (ss_a, 'Core', 2, false) RETURNING id INTO sec_ss_a_core;

  -- SS Session A · Prep
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, is_warm_up) VALUES
    (ss_a, sec_ss_a_prep, ex_90_90,          0, 'reps_only', true) RETURNING id INTO se_ss_a_9090;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up) VALUES
    (ss_a, sec_ss_a_prep, ex_banded_walk,    1, 'reps_only', 'Each way = one out, one back', true) RETURNING id INTO se_ss_a_bw;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up) VALUES
    (ss_a, sec_ss_a_prep, ex_pogo_hops,      2, 'reps_only', 'Low amplitude, stiff ankle', true) RETURNING id INTO se_ss_a_pogo;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up) VALUES
    (ss_a, sec_ss_a_prep, ex_wall_open_book, 3, 'reps_only', 'Thoracic Opener — bench variant OK', true) RETURNING id INTO se_ss_a_wob;

  -- SS Session A · Main
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (ss_a, sec_ss_a_main, ex_broad_jump,    4, 'reps_only', 'Max intent every rep. Full recovery.') RETURNING id INTO se_ss_a_bj;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (ss_a, sec_ss_a_main, ex_clean_plates,  5, 'rpe',       'Full recoveries') RETURNING id INTO se_ss_a_clean;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (ss_a, sec_ss_a_main, ex_split_squat,   6, 'reps_only', 'Approx 55-65% of recent heavy load. Maximum bar speed, every rep aggressive.') RETURNING id INTO se_ss_a_split;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (ss_a, sec_ss_a_main, ex_rdl,           7, 'rpe',       'Maintenance') RETURNING id INTO se_ss_a_rdl;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (ss_a, sec_ss_a_main, ex_chin_up,       8, 'reps_only', 'Full Chin-Up (no eccentric tempo — replaces Chin-Up Eccentric this block)') RETURNING id INTO se_ss_a_chin;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (ss_a, sec_ss_a_main, ex_calf_raise_fr, 9, 'reps_only') RETURNING id INTO se_ss_a_calf;

  -- SS Session A · Core
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (ss_a, sec_ss_a_core, ex_pushup_st,       10, 'reps_only') RETURNING id INTO se_ss_a_pushup;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (ss_a, sec_ss_a_core, ex_side_plank_hab, 11, 'reps_only') RETURNING id INTO se_ss_a_sp;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (ss_a, sec_ss_a_core, ex_dead_bug,        12, 'reps_only') RETURNING id INTO se_ss_a_db;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (ss_a, sec_ss_a_core, ex_crossover_reach, 13, 'reps_only') RETURNING id INTO se_ss_a_cross;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (ss_a, sec_ss_a_core, ex_ham_bridge_cr,   14, 'reps_only') RETURNING id INTO se_ss_a_hbcr;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (ss_a, sec_ss_a_core, ex_copenhagen_plank,15, 'time')      RETURNING id INTO se_ss_a_copen;

  -- SS Session A prescriptions (weeks 1-2 only)
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value) VALUES
    -- Prep
    (se_ss_a_9090, 1, 1, '5 es', NULL), (se_ss_a_9090, 2, 1, '5 es', NULL),
    (se_ss_a_bw,   1, 2, '10 each way', NULL), (se_ss_a_bw, 2, 2, '10 each way', NULL),
    (se_ss_a_pogo, 1, 2, '10', 'Low amplitude'), (se_ss_a_pogo, 2, 2, '10', 'Low amplitude'),
    (se_ss_a_wob,  1, 1, '6 es', NULL), (se_ss_a_wob, 2, 1, '6 es', NULL),
    -- Main
    (se_ss_a_bj,    1, 3, '3',    'Max intent'), (se_ss_a_bj,    2, 3, '3',    'Max intent'),
    (se_ss_a_clean, 1, 5, '2',    'RPE 8 · full recovery'), (se_ss_a_clean, 2, 5, '2', 'RPE 8 · full recovery'),
    (se_ss_a_split, 1, 3, '3 es', '55-65% · max bar speed'), (se_ss_a_split, 2, 3, '3 es', '55-65% · max bar speed'),
    (se_ss_a_rdl,   1, 2, '5',    'RPE 7 · maintenance'), (se_ss_a_rdl,   2, 2, '5', 'RPE 7 · maintenance'),
    (se_ss_a_chin,  1, 3, '3',    'Full Chin-Up'), (se_ss_a_chin,  2, 3, '3', 'Full Chin-Up'),
    (se_ss_a_calf,  1, 2, '12',   NULL), (se_ss_a_calf,  2, 2, '12', NULL),
    -- Core (full prescription, both weeks)
    (se_ss_a_pushup,1, 2, '8',    NULL), (se_ss_a_pushup,2, 2, '8', NULL),
    (se_ss_a_sp,    1, 2, '8 es', NULL), (se_ss_a_sp,    2, 2, '8 es', NULL),
    (se_ss_a_db,    1, 2, '10',   NULL), (se_ss_a_db,    2, 2, '10', NULL),
    (se_ss_a_cross, 1, 2, '6 es', NULL), (se_ss_a_cross, 2, 2, '6 es', NULL),
    (se_ss_a_hbcr,  1, 2, '6 es', NULL), (se_ss_a_hbcr,  2, 2, '6 es', NULL),
    (se_ss_a_copen, 1, 2, '20 s es', NULL), (se_ss_a_copen, 2, 2, '20 s es', NULL);

  -- ── SS Session B ──────────────────────────────────────────────────────
  INSERT INTO public.block_sessions (block_id, session_name, session_order)
    VALUES (blk_ss, 'Session B', 1) RETURNING id INTO ss_b;

  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up) VALUES
    (ss_b, 'Prep', 0, true) RETURNING id INTO sec_ss_b_prep;
  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up) VALUES
    (ss_b, 'Main', 1, false) RETURNING id INTO sec_ss_b_main;
  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up) VALUES
    (ss_b, 'Core', 2, false) RETURNING id INTO sec_ss_b_core;

  -- SS Session B · Prep
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, is_warm_up) VALUES
    (ss_b, sec_ss_b_prep, ex_90_90,          0, 'reps_only', true) RETURNING id INTO se_ss_b_9090;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up) VALUES
    (ss_b, sec_ss_b_prep, ex_banded_walk,    1, 'reps_only', 'Each way = one out, one back', true) RETURNING id INTO se_ss_b_bw;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up) VALUES
    (ss_b, sec_ss_b_prep, ex_pogo_hops,      2, 'reps_only', 'Low amplitude, stiff ankle', true) RETURNING id INTO se_ss_b_pogo;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up) VALUES
    (ss_b, sec_ss_b_prep, ex_wall_open_book, 3, 'reps_only', 'Thoracic Opener — bench variant OK', true) RETURNING id INTO se_ss_b_wob;

  -- SS Session B · Main
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (ss_b, sec_ss_b_main, ex_db_squat_jump,  4, 'reps_only', '~15% BW') RETURNING id INTO se_ss_b_dbsj;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (ss_b, sec_ss_b_main, ex_hang_clean,     5, 'rpe',       'Hang Power Clean — power catch') RETURNING id INTO se_ss_b_hpc;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (ss_b, sec_ss_b_main, ex_hack_squat,     6, 'reps_only', '~60% · moved fast · Sub: Leg Press if unavailable') RETURNING id INTO se_ss_b_hack;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (ss_b, sec_ss_b_main, ex_hamstring_iso,  7, 'reps_only', '5 s hold on the catch') RETURNING id INTO se_ss_b_hiso;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (ss_b, sec_ss_b_main, ex_seated_row,     8, 'reps_only') RETURNING id INTO se_ss_b_row;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (ss_b, sec_ss_b_main, ex_z_press,        9, 'reps_only', 'DB Z Press (straddle)') RETURNING id INTO se_ss_b_z;

  -- SS Session B · Core
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (ss_b, sec_ss_b_core, ex_pushup_st,       10, 'reps_only') RETURNING id INTO se_ss_b_pushup;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (ss_b, sec_ss_b_core, ex_side_plank_hab, 11, 'reps_only') RETURNING id INTO se_ss_b_sp;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (ss_b, sec_ss_b_core, ex_dead_bug,        12, 'reps_only') RETURNING id INTO se_ss_b_db;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (ss_b, sec_ss_b_core, ex_crossover_reach, 13, 'reps_only') RETURNING id INTO se_ss_b_cross;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (ss_b, sec_ss_b_core, ex_ham_bridge_cr,   14, 'reps_only') RETURNING id INTO se_ss_b_hbcr;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (ss_b, sec_ss_b_core, ex_copenhagen_plank,15, 'time')      RETURNING id INTO se_ss_b_copen;

  -- SS Session B prescriptions (weeks 1-3)
  -- Wk 1-2: main plan; Wk 3: unload — every Main slot 2 sets, RPE cap 6, jumps stay sharp
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value) VALUES
    -- Prep — same across all 3 weeks
    (se_ss_b_9090, 1, 1, '5 es', NULL),         (se_ss_b_9090, 2, 1, '5 es', NULL),         (se_ss_b_9090, 3, 1, '5 es', NULL),
    (se_ss_b_bw,   1, 2, '10 each way', NULL),  (se_ss_b_bw,   2, 2, '10 each way', NULL),  (se_ss_b_bw,   3, 2, '10 each way', NULL),
    (se_ss_b_pogo, 1, 2, '10', 'Low amplitude'),(se_ss_b_pogo, 2, 2, '10', 'Low amplitude'),(se_ss_b_pogo, 3, 2, '10', 'Low amplitude'),
    (se_ss_b_wob,  1, 1, '6 es', NULL),         (se_ss_b_wob,  2, 1, '6 es', NULL),         (se_ss_b_wob,  3, 1, '6 es', NULL),
    -- Main — Wk 1-2 loaded, Wk 3 unload (jumps stay sharp per brief)
    (se_ss_b_dbsj, 1, 4, '3', '~15% BW'),         (se_ss_b_dbsj, 2, 4, '3', '~15% BW'),         (se_ss_b_dbsj, 3, 2, '3', '~15% BW · sharp'),
    (se_ss_b_hpc,  1, 5, '2', 'RPE 8'),           (se_ss_b_hpc,  2, 5, '2', 'RPE 8'),           (se_ss_b_hpc,  3, 2, '2', 'RPE 6 · unload'),
    (se_ss_b_hack, 1, 3, '3', '~60% · fast'),     (se_ss_b_hack, 2, 3, '3', '~60% · fast'),     (se_ss_b_hack, 3, 2, '3', 'RPE 6 · unload'),
    (se_ss_b_hiso, 1, 3, '3 es', '5 s hold'),     (se_ss_b_hiso, 2, 3, '3 es', '5 s hold'),     (se_ss_b_hiso, 3, 2, '3 es', '5 s hold · unload'),
    (se_ss_b_row,  1, 2, '8', NULL),              (se_ss_b_row,  2, 2, '8', NULL),              (se_ss_b_row,  3, 2, '8', 'RPE 6 · unload'),
    (se_ss_b_z,    1, 2, '6', NULL),              (se_ss_b_z,    2, 2, '6', NULL),              (se_ss_b_z,    3, 2, '6', 'RPE 6 · unload'),
    -- Core — full Wk 1-2, reduced Wk 3
    (se_ss_b_pushup, 1, 2, '8', NULL),   (se_ss_b_pushup, 2, 2, '8', NULL),   (se_ss_b_pushup, 3, 1, '8', NULL),
    (se_ss_b_sp,     1, 2, '8 es', NULL),(se_ss_b_sp,     2, 2, '8 es', NULL),(se_ss_b_sp,     3, 1, '8 es', NULL),
    (se_ss_b_db,     1, 2, '10', NULL),  (se_ss_b_db,     2, 2, '10', NULL),  (se_ss_b_db,     3, 1, '10', NULL),
    (se_ss_b_cross,  1, 2, '6 es', NULL),(se_ss_b_cross,  2, 2, '6 es', NULL),(se_ss_b_cross,  3, 1, '6 es', NULL),
    (se_ss_b_hbcr,   1, 2, '6 es', NULL),(se_ss_b_hbcr,   2, 2, '6 es', NULL),(se_ss_b_hbcr,   3, 1, '6 es', NULL),
    (se_ss_b_copen,  1, 2, '20 s es', NULL),(se_ss_b_copen, 2, 2, '20 s es', NULL),(se_ss_b_copen, 3, 1, '20 s es', NULL);

  -- ═══════════════════════════════════════════════════════════════════════
  -- BLOCK 3: Taper — Mon 14 → Sun 27 Sep 2026 · 2 weeks
  -- Coach Wk 1 = manifest Wk 2, Coach Wk 2 = manifest Wk 3 (champs micro-dose)
  -- ═══════════════════════════════════════════════════════════════════════
  INSERT INTO public.training_blocks
    (athlete_id, block_name, start_date, end_date, duration_weeks, display_order, notes)
  VALUES
    (v_athlete_id, 'Taper', '2026-09-14', '2026-09-27', 2, 320,
     'Sharpness sessions, not training sessions. Submaximal load, maximal velocity. '
     'Leave feeling better than walking in. Run early in the week — Monday or Tuesday at the latest. '
     'Champs Sat 3 + Sun 4 Oct sit 6 days after block end (outside seed window).')
  RETURNING id INTO blk_taper;

  INSERT INTO public.block_sessions (block_id, session_name, session_order, coach_notes)
    VALUES (blk_taper, 'Sharpness Session', 0,
            'Wk 2 note: Championships week, in camp. Jumps and cleans only, everything crisp, out in 20 minutes.')
    RETURNING id INTO tp;

  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up) VALUES
    (tp, 'Prep', 0, true) RETURNING id INTO sec_tp_prep;
  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up) VALUES
    (tp, 'Main', 1, false) RETURNING id INTO sec_tp_main;
  INSERT INTO public.session_sections (block_session_id, name, display_order, is_warm_up) VALUES
    (tp, 'Core', 2, false) RETURNING id INTO sec_tp_core;

  -- Taper · Prep (display_order 0-3)
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, is_warm_up) VALUES
    (tp, sec_tp_prep, ex_90_90,          0, 'reps_only', true) RETURNING id INTO se_tp_9090;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up) VALUES
    (tp, sec_tp_prep, ex_banded_walk,    1, 'reps_only', 'Each way = one out, one back', true) RETURNING id INTO se_tp_bw;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up) VALUES
    (tp, sec_tp_prep, ex_pogo_hops,      2, 'reps_only', 'Low amplitude, stiff ankle', true) RETURNING id INTO se_tp_pogo;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up) VALUES
    (tp, sec_tp_prep, ex_wall_open_book, 3, 'reps_only', 'Thoracic Opener — bench variant OK', true) RETURNING id INTO se_tp_wob;

  -- Taper · Main (display_order 4-7)
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (tp, sec_tp_main, ex_broad_jump,   4, 'reps_only') RETURNING id INTO se_tp_bj;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (tp, sec_tp_main, ex_hang_clean,   5, 'rpe',       'Hang Power Clean — power catch. Crisp.') RETURNING id INTO se_tp_hpc;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (tp, sec_tp_main, ex_split_squat,  6, 'reps_only', '~50-60% · fast') RETURNING id INTO se_tp_split;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type, notes) VALUES
    (tp, sec_tp_main, ex_hamstring_iso,7, 'reps_only', '5 s hold on the catch') RETURNING id INTO se_tp_hiso;

  -- Taper · Core (display_order 8-10) — 3 exercises per manifest reduced core
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (tp, sec_tp_core, ex_dead_bug,        8, 'reps_only') RETURNING id INTO se_tp_db;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (tp, sec_tp_core, ex_side_plank_hab, 9, 'reps_only') RETURNING id INTO se_tp_sp;
  INSERT INTO public.session_exercises (block_session_id, section_id, exercise_id, display_order, prescription_type) VALUES
    (tp, sec_tp_core, ex_copenhagen_plank,10,'time')      RETURNING id INTO se_tp_copen;

  -- Taper prescriptions
  -- Wk 1 = manifest Wk 2 · full main + reduced core
  -- Wk 2 = manifest Wk 3 · Broad Jump + Hang Clean only, NO core (per manifest)
  INSERT INTO public.exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value) VALUES
    -- Prep — both weeks
    (se_tp_9090, 1, 1, '5 es', NULL),         (se_tp_9090, 2, 1, '5 es', NULL),
    (se_tp_bw,   1, 2, '10 each way', NULL),  (se_tp_bw,   2, 2, '10 each way', NULL),
    (se_tp_pogo, 1, 2, '10', 'Low amplitude'),(se_tp_pogo, 2, 2, '10', 'Low amplitude'),
    (se_tp_wob,  1, 1, '6 es', NULL),         (se_tp_wob,  2, 1, '6 es', NULL),
    -- Main — Wk 1 full (Broad Jump, Hang Clean, Split Squat, Hamstring Iso). Wk 2 only Broad Jump + Hang Clean.
    (se_tp_bj,    1, 2, '3', NULL),                    (se_tp_bj,    2, 2, '2', NULL),
    (se_tp_hpc,   1, 3, '2', 'RPE 7 · crisp'),         (se_tp_hpc,   2, 2, '2', 'RPE 6'),
    (se_tp_split, 1, 2, '3 es', '~50-60% · fast'),
    (se_tp_hiso,  1, 2, '3 es', '5 s hold'),
    -- Core — Wk 1 only (no core Wk 2 per manifest note)
    (se_tp_db,    1, 1, '10',      NULL),
    (se_tp_sp,    1, 1, '8 es',    NULL),
    (se_tp_copen, 1, 1, '20 s es', NULL);

  -- ─── Summary ───────────────────────────────────────────────────────────
  RAISE NOTICE 'Seed complete for Maggie Urda (%). Blocks: GPP=%, Strength-Speed=%, Taper=%',
    v_athlete_id, blk_gpp, blk_ss, blk_taper;

END $seed$;

COMMIT;

-- Post-run verification query (uncomment to run separately after the seed):
--
-- SELECT tb.block_name, tb.start_date, tb.end_date, tb.duration_weeks,
--        COUNT(DISTINCT bs.id) AS sessions,
--        COUNT(DISTINCT ss.id) AS sections,
--        COUNT(DISTINCT se.id) AS exercises,
--        COUNT(DISTINCT ewp.id) AS prescriptions
--   FROM training_blocks tb
--   LEFT JOIN block_sessions bs   ON bs.block_id = tb.id
--   LEFT JOIN session_sections ss ON ss.block_session_id = bs.id
--   LEFT JOIN session_exercises se ON se.block_session_id = bs.id
--   LEFT JOIN exercise_week_prescriptions ewp ON ewp.session_exercise_id = se.id
--  WHERE tb.athlete_id = 'ef5' AND tb.block_name IN ('GPP','Strength-Speed','Taper')
--  GROUP BY tb.block_name, tb.start_date, tb.end_date, tb.duration_weeks, tb.display_order
--  ORDER BY tb.display_order;
