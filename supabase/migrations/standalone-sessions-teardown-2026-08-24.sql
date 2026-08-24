-- Retire standalone_sessions — superseded by lightweight "FreeForm"
-- 1-week training_blocks reusing the existing block builder, rather
-- than maintaining a second exercise-entry UI.
-- Date: 2026-08-24
-- Idempotent: safe to re-run.
--
-- Nothing in production ever successfully wrote a NULL block_id /
-- block_session_id / week_number: the one attempt made during browser
-- verification was rejected by RLS before this teardown, and no coach
-- had reached this feature yet. Safe to fully revert planned_sessions
-- to its original shape.

ALTER TABLE planned_sessions DROP CONSTRAINT IF EXISTS planned_sessions_lineage_xor;
ALTER TABLE planned_sessions DROP COLUMN IF EXISTS standalone_session_id;

ALTER TABLE planned_sessions ALTER COLUMN block_id SET NOT NULL;
ALTER TABLE planned_sessions ALTER COLUMN block_session_id SET NOT NULL;
ALTER TABLE planned_sessions ALTER COLUMN week_number SET NOT NULL;

DROP TABLE IF EXISTS standalone_sessions;

-- End of migration.
