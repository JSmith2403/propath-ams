-- ============================================================================
-- Garmin Connect Developer Program (Starter) — per-athlete OAuth connection + pushed watch data.
-- Date: 2026-11-03.  Safe to re-run.  Replaces the unapplied sql/garmin_2026-10-27.sql (personal-key version).
--
-- How it works: the athlete taps "Connect Garmin" in their app, signs in on Garmin's own page and approves.
-- Garmin sends them back to /api/garmin/callback with a one-time code; the server swaps it for tokens and
-- stores them ENCRYPTED. From then on Garmin PUSHES their data to /api/garmin/webhook as their watch syncs
-- (Starter access is push-only, no history).
--
-- Access model (health information about young people, so scoped from day one):
--     athlete  → their own rows only   (my_athlete_id())
--     coaches  → all rows              (is_staff())
--     anyone else (anon, other athletes, providers) → nothing
-- Only the server (service-role key) writes rows or reads the tokens.
-- Requires the wave-2 helper functions my_athlete_id() and is_staff().
-- ============================================================================

-- ── 1. Connection (tokens live here — server only) ──────────────────────────
DROP TABLE IF EXISTS public.garmin_connections CASCADE;     -- nothing was ever stored in the old personal-key version
CREATE TABLE public.garmin_connections (
  athlete_id         text        PRIMARY KEY REFERENCES public.athletes(id) ON DELETE CASCADE,
  garmin_user_id     text        UNIQUE,                    -- Garmin's stable API user id; arrives on every push
  tokens_ciphertext  text,                                  -- AES-256-GCM JSON {access, refresh}; key = GARMIN_KEY_SECRET (server env)
  access_expires_at  timestamptz,
  refresh_expires_at timestamptz,
  permissions        text[]      NOT NULL DEFAULT '{}',     -- what the athlete agreed to share on GARMIN's consent screen, e.g. HEALTH_EXPORT
  share              jsonb       NOT NULL DEFAULT '{"sleep":true,"stress":true,"body_battery":true,"womens_health":false}'::jsonb,
                                                            -- what the athlete lets COACHES see (their own switches in ProPath)
  status             text        NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'needs_attention', 'disconnected')),
  connected_at       timestamptz NOT NULL DEFAULT now(),
  last_sync_at       timestamptz,                           -- when we last RECEIVED data from Garmin
  last_error         text,
  updated_at         timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.garmin_connections ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.garmin_connections FROM anon, authenticated;   -- no policies = server only

-- ── 2. Sign-in in progress (single-use, short-lived; server only) ────────────
CREATE TABLE IF NOT EXISTS public.garmin_oauth_states (
  state               text        PRIMARY KEY,
  athlete_id          text        NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  verifier_ciphertext text        NOT NULL,                 -- the PKCE code verifier, encrypted
  share               jsonb       NOT NULL DEFAULT '{"sleep":true,"stress":true,"body_battery":true,"womens_health":false}'::jsonb,  -- chosen before leaving for Garmin
  created_at          timestamptz NOT NULL DEFAULT now(),
  expires_at          timestamptz NOT NULL
);
ALTER TABLE public.garmin_oauth_states ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.garmin_oauth_states FROM anon, authenticated;

-- ── 3. Daily summary (one row per athlete per day) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.garmin_daily (
  athlete_id          text   NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  day                 date   NOT NULL,
  steps               integer,
  resting_hr          integer,
  avg_stress          integer,
  body_battery_high   integer,
  body_battery_low    integer,
  active_kcal         integer,
  sleep_seconds       integer,
  sleep_score         integer,
  hrv_last_night      integer,
  hrv_weekly_avg      integer,
  hrv_status          text,
  -- Garmin's original payloads, kept so the field mapping can be corrected later without asking Garmin again
  raw_daily           jsonb,
  raw_sleep           jsonb,
  raw_hrv             jsonb,
  updated_at          timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (athlete_id, day)
);
CREATE INDEX IF NOT EXISTS idx_garmin_daily_day ON public.garmin_daily (athlete_id, day DESC);

-- ── 4. Activities (one row per workout recorded on the watch) ───────────────
CREATE TABLE IF NOT EXISTS public.garmin_activities (
  athlete_id      text    NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  activity_id     bigint  NOT NULL,
  started_at      timestamptz,
  day             date,
  activity_type   text,
  name            text,
  duration_s      numeric,
  distance_m      numeric,
  avg_hr          integer,
  max_hr          integer,
  calories        integer,
  training_load   numeric,
  raw             jsonb   NOT NULL DEFAULT '{}'::jsonb,
  updated_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (athlete_id, activity_id)
);
CREATE INDEX IF NOT EXISTS idx_garmin_activities_day ON public.garmin_activities (athlete_id, started_at DESC);

-- ── 5. Row-level security ───────────────────────────────────────────────────
-- Athletes read their own rows. Coaches read activities directly, but daily data (sleep / stress / body battery)
-- ONLY through garmin_daily_for() below, so an athlete's "No" switches are enforced here, not just on screen.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['garmin_daily', 'garmin_activities'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('REVOKE INSERT, UPDATE, DELETE ON public.%I FROM authenticated', t);
    EXECUTE format('DROP POLICY IF EXISTS own_select ON public.%I', t);
    EXECUTE format('CREATE POLICY own_select ON public.%I FOR SELECT TO authenticated USING (athlete_id = public.my_athlete_id())', t);
    EXECUTE format('DROP POLICY IF EXISTS staff_select ON public.%I', t);
  END LOOP;
  CREATE POLICY staff_select ON public.garmin_activities FOR SELECT TO authenticated USING (public.is_staff());
END $$;

-- ── 6. Connection status for the screens (never returns tokens) ─────────────
-- No argument → the signed-in athlete's own status. With an athlete id → coaches only.
DROP FUNCTION IF EXISTS public.garmin_status(text);
CREATE OR REPLACE FUNCTION public.garmin_status(p_athlete_id text DEFAULT NULL)
RETURNS TABLE (connected boolean, status text, connected_at timestamptz, last_sync_at timestamptz, last_error text, permissions text[], share jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT (c.status <> 'disconnected'), c.status, c.connected_at, c.last_sync_at, c.last_error, c.permissions, c.share
  FROM public.garmin_connections c
  WHERE c.athlete_id = CASE
          WHEN p_athlete_id IS NULL THEN public.my_athlete_id()
          WHEN public.is_staff()    THEN p_athlete_id
          ELSE NULL
        END;
$$;
REVOKE ALL ON FUNCTION public.garmin_status(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.garmin_status(text) TO authenticated;

-- ── 7. Daily data as the viewer is allowed to see it ────────────────────────
-- The athlete sees all of their own columns. A coach sees a column only if the athlete's switch for it is on:
--   sleep → sleep_seconds, sleep_score, hrv_*      stress → avg_stress      body_battery → body_battery_*
-- Steps, resting heart rate and active calories come with connecting. Everyone else (anon, other athletes,
-- external providers) gets nothing.
DROP FUNCTION IF EXISTS public.garmin_daily_for(text[], date, integer);
CREATE OR REPLACE FUNCTION public.garmin_daily_for(p_athlete_ids text[], p_since date DEFAULT NULL, p_limit integer DEFAULT 400)
RETURNS TABLE (athlete_id text, day date, steps integer, resting_hr integer, avg_stress integer,
               body_battery_high integer, body_battery_low integer, active_kcal integer,
               sleep_seconds integer, sleep_score integer, hrv_last_night integer, hrv_weekly_avg integer, hrv_status text)
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
         CASE WHEN v.own OR COALESCE((c.share->>'sleep')::boolean, false)        THEN d.hrv_status END
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

-- ── 8. The athlete's own switches ───────────────────────────────────────────
DROP FUNCTION IF EXISTS public.garmin_set_sharing(boolean, boolean, boolean, boolean);
CREATE OR REPLACE FUNCTION public.garmin_set_sharing(p_sleep boolean, p_stress boolean, p_body_battery boolean, p_womens_health boolean)
RETURNS void
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  UPDATE public.garmin_connections
     SET share = jsonb_build_object(
           'sleep', COALESCE(p_sleep, true), 'stress', COALESCE(p_stress, true),
           'body_battery', COALESCE(p_body_battery, true), 'womens_health', COALESCE(p_womens_health, false)),
         updated_at = now()
   WHERE athlete_id = public.my_athlete_id();
$$;
REVOKE ALL ON FUNCTION public.garmin_set_sharing(boolean, boolean, boolean, boolean) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.garmin_set_sharing(boolean, boolean, boolean, boolean) TO authenticated;
