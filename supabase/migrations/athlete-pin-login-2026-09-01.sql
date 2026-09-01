-- Athlete PIN login — Phase 1
-- Date: 2026-09-01
-- Idempotent: safe to re-run.
--
-- Feature-flagged per athlete via athlete_app_tokens.pin_login_enabled
-- (default false) so this can be tested on a single athlete (Pro
-- Pathius) without touching anyone else's existing token-only flow.
--
-- All access to the two new tables goes through server-side API
-- routes using the Supabase service-role key (see api/athlete-auth/),
-- never directly from the browser — so RLS is enabled with NO
-- policies at all: anon and authenticated get zero access by default,
-- matching a deny-by-default posture for credential data.

ALTER TABLE athlete_app_tokens
  ADD COLUMN IF NOT EXISTS pin_login_enabled boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS athlete_credentials (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id  text        NOT NULL UNIQUE REFERENCES athletes(id) ON DELETE CASCADE,
  login_code  text        NOT NULL UNIQUE,
  pin_hash    text        NOT NULL,
  pin_salt    text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_touch_updated_at ON athlete_credentials;
CREATE TRIGGER trg_touch_updated_at
  BEFORE UPDATE ON athlete_credentials
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

ALTER TABLE athlete_credentials ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS athlete_sessions (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id    text        NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  session_token text        NOT NULL UNIQUE,
  user_agent    text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  revoked_at    timestamptz
);
CREATE INDEX IF NOT EXISTS idx_athlete_sessions_athlete ON athlete_sessions(athlete_id);

ALTER TABLE athlete_sessions ENABLE ROW LEVEL SECURITY;

-- End of migration.
