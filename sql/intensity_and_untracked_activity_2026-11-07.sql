-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Intensity minutes from the watch, and 2. a log for activity the watch didn't record.
--
-- 1) garmin_daily gets moderate_min / vigorous_min (Garmin's daily "intensity minutes"). The Garmin
--    receiver fills them in as the watch syncs. garmin_daily_for() now also returns intensity_min =
--    moderate + 2 x vigorous (Garmin's own way of counting), shared with coaches like active calories.
--    The athlete's Yes/No switches are untouched.
--
-- 2) untracked_activity_logs: an athlete logs something their watch didn't capture (a game, training
--    without the watch): what, when, how long, and how hard (0 to 10, same slider as the end of a workout).
--    Athletes read, add and delete their own; coaches (staff) read all. No edits.
--
-- Additive; safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.garmin_daily
  ADD COLUMN IF NOT EXISTS moderate_min integer,
  ADD COLUMN IF NOT EXISTS vigorous_min integer;

DROP FUNCTION IF EXISTS public.garmin_daily_for(text[], date, integer);
CREATE OR REPLACE FUNCTION public.garmin_daily_for(p_athlete_ids text[], p_since date DEFAULT NULL, p_limit integer DEFAULT 400)
RETURNS TABLE (athlete_id text, day date, steps integer, resting_hr integer, avg_stress integer,
               body_battery_high integer, body_battery_low integer, active_kcal integer,
               sleep_seconds integer, sleep_score integer, hrv_last_night integer, hrv_weekly_avg integer, hrv_status text,
               resp_avg numeric, spo2_avg integer, spo2_min integer, vo2_max numeric, fitness_age integer,
               intensity_min integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT d.athlete_id, d.day, d.steps, d.resting_hr,
         CASE WHEN v.own OR COALESCE((c.share->>'stress')::boolean, false)       THEN d.avg_stress END,
         CASE WHEN v.own OR COALESCE((c.share->>'body_battery')::boolean, false) THEN d.body_battery_high END,
         CASE WHEN v.own OR COALESCE((c.share->>'body_battery')::boolean, false) THEN d.body_battery_low END,
         d.active_kcal,
         CASE WHEN v.own OR COALESCE((c.share->>'sleep')::boolean, false)        THEN d.sleep_seconds END,
         CASE WHEN v.own OR COALESCE((c.share->>'sleep')::boolean, false)        THEN d.sleep_score END,
         CASE WHEN v.own OR COALESCE((c.share->>'sleep')::boolean, false)        THEN d.hrv_last_night END,
         CASE WHEN v.own OR COALESCE((c.share->>'sleep')::boolean, false)        THEN d.hrv_weekly_avg END,
         CASE WHEN v.own OR COALESCE((c.share->>'sleep')::boolean, false)        THEN d.hrv_status END,
         CASE WHEN v.own OR COALESCE((c.share->>'vitals')::boolean, false)       THEN d.resp_avg END,
         CASE WHEN v.own OR COALESCE((c.share->>'vitals')::boolean, false)       THEN d.spo2_avg END,
         CASE WHEN v.own OR COALESCE((c.share->>'vitals')::boolean, false)       THEN d.spo2_min END,
         CASE WHEN v.own OR COALESCE((c.share->>'fitness')::boolean, false)      THEN d.vo2_max END,
         CASE WHEN v.own OR COALESCE((c.share->>'fitness')::boolean, false)      THEN d.fitness_age END,
         CASE WHEN d.moderate_min IS NULL AND d.vigorous_min IS NULL THEN NULL
              ELSE COALESCE(d.moderate_min, 0) + 2 * COALESCE(d.vigorous_min, 0) END
  FROM public.garmin_daily d
  LEFT JOIN public.garmin_connections c ON c.athlete_id = d.athlete_id
  CROSS JOIN LATERAL (SELECT (d.athlete_id = public.my_athlete_id()) AS own) v
  WHERE d.athlete_id = ANY (p_athlete_ids)
    AND (v.own OR public.is_staff())
    AND (p_since IS NULL OR d.day >= p_since)
  ORDER BY d.day DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 2000);
$$;
REVOKE ALL ON FUNCTION public.garmin_daily_for(text[], date, integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.garmin_daily_for(text[], date, integer) TO authenticated;

CREATE TABLE IF NOT EXISTS public.untracked_activity_logs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id    text        NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  activity_date date        NOT NULL DEFAULT current_date,
  name          text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  duration_min  integer     NOT NULL CHECK (duration_min BETWEEN 1 AND 600),
  rpe           integer     NOT NULL CHECK (rpe BETWEEN 0 AND 10),
  load_au       integer     GENERATED ALWAYS AS (duration_min * rpe) STORED,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (activity_date <= current_date + 1)
);

CREATE INDEX IF NOT EXISTS untracked_activity_athlete_idx ON public.untracked_activity_logs (athlete_id, activity_date DESC);

ALTER TABLE public.untracked_activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS untracked_read ON public.untracked_activity_logs;
CREATE POLICY untracked_read ON public.untracked_activity_logs
  FOR SELECT TO authenticated
  USING (public.is_staff() OR athlete_id = public.my_athlete_id());

DROP POLICY IF EXISTS untracked_insert_own ON public.untracked_activity_logs;
CREATE POLICY untracked_insert_own ON public.untracked_activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (athlete_id = public.my_athlete_id());

DROP POLICY IF EXISTS untracked_delete_own ON public.untracked_activity_logs;
CREATE POLICY untracked_delete_own ON public.untracked_activity_logs
  FOR DELETE TO authenticated
  USING (athlete_id = public.my_athlete_id() OR public.is_staff());
