-- ============================================================================
-- Fix: Titus McKnight's FreeForm week landed with scrambled dates and a
-- missing session
-- Date: 2026-09-13
-- Data-only. Targeted at exact known row ids — safe to re-run (every
-- UPDATE is idempotent; the Prep insert is guarded).
--
-- Diagnosis: across the two earlier failed applies of
-- titus-mcknight-week-2026-09-02.sql (bad column, then a mangled line)
-- something partially landed before/around the fixes — the exercise
-- content (sets/reps/notes) for all 8 sessions that DID land is
-- correct, but their planned_date values are wrong and the "Prep"
-- session never made it in at all. This corrects both directly against
-- the block that's actually live (0fd8f291-8089-4a47-bf12-9ed940e348f3)
-- rather than re-running the original script, which would now no-op
-- (its own guard sees a matching block and skips).
-- ============================================================================

DO $$
DECLARE
  v_block_id uuid := '0fd8f291-8089-4a47-bf12-9ed940e348f3';
  v_session_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM block_sessions WHERE block_id = v_block_id) THEN
    RAISE EXCEPTION 'Expected block % not found — has the DB state changed since diagnosis?', v_block_id;
  END IF;

  -- ── Clear session_order first (shift-to-negative pattern) so the
  -- final UPDATEs below can't transiently collide with each other under
  -- the (block_id, session_order) unique constraint. ──────────────────
  UPDATE block_sessions SET session_order = session_order - 1000
  WHERE block_id = v_block_id;

  -- ── Fix planned_date + session_order per session, keyed by the
  -- exact block_session id (no name-matching ambiguity). ─────────────

  -- Rugby: was on the 4th, should be the 2nd (Wed).
  UPDATE block_sessions SET session_order = 2 WHERE id = '4f88d7d5-49f1-4cf6-affe-18034150d7d7';
  UPDATE planned_sessions SET planned_date = DATE '2026-09-02'
  WHERE block_session_id = '4f88d7d5-49f1-4cf6-affe-18034150d7d7';

  -- Conditioning: already correct (Wed) — order only.
  UPDATE block_sessions SET session_order = 3 WHERE id = '59417fa1-98f1-40f5-ad50-526e7f340254';

  -- Uppers: already correct (Wed) — order only.
  UPDATE block_sessions SET session_order = 4 WHERE id = '4929fb3f-9e36-4d6d-8e48-ffd6c913c1cf';

  -- Rugby Handling: was on the 2nd, should be the 3rd (Thu).
  UPDATE block_sessions SET session_order = 5 WHERE id = '87107ea7-6c79-49b8-bd31-263813d8e998';
  UPDATE planned_sessions SET planned_date = DATE '2026-09-03'
  WHERE block_session_id = '87107ea7-6c79-49b8-bd31-263813d8e998';

  -- Lower Body & Core: was on the 2nd, should be the 3rd (Thu).
  UPDATE block_sessions SET session_order = 6 WHERE id = 'd8020538-8f2b-4cb5-8778-c3fbdcc42260';
  UPDATE planned_sessions SET planned_date = DATE '2026-09-03'
  WHERE block_session_id = 'd8020538-8f2b-4cb5-8778-c3fbdcc42260';

  -- Down Day: was on the 3rd, should be the 4th (Fri).
  UPDATE block_sessions SET session_order = 7 WHERE id = 'c79e63c1-7cdb-4f37-8a1f-83157d1c7ff6';
  UPDATE planned_sessions SET planned_date = DATE '2026-09-04'
  WHERE block_session_id = 'c79e63c1-7cdb-4f37-8a1f-83157d1c7ff6';

  -- Aerobic Run: was on the 3rd, should be the 5th (Sat).
  UPDATE block_sessions SET session_order = 8 WHERE id = 'da3057e1-9e3d-4cff-88f2-85febdb9470d';
  UPDATE planned_sessions SET planned_date = DATE '2026-09-05'
  WHERE block_session_id = 'da3057e1-9e3d-4cff-88f2-85febdb9470d';

  -- Supplementary Uppers: was on the 4th, should be the 5th (Sat).
  UPDATE block_sessions SET session_order = 9 WHERE id = 'e4e9844f-c500-45f8-afa8-e5afc94bfd38';
  UPDATE planned_sessions SET planned_date = DATE '2026-09-05'
  WHERE block_session_id = 'e4e9844f-c500-45f8-afa8-e5afc94bfd38';

  -- ── Add the missing Prep session (Wed, order 1) — only if it's
  -- still absent, so re-running this file is harmless. ────────────────
  IF NOT EXISTS (SELECT 1 FROM block_sessions WHERE block_id = v_block_id AND session_name = 'Prep') THEN
    INSERT INTO block_sessions (block_id, session_name, session_order)
    VALUES (v_block_id, 'Prep', 1)
    RETURNING id INTO v_session_id;

    INSERT INTO session_sections (block_session_id, name, display_order)
    VALUES (v_session_id, 'Main', 1);

    INSERT INTO session_step_notes (block_session_id, section_id, display_order, content)
    SELECT v_session_id, ss.id, 1,
      '2 rounds:
Pelvic tucks x15
Glute bridges x15
Bird dog x10/side
Side plank clam x15s/side
Bear Crawl Shoulder Taps x10'
    FROM session_sections ss WHERE ss.block_session_id = v_session_id;

    INSERT INTO planned_sessions (athlete_id, block_id, block_session_id, week_number, planned_date)
    VALUES ('db93421d-4276-40ef-9d53-d6fe4d074e03', v_block_id, v_session_id, 1, DATE '2026-09-02');
  END IF;

  RAISE NOTICE 'Titus''s FreeForm week corrected: 9 sessions, Wed 2 - Sat 5 Sep, in order.';
END $$;

-- End of migration.
