-- meal_events_anon_insert_fix_2026-08-20.sql
-- ----------------------------------------------------------------------
-- meal_entries and meal_photos were both tightened from the original
-- blanket "anon: ALL" policy down to precise anon_insert/anon_select/
-- anon_update grants at some point after meal_logging_2026-06-01.sql
-- was written — but meal_events was missed, since nothing in client
-- code inserts into it directly; only the log_meal_entry_submitted
-- trigger does, on every meal_entries insert.
--
-- Net effect discovered while testing: meal_events had ZERO anon
-- policies (only staff_insert/staff_update/staff_delete/auth_select,
-- all authenticated-only). Since the trigger runs in the same
-- transaction as the athlete's INSERT, every meal submission from the
-- athlete app (any meal_type) has been failing outright with an RLS
-- violation and rolling back — Snap & Send has not actually been able
-- to record a meal.
--
-- Fix: scope the anon grant to exactly what the trigger does — insert
-- a 'submitted' event. reviewed / note_added stay staff-only via the
-- existing staff_insert policy.
-- ----------------------------------------------------------------------

DROP POLICY IF EXISTS anon_insert_submitted ON public.meal_events;
CREATE POLICY anon_insert_submitted ON public.meal_events
  FOR INSERT TO anon
  WITH CHECK (event_type = 'submitted');

NOTIFY pgrst, 'reload schema';
