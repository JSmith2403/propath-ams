-- ============================================================================
-- ProPath — Hooper-style label standardisation + library tidy
--
-- Six direction flips with anchor swap + response rescale (new = 8-old).
-- Wording-only updates for non-flipping items. One drop. Three new items.
--
-- Run in dev project mdqzxhihyglxhgezxeat. Idempotent on re-run.
-- ============================================================================

-- ── 0. Snapshot the question_ids we need to act on ─────────────────────────
-- (Use stable label matches because UUIDs differ per environment.)

-- ── 1. Direction flips (anchor swap + reset thresholds + rescale data) ─────
-- For each flipped question:
--   * direction → 'higher_better'
--   * leftAnchor / rightAnchor → from your standardised table
--   * rag_thresholds → {green_boundary: 6, amber_boundary: 3} (higher_better default)
--   * any existing wellness_responses values for that question_id → 8 - old

-- 1a. Sleep quality (#20)
update wellness_question_library
set direction = 'higher_better',
    config    = jsonb_set(jsonb_set(config, '{leftAnchor}',  '"Very, very poor"'::jsonb),
                          '{rightAnchor}', '"Very, very good"'::jsonb),
    rag_thresholds = jsonb_build_object('green_boundary', 6, 'amber_boundary', 3)
where label = 'How would you rate your sleep quality last night?';

-- 1b. Mood (#40)
update wellness_question_library
set direction = 'higher_better',
    config    = jsonb_set(jsonb_set(config, '{leftAnchor}',  '"Very, very low"'::jsonb),
                          '{rightAnchor}', '"Very, very high"'::jsonb),
    rag_thresholds = jsonb_build_object('green_boundary', 6, 'amber_boundary', 3)
where label = 'How would you rate your current mood?';

-- 1c. Motivation (#50)
update wellness_question_library
set direction = 'higher_better',
    config    = jsonb_set(jsonb_set(config, '{leftAnchor}',  '"Very, very low"'::jsonb),
                          '{rightAnchor}', '"Very, very high"'::jsonb),
    rag_thresholds = jsonb_build_object('green_boundary', 6, 'amber_boundary', 3)
where label = 'How would you rate your current motivation?';

-- 1d. Recovery (#100)
update wellness_question_library
set direction = 'higher_better',
    config    = jsonb_set(jsonb_set(config, '{leftAnchor}',  '"Very, very poor"'::jsonb),
                          '{rightAnchor}', '"Very, very good"'::jsonb),
    rag_thresholds = jsonb_build_object('green_boundary', 6, 'amber_boundary', 3),
    label = 'How recovered do you feel from your last session?'
where label = 'How recovered do you feel from your last session?';

-- 1e. Hydration (#180)
update wellness_question_library
set direction = 'higher_better',
    config    = jsonb_set(jsonb_set(config, '{leftAnchor}',  '"Very poorly hydrated"'::jsonb),
                          '{rightAnchor}', '"Very well hydrated"'::jsonb),
    rag_thresholds = jsonb_build_object('green_boundary', 6, 'amber_boundary', 3)
where label = 'How well hydrated do you feel today?';

-- 1f. Energy (#200) — also relabelled away from "in relation to nutrition"
update wellness_question_library
set direction = 'higher_better',
    label = 'How would you rate your current energy?',
    config = jsonb_set(jsonb_set(config, '{leftAnchor}',  '"Very, very low"'::jsonb),
                       '{rightAnchor}', '"Very, very high"'::jsonb),
    rag_thresholds = jsonb_build_object('green_boundary', 6, 'amber_boundary', 3)
where label = 'How would you rate your current energy levels in relation to nutrition?';

-- ── 1z. Rescale existing responses for the six flipped questions ───────────
-- For each response row, for each (key, value) pair, if the question_id
-- belongs to one of the flipped questions and the value is a number in
-- 1..7, replace it with 8 - value. Yes/no, numeric, and other-question
-- values are untouched.
with flipped as (
  select id::text as qid
  from wellness_question_library
  where label in (
    'How would you rate your sleep quality last night?',
    'How would you rate your current mood?',
    'How would you rate your current motivation?',
    'How recovered do you feel from your last session?',
    'How well hydrated do you feel today?',
    'How would you rate your current energy?'
  )
),
rescaled as (
  select wr.id,
    jsonb_object_agg(
      e.key,
      case
        when e.key in (select qid from flipped)
         and jsonb_typeof(e.value) = 'number'
         and (e.value::text)::numeric between 1 and 7
        then to_jsonb(8 - (e.value::text)::int)
        else e.value
      end
    ) as new_responses
  from wellness_responses wr
  cross join lateral jsonb_each(wr.responses) as e(key, value)
  group by wr.id
)
update wellness_responses wr
set responses = r.new_responses
from rescaled r
where wr.id = r.id;

-- ── 2. Wording-only updates (no direction change, no rescale) ──────────────

-- Stress (#30)
update wellness_question_library
set config = jsonb_set(jsonb_set(config, '{leftAnchor}',  '"Very relaxed"'::jsonb),
                       '{rightAnchor}', '"Very, very stressed"'::jsonb)
where label = 'How would you rate your current mental stress?';

-- Fatigue (#60 — was "physically fresh")
update wellness_question_library
set config = jsonb_set(jsonb_set(config, '{leftAnchor}',  '"Very fresh"'::jsonb),
                       '{rightAnchor}', '"Very, very tired"'::jsonb)
where label = 'How physically fresh do you feel today?';

-- Soreness (#70)
update wellness_question_library
set config = jsonb_set(jsonb_set(config, '{leftAnchor}',  '"Not sore"'::jsonb),
                       '{rightAnchor}', '"Very, very sore"'::jsonb)
where label = 'How sore do you feel today?';

-- Menstrual cycle (#160) — reframed to focus on training impact
update wellness_question_library
set label  = 'How significantly are menstrual or cycle-related symptoms affecting your training today?',
    config = jsonb_set(jsonb_set(config, '{leftAnchor}',  '"Not at all"'::jsonb),
                       '{rightAnchor}', '"Very, very significantly"'::jsonb)
where label = 'Any menstrual cycle related symptoms affecting you today? (if relevant)';

-- ── 3. Drop the duplicate fatigue item (#80) ───────────────────────────────
-- Also strip its key from any wellness_responses jsonb so we don't
-- carry orphaned answers around.
with dropped as (
  select id::text as qid
  from wellness_question_library
  where label = 'How fatigued do you feel today?'
)
update wellness_responses wr
set responses = wr.responses - (select qid from dropped)
where exists (select 1 from dropped);

delete from athlete_wellness_questions
where question_id in (
  select id from wellness_question_library
  where label = 'How fatigued do you feel today?'
);

delete from wellness_question_library
where label = 'How fatigued do you feel today?';

-- ── 4. New items: Confidence, Focus, Appetite ──────────────────────────────
insert into wellness_question_library
  (label, category, question_type, config, display_order, direction, rag_thresholds)
values
  ('How would you rate your current confidence?',
    'lifestyle', 'slider',
    jsonb_build_object('min', 1, 'max', 7, 'leftAnchor', 'Very, very low', 'rightAnchor', 'Very, very high'),
    52, 'higher_better',
    jsonb_build_object('green_boundary', 6, 'amber_boundary', 3)),

  ('How would you rate your current focus?',
    'lifestyle', 'slider',
    jsonb_build_object('min', 1, 'max', 7, 'leftAnchor', 'Very, very poor', 'rightAnchor', 'Very, very high'),
    54, 'higher_better',
    jsonb_build_object('green_boundary', 6, 'amber_boundary', 3)),

  ('How would you rate your current appetite?',
    'nutritional', 'slider',
    jsonb_build_object('min', 1, 'max', 7, 'leftAnchor', 'Very, very poor', 'rightAnchor', 'Very, very good'),
    195, 'higher_better',
    jsonb_build_object('green_boundary', 6, 'amber_boundary', 3));

-- ── 5. Reload PostgREST schema cache ───────────────────────────────────────
notify pgrst, 'reload schema';
