-- ============================================================================
-- Mental Game — Phase 0 sample seed DOWN
-- Date: 2026-06-01
-- Branch: feat/mental-game-phase-0
--
-- Removes ONLY the sample-smoke-test module + its steps. The schema
-- stays in place. Useful when you want to wipe the demo data without
-- dropping the tables.
-- ============================================================================

BEGIN;

DELETE FROM public.mf_modules WHERE slug = 'sample-smoke-test';
-- Steps cascade via FK ON DELETE CASCADE.

COMMIT;
