-- ============================================================================
-- SECURITY WAVE 1b — functions the public key could call.            2026-10-27
-- NOT YET APPLIED.  Rules/functions only; no rows change.
--
-- FOUND (Supabase security advisor + reading the function bodies):
--   * shift_planned_session_dates(block_ids, delta_days) is SECURITY DEFINER with NO permission check and
--     is callable with the public key. Anyone could move every athlete's planned sessions by any number
--     of days. Fix: coaches only (is_staff() inside) and no public/anon execute.
--   * is_staff(), mf_is_staff(), my_athlete_id() are callable by the public key. Harmless (they only report
--     the caller's own status) but flagged — signed-in users keep access, the public doesn't.
--   * 10 functions have no fixed search_path (warning) — pinned to public.
--   * Two new athlete/provider policies re-evaluate auth.uid() per row — wrapped in (select …).
--
-- NOT touched here (the old private-link athlete app still needs them; closed in wave 2 with the logins):
--   set_water_daily_target, set_session_attendance, validate_athlete_token, validate_wellness_token.
--
-- Also needs doing by hand in the Supabase dashboard: Authentication → Passwords → turn on
-- "Leaked password protection" (blocks passwords found in known breaches; may need the Pro plan).
-- ============================================================================

-- 1. Coaches only
CREATE OR REPLACE FUNCTION public.shift_planned_session_dates(p_block_ids uuid[], p_delta_days integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  affected int;
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Only coaches can move planned sessions' USING ERRCODE = '42501';
  END IF;
  UPDATE public.planned_sessions
  SET    planned_date = planned_date + make_interval(days => p_delta_days)
  WHERE  block_id = ANY(p_block_ids);
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$function$;
REVOKE ALL ON FUNCTION public.shift_planned_session_dates(uuid[], integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.shift_planned_session_dates(uuid[], integer) TO authenticated;

-- 2. Helpers: signed-in only
REVOKE ALL ON FUNCTION public.is_staff()      FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mf_is_staff()   FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_athlete_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff()      TO authenticated;
GRANT EXECUTE ON FUNCTION public.mf_is_staff()   TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_athlete_id() TO authenticated;

-- 3. Fixed search_path on the flagged functions
ALTER FUNCTION public.compute_srpe_load()                  SET search_path = public, pg_temp;
ALTER FUNCTION public.calculate_e1rm(numeric, integer)     SET search_path = public, pg_temp;
ALTER FUNCTION public.update_athlete_e1rm()                SET search_path = public, pg_temp;
ALTER FUNCTION public.touch_updated_at()                   SET search_path = public, pg_temp;
ALTER FUNCTION public.touch_resource_items_updated_at()    SET search_path = public, pg_temp;
ALTER FUNCTION public.enforce_meal_photo_cap()             SET search_path = public, pg_temp;
ALTER FUNCTION public.log_meal_entry_submitted()           SET search_path = public, pg_temp;
ALTER FUNCTION public.apply_session_grid_changes(jsonb)    SET search_path = public, pg_temp;
ALTER FUNCTION public.chat_messages_protect()              SET search_path = public, pg_temp;
ALTER FUNCTION public.athlete_messages_protect()           SET search_path = public, pg_temp;

-- 4. Policy speed-ups from wave 1 (same rules, auth.uid() evaluated once)
DROP POLICY IF EXISTS athletes_provider_select ON public.athletes;
CREATE POLICY athletes_provider_select ON public.athletes
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.provider_allocations pa WHERE pa.user_id = (SELECT auth.uid()) AND pa.athlete_id = athletes.id));
DROP POLICY IF EXISTS athletes_provider_update ON public.athletes;
CREATE POLICY athletes_provider_update ON public.athletes
  FOR UPDATE TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.provider_allocations pa WHERE pa.user_id = (SELECT auth.uid()) AND pa.athlete_id = athletes.id))
  WITH CHECK (EXISTS (SELECT 1 FROM public.provider_allocations pa WHERE pa.user_id = (SELECT auth.uid()) AND pa.athlete_id = athletes.id));
DROP POLICY IF EXISTS provider_allocations_own_select ON public.provider_allocations;
CREATE POLICY provider_allocations_own_select ON public.provider_allocations
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
