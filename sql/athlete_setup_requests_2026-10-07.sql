-- ============================================================================
-- Athlete account setup / forgotten-password requests.
-- Date: 2026-10-07.  Safe to re-run.
--
-- Coaches never see or choose an athlete's password. Flow:
--   1. Athlete enters their username on /athlete ("First time or forgot your
--      password?") → a row is created here with a 6-digit CODE shown on their
--      screen and a secret (claim) that only their browser holds.
--   2. They send the code to a coach on another platform. The coach checks it
--      and clicks Approve in User Management → Athlete logins.
--   3. The athlete's browser (holding the claim secret) can then set a new
--      password. The request is single-use and short-lived.
--
-- Only the server (service role) reads or writes this table: RLS is on with
-- NO policies and every client privilege is revoked.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.athlete_setup_requests (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id    text        NOT NULL,
  user_id       uuid        NOT NULL,
  username      text        NOT NULL,
  code          text        NOT NULL,                       -- 6 digits, read out to the coach
  claim_hash    text        NOT NULL,                       -- sha256 of the browser-held secret
  status        text        NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'used', 'expired', 'denied', 'cancelled')),
  attempts      int         NOT NULL DEFAULT 0,             -- wrong codes typed by a coach
  created_at    timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL,
  approved_by   uuid,
  approved_name text,
  approved_at   timestamptz,
  used_at       timestamptz
);

CREATE INDEX IF NOT EXISTS idx_setup_requests_athlete ON public.athlete_setup_requests (athlete_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_setup_requests_status  ON public.athlete_setup_requests (status, expires_at);

ALTER TABLE public.athlete_setup_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.athlete_setup_requests FROM anon, authenticated;
