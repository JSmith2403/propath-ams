-- ============================================================================
-- ProPath — Session flow polish: move-audit + new RPE/duration/reflection
--
-- 1. session_logs:
--    a. RPE constraint widened to 0-10 (was 1-10) — Rest counts as 0.
--    b. duration_minutes int — athlete's confirmed duration (override of
--       the timer's duration_seconds). Reads fall back to seconds/60.
--    c. athlete_reflection text — free-form note shared with the coach.
--
-- 2. planned_sessions:
--    a. original_date date — preserved when an athlete moves a session.
--    b. moved_at timestamptz — when the move happened.
--
-- Run in dev project mdqzxhihyglxhgezxeat. Idempotent.
-- ============================================================================

-- ── session_logs additions ────────────────────────────────────────────────
alter table session_logs
  add column if not exists duration_minutes  int,
  add column if not exists athlete_reflection text;

-- Widen RPE check to allow 0 (Rest)
alter table session_logs drop constraint if exists session_logs_session_rpe_check;
alter table session_logs add constraint session_logs_session_rpe_check
  check (session_rpe is null or (session_rpe between 0 and 10));

-- ── planned_sessions move audit ───────────────────────────────────────────
alter table planned_sessions
  add column if not exists original_date date,
  add column if not exists moved_at      timestamptz;

create index if not exists idx_planned_sessions_moved
  on planned_sessions (athlete_id, moved_at)
  where moved_at is not null;

-- ── Reload PostgREST schema cache ─────────────────────────────────────────
notify pgrst, 'reload schema';
