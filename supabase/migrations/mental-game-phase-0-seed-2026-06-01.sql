-- ============================================================================
-- Mental Game — Phase 0 sample seed
-- Date: 2026-06-01
-- Branch: feat/mental-game-phase-0
--
-- One smoke-test module + the seven steps from the brief, hitting
-- every step_type and three interaction shapes so the renderer can be
-- validated against real data once Phase 1 lands.
--
-- Idempotent:
--   - mf_modules.slug is UNIQUE → ON CONFLICT (slug) DO NOTHING
--   - mf_module_steps(module_id, order_index) is UNIQUE → same
-- Safe to re-run; running against a populated database will simply
-- skip the inserts.
-- ============================================================================

BEGIN;

-- 1. Module
INSERT INTO public.mf_modules (slug, title, description, domain, order_index, xp_reward, status, version)
VALUES (
  'sample-smoke-test', 'Sample', NULL, 'intro', 0, 100, 'draft', 1
)
ON CONFLICT (slug) DO NOTHING;

-- 2. Steps — keyed off the module slug so this works whether the row
--    above was just inserted OR was already present from a prior run.
WITH m AS (
  SELECT id FROM public.mf_modules WHERE slug = 'sample-smoke-test'
)
INSERT INTO public.mf_module_steps (module_id, order_index, step_type, content, config)
SELECT m.id, x.order_index, x.step_type, x.content::jsonb, '{}'::jsonb
FROM m,
(VALUES
  (0, 'learn',
    '{
      "headline": "Mental skills are trainable",
      "body": "...",
      "sport_token": true
    }'),
  (1, 'interaction',
    '{
      "interaction": "gap_fill",
      "sentence": "Mental skills are ___, not fixed.",
      "bank": ["trainable","genetic","luck"],
      "answer": "trainable"
    }'),
  (2, 'interaction',
    '{
      "interaction": "tap_select",
      "prompt": "Which is a mental skill?",
      "options": ["Focus","Height","Shoe size"],
      "answer": 0
    }'),
  (3, 'interaction',
    '{
      "interaction": "reorder",
      "prompt": "Order the steps",
      "items": ["Plan","Wish","Outcome","Obstacle"],
      "answer": ["Wish","Outcome","Obstacle","Plan"]
    }'),
  (4, 'quiz',
    '{
      "tier": "basic",
      "prompt": "A Blueprint is...",
      "options": ["A starting snapshot you can change","A permanent rating"],
      "answer": 0,
      "explain": "..."
    }'),
  (5, 'builder',
    '{
      "builder": "reflection",
      "prompt": "What surprised you?"
    }'),
  (6, 'reflection',
    '{
      "prompt": "One thing you want to develop?"
    }')
) AS x(order_index, step_type, content)
ON CONFLICT (module_id, order_index) DO NOTHING;

COMMIT;
