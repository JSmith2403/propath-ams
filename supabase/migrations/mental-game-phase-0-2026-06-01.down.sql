-- ============================================================================
-- Mental Game — Phase 0 schema DOWN migration
-- Date: 2026-06-01
-- Branch: feat/mental-game-phase-0
--
-- Reverts the UP migration. Because every new object is namespaced
-- `mf_*` and is additive over the existing schema, this DROP set
-- cannot touch any legacy table or function. Safe to run repeatedly.
--
-- Reverts both the schema AND the sample seed (seed rows live inside
-- mf_modules / mf_module_steps which CASCADE-drop with the tables).
-- If you only want to revert the seed, run the matching ...seed.down
-- file instead.
-- ============================================================================

BEGIN;

DROP TABLE IF EXISTS public.mf_reflections             CASCADE;
DROP TABLE IF EXISTS public.mf_assessment_responses    CASCADE;
DROP TABLE IF EXISTS public.mf_blueprint               CASCADE;
DROP TABLE IF EXISTS public.mf_persona                 CASCADE;
DROP TABLE IF EXISTS public.mf_xp_ledger               CASCADE;
DROP TABLE IF EXISTS public.mf_athlete_progress        CASCADE;
DROP TABLE IF EXISTS public.mf_module_steps            CASCADE;
DROP TABLE IF EXISTS public.mf_modules                 CASCADE;

DROP FUNCTION IF EXISTS public.mf_is_staff();

NOTIFY pgrst, 'reload schema';

COMMIT;
