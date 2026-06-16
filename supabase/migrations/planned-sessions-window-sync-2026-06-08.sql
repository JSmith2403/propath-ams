-- ============================================================================
-- planned_sessions ↔ training_blocks window sync
-- Date: 2026-06-08
--
-- Bug fixed: when a coach shortens a block (removes a week), the
-- shiftBlocksByDays hook updates training_blocks.duration_weeks +
-- end_date — but the dropped week's planned_sessions stay behind and
-- continue to render on the athlete's calendar as ghost sessions.
-- The FK CASCADE only fires on DELETE of the parent row, not UPDATE.
--
-- Symmetrically, when a block is shortened/lengthened, every LATER
-- block on the same athlete's timeline shifts ±7 days — but their
-- planned_sessions don't shift, so the dates drift out of sync with
-- the block window.
--
-- This migration:
--   1. Cleans up the existing orphans on LIVE.
--   2. Creates a small RPC `shift_planned_session_dates(ids, delta)`
--      the app can call after a shift to keep dates aligned.
--
-- Safe to re-run: cleanup is idempotent, function uses CREATE OR REPLACE.
-- ============================================================================

BEGIN;

-- ─── 1. One-shot orphan cleanup ────────────────────────────────────────────
-- Any planned_session whose date or week_number falls outside its block's
-- current window is a ghost from a prior shrink. Delete them.
DELETE FROM public.planned_sessions ps
USING public.training_blocks tb
WHERE  ps.block_id = tb.id
  AND  (
        ps.planned_date > tb.end_date
     OR ps.planned_date < tb.start_date
     OR ps.week_number  > tb.duration_weeks
       );

-- ─── 2. Date-shift RPC ─────────────────────────────────────────────────────
-- Shifts every planned_session for the given block_ids by p_delta_days.
-- Used when an EARLIER block in the timeline grows/shrinks and the
-- later blocks have been shifted by the same amount — their planned
-- sessions need to ride along so the dates still line up with the
-- block window.
--
-- week_number is intentionally untouched: shifting the block's calendar
-- position doesn't change which week each session belongs to.
CREATE OR REPLACE FUNCTION public.shift_planned_session_dates(
  p_block_ids uuid[],
  p_delta_days int
) RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected int;
BEGIN
  UPDATE public.planned_sessions
  SET    planned_date = planned_date + make_interval(days => p_delta_days)
  WHERE  block_id = ANY(p_block_ids);
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

GRANT EXECUTE ON FUNCTION public.shift_planned_session_dates(uuid[], int) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
