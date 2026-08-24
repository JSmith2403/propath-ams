-- Fix standalone_sessions RLS — bring it in line with security-lockdown-2026-07-06.sql
-- Date: 2026-08-24
-- Idempotent: safe to re-run.
--
-- The original standalone-sessions-2026-08-23.sql migration gave this
-- table an `allow_all TO public` policy, copied from the OLDER
-- programming-foundation convention — but that convention was replaced
-- by security-lockdown-2026-07-06.sql, which locked its sibling tables
-- (block_sessions, planned_sessions, exercise_library, ...) down to
-- "anon read-only, staff write". Caught in browser verification before
-- shipping: standalone_sessions was left world-writable by anon, and
-- the app's real INSERT (staff, via the coach UI) went through
-- planned_sessions correctly rejecting anon — but standalone_sessions
-- itself was a live gap. This closes it to match its peers exactly.

DROP POLICY IF EXISTS allow_all ON standalone_sessions;

ALTER TABLE standalone_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY anon_select ON standalone_sessions
  FOR SELECT TO anon USING (true);
CREATE POLICY auth_select ON standalone_sessions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY staff_insert ON standalone_sessions
  FOR INSERT TO authenticated WITH CHECK (public.is_staff());
CREATE POLICY staff_update ON standalone_sessions
  FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY staff_delete ON standalone_sessions
  FOR DELETE TO authenticated USING (public.is_staff());

-- End of migration.
