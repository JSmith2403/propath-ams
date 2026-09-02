-- ============================================================================
-- Fix: attach a section to every session in Titus's FreeForm week
-- Date: 2026-09-02
-- Data-only. Safe to re-run.
--
-- titus-mcknight-week-2026-09-02.sql inserted session_exercises and
-- session_step_notes with section_id left NULL. The athlete app and
-- coach week view don't care (they read notes/exercises directly off
-- block_session_id), but the Programme *builder* only shows content
-- that belongs to a session_sections row — with no section, every
-- session in the builder renders as empty ("0 exercises", blank body),
-- which is what showed up when opening the FreeForm block to check it.
--
-- This creates one "Main" section per session (only where one doesn't
-- already exist) and re-points any section_id-less rows at it.
-- ============================================================================

DO $$
DECLARE
  v_athlete_id text;
  v_block_id uuid;
  r RECORD;
  v_section_id uuid;
BEGIN
  SELECT id INTO v_athlete_id
  FROM athletes
  WHERE data->>'name' ILIKE '%titus%' AND data->>'name' ILIKE '%mcknight%'
  LIMIT 1;

  IF v_athlete_id IS NULL THEN
    RAISE EXCEPTION 'Could not find an athlete named Titus McKnight.';
  END IF;

  SELECT id INTO v_block_id
  FROM training_blocks
  WHERE athlete_id = v_athlete_id
    AND block_name = 'FreeForm'
    AND start_date = DATE '2026-09-02'
    AND end_date   = DATE '2026-09-05';

  IF v_block_id IS NULL THEN
    RAISE EXCEPTION 'Could not find this week''s FreeForm block for Titus — has titus-mcknight-week-2026-09-02.sql been applied?';
  END IF;

  FOR r IN
    SELECT id, session_name FROM block_sessions WHERE block_id = v_block_id
  LOOP
    SELECT id INTO v_section_id
    FROM session_sections
    WHERE block_session_id = r.id
    LIMIT 1;

    IF v_section_id IS NULL THEN
      INSERT INTO session_sections (block_session_id, name, display_order)
      VALUES (r.id, 'Main', 1)
      RETURNING id INTO v_section_id;
    END IF;

    UPDATE session_step_notes
    SET section_id = v_section_id
    WHERE block_session_id = r.id AND section_id IS NULL;

    UPDATE session_exercises
    SET section_id = v_section_id
    WHERE block_session_id = r.id AND section_id IS NULL;
  END LOOP;

  RAISE NOTICE 'Sections attached for all sessions in Titus''s FreeForm week.';
END $$;

-- End of migration.
