-- ============================================================================
-- Mental Game — Phase 1 DOWN migration
-- Date: 2026-06-01
-- Branch: feat/mental-game-phase-1
--
-- Reverts Phase 1 cleanly:
--   - Drops the two new sibling tables (mf_assessment_item_responses,
--     mf_module_sessions). Both are namespaced under mf_*; CASCADE
--     only touches Mental Game data, never legacy tables.
--   - Removes the Module 1 seed (steps cascade via FK).
--   - Re-seeds the Phase 0 smoke-test stub at order_index=99 so
--     running Phase 1 DOWN doesn't leave the catalogue empty when
--     running on top of Phase 0.
--
-- Phase 0 schema (mf_modules / mf_module_steps / mf_athlete_progress /
-- mf_xp_ledger / mf_persona / mf_blueprint / mf_assessment_responses /
-- mf_reflections / mf_is_staff) stays in place.
-- ============================================================================

BEGIN;

DROP TABLE IF EXISTS public.mf_assessment_item_responses CASCADE;
DROP TABLE IF EXISTS public.mf_module_sessions          CASCADE;

DELETE FROM public.mf_modules WHERE slug = 'what-are-mental-skills';

-- Restore the Phase 0 smoke-test row so the catalogue isn't blank
-- on rollback. Only inserted if it isn't already there (e.g. someone
-- ran the Phase 0 seed by hand after the Phase 1 delete).
INSERT INTO public.mf_modules (slug, title, description, domain, order_index, xp_reward, status, version)
VALUES ('sample-smoke-test', 'Sample', NULL, 'intro', 99, 100, 'draft', 1)
ON CONFLICT (slug) DO NOTHING;

NOTIFY pgrst, 'reload schema';

COMMIT;
