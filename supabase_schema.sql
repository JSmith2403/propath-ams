-- ProPath AMS — Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- 1. Athletes
create table if not exists public.athletes (
  id         text        primary key,
  data       jsonb       not null,
  updated_at timestamptz not null default now()
);

-- 2. Testing sessions
create table if not exists public.sessions (
  id         text        primary key,
  data       jsonb       not null,
  updated_at timestamptz not null default now()
);

-- 3. App-wide settings (custom_metrics + providers stored as keyed rows)
create table if not exists public.app_settings (
  key        text        primary key,
  value      jsonb       not null,
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security (keeps the tables accessible without auth)
alter table public.athletes    enable row level security;
alter table public.sessions    enable row level security;
alter table public.app_settings enable row level security;

-- Allow full public access (no auth required — internal tool)
create policy "allow_all" on public.athletes    for all using (true) with check (true);
create policy "allow_all" on public.sessions    for all using (true) with check (true);
create policy "allow_all" on public.app_settings for all using (true) with check (true);

-- Enable real-time replication
alter table public.athletes     replica identity full;
alter table public.sessions     replica identity full;
alter table public.app_settings replica identity full;
