-- ============================================================================
-- Maggie Urda (ef5) — planned_sessions for the Core split-off sessions
-- Date: 2026-07-04
--
-- Two core hits per week (Mon + Wed). GPP wk 4 deload keeps its Mon/Wed
-- for the main sessions, so core shifts to Tue/Thu that week.
-- ============================================================================

BEGIN;

DO $core_dates$
DECLARE
  v_athlete_id text := 'ef5';
  blk_gpp   uuid := '005706c4-9629-4dc4-a76a-62bde68e9b8a';
  blk_ss    uuid := '78db3ce0-d9b3-42dc-b8d5-176438a51ff2';
  blk_tap   uuid := 'd4fc1bb5-81ea-4b08-883a-d248b611a305';

  gpp_a_core uuid := '33d06c84-de6c-4aaa-82bf-282e1f1897d4';
  gpp_b_core uuid := 'a511eefb-10db-4bef-82d8-d15b0509738a';
  gpp_c_core uuid := '2e4f023c-a394-454d-8706-b6cf9414b2f1';
  ss_a_core  uuid := 'f530e245-161c-4e35-a50a-f324fa76a81c';
  ss_b_core  uuid := '3adcacf6-ca01-4930-a4f0-d3631e4525e2';
  tap_core   uuid := 'f4bb4bf0-a617-4212-bba1-98f1e57f151d';

  v_existing int;
BEGIN
  SELECT count(*) INTO v_existing
    FROM public.planned_sessions ps
   WHERE ps.athlete_id = v_athlete_id
     AND ps.block_session_id IN
       (gpp_a_core, gpp_b_core, gpp_c_core, ss_a_core, ss_b_core, tap_core);

  IF v_existing > 0 THEN
    RAISE NOTICE 'Maggie Core planned_sessions already exist (% rows). Skipping.', v_existing;
    RETURN;
  END IF;

  INSERT INTO public.planned_sessions
    (athlete_id, block_id, block_session_id, week_number, planned_date)
  VALUES
    -- GPP (7 weeks). Mon + Wed except wk 4 deload → Tue + Thu.
    (v_athlete_id, blk_gpp, gpp_a_core, 1, '2026-07-06'),
    (v_athlete_id, blk_gpp, gpp_b_core, 1, '2026-07-08'),
    (v_athlete_id, blk_gpp, gpp_a_core, 2, '2026-07-13'),
    (v_athlete_id, blk_gpp, gpp_b_core, 2, '2026-07-15'),
    (v_athlete_id, blk_gpp, gpp_a_core, 3, '2026-07-20'),
    (v_athlete_id, blk_gpp, gpp_b_core, 3, '2026-07-22'),
    (v_athlete_id, blk_gpp, gpp_a_core, 4, '2026-07-28'),  -- Tue (Mon is A main)
    (v_athlete_id, blk_gpp, gpp_b_core, 4, '2026-07-30'),  -- Thu (Wed is B main)
    (v_athlete_id, blk_gpp, gpp_a_core, 5, '2026-08-03'),
    (v_athlete_id, blk_gpp, gpp_b_core, 5, '2026-08-05'),
    (v_athlete_id, blk_gpp, gpp_a_core, 6, '2026-08-10'),
    (v_athlete_id, blk_gpp, gpp_b_core, 6, '2026-08-12'),
    (v_athlete_id, blk_gpp, gpp_c_core, 7, '2026-08-17'),
    (v_athlete_id, blk_gpp, gpp_c_core, 7, '2026-08-19'),

    -- Strength-Speed (3 weeks). Mon + Wed. Wk 3 uses B-Core twice (deload).
    (v_athlete_id, blk_ss, ss_a_core, 1, '2026-08-24'),
    (v_athlete_id, blk_ss, ss_b_core, 1, '2026-08-26'),
    (v_athlete_id, blk_ss, ss_a_core, 2, '2026-08-31'),
    (v_athlete_id, blk_ss, ss_b_core, 2, '2026-09-02'),
    (v_athlete_id, blk_ss, ss_b_core, 3, '2026-09-07'),
    (v_athlete_id, blk_ss, ss_b_core, 3, '2026-09-09'),

    -- Taper (2 weeks). Mon + Wed.
    (v_athlete_id, blk_tap, tap_core, 1, '2026-09-14'),
    (v_athlete_id, blk_tap, tap_core, 1, '2026-09-16'),
    (v_athlete_id, blk_tap, tap_core, 2, '2026-09-21'),
    (v_athlete_id, blk_tap, tap_core, 2, '2026-09-23');

  RAISE NOTICE 'Maggie Core planned_sessions seeded: 14 GPP + 6 SS + 4 Taper = 24 rows.';
END
$core_dates$;

COMMIT;
