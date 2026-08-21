-- development_plans_2026-08-21.sql
-- ----------------------------------------------------------------------
-- Replaces the athlete.data.quarterlyReviews JSONB blob (see
-- src/components/QuarterlyReviews.jsx, now retired) with normalized
-- tables so the quarterly goal-setting cycle can be read from both the
-- coach app and the athlete app, and so goals can cascade
-- Long -> Medium -> Short -> Process instead of being a flat list.
--
-- development_plans = one row per athlete per quarter (the review).
-- goals              = one row per goal, self-referencing parent_goal_id
--                       so a Process goal chains up through Short ->
--                       Medium -> Long. owner distinguishes a coach-set
--                       goal from one the athlete entered themselves;
--                       linked_goal_id pairs an adopted athlete goal
--                       with the coach-owned mirror created for it.
-- ----------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.development_plans (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id    text NOT NULL
                REFERENCES public.athletes(id) ON DELETE CASCADE,
  year          int NOT NULL,
  quarter       smallint NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  period_label  text NOT NULL,               -- e.g. 'Q3 2026'
  period_start  date NOT NULL,
  period_end    date NOT NULL,
  status        text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','closed')),
  conducted_by  text NOT NULL DEFAULT '',
  narrative     text NOT NULL DEFAULT '',
  rag_summary   jsonb NOT NULL DEFAULT '{}', -- { physical:'green', nutrition:'amber', ... } snapshot at close
  -- Set once a nudge has actually been sent so the cron doesn't re-fire
  -- for the same plan. No coach-side equivalent — the coach dashboard
  -- computes its own due-soon banner live from period_end instead.
  athlete_reminder_sent_at timestamptz,
  closed_at     timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (athlete_id, year, quarter)
);

CREATE TABLE IF NOT EXISTS public.goals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id         uuid NOT NULL
                  REFERENCES public.development_plans(id) ON DELETE CASCADE,
  athlete_id      text NOT NULL
                  REFERENCES public.athletes(id) ON DELETE CASCADE,
  parent_goal_id  uuid REFERENCES public.goals(id) ON DELETE CASCADE,
  tier            text NOT NULL CHECK (tier IN ('long','medium','short','process')),
  domain          text NOT NULL CHECK (domain IN ('physical','nutrition','psych','lifestyle')),
  owner           text NOT NULL DEFAULT 'coach' CHECK (owner IN ('coach','athlete')),
  linked_goal_id  uuid REFERENCES public.goals(id) ON DELETE SET NULL,
  description     text NOT NULL DEFAULT '',
  target_date     date,
  status          text NOT NULL DEFAULT 'not_started'
                  CHECK (status IN ('not_started','on_track','at_risk','achieved','missed')),
  position        int NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_development_plans_athlete ON public.development_plans (athlete_id);
CREATE INDEX IF NOT EXISTS idx_goals_plan   ON public.goals (plan_id);
CREATE INDEX IF NOT EXISTS idx_goals_athlete ON public.goals (athlete_id);
CREATE INDEX IF NOT EXISTS idx_goals_parent  ON public.goals (parent_goal_id);

ALTER TABLE public.development_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS development_plans_authed_all ON public.development_plans;
CREATE POLICY development_plans_authed_all ON public.development_plans
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Athlete app reads the plan (period, narrative, RAG snapshot) for its
-- own athlete_id — same trust model as every other athlete-facing
-- table (private token URL, app-layer scoped, not DB-level tenancy).
DROP POLICY IF EXISTS development_plans_anon_select ON public.development_plans;
CREATE POLICY development_plans_anon_select ON public.development_plans
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS goals_authed_all ON public.goals;
CREATE POLICY goals_authed_all ON public.goals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS goals_anon_select ON public.goals;
CREATE POLICY goals_anon_select ON public.goals
  FOR SELECT TO anon USING (true);

-- Athletes can only write goals they own themselves — coach-owned rows
-- stay read-only from the athlete app.
DROP POLICY IF EXISTS goals_anon_insert_own ON public.goals;
CREATE POLICY goals_anon_insert_own ON public.goals
  FOR INSERT TO anon WITH CHECK (owner = 'athlete');

DROP POLICY IF EXISTS goals_anon_update_own ON public.goals;
CREATE POLICY goals_anon_update_own ON public.goals
  FOR UPDATE TO anon USING (owner = 'athlete') WITH CHECK (owner = 'athlete');

NOTIFY pgrst, 'reload schema';
