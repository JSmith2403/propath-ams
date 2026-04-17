-- ============================================================================
-- ProPath Wellness Survey Builder — Flexible Schema
-- Run this manually in the DEV Supabase SQL Editor only.
-- Do NOT run against production yet.
-- ============================================================================

-- ── 1. Question bank ─────────────────────────────────────────────────────────
create table if not exists public.wellness_questions (
  id                uuid          primary key default gen_random_uuid(),
  question_text     text          not null,
  question_type     text          not null check (question_type in ('scale', 'numerical', 'text', 'yes_no')),
  scale_min         integer,
  scale_max         integer,
  scale_min_label   text,
  scale_max_label   text,
  numerical_min     numeric,
  numerical_max     numeric,
  numerical_step    numeric,
  numerical_unit    text,
  higher_is_worse   boolean       default true,
  green_threshold   numeric,
  amber_threshold   numeric,
  display_order     integer       default 0,
  is_active         boolean       default true,
  created_at        timestamptz   default now()
);

-- ── 2. Per-athlete question assignment ───────────────────────────────────────
create table if not exists public.wellness_athlete_questions (
  id               uuid          primary key default gen_random_uuid(),
  athlete_id       text          not null,
  question_id      uuid          not null references public.wellness_questions(id) on delete cascade,
  show_on_roster   boolean       default false,
  display_order    integer       default 0,
  created_at       timestamptz   default now(),
  unique (athlete_id, question_id)
);

-- ── 3. Rebuild wellness_submissions with flexible responses ──────────────────
-- Archive existing data (if any) to a backup table first, then rebuild.
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'wellness_submissions') then
    -- Preserve old data as a backup
    execute 'create table if not exists public.wellness_submissions_legacy as select * from public.wellness_submissions';
    drop table public.wellness_submissions cascade;
  end if;
end $$;

create table public.wellness_submissions (
  id               uuid          primary key default gen_random_uuid(),
  athlete_id       text          not null,
  token            text          not null,
  submission_date  date          not null,
  responses        jsonb         not null default '{}'::jsonb,
  created_at       timestamptz   default now(),
  unique (athlete_id, submission_date)
);

-- Indexes
create index if not exists idx_wellness_questions_active   on public.wellness_questions (is_active);
create index if not exists idx_wellness_questions_order    on public.wellness_questions (display_order);
create index if not exists idx_wellness_aq_athlete         on public.wellness_athlete_questions (athlete_id);
create index if not exists idx_wellness_aq_question        on public.wellness_athlete_questions (question_id);
create index if not exists idx_wellness_subs_athlete_date  on public.wellness_submissions (athlete_id, submission_date);
create index if not exists idx_wellness_subs_token         on public.wellness_submissions (token);

-- ── 4. Row Level Security ────────────────────────────────────────────────────
alter table public.wellness_questions         enable row level security;
alter table public.wellness_athlete_questions enable row level security;
alter table public.wellness_submissions       enable row level security;

-- Anon can READ active questions (needed for rendering the public form)
do $$ begin
  create policy "anon_select_questions"
    on public.wellness_questions for select to anon
    using (is_active = true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "auth_all_questions"
    on public.wellness_questions for all to authenticated
    using (true) with check (true);
exception when duplicate_object then null;
end $$;

-- Anon can READ athlete question assignments for a valid active token
do $$ begin
  create policy "anon_select_athlete_questions"
    on public.wellness_athlete_questions for select to anon
    using (
      athlete_id in (
        select athlete_id from public.wellness_tokens where is_active = true
      )
    );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "auth_all_athlete_questions"
    on public.wellness_athlete_questions for all to authenticated
    using (true) with check (true);
exception when duplicate_object then null;
end $$;

-- Submissions — anon can select/insert/update via valid active tokens
do $$ begin
  create policy "anon_select_submissions"
    on public.wellness_submissions for select to anon
    using (token in (select token from public.wellness_tokens where is_active = true));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "anon_insert_submissions"
    on public.wellness_submissions for insert to anon
    with check (token in (select token from public.wellness_tokens where is_active = true));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "anon_update_submissions"
    on public.wellness_submissions for update to anon
    using (token in (select token from public.wellness_tokens where is_active = true))
    with check (token in (select token from public.wellness_tokens where is_active = true));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "auth_all_submissions"
    on public.wellness_submissions for all to authenticated
    using (true) with check (true);
exception when duplicate_object then null;
end $$;

-- ── 5. Seed the existing 5 Hooper questions ──────────────────────────────────
-- Only seed if the table is empty
insert into public.wellness_questions
  (question_text, question_type, numerical_min, numerical_max, numerical_step, numerical_unit, higher_is_worse, green_threshold, amber_threshold, display_order)
select
  'How many hours did you sleep last night?', 'numerical', 0, 12, 0.5, 'hours', false, 7, 5, 1
where not exists (select 1 from public.wellness_questions);

insert into public.wellness_questions
  (question_text, question_type, scale_min, scale_max, scale_min_label, scale_max_label, higher_is_worse, green_threshold, amber_threshold, display_order)
select
  'How would you rate your sleep quality?', 'scale', 1, 7, 'Very, very good', 'Very, very poor', true, 3, 5, 2
where (select count(*) from public.wellness_questions) = 1;

insert into public.wellness_questions
  (question_text, question_type, scale_min, scale_max, scale_min_label, scale_max_label, higher_is_worse, green_threshold, amber_threshold, display_order)
select
  'How fatigued do you feel today?', 'scale', 1, 7, 'Very, very low', 'Very, very high', true, 3, 5, 3
where (select count(*) from public.wellness_questions) = 2;

insert into public.wellness_questions
  (question_text, question_type, scale_min, scale_max, scale_min_label, scale_max_label, higher_is_worse, green_threshold, amber_threshold, display_order)
select
  'How would you rate your muscle soreness?', 'scale', 1, 7, 'Very, very low', 'Very, very high', true, 3, 5, 4
where (select count(*) from public.wellness_questions) = 3;

insert into public.wellness_questions
  (question_text, question_type, scale_min, scale_max, scale_min_label, scale_max_label, higher_is_worse, green_threshold, amber_threshold, display_order)
select
  'How stressed do you feel?', 'scale', 1, 7, 'Very, very low', 'Very, very high', true, 3, 5, 5
where (select count(*) from public.wellness_questions) = 4;
