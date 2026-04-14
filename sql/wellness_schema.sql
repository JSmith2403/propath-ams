-- ============================================================================
-- ProPath Wellness Module — Schema
-- Run this manually in the Supabase SQL Editor (do NOT auto-migrate).
-- ============================================================================

-- 1. wellness_tokens — one row per athlete, links athlete to a shareable token
create table if not exists wellness_tokens (
  id          uuid        primary key default gen_random_uuid(),
  athlete_id  text        not null,
  token       text        unique not null,
  is_active   boolean     default false,
  created_at  timestamptz default now()
);

-- 2. wellness_submissions — one row per athlete per day
create table if not exists wellness_submissions (
  id              uuid        primary key default gen_random_uuid(),
  athlete_id      text        not null,
  token           text        not null,
  submission_date date        not null,
  sleep_duration  numeric     check (sleep_duration >= 0 and sleep_duration <= 12),
  sleep_quality   integer     check (sleep_quality >= 1 and sleep_quality <= 7),
  fatigue         integer     check (fatigue >= 1 and fatigue <= 7),
  muscle_soreness integer     check (muscle_soreness >= 1 and muscle_soreness <= 7),
  stress          integer     check (stress >= 1 and stress <= 7),
  created_at      timestamptz default now(),
  unique (athlete_id, submission_date)
);

-- Indexes for common queries
create index if not exists idx_wellness_tokens_athlete   on wellness_tokens (athlete_id);
create index if not exists idx_wellness_tokens_token     on wellness_tokens (token);
create index if not exists idx_wellness_subs_athlete     on wellness_submissions (athlete_id);
create index if not exists idx_wellness_subs_token       on wellness_submissions (token);
create index if not exists idx_wellness_subs_date        on wellness_submissions (athlete_id, submission_date);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table wellness_tokens enable row level security;
alter table wellness_submissions enable row level security;

-- wellness_tokens ----------------------------------------------------------

-- Anon users can look up a token (needed for the public form)
create policy "anon_select_tokens"
  on wellness_tokens for select
  to anon
  using (true);

-- Authenticated users have full access
create policy "auth_all_tokens"
  on wellness_tokens for all
  to authenticated
  using (true)
  with check (true);

-- wellness_submissions -----------------------------------------------------

-- Anon users can read submissions for a valid active token
create policy "anon_select_submissions"
  on wellness_submissions for select
  to anon
  using (
    token in (select token from wellness_tokens where is_active = true)
  );

-- Anon users can insert submissions for a valid active token
create policy "anon_insert_submissions"
  on wellness_submissions for insert
  to anon
  with check (
    token in (select token from wellness_tokens where is_active = true)
  );

-- Anon users can update their own submissions (edit existing entry)
create policy "anon_update_submissions"
  on wellness_submissions for update
  to anon
  using (
    token in (select token from wellness_tokens where is_active = true)
  )
  with check (
    token in (select token from wellness_tokens where is_active = true)
  );

-- Authenticated users have full access
create policy "auth_all_submissions"
  on wellness_submissions for all
  to authenticated
  using (true)
  with check (true);
