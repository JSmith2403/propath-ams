-- ============================================================================
-- Maggie Urda (ef5) — post-seed adjustments
-- Date: 2026-07-04
--
-- (1) Swap "Banded Lateral Walk" → "SL Hip Hike" in every session so she can
--     do the warm-up drill without a band.
-- (2) Split the Core section off each of the six sessions into its own
--     block_session ("... — Core") so the main gym session is shorter and
--     the core work can be scheduled independently.
--
-- Prescriptions live on session_exercises.id, which is stable across the
-- section move — no need to touch exercise_week_prescriptions.
--
-- Idempotent: guards on BLW presence for the swap and on
-- "— Core" session_name presence for the split.
-- ============================================================================

BEGIN;

-- (1) --------------------------------------------------------------------
--  BLW → SL Hip Hike
-- ------------------------------------------------------------------------
DO $swap$
DECLARE
  v_athlete_id text := 'ef5';
  v_blw uuid;
  v_hip uuid := 'a194ffcf-7143-424b-b6b5-4708139b2cf7';   -- SL Hip Hike (warm_up)
  v_updated int;
BEGIN
  SELECT id INTO v_blw FROM public.exercise_library WHERE name = 'Banded Lateral Walk';
  IF v_blw IS NULL THEN
    RAISE NOTICE 'Banded Lateral Walk not in library — skipping swap.';
    RETURN;
  END IF;

  WITH targets AS (
    SELECT se.id
      FROM public.session_exercises se
      JOIN public.session_sections ss ON ss.id = se.section_id
      JOIN public.block_sessions bs   ON bs.id = ss.block_session_id
      JOIN public.training_blocks tb  ON tb.id = bs.block_id
     WHERE tb.athlete_id = v_athlete_id
       AND tb.display_order IN (300, 310, 320)
       AND se.exercise_id = v_blw
  )
  UPDATE public.session_exercises
     SET exercise_id = v_hip,
         updated_at  = now()
   WHERE id IN (SELECT id FROM targets);

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RAISE NOTICE 'BLW → SL Hip Hike swap: % row(s) updated.', v_updated;
END
$swap$;


-- (2) --------------------------------------------------------------------
--  Split Core sections into their own block_sessions
-- ------------------------------------------------------------------------
DO $split$
DECLARE
  v_athlete_id text := 'ef5';
  r_sess RECORD;
  v_new_bs uuid;
  v_new_name text;
  v_next_order int;
  v_existing int;
  v_touched int := 0;
BEGIN
  -- Guard: if any "— Core" session already exists for these blocks, bail.
  SELECT count(*) INTO v_existing
    FROM public.block_sessions bs
    JOIN public.training_blocks tb ON tb.id = bs.block_id
   WHERE tb.athlete_id = v_athlete_id
     AND tb.display_order IN (300, 310, 320)
     AND bs.session_name ILIKE '%— Core';

  IF v_existing > 0 THEN
    RAISE NOTICE 'Core sessions already split (% found). Skipping.', v_existing;
    RETURN;
  END IF;

  -- Loop over each of Maggie's summer sessions in order.
  FOR r_sess IN
    SELECT bs.id AS bs_id, bs.block_id, bs.session_name, bs.session_order,
           ss.id AS core_ss_id
      FROM public.block_sessions bs
      JOIN public.training_blocks tb ON tb.id = bs.block_id
      JOIN public.session_sections ss ON ss.block_session_id = bs.id
     WHERE tb.athlete_id = v_athlete_id
       AND tb.display_order IN (300, 310, 320)
       AND ss.name = 'Core'
     ORDER BY tb.display_order, bs.session_order
  LOOP
    -- Build the new session name.
    IF r_sess.session_name ILIKE 'Sharpness%' THEN
      v_new_name := 'Sharpness — Core';
    ELSE
      -- e.g. "Session A" or "Session C — Deload / Test Week" → "Session A — Core" / "Session C — Core"
      v_new_name := split_part(r_sess.session_name, ' —', 1) || ' — Core';
    END IF;

    -- Next available session_order within this block (append to end).
    SELECT COALESCE(MAX(session_order), -1) + 1
      INTO v_next_order
      FROM public.block_sessions
     WHERE block_id = r_sess.block_id;

    -- Create the new block_session.
    INSERT INTO public.block_sessions (block_id, session_order, session_name, coach_notes)
    VALUES (r_sess.block_id, v_next_order, v_new_name,
            'Split off from "' || r_sess.session_name || '" to keep the main session concise. Do same-day, another day, or at home.')
    RETURNING id INTO v_new_bs;

    -- Move the Core section over and put it first inside the new session.
    UPDATE public.session_sections
       SET block_session_id = v_new_bs,
           display_order    = 0,
           updated_at       = now()
     WHERE id = r_sess.core_ss_id;

    -- Renumber the exercises inside the moved section to be 0-based
    -- within the new session.
    WITH ranked AS (
      SELECT id,
             row_number() OVER (ORDER BY display_order, id) - 1 AS new_ord
        FROM public.session_exercises
       WHERE section_id = r_sess.core_ss_id
    )
    UPDATE public.session_exercises se
       SET display_order = ranked.new_ord,
           block_session_id = v_new_bs,
           updated_at = now()
      FROM ranked
     WHERE se.id = ranked.id;

    v_touched := v_touched + 1;
  END LOOP;

  RAISE NOTICE 'Core split: % new sessions created.', v_touched;
END
$split$;

COMMIT;
