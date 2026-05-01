-- ============================================================================
-- ProPath — Wellness library + per-athlete selections redesign
--
-- Replaces the per-athlete `wellness_questions` model with a global
-- library (`wellness_question_library`) and a per-athlete junction
-- (`athlete_wellness_questions`).
--
-- Run in the dev project's SQL editor (mdqzxhihyglxhgezxeat).
-- Idempotent — safe to re-run.
-- ============================================================================

-- ── Clean slate ─────────────────────────────────────────────────────────────
drop table if exists athlete_wellness_questions cascade;
drop table if exists wellness_question_library  cascade;
drop table if exists wellness_questions         cascade;
drop table if exists wellness_responses         cascade;

-- ── Library — global, 21 ProPath defaults ──────────────────────────────────
create table wellness_question_library (
  id            uuid primary key default gen_random_uuid(),
  label         text not null,
  category      text not null check (category in ('lifestyle','physical','medical','nutritional')),
  question_type text not null check (question_type in (
    'slider','slider_1_7','number','yes_no','multi_choice','text'
  )),
  config        jsonb not null default '{}'::jsonb,
  display_order int   not null,
  is_active     bool  default true,
  created_at    timestamptz default now()
);

create index idx_wellness_question_library_order on wellness_question_library (display_order);

-- ── Junction — per-athlete selections ──────────────────────────────────────
create table athlete_wellness_questions (
  athlete_id  text not null,
  question_id uuid not null references wellness_question_library(id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (athlete_id, question_id)
);

create index idx_athlete_wellness_questions_athlete on athlete_wellness_questions (athlete_id);

-- ── Responses (recreated — keys to library_question_id in jsonb) ───────────
create table wellness_responses (
  id              uuid primary key default gen_random_uuid(),
  athlete_id      text not null,
  token           text not null,
  submission_date date not null,
  responses       jsonb not null default '{}'::jsonb,
  created_at      timestamptz default now(),
  unique (athlete_id, submission_date)
);

create index idx_wellness_responses_athlete on wellness_responses (athlete_id);
create index idx_wellness_responses_date    on wellness_responses (athlete_id, submission_date);

-- ── Seed the 21 ProPath default questions ─────────────────────────────────
insert into wellness_question_library (label, category, question_type, config, display_order) values
-- Lifestyle (1-5)
('How many hours did you sleep last night?',
   'lifestyle', 'number',
   '{"min":0,"max":12,"step":0.5,"unit":"hrs"}'::jsonb, 10),
('How would you rate your sleep quality last night?',
   'lifestyle', 'slider',
   '{"min":1,"max":5,"leftAnchor":"Very good","rightAnchor":"Very poor"}'::jsonb, 20),
('How would you rate your current mental stress?',
   'lifestyle', 'slider',
   '{"min":1,"max":5,"leftAnchor":"Very low","rightAnchor":"Very high"}'::jsonb, 30),
('How would you rate your current mood?',
   'lifestyle', 'slider',
   '{"min":1,"max":5,"leftAnchor":"Very positive","rightAnchor":"Very low"}'::jsonb, 40),
('How would you rate your current motivation?',
   'lifestyle', 'slider',
   '{"min":1,"max":5,"leftAnchor":"Very high","rightAnchor":"Very low"}'::jsonb, 50),
-- Physical (6-10)
('How physically fresh do you feel today?',
   'physical', 'slider',
   '{"min":1,"max":5,"leftAnchor":"Very fresh","rightAnchor":"Very fatigued"}'::jsonb, 60),
('How sore do you feel today?',
   'physical', 'slider',
   '{"min":1,"max":5,"leftAnchor":"No soreness","rightAnchor":"Very sore"}'::jsonb, 70),
('How fatigued do you feel today?',
   'physical', 'slider',
   '{"min":1,"max":5,"leftAnchor":"No fatigue","rightAnchor":"Very fatigued"}'::jsonb, 80),
('How ready do you feel to train today?',
   'physical', 'slider',
   '{"min":1,"max":5,"leftAnchor":"Fully ready","rightAnchor":"Not ready at all"}'::jsonb, 90),
('How recovered do you feel from your last session?',
   'physical', 'slider',
   '{"min":1,"max":5,"leftAnchor":"Fully recovered","rightAnchor":"Not recovered at all"}'::jsonb, 100),
-- Medical (11-16)
('Do you have any pain or symptoms today?',
   'medical', 'yes_no', '{}'::jsonb, 110),
('If yes, pain scale today',
   'medical', 'number',
   '{"min":0,"max":10,"step":1,"unit":"/10"}'::jsonb, 120),
('Are you experiencing any swelling, stiffness or restriction today?',
   'medical', 'slider',
   '{"min":1,"max":5,"leftAnchor":"None","rightAnchor":"Severe"}'::jsonb, 130),
('Did you experience any pain during or after your last session?',
   'medical', 'yes_no', '{}'::jsonb, 140),
('If yes, pain scale during or after last session',
   'medical', 'number',
   '{"min":0,"max":10,"step":1,"unit":"/10"}'::jsonb, 150),
('Any menstrual cycle related symptoms affecting you today? (if relevant)',
   'medical', 'slider',
   '{"min":1,"max":5,"leftAnchor":"No impact","rightAnchor":"Major impact"}'::jsonb, 160),
-- Nutritional (17-21)
('How well fuelled do you feel today?',
   'nutritional', 'slider',
   '{"min":1,"max":5,"leftAnchor":"Very well fuelled","rightAnchor":"Very under-fuelled"}'::jsonb, 170),
('How well hydrated do you feel today?',
   'nutritional', 'slider',
   '{"min":1,"max":5,"leftAnchor":"Very well hydrated","rightAnchor":"Very dehydrated"}'::jsonb, 180),
('Have you skipped any meals in the last 24 hours?',
   'nutritional', 'yes_no', '{}'::jsonb, 190),
('How would you rate your current energy levels in relation to nutrition?',
   'nutritional', 'slider',
   '{"min":1,"max":5,"leftAnchor":"No issue","rightAnchor":"Severe issue"}'::jsonb, 200),
('Are you experiencing any digestive issues or stomach discomfort today?',
   'nutritional', 'slider',
   '{"min":1,"max":5,"leftAnchor":"None","rightAnchor":"Severe"}'::jsonb, 210);

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table wellness_question_library  enable row level security;
alter table athlete_wellness_questions enable row level security;
alter table wellness_responses         enable row level security;

create policy "anon_select_library"     on wellness_question_library
  for select to anon using (true);
create policy "auth_all_library"        on wellness_question_library
  for all to authenticated using (true) with check (true);

create policy "anon_select_selections"  on athlete_wellness_questions
  for select to anon using (true);
create policy "anon_modify_selections"  on athlete_wellness_questions
  for all to anon using (true) with check (true);
create policy "auth_all_selections"     on athlete_wellness_questions
  for all to authenticated using (true) with check (true);

create policy "anon_select_responses"   on wellness_responses
  for select to anon
  using (token in (select token from wellness_tokens where is_active = true));
create policy "anon_insert_responses"   on wellness_responses
  for insert to anon
  with check (token in (select token from wellness_tokens where is_active = true));
create policy "anon_update_responses"   on wellness_responses
  for update to anon
  using (token in (select token from wellness_tokens where is_active = true))
  with check (token in (select token from wellness_tokens where is_active = true));
create policy "auth_all_responses"      on wellness_responses
  for all to authenticated using (true) with check (true);

-- ── Reload PostgREST schema cache ──────────────────────────────────────────
notify pgrst, 'reload schema';
