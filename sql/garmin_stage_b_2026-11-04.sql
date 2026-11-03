-- ============================================================================
-- Garmin Stage B — stress/body battery from Stress Details, breathing, blood oxygen, VO2 max, Health Snapshots,
-- two new athlete switches, and a small rolling sample of raw pushes for checking field names.  2026-11-04.
-- Safe to re-run.  Adds to sql/garmin_2026-11-03.sql; nothing is removed except two helper functions that are replaced.
--
-- Switches the athlete controls for what COACHES see (steps / resting HR / workouts always come with connecting):
--   sleep · stress · body_battery · womens_health (existing)   +   vitals (breathing rate, blood oxygen, Health
--   Snapshots)  ·  fitness (VO2 max, fitness age).
-- A switch that is MISSING from an athlete's saved choices counts as NO — nothing new is shown to coaches until the
-- athlete has chosen.
-- ============================================================================

-- ── 1. New daily columns ────────────────────────────────────────────────────
ALTER TABLE public.garmin_daily
  ADD COLUMN IF NOT EXISTS resp_avg    numeric,    -- average breaths per minute over the day
  ADD COLUMN IF NOT EXISTS spo2_avg    integer,    -- average blood oxygen %
  ADD COLUMN IF NOT EXISTS spo2_min    integer,    -- lowest blood oxygen %
  ADD COLUMN IF NOT EXISTS vo2_max     numeric,
  ADD COLUMN IF NOT EXISTS fitness_age integer;

-- ── 2. Health Snapshots (a 2-minute on-watch reading the athlete chooses to take) ─
CREATE TABLE IF NOT EXISTS public.garmin_snapshots (
  athlete_id   text        NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  summary_id   text        NOT NULL,
  taken_at     timestamptz,
  day          date,
  duration_s   integer,
  hr_avg       integer,
  hrv_rmssd    numeric,
  resp_avg     numeric,
  spo2_avg     integer,
  stress_avg   integer,
  raw          jsonb       NOT NULL DEFAULT '{}'::jsonb,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (athlete_id, summary_id)
);
CREATE INDEX IF NOT EXISTS idx_garmin_snapshots_time ON public.garmin_snapshots (athlete_id, taken_at DESC);
ALTER TABLE public.garmin_snapshots ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.garmin_snapshots FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.garmin_snapshots FROM authenticated;
DROP POLICY IF EXISTS own_select ON public.garmin_snapshots;
CREATE POLICY own_select ON public.garmin_snapshots FOR SELECT TO authenticated USING (athlete_id = public.my_athlete_id());
-- (coaches read snapshots only through garmin_snapshots_for(), which applies the athlete's "vitals" switch)

-- ── 3. Rolling raw samples — the last 3 messages of each data type, for checking field names ─────────────
-- Server only. Women's-health data is never put here (the server skips it). Pruned to 3 per type.
CREATE TABLE IF NOT EXISTS public.garmin_raw_samples (
  id          bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  data_type   text        NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  payload     jsonb       NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_garmin_raw_samples_type ON public.garmin_raw_samples (data_type, received_at DESC);
ALTER TABLE public.garmin_raw_samples ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.garmin_raw_samples FROM anon, authenticated;

-- ── 4. New defaults for athletes who connect from now on ────────────────────
ALTER TABLE public.garmin_connections ALTER COLUMN share SET DEFAULT
  '{"sleep":true,"stress":true,"body_battery":true,"vitals":true,"fitness":true,"womens_health":false}'::jsonb;
ALTER TABLE public.garmin_oauth_states ALTER COLUMN share SET DEFAULT
  '{"sleep":true,"stress":true,"body_battery":true,"vitals":true,"fitness":true,"womens_health":false}'::jsonb;

-- ── 5. Daily data as the viewer may see it (now with the new columns + switches) ─────────────────────
DROP FUNCTION IF EXISTS public.garmin_daily_for(text[], date, integer);
CREATE OR REPLACE FUNCTION public.garmin_daily_for(p_athlete_ids text[], p_since date DEFAULT NULL, p_limit integer DEFAULT 400)
RETURNS TABLE (athlete_id text, day date, steps integer, resting_hr integer, avg_stress integer,
               body_battery_high integer, body_battery_low integer, active_kcal integer,
               sleep_seconds integer, sleep_score integer, hrv_last_night integer, hrv_weekly_avg integer, hrv_status text,
               resp_avg numeric, spo2_avg integer, spo2_min integer, vo2_max numeric, fitness_age integer)
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
         CASE WHEN v.own OR COALESCE((c.share->>'fitness')::boolean, false)      THEN d.fitness_age END
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

-- ── 6. Health Snapshots as the viewer may see them ──────────────────────────
CREATE OR REPLACE FUNCTION public.garmin_snapshots_for(p_athlete_ids text[], p_limit integer DEFAULT 20)
RETURNS TABLE (athlete_id text, taken_at timestamptz, day date, duration_s integer, hr_avg integer,
               hrv_rmssd numeric, resp_avg numeric, spo2_avg integer, stress_avg integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT s.athlete_id, s.taken_at, s.day, s.duration_s, s.hr_avg, s.hrv_rmssd, s.resp_avg, s.spo2_avg, s.stress_avg
  FROM public.garmin_snapshots s
  LEFT JOIN public.garmin_connections c ON c.athlete_id = s.athlete_id
  WHERE s.athlete_id = ANY (p_athlete_ids)
    AND (s.athlete_id = public.my_athlete_id()
         OR (public.is_staff() AND COALESCE((c.share->>'vitals')::boolean, false)))
  ORDER BY s.taken_at DESC NULLS LAST
  LIMIT LEAST(GREATEST(p_limit, 1), 200);
$$;
REVOKE ALL ON FUNCTION public.garmin_snapshots_for(text[], integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.garmin_snapshots_for(text[], integer) TO authenticated;

-- ── 7. The athlete's switches — one JSON argument so adding a switch later needs no new function ─────
DROP FUNCTION IF EXISTS public.garmin_set_sharing(boolean, boolean, boolean, boolean);
DROP FUNCTION IF EXISTS public.garmin_set_sharing(jsonb);
CREATE OR REPLACE FUNCTION public.garmin_set_sharing(p_share jsonb)
RETURNS void
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  UPDATE public.garmin_connections
     SET share = jsonb_build_object(
           'sleep',         COALESCE((p_share->>'sleep')::boolean, true),
           'stress',        COALESCE((p_share->>'stress')::boolean, true),
           'body_battery',  COALESCE((p_share->>'body_battery')::boolean, true),
           'vitals',        COALESCE((p_share->>'vitals')::boolean, true),
           'fitness',       COALESCE((p_share->>'fitness')::boolean, true),
           'womens_health', COALESCE((p_share->>'womens_health')::boolean, false)),
         updated_at = now()
   WHERE athlete_id = public.my_athlete_id();
$$;
REVOKE ALL ON FUNCTION public.garmin_set_sharing(jsonb) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.garmin_set_sharing(jsonb) TO authenticated;
