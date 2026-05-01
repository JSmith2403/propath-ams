-- ============================================================================
-- ProPath — Featured wellness questions (roster-card spotlight)
--
-- Adds an `is_featured` flag to the per-athlete junction so coaches
-- can pick which (max 5) of the athlete's selected questions appear
-- on the roster card. Cap is enforced client-side; this column is
-- the storage.
--
-- Run in dev project mdqzxhihyglxhgezxeat. Idempotent.
-- ============================================================================

alter table athlete_wellness_questions
  add column if not exists is_featured boolean not null default false;

create index if not exists idx_athlete_wellness_questions_featured
  on athlete_wellness_questions (athlete_id, is_featured)
  where is_featured = true;

notify pgrst, 'reload schema';
