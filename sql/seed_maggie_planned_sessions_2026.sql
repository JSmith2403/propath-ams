-- ============================================================================
-- Maggie Urda (ef5) — planned_sessions for GPP / Strength-Speed / Taper
-- Date: 2026-07-04
--
-- Pins each block_session template to its calendar date so the sessions
-- appear on Maggie's athlete-app calendar and coach-side week view.
--
-- Guard: skips if any planned_sessions already exist for these three blocks.
-- Safe to re-run — re-runs are no-ops after the first successful apply.
-- ============================================================================

BEGIN;

DO $seed$
DECLARE
  v_athlete_id text := 'ef5';
  blk_gpp   uuid := '005706c4-9629-4dc4-a76a-62bde68e9b8a';
  blk_ss    uuid := '78db3ce0-d9b3-42dc-b8d5-176438a51ff2';
  blk_tap   uuid := 'd4fc1bb5-81ea-4b08-883a-d248b611a305';

  -- GPP sessions
  gpp_a  uuid := 'ec088c39-4cfd-49ee-8ee0-511f7e3c41c3';  -- Session A
  gpp_b  uuid := '9e2ef41f-13cc-4e21-bb52-6ecc03945c69';  -- Session B
  gpp_c  uuid := '9229cdcb-4069-46d5-a141-68607f9abcdc';  -- Session C — Deload / Test Week

  -- Strength-Speed sessions
  ss_a   uuid := '249670e5-f0be-4a74-94dd-0d8345252178';
  ss_b   uuid := '271ca1ec-c025-4b56-8620-905f2b767d29';

  -- Taper session
  tap_s  uuid := '8a0395ec-57fd-4574-b695-8f9786b13875';

  v_existing int;
BEGIN
  SELECT count(*) INTO v_existing
    FROM public.planned_sessions
   WHERE athlete_id = v_athlete_id
     AND block_id IN (blk_gpp, blk_ss, blk_tap);

  IF v_existing > 0 THEN
    RAISE NOTICE 'Maggie summer planned_sessions already exist (% rows). Skipping.', v_existing;
    RETURN;
  END IF;

  -- ------------------------------------------------------------------
  -- GPP  (Mon 6 Jul → Sun 23 Aug, 7 weeks)
  -- Tue A / Fri B, with deload weeks 4 & 7. Wk 4 shifts to Mon/Wed.
  -- Wk 7 is the C (Deload/Test) session on Tue.
  -- ------------------------------------------------------------------
  INSERT INTO public.planned_sessions
    (athlete_id, block_id, block_session_id, week_number, planned_date)
  VALUES
    -- Wk 1
    (v_athlete_id, blk_gpp, gpp_a, 1, '2026-07-07'),
    (v_athlete_id, blk_gpp, gpp_b, 1, '2026-07-10'),
    -- Wk 2
    (v_athlete_id, blk_gpp, gpp_a, 2, '2026-07-14'),
    (v_athlete_id, blk_gpp, gpp_b, 2, '2026-07-17'),
    -- Wk 3
    (v_athlete_id, blk_gpp, gpp_a, 3, '2026-07-21'),
    (v_athlete_id, blk_gpp, gpp_b, 3, '2026-07-24'),
    -- Wk 4 (deload — Mon/Wed)
    (v_athlete_id, blk_gpp, gpp_a, 4, '2026-07-27'),
    (v_athlete_id, blk_gpp, gpp_b, 4, '2026-07-29'),
    -- Wk 5
    (v_athlete_id, blk_gpp, gpp_a, 5, '2026-08-04'),
    (v_athlete_id, blk_gpp, gpp_b, 5, '2026-08-07'),
    -- Wk 6
    (v_athlete_id, blk_gpp, gpp_a, 6, '2026-08-11'),
    (v_athlete_id, blk_gpp, gpp_b, 6, '2026-08-14'),
    -- Wk 7 (deload — Session C on Tue)
    (v_athlete_id, blk_gpp, gpp_c, 7, '2026-08-18');

  -- ------------------------------------------------------------------
  -- Strength-Speed  (Mon 24 Aug → Sun 13 Sep, 3 weeks)
  -- A on Tue Wk1/Wk2; B on Fri Wk1/Wk2 + Tue Wk3 (deload).
  -- ------------------------------------------------------------------
  INSERT INTO public.planned_sessions
    (athlete_id, block_id, block_session_id, week_number, planned_date)
  VALUES
    (v_athlete_id, blk_ss, ss_a, 1, '2026-08-25'),
    (v_athlete_id, blk_ss, ss_b, 1, '2026-08-28'),
    (v_athlete_id, blk_ss, ss_a, 2, '2026-09-01'),
    (v_athlete_id, blk_ss, ss_b, 2, '2026-09-04'),
    (v_athlete_id, blk_ss, ss_b, 3, '2026-09-08');

  -- ------------------------------------------------------------------
  -- Taper  (Mon 14 → Sun 27 Sep, 2 weeks)
  -- Sharpness session on Tue each week.
  -- Championships Sat 3 + Sun 4 Oct sit outside this window.
  -- ------------------------------------------------------------------
  INSERT INTO public.planned_sessions
    (athlete_id, block_id, block_session_id, week_number, planned_date)
  VALUES
    (v_athlete_id, blk_tap, tap_s, 1, '2026-09-15'),
    (v_athlete_id, blk_tap, tap_s, 2, '2026-09-22');

  RAISE NOTICE 'Maggie planned_sessions seeded: 13 GPP + 5 SS + 2 Taper = 20 rows.';
END
$seed$;

COMMIT;
