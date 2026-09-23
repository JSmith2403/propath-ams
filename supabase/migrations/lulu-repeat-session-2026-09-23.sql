-- ============================================================================
-- Repeat Lulu Mubarak's "Injury Prevention + Power" session (14 Sep) onto
-- today (23 Sep)
-- Date: 2026-09-23
-- Data-only. Safe to re-run: skips if she already has a planned session
-- on the target date.
--
-- NOTE ON WHY THIS ISN'T THE APP'S OWN "COPY" BUTTON:
-- usePlannedSessionMutations.js's cloneBlockSessionInto() — what the ⧉
-- copy icon and long-press-copy actually call when the target date falls
-- outside the source block's window (true here, since Lulu's session
-- lives in a single-day FreeForm block) — copies block_sessions and
-- session_exercises, but its SELECT omits section_id and
-- superset_group_id entirely, and it never touches session_step_notes at
-- all. Copying this way would have dropped her 5 named sections, the two
-- Strength supersets (RDL+TRX Row, Incline Push-up+Calf Raise), and the
-- "Session focus" note into one flat unsectioned list. This script does
-- a real full clone instead: sections, exercises (with section + superset
-- links preserved via temp id maps), week-1 prescriptions, and notes.
-- Worth fixing cloneBlockSessionInto itself at some point so the in-app
-- button doesn't have this gap for anyone else's sessions.
-- ============================================================================

DO $$
DECLARE
  v_athlete_id      text;
  v_src_session_id  uuid;
  v_new_block_id    uuid;
  v_new_session_id  uuid;
  v_sec             RECORD;
  v_new_sec_id      uuid;
  v_ex              RECORD;
  v_new_ex_id       uuid;
  v_wp              RECORD;
BEGIN
  SELECT id INTO v_athlete_id FROM athletes WHERE data->>'name' = 'Lulu Mubarak';
  IF v_athlete_id IS NULL THEN
    RAISE EXCEPTION 'Could not find an athlete named Lulu Mubarak.';
  END IF;

  SELECT ps.block_session_id INTO v_src_session_id
  FROM planned_sessions ps
  WHERE ps.athlete_id = v_athlete_id AND ps.planned_date = DATE '2026-09-14'
  LIMIT 1;
  IF v_src_session_id IS NULL THEN
    RAISE EXCEPTION 'No planned session found for Lulu Mubarak on 2026-09-14.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM planned_sessions
    WHERE athlete_id = v_athlete_id AND planned_date = DATE '2026-09-23'
  ) THEN
    RAISE NOTICE 'Lulu already has a planned session on 2026-09-23 — skipping, nothing inserted.';
    RETURN;
  END IF;

  -- One-off FreeForm block for today.
  INSERT INTO training_blocks (athlete_id, block_name, start_date, end_date, duration_weeks, display_order)
  VALUES (
    v_athlete_id, 'FreeForm', DATE '2026-09-23', DATE '2026-09-23', 1,
    COALESCE((SELECT MAX(display_order) FROM training_blocks WHERE athlete_id = v_athlete_id), 0) + 1
  )
  RETURNING id INTO v_new_block_id;

  -- Clone the session shell (name + coach notes).
  INSERT INTO block_sessions (block_id, session_name, session_order, coach_notes)
  SELECT v_new_block_id, session_name, 1, coach_notes
  FROM block_sessions WHERE id = v_src_session_id
  RETURNING id INTO v_new_session_id;

  -- Old-id -> new-id maps for sections and exercises, needed so cloned
  -- exercises/notes/prescriptions point at the NEW rows, not the source's.
  CREATE TEMP TABLE _sec_map (old_id uuid PRIMARY KEY, new_id uuid) ON COMMIT DROP;
  CREATE TEMP TABLE _ex_map  (old_id uuid PRIMARY KEY, new_id uuid) ON COMMIT DROP;

  FOR v_sec IN
    SELECT * FROM session_sections WHERE block_session_id = v_src_session_id ORDER BY display_order
  LOOP
    INSERT INTO session_sections (block_session_id, name, display_order, is_warm_up)
    VALUES (v_new_session_id, v_sec.name, v_sec.display_order, v_sec.is_warm_up)
    RETURNING id INTO v_new_sec_id;
    INSERT INTO _sec_map VALUES (v_sec.id, v_new_sec_id);
  END LOOP;

  FOR v_ex IN
    SELECT * FROM session_exercises WHERE block_session_id = v_src_session_id ORDER BY display_order
  LOOP
    INSERT INTO session_exercises (
      block_session_id, section_id, exercise_id, display_order,
      group_label, group_colour, prescription_type, notes, is_warm_up, superset_group_id
    )
    VALUES (
      v_new_session_id,
      (SELECT new_id FROM _sec_map WHERE old_id = v_ex.section_id),
      v_ex.exercise_id, v_ex.display_order,
      v_ex.group_label, v_ex.group_colour, v_ex.prescription_type, v_ex.notes, v_ex.is_warm_up,
      -- Same superset_group_id value as the source is fine to reuse —
      -- grouping is only ever compared within one block_session_id's own
      -- exercise list, never across sessions, so sharing the value with
      -- the 14 Sept session can't cross-link them.
      v_ex.superset_group_id
    )
    RETURNING id INTO v_new_ex_id;
    INSERT INTO _ex_map VALUES (v_ex.id, v_new_ex_id);
  END LOOP;

  FOR v_wp IN
    SELECT ewp.* FROM exercise_week_prescriptions ewp
    JOIN session_exercises se ON se.id = ewp.session_exercise_id
    WHERE se.block_session_id = v_src_session_id AND ewp.week_number = 1
  LOOP
    INSERT INTO exercise_week_prescriptions (session_exercise_id, week_number, sets, reps, target_value, rest_seconds)
    VALUES (
      (SELECT new_id FROM _ex_map WHERE old_id = v_wp.session_exercise_id),
      1, v_wp.sets, v_wp.reps, v_wp.target_value, v_wp.rest_seconds
    );
  END LOOP;

  -- Notes — some section-scoped, some session-level (section_id null,
  -- e.g. the "Session focus" line). NULL maps to NULL automatically.
  INSERT INTO session_step_notes (block_session_id, section_id, display_order, content)
  SELECT v_new_session_id,
         (SELECT new_id FROM _sec_map WHERE old_id = ssn.section_id),
         ssn.display_order, ssn.content
  FROM session_step_notes ssn
  WHERE ssn.block_session_id = v_src_session_id;

  INSERT INTO planned_sessions (athlete_id, block_id, block_session_id, week_number, planned_date)
  VALUES (v_athlete_id, v_new_block_id, v_new_session_id, 1, DATE '2026-09-23');

  RAISE NOTICE 'Cloned Lulu Mubarak''s 14 Sep session onto 23 Sep.';
END $$;

-- End of migration.
