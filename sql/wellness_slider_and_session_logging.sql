-- ============================================================================
-- ProPath — Wellness slider generalisation + Session Logging
--
-- Two changes in one file:
--   1. Allow a generic 'slider' question_type so coaches can author 1-N
--      scales (currently fixed to 1-7). Old slider_1_7 rows still valid.
--   2. New session_logs + set_logs tables for the athlete-app session
--      logger (timer, weight x reps, end-of-session RPE).
--
-- Run manually in the Supabase SQL Editor. Idempotent.
-- ============================================================================

-- ── 1. Extend wellness_questions.question_type ─────────────────────────────
alter table wellness_questions drop constraint if exists wellness_questions_question_type_check;
alter table wellness_questions add constraint wellness_questions_question_type_check
  check (question_type in (
    'slider', 'slider_1_7', 'number', 'yes_no', 'multi_choice', 'text'
  ));

-- ── 2. Session logging ─────────────────────────────────────────────────────
create table if not exists session_logs (
  id                  uuid        primary key default gen_random_uuid(),
  athlete_id          text        not null,
  planned_session_id  uuid        references planned_sessions(id) on delete set null,
  block_session_id    uuid,
  started_at          timestamptz not null default now(),
  completed_at        timestamptz,
  duration_seconds    int,
  session_rpe         int         check (session_rpe between 1 and 10),
  notes               text,
  created_at          timestamptz default now()
);

create index if not exists idx_session_logs_athlete   on session_logs (athlete_id, started_at desc);
create index if not exists idx_session_logs_planned   on session_logs (planned_session_id);

create table if not exists set_logs (
  id                  uuid        primary key default gen_random_uuid(),
  session_log_id      uuid        not null references session_logs(id) on delete cascade,
  session_exercise_id uuid        references session_exercises(id) on delete set null,
  exercise_id         uuid,
  set_number          int         not null,
  weight_kg           numeric,
  reps                int,
  rpe                 int         check (rpe between 1 and 10),
  notes               text,
  created_at          timestamptz default now()
);

create index if not exists idx_set_logs_session  on set_logs (session_log_id);
create index if not exists idx_set_logs_exercise on set_logs (session_exercise_id);

-- ── 3. RLS — anon read/write for the athlete app ───────────────────────────
alter table session_logs enable row level security;
alter table set_logs     enable row level security;

drop policy if exists "anon_all_session_logs" on session_logs;
create policy "anon_all_session_logs"
  on session_logs for all to anon using (true) with check (true);

drop policy if exists "auth_all_session_logs" on session_logs;
create policy "auth_all_session_logs"
  on session_logs for all to authenticated using (true) with check (true);

drop policy if exists "anon_all_set_logs" on set_logs;
create policy "anon_all_set_logs"
  on set_logs for all to anon using (true) with check (true);

drop policy if exists "auth_all_set_logs" on set_logs;
create policy "auth_all_set_logs"
  on set_logs for all to authenticated using (true) with check (true);

-- ── 4. Reload PostgREST schema cache ───────────────────────────────────────
notify pgrst, 'reload schema';
