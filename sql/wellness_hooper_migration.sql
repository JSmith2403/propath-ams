-- ============================================================================
-- ProPath — Hooper-style 1-7 scale + per-question RAG thresholds
--
-- 1. Adds `direction` and `rag_thresholds` columns to the question library
-- 2. Migrates 15 slider questions from 1-5 → 1-7 with default thresholds
-- 3. Adds direction to yes_no, hours_sleep and pain (0-10) numerics
-- 4. Rescales the existing wellness_responses row(s) — slider values only
--
-- Run in dev project mdqzxhihyglxhgezxeat. Idempotent.
-- ============================================================================

-- 1. ── Schema additions ────────────────────────────────────────────────────
alter table wellness_question_library
  add column if not exists direction text
    check (direction in ('higher_better','lower_better','no_better','yes_better','none'));

alter table wellness_question_library
  add column if not exists rag_thresholds jsonb default '{}'::jsonb;

-- 2. ── Migrate sliders 1-5 → 1-7, set defaults ────────────────────────────
-- All current sliders are authored as lower_better (1 = best, 5 = worst).
-- New default thresholds on 1-7 scale: green 1-2, amber 3-5, red 6-7.
update wellness_question_library
set
  config = jsonb_set(config, '{max}', to_jsonb(7), true),
  direction = 'lower_better',
  rag_thresholds = jsonb_build_object('green_boundary', 2, 'amber_boundary', 5)
where question_type = 'slider';

-- 3. ── yes_no → direction only, no thresholds ─────────────────────────────
-- All current yes_no questions are no_better (yes = bad).
update wellness_question_library
set
  direction = 'no_better',
  rag_thresholds = '{}'::jsonb
where question_type = 'yes_no';

-- 4. ── Sleep hours number — higher_better with sport-specific thresholds ──
update wellness_question_library
set
  direction = 'higher_better',
  rag_thresholds = jsonb_build_object('green_boundary', 7, 'amber_boundary', 6)
where question_type = 'number'
  and label = 'How many hours did you sleep last night?';

-- 5. ── Pain scale numerics (0-10) — direction set, thresholds empty ───────
-- Coach fills these in manually via the editor (per spec).
update wellness_question_library
set
  direction = 'lower_better',
  rag_thresholds = '{}'::jsonb
where question_type = 'number'
  and label like 'If yes%';

-- 6. ── Rescale existing responses (slider values 1-5 → 1-7) ───────────────
-- Linear: new = round((old - 1) * 6 / 4) + 1
--   1→1, 2→3, 3→4, 4→5, 5→7
-- Yes/no strings, hours numbers, and pain 0-10 numbers are left alone.
with rescaled as (
  select
    wr.id,
    jsonb_object_agg(
      e.key,
      case
        when q.question_type = 'slider'
         and jsonb_typeof(e.value) = 'number'
         and (e.value::text)::numeric between 1 and 5
        then to_jsonb(round((((e.value::text)::numeric - 1) * 6.0 / 4.0) + 1)::int)
        else e.value
      end
    ) as new_responses
  from wellness_responses wr
  cross join lateral jsonb_each(wr.responses) as e(key, value)
  left join wellness_question_library q on q.id::text = e.key
  group by wr.id
)
update wellness_responses wr
set responses = r.new_responses
from rescaled r
where r.id = wr.id;

-- 7. ── Reload PostgREST schema cache ──────────────────────────────────────
notify pgrst, 'reload schema';
