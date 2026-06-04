-- ============================================================================
-- Mental Game — Phase 1 schema migration
-- Date: 2026-06-01
-- Branch: feat/mental-game-phase-1
-- Idempotent: safe to re-run.
-- Additive only: creates new objects + populates Module 1 + removes the
-- Phase 0 smoke-test stub. Does NOT alter Phase 0 tables.
--
-- Per the diagnosis report (and your two decisions):
--
--   1. The Phase 1 brief's "new mf_assessment_responses" table already
--      exists from Phase 0 with a slightly different schema. Strict-
--      additive resolution: leave the Phase 0 table untouched, create
--      a new sibling table mf_assessment_item_responses that carries
--      the exact column shape the brief asks for. Future code targets
--      the new table.
--
--   2. The Phase 0 smoke-test seed (sample-smoke-test) is removed so it
--      doesn't collide with Module 1 at order_index 0 / domain 'intro'.
--      It served its purpose (proving the schema worked); real content
--      starts here.
--
-- Additions on top of the brief:
--
--   - mf_module_sessions table: tracks every athlete attempt at a
--     module — start / end / accumulated active seconds / how many
--     "are you still training?" prompts fired / whether the session
--     was killed by inactivity. Drives the time-spent column on the
--     coach Mental Skills view and the cumulative tally on the
--     athlete app.
-- ============================================================================

BEGIN;

-- ─── 1. mf_assessment_item_responses — Phase 1 brief shape ─────────────────
CREATE TABLE IF NOT EXISTS public.mf_assessment_item_responses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id    text NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  step_id       uuid NOT NULL REFERENCES public.mf_module_steps(id) ON DELETE CASCADE,
  instrument    text NOT NULL,                          -- e.g. 'acsi-28'
  item_id       text NOT NULL,                          -- e.g. 'q1'
  anchor_index  integer NOT NULL CHECK (anchor_index BETWEEN 0 AND 3),
  attempt_id    uuid NOT NULL,                          -- groups one sitting
  submitted_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mf_assessment_item_responses_athlete_instrument
  ON public.mf_assessment_item_responses (athlete_id, instrument);
CREATE INDEX IF NOT EXISTS idx_mf_assessment_item_responses_attempt
  ON public.mf_assessment_item_responses (attempt_id);

ALTER TABLE public.mf_assessment_item_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS anon_all_mf_assessment_item_responses ON public.mf_assessment_item_responses;
CREATE POLICY anon_all_mf_assessment_item_responses ON public.mf_assessment_item_responses
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS staff_all_mf_assessment_item_responses ON public.mf_assessment_item_responses;
CREATE POLICY staff_all_mf_assessment_item_responses ON public.mf_assessment_item_responses
  FOR ALL TO authenticated
  USING (public.mf_is_staff()) WITH CHECK (public.mf_is_staff());

-- ─── 2. mf_module_sessions — per-attempt timing + audit ────────────────────
-- One row per athlete attempt at a module. The renderer creates a row
-- when the athlete opens a module, stamps ended_at + total_seconds when
-- they finish, and bumps inactivity_count each time the
-- "are you still training?" prompt fires. killed_by_inactivity flips
-- true when the 3rd prompt expires unanswered.
--
-- Cumulative time per (athlete, module) is computed by SUM() in the
-- coach view; no need for a denormalised total column.
CREATE TABLE IF NOT EXISTS public.mf_module_sessions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id             text NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  module_id              uuid NOT NULL REFERENCES public.mf_modules(id) ON DELETE CASCADE,
  started_at             timestamptz NOT NULL DEFAULT now(),
  ended_at               timestamptz,
  total_seconds          integer NOT NULL DEFAULT 0 CHECK (total_seconds >= 0),
  inactivity_count       integer NOT NULL DEFAULT 0 CHECK (inactivity_count >= 0),
  killed_by_inactivity   boolean NOT NULL DEFAULT false,
  completed              boolean NOT NULL DEFAULT false,
  last_step_index        integer,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mf_module_sessions_athlete_time
  ON public.mf_module_sessions (athlete_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_mf_module_sessions_athlete_module
  ON public.mf_module_sessions (athlete_id, module_id);

ALTER TABLE public.mf_module_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS anon_all_mf_module_sessions ON public.mf_module_sessions;
CREATE POLICY anon_all_mf_module_sessions ON public.mf_module_sessions
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS staff_all_mf_module_sessions ON public.mf_module_sessions;
CREATE POLICY staff_all_mf_module_sessions ON public.mf_module_sessions
  FOR ALL TO authenticated
  USING (public.mf_is_staff()) WITH CHECK (public.mf_is_staff());

-- ─── 3. Remove Phase 0 smoke-test seed ─────────────────────────────────────
-- Steps cascade via FK ON DELETE CASCADE on mf_module_steps.module_id.
DELETE FROM public.mf_modules WHERE slug = 'sample-smoke-test';

-- ─── 4. Seed Module 1 — "What Are Mental Skills?" ──────────────────────────
INSERT INTO public.mf_modules (
  slug, title, description, domain, icon, order_index, xp_reward, status, version
)
VALUES (
  'what-are-mental-skills',
  'What Are Mental Skills?',
  'The mind trains like the body. Start here.',
  'intro',
  'brain',
  0, 200, 'draft', 1
)
ON CONFLICT (slug) DO NOTHING;

-- Steps. WHERE clause picks the module row that was just inserted (or
-- was already present from a prior re-run).
WITH m AS (
  SELECT id FROM public.mf_modules WHERE slug = 'what-are-mental-skills'
)
INSERT INTO public.mf_module_steps (module_id, order_index, step_type, content, config)
SELECT m.id, x.order_index, x.step_type, x.content::jsonb, '{}'::jsonb
FROM m,
(VALUES
  (0, 'learn', $$
    {
      "headline": "The difference is above the neck",
      "body": "Picture two athletes. Same age, same training, near-identical test scores. On the day it matters, one delivers and one falls short. The gap was not in their legs or their lungs, it was above the neck. How you focus, handle nerves, talk to yourself and recover after a mistake is what separates close performances. Every one of those is a skill, and skills can be trained."
    }
  $$),
  (1, 'learn', $$
    {
      "headline": "Your brain trains like your body",
      "body": "Repeat a movement and your body adapts until it gets easier. Your brain works the same way. Practise staying calm under pressure, or refocusing after an error, and the wiring strengthens until it becomes second nature. The best athletes do not just happen to have a strong mind, they train it on purpose, the same way they train speed or strength. Over the next modules you will build exactly that: focus, confidence, resilience, handling pressure, imagery, self-talk and routines. First, let's find your starting point."
    }
  $$),
  (2, 'assessment', $$
    {
      "instrument": "acsi-28",
      "intro": "Understanding your starting point. Rate how true each statement is for you right now. There are no right answers, and this is a snapshot you can change.",
      "scale": {
        "type": "likert",
        "anchors": ["Almost Never", "Sometimes", "Often", "Almost Always"],
        "values": [0, 1, 2, 3]
      },
      "subscales": [
        { "key": "cwa", "label": "Coping with Adversity" },
        { "key": "pup", "label": "Peaking Under Pressure" },
        { "key": "gsm", "label": "Goal Setting & Mental Preparation" },
        { "key": "con", "label": "Concentration" },
        { "key": "cam", "label": "Confidence & Achievement Motivation" },
        { "key": "coa", "label": "Coachability" },
        { "key": "ffw", "label": "Freedom from Worry" }
      ],
      "items": [
        { "id": "q1",  "subscale": "gsm", "reverse": false, "text": "On a daily or weekly basis, I set very specific goals for myself that guide what I do." },
        { "id": "q2",  "subscale": "cam", "reverse": false, "text": "I get the most out of my talent and skill." },
        { "id": "q3",  "subscale": "coa", "reverse": true,  "text": "When a coach or manager tells me how to correct a mistake I've made, I tend to take it personally and feel upset." },
        { "id": "q4",  "subscale": "con", "reverse": false, "text": "When I'm playing sports, I can focus my attention and block out distractions." },
        { "id": "q5",  "subscale": "cwa", "reverse": false, "text": "I remain positive and enthusiastic during competition, no matter how badly things are going." },
        { "id": "q6",  "subscale": "pup", "reverse": false, "text": "I tend to play better under pressure because I think more clearly." },
        { "id": "q7",  "subscale": "ffw", "reverse": true,  "text": "I worry quite a bit about what others think of my performance." },
        { "id": "q8",  "subscale": "gsm", "reverse": false, "text": "I tend to do lots of planning about how to reach my goals." },
        { "id": "q9",  "subscale": "cam", "reverse": false, "text": "I feel confident that I will play well." },
        { "id": "q10", "subscale": "coa", "reverse": true,  "text": "When a coach or manager criticizes me, I become upset rather than feel helped." },
        { "id": "q11", "subscale": "con", "reverse": false, "text": "It is easy for me to keep distracting thoughts from interfering with something I am watching or listening to." },
        { "id": "q12", "subscale": "ffw", "reverse": true,  "text": "I put a lot of pressure on myself by worrying about how I will perform." },
        { "id": "q13", "subscale": "gsm", "reverse": false, "text": "I set my own performance goals for each practice." },
        { "id": "q14", "subscale": "cam", "reverse": false, "text": "I don't have to be pushed to practice or play hard; I give 100%." },
        { "id": "q15", "subscale": "coa", "reverse": false, "text": "If a coach criticizes or yells at me, I correct the mistake without getting upset about it." },
        { "id": "q16", "subscale": "con", "reverse": false, "text": "I handle unexpected situations in my sport very well." },
        { "id": "q17", "subscale": "cwa", "reverse": false, "text": "When things are going badly, I tell myself to keep calm, and this works for me." },
        { "id": "q18", "subscale": "pup", "reverse": false, "text": "The more pressure there is during a game, the more I enjoy it." },
        { "id": "q19", "subscale": "ffw", "reverse": true,  "text": "While competing, I worry about making mistakes or failing to come through." },
        { "id": "q20", "subscale": "gsm", "reverse": false, "text": "I have my own game plan worked out in my head long before the game begins." },
        { "id": "q21", "subscale": "cwa", "reverse": false, "text": "When I feel myself getting too tense, I can quickly relax my body and calm myself." },
        { "id": "q22", "subscale": "pup", "reverse": false, "text": "To me, pressure situations are challenges that I welcome." },
        { "id": "q23", "subscale": "ffw", "reverse": true,  "text": "I think about and imagine what will happen if I fail or screw up." },
        { "id": "q24", "subscale": "cwa", "reverse": false, "text": "I maintain emotional control regardless of how things are going for me." },
        { "id": "q25", "subscale": "con", "reverse": false, "text": "It is easy for me to direct my attention and focus on a single object or person." },
        { "id": "q26", "subscale": "cam", "reverse": false, "text": "When I fail to reach my goals, it makes me try even harder." },
        { "id": "q27", "subscale": "coa", "reverse": false, "text": "I improve my skills by listening carefully to advice and instruction from coaches and managers." },
        { "id": "q28", "subscale": "pup", "reverse": false, "text": "I make fewer mistakes when the pressure is on because I concentrate better." }
      ]
    }
  $$),
  (3, 'interaction', $$
    {
      "interaction": "gap_fill",
      "sentence": "Mental skills are ___, not fixed.",
      "bank": ["trainable", "inherited", "luck"],
      "answer": "trainable"
    }
  $$),
  (4, 'interaction', $$
    {
      "interaction": "tap_select",
      "prompt": "Which of these is a mental skill you can train?",
      "options": ["Refocusing after a mistake", "Your height", "Your shoe size"],
      "answer": 0
    }
  $$),
  (5, 'interaction', $$
    {
      "interaction": "reorder",
      "prompt": "Put the stages of building any skill in order.",
      "items": ["It becomes automatic", "Learn it", "Use it under pressure", "Practise it"],
      "answer": ["Learn it", "Practise it", "Use it under pressure", "It becomes automatic"]
    }
  $$),
  (6, 'quiz', $$
    {
      "tier": "basic",
      "prompt": "Why do the best athletes train mental skills on purpose?",
      "options": ["Because the brain adapts to practice, just like the body", "Because they were born with a stronger mind", "Because nerves cannot be changed"],
      "answer": 0,
      "explain": "The brain adapts to repetition the same way muscles do. A strong mind is built through practice, not handed out at birth."
    }
  $$),
  (7, 'quiz', $$
    {
      "tier": "hard",
      "prompt": "Your snapshot shows your lowest area is Peaking Under Pressure. What does that most usefully tell you?",
      "options": ["It's a fixed weakness you'll have to work around", "It's a sensible first area to train, because it can change with practice", "It means you should avoid high-pressure events"],
      "answer": 1,
      "explain": "A low area is a starting point, not a verdict. It points to where deliberate practice gives you the biggest return."
    }
  $$),
  (8, 'builder', $$
    {
      "builder": "reflection",
      "prompt": "Think of a moment your head was fully in the right place during sport. What was different about how you were thinking?"
    }
  $$),
  (9, 'reflection', $$
    {
      "prompt": "Based on today, one mental skill you want to develop first?"
    }
  $$)
) AS x(order_index, step_type, content)
ON CONFLICT (module_id, order_index) DO NOTHING;

-- ─── 5. Reload PostgREST schema cache ──────────────────────────────────────
NOTIFY pgrst, 'reload schema';

COMMIT;
