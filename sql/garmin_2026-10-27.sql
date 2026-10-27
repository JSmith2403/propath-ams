-- ============================================================================
-- Garmin connection (per athlete) + daily watch data + activities.
-- Date: 2026-10-27.  Safe to re-run.
--
-- Each athlete connects their OWN Garmin account from their own login (they paste
-- a Garmin "personal API key" — see api/_lib/garmin). The key is encrypted by the
-- server before it is stored and is NEVER readable from a browser: the
-- garmin_connections table has row-level security on and no policies at all, so only
-- the server (service-role key) can touch it. Browsers only ever see the status
-- below via the two functions.
--
-- Watch data (sleep, HRV, resting HR, steps, activities) is health information about
-- young people, so — unlike older tables in this project — it is scoped properly
-- from day one:
--     athlete  → their own rows only   (my_athlete_id())
--     coaches  → all rows              (is_staff())
--     anyone else (anon, other athletes) → nothing
-- Only the server writes rows.
-- ============================================================================

-- Resolves the signed-in athlete's id (also created by the messaging / timetable SQL).
CREATE OR REPLACE FUNCTION public.my_athlete_id()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT athlete_id FROM public.user_roles
  WHERE user_id = auth.uid() AND role = 'athlete'
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.my_athlete_id() TO authenticated;


-- ── 1. Connection (secret lives here — server only) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.garmin_connections (
  athlete_id      text        PRIMARY KEY REFERENCES public.athletes(id) ON DELETE CASCADE,
  auth_type       text        NOT NULL DEFAULT 'personal_key' CHECK (auth_type IN ('personal_key', 'oauth')),
  key_ciphertext  text,                       -- AES-256-GCM, encrypted with a server-only secret
  key_expires_on  date,                       -- when the athlete's Garmin key lapses (they told us)
  status          text        NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'needs_attention', 'disconnected')),
  connected_at    timestamptz NOT NULL DEFAULT now(),
  last_sync_at    timestamptz,
  last_error      text,
  updated_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.garmin_connections ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.garmin_connections FROM anon, authenticated;   -- no policies = server only


-- ── 2. Daily summary (one row per athlete per day) ──────────────────────────
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
  -- Garmin's original payloads per source, kept so the field mapping can be corrected later without re-fetching
  raw_daily           jsonb,
  raw_sleep           jsonb,
  raw_hrv             jsonb,
  updated_at          timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (athlete_id, day)
);
CREATE INDEX IF NOT EXISTS idx_garmin_daily_day ON public.garmin_daily (athlete_id, day DESC);


-- ── 3. Activities (one row per workout recorded on the watch) ───────────────
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


-- ── 4. Row-level security: own rows for athletes, everything for coaches ────
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
    EXECUTE format('CREATE POLICY staff_select ON public.%I FOR SELECT TO authenticated USING (public.is_staff())', t);
  END LOOP;
END $$;


-- ── 5. Connection status for the screens (never returns the key) ────────────
-- No argument → the signed-in athlete's own status. With an athlete id → coaches only.
CREATE OR REPLACE FUNCTION public.garmin_status(p_athlete_id text DEFAULT NULL)
RETURNS TABLE (connected boolean, status text, connected_at timestamptz, last_sync_at timestamptz, last_error text, key_expires_on date)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (c.status <> 'disconnected'), c.status, c.connected_at, c.last_sync_at, c.last_error, c.key_expires_on
  FROM public.garmin_connections c
  WHERE c.athlete_id = CASE
          WHEN p_athlete_id IS NULL THEN public.my_athlete_id()
          WHEN public.is_staff()    THEN p_athlete_id
          ELSE NULL
        END;
$$;
REVOKE ALL ON FUNCTION public.garmin_status(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.garmin_status(text) TO authenticated;
