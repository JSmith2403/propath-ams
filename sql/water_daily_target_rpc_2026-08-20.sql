-- water_daily_target_rpc_2026-08-20.sql
-- ----------------------------------------------------------------------
-- nutrition_settings is anon-readable but authenticated-only for
-- writes (meal_logging_enabled / require_photo are coach-set toggles,
-- and a blanket anon write policy would let an athlete flip those
-- themselves). The water-target popup lives in the athlete app though,
-- so it needs a narrow anon-callable write path for just that one
-- field — a SECURITY DEFINER RPC, same pattern as
-- apply_session_grid_changes / validate_athlete_token.
-- ----------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_water_daily_target(p_athlete_id text, p_target smallint)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_target < 1 OR p_target > 30 THEN
    RAISE EXCEPTION 'Target must be between 1 and 30 glasses';
  END IF;

  INSERT INTO public.nutrition_settings (athlete_id, water_daily_target)
  VALUES (p_athlete_id, p_target)
  ON CONFLICT (athlete_id) DO UPDATE
    SET water_daily_target = EXCLUDED.water_daily_target,
        updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_water_daily_target(text, smallint) TO anon;
GRANT EXECUTE ON FUNCTION public.set_water_daily_target(text, smallint) TO authenticated;

NOTIFY pgrst, 'reload schema';
