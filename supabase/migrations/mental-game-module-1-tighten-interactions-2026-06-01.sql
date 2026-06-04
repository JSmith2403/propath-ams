-- ============================================================================
-- Mental Game — Module 1 interaction content polish
-- Date: 2026-06-01
-- Branch: feat/mental-game-phase-1
--
-- Tightens the three interaction steps on "What Are Mental Skills?"
-- so the distractors actually distract. The seed content from the
-- original Phase 0 / Phase 1 briefs used quick smoke-test wording
-- ("Your height", "Your shoe size", etc.) — fine for proving the
-- renderer works, weak as athlete-facing content.
--
-- All writes are UPDATE-by-(slug, order_index), so this is safe to
-- re-run and won't touch anything other than the targeted three rows.
-- ============================================================================

BEGIN;

-- Step 3 — gap_fill
UPDATE public.mf_module_steps
SET    content = '{
         "interaction": "gap_fill",
         "sentence":    "Mental skills are ___, not personality.",
         "bank":        ["trainable", "innate", "permanent"],
         "answer":      "trainable"
       }'::jsonb,
       updated_at = now()
WHERE  module_id = (SELECT id FROM public.mf_modules WHERE slug = 'what-are-mental-skills')
  AND  order_index = 3;

-- Step 4 — tap_select
UPDATE public.mf_module_steps
SET    content = '{
         "interaction": "tap_select",
         "prompt":      "Which of these is a mental skill you can train?",
         "options":     ["Holding focus when fatigued", "Your top sprint speed", "Your VO2 max"],
         "answer":      0
       }'::jsonb,
       updated_at = now()
WHERE  module_id = (SELECT id FROM public.mf_modules WHERE slug = 'what-are-mental-skills')
  AND  order_index = 4;

-- Step 5 — reorder
UPDATE public.mf_module_steps
SET    content = '{
         "interaction": "reorder",
         "prompt":      "Put the stages of training a mental skill in order.",
         "items":       ["Pressure-test it", "Notice when it shows up", "Drill it in calm conditions", "Use it on autopilot"],
         "answer":      ["Notice when it shows up", "Drill it in calm conditions", "Pressure-test it", "Use it on autopilot"]
       }'::jsonb,
       updated_at = now()
WHERE  module_id = (SELECT id FROM public.mf_modules WHERE slug = 'what-are-mental-skills')
  AND  order_index = 5;

NOTIFY pgrst, 'reload schema';

COMMIT;
