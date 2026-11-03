-- ============================================================================
-- Garmin push log — one row per message Garmin sends to /api/garmin/webhook.   2026-11-03.  Safe to re-run.
-- Holds NO health data: only when it arrived, which data types, how many records, how many matched an
-- athlete, and the reply we gave. It exists so "has Garmin sent anything?" can be answered from the database
-- (Vercel only keeps an hour of logs on the free plan). Server only; rows older than 30 days are pruned.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.garmin_push_log (
  id          bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  received_at timestamptz NOT NULL DEFAULT now(),
  data_types  text[]      NOT NULL DEFAULT '{}',   -- e.g. {dailies,sleeps}
  records     integer     NOT NULL DEFAULT 0,      -- records in the message
  matched     integer     NOT NULL DEFAULT 0,      -- how many belonged to a connected athlete
  status      integer     NOT NULL,                -- HTTP status we replied with
  note        text
);
CREATE INDEX IF NOT EXISTS idx_garmin_push_log_time ON public.garmin_push_log (received_at DESC);
ALTER TABLE public.garmin_push_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.garmin_push_log FROM anon, authenticated;   -- no policies = server only
