-- Athlete login, take 2 — real Supabase Auth instead of a custom
-- session/PIN system.
-- Date: 2026-09-01
-- Idempotent: safe to re-run.
--
-- The custom athlete_credentials/athlete_sessions approach (previous
-- migration, athlete-pin-login-2026-09-01.sql) failed real-device
-- testing repeatedly in ways that couldn't be pinned down remotely.
-- This replaces it with the coach login's own proven mechanism:
-- Supabase Auth, with a synthetic email (never actually emailed
-- anywhere) as the required identifier and the athlete's chosen PIN
-- as a real Auth password. Same athlete_app_tokens.pin_login_enabled
-- flag still gates this per-athlete, so it stays Pro Pathius-only
-- until proven out.

DROP TABLE IF EXISTS athlete_credentials;
DROP TABLE IF EXISTS athlete_sessions;

ALTER TABLE user_roles
  ADD COLUMN IF NOT EXISTS athlete_id text REFERENCES athletes(id) ON DELETE CASCADE;

ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles
  ADD CONSTRAINT user_roles_role_check
  CHECK (role = ANY (ARRAY['admin'::text, 'co_admin'::text, 'external'::text, 'athlete'::text]));

-- End of migration.
