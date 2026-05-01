-- ============================================================================
-- ProPath Athlete App — Schema
-- One permanent token per athlete, used by /athlete/:token public page.
-- Run manually in the Supabase SQL Editor.
-- ============================================================================

create table if not exists athlete_app_tokens (
  id          uuid        primary key default gen_random_uuid(),
  athlete_id  text        not null unique,
  token       text        unique not null,
  is_active   boolean     default true,
  created_at  timestamptz default now()
);

create index if not exists idx_athlete_app_tokens_token   on athlete_app_tokens (token);
create index if not exists idx_athlete_app_tokens_athlete on athlete_app_tokens (athlete_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table athlete_app_tokens enable row level security;

-- Anon can look up a token (needed to validate /athlete/:token at page load)
drop policy if exists "anon_select_athlete_app_tokens" on athlete_app_tokens;
create policy "anon_select_athlete_app_tokens"
  on athlete_app_tokens for select
  to anon
  using (true);

-- Anon insert/update — the coach UI uses the anon-keyed Supabase client
-- to create + toggle tokens. Token values are unguessable UUIDs.
drop policy if exists "anon_insert_athlete_app_tokens" on athlete_app_tokens;
create policy "anon_insert_athlete_app_tokens"
  on athlete_app_tokens for insert
  to anon
  with check (true);

drop policy if exists "anon_update_athlete_app_tokens" on athlete_app_tokens;
create policy "anon_update_athlete_app_tokens"
  on athlete_app_tokens for update
  to anon
  using (true)
  with check (true);

-- Authenticated users have full access
drop policy if exists "auth_all_athlete_app_tokens" on athlete_app_tokens;
create policy "auth_all_athlete_app_tokens"
  on athlete_app_tokens for all
  to authenticated
  using (true)
  with check (true);
