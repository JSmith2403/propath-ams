-- vald_trial_limb_2026-05-06.sql
-- ----------------------------------------------------------------------
-- VALD ForceDecks: capture the trial-level limb tag.
--
-- Single-leg tests (SLHJ, SLDJ, single-leg CMJ etc.) report each trial
-- as one leg, but VALD's per-metric `limb` field is often null — the
-- side lives on the trial object itself. Without a column for it the
-- table can only show "TRIAL" for every single-leg jump, which makes
-- it impossible to tell which leg produced which numbers.
--
-- nullable + safe to backfill on the next sync — no data migration
-- needed; existing rows just keep trial_limb = NULL until re-synced.
-- ----------------------------------------------------------------------

ALTER TABLE public.vald_test_results
  ADD COLUMN IF NOT EXISTS trial_limb text;

COMMENT ON COLUMN public.vald_test_results.trial_limb IS
  'Trial-level limb tag from VALD (Left / Right / Trial). Distinct from raw_metrics[*].limb which is per-metric and often null for single-leg tests.';
