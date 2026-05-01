-- ============================================================================
-- ProPath — Custom Wellness Questions
-- Adds per-athlete authoring of wellness questionnaires.
-- Old wellness_submissions table is left in place for backwards compat.
-- Run manually in the Supabase SQL Editor.
-- ============================================================================

-- 1. The questionnaire definition — one row per question per athlete.
create table if not exists wellness_questions (
  id            uuid        primary key default gen_random_uuid(),
  athlete_id    text        not null,
  label         text        not null,
  question_type text        not null
    check (question_type in ('slider_1_7','number','yes_no','multi_choice','text')),
  config        jsonb       not null default '{}'::jsonb,
  display_order int         not null default 0,
  is_active     bool        default true,
  created_at    timestamptz default now()
);

create index if not exists idx_wellness_questions_athlete
  on wellness_questions (athlete_id, display_order);

-- 2. Athlete responses to custom questions — one row per athlete per day,
--    `responses` is { [question_id]: value }.
create table if not exists wellness_responses (
  id              uuid        primary key default gen_random_uuid(),
  athlete_id      text        not null,
  token           text        not null,
  submission_date date        not null,
  responses       jsonb       not null default '{}'::jsonb,
  created_at      timestamptz default now(),
  unique (athlete_id, submission_date)
);

create index if not exists idx_wellness_responses_athlete on wellness_responses (athlete_id);
create index if not exists idx_wellness_responses_date    on wellness_responses (athlete_id, submission_date);

-- 3. Per-athlete toggle for which form variant the app shows.
alter table athlete_app_tokens
  add column if not exists use_custom_wellness bool default false;

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table wellness_questions enable row level security;
alter table wellness_responses enable row level security;

-- wellness_questions: anon select (athlete app needs to read its own
-- questionnaire), anon insert/update/delete for the coach UI which
-- runs against the anon key. Authenticated users get full access.
drop policy if exists "anon_select_wellness_questions" on wellness_questions;
create policy "anon_select_wellness_questions"
  on wellness_questions for select to anon using (true);

drop policy if exists "anon_modify_wellness_questions" on wellness_questions;
create policy "anon_modify_wellness_questions"
  on wellness_questions for all to anon using (true) with check (true);

drop policy if exists "auth_all_wellness_questions" on wellness_questions;
create policy "auth_all_wellness_questions"
  on wellness_questions for all to authenticated using (true) with check (true);

-- wellness_responses: anon insert/update for athletes submitting via
-- the public app token, and anon select so the coach UI (anon-keyed)
-- can read history. Mirrors the wellness_submissions policies.
drop policy if exists "anon_select_wellness_responses" on wellness_responses;
create policy "anon_select_wellness_responses"
  on wellness_responses for select to anon
  using (token in (select token from wellness_tokens where is_active = true));

drop policy if exists "anon_insert_wellness_responses" on wellness_responses;
create policy "anon_insert_wellness_responses"
  on wellness_responses for insert to anon
  with check (token in (select token from wellness_tokens where is_active = true));

drop policy if exists "anon_update_wellness_responses" on wellness_responses;
create policy "anon_update_wellness_responses"
  on wellness_responses for update to anon
  using (token in (select token from wellness_tokens where is_active = true))
  with check (token in (select token from wellness_tokens where is_active = true));

drop policy if exists "auth_all_wellness_responses" on wellness_responses;
create policy "auth_all_wellness_responses"
  on wellness_responses for all to authenticated using (true) with check (true);
