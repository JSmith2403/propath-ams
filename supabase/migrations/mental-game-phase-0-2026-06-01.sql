-- ============================================================================
-- Mental Game (working name) — Phase 0 schema migration
-- Date: 2026-06-01
-- Branch: feat/mental-game-phase-0
-- Idempotent: safe to re-run.
-- Additive only: creates new objects, does NOT alter or drop any
-- existing table. Every new object is prefixed `mf_` so the down
-- script can revert with a single namespaced DROP.
--
-- RLS design (deliberate, not just copied from existing tables):
--
--   Athletes auth via the public /athlete/:token route using the anon
--   Supabase key — there is no auth.uid() for an athlete. The athlete
--   app gates per-athlete access by passing the right athlete_id on
--   every read/write, exactly as it already does for session_logs,
--   meal_entries etc. We honour the brief's "external role: no access"
--   by gating authenticated access on a new mf_is_staff() helper that
--   checks user_roles.role IN ('admin','co_admin') — externals get
--   nothing on the Mental Game tables.
--
--   Catalogue tables (mf_modules, mf_module_steps): readable by
--   athletes (anon) and staff (authenticated SELECT). Writeable only
--   when mf_is_staff() returns true.
--
--   Athlete-scoped tables (progress, xp, persona, blueprint,
--   assessment_responses, reflections): anon ALL (app-layer gated)
--   + authenticated ALL gated by mf_is_staff() so externals are
--   blocked.
-- ============================================================================

BEGIN;

-- ─── 0. Staff helper ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.mf_is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin','co_admin')
  );
$$;

REVOKE ALL ON FUNCTION public.mf_is_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mf_is_staff() TO anon, authenticated;

-- ─── 1. mf_modules — course catalogue ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mf_modules (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL UNIQUE,
  title         text NOT NULL,
  description   text,
  domain        text NOT NULL,
  order_index   integer NOT NULL DEFAULT 0,
  icon          text,
  xp_reward     integer NOT NULL DEFAULT 0 CHECK (xp_reward >= 0),
  status        text NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft','published')),
  version       integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mf_modules_domain_order
  ON public.mf_modules (domain, order_index);
CREATE INDEX IF NOT EXISTS idx_mf_modules_status
  ON public.mf_modules (status) WHERE status = 'published';

-- ─── 2. mf_module_steps — steps within a module ────────────────────────────
CREATE TABLE IF NOT EXISTS public.mf_module_steps (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id     uuid NOT NULL REFERENCES public.mf_modules(id) ON DELETE CASCADE,
  order_index   integer NOT NULL,
  step_type     text NOT NULL
                CHECK (step_type IN ('learn','interaction','quiz','builder','reflection','assessment')),
  content       jsonb NOT NULL DEFAULT '{}'::jsonb,
  config        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_mf_module_steps_module
  ON public.mf_module_steps (module_id, order_index);

-- ─── 3. mf_athlete_progress — per-athlete per-module status ────────────────
CREATE TABLE IF NOT EXISTS public.mf_athlete_progress (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id    text NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  module_id     uuid NOT NULL REFERENCES public.mf_modules(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'not_started'
                CHECK (status IN ('not_started','in_progress','completed')),
  stars         integer NOT NULL DEFAULT 0 CHECK (stars BETWEEN 0 AND 3),
  best_score    numeric,
  last_step     integer,
  completed_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (athlete_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_mf_progress_athlete
  ON public.mf_athlete_progress (athlete_id);

-- ─── 4. mf_xp_ledger — append-only XP events ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mf_xp_ledger (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id  text NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  source      text NOT NULL,         -- 'module_completion', 'quiz_perfect', etc.
  amount      integer NOT NULL,
  ref_id      text,                  -- module/step/run id as plain string
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mf_xp_ledger_athlete_time
  ON public.mf_xp_ledger (athlete_id, created_at DESC);

-- ─── 5. mf_persona — one row per athlete ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mf_persona (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id      text NOT NULL UNIQUE
                  REFERENCES public.athletes(id) ON DELETE CASCADE,
  name            text,
  avatar_config   jsonb NOT NULL DEFAULT '{}'::jsonb,
  care_traits     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── 6. mf_blueprint — history per athlete (no unique constraint) ──────────
CREATE TABLE IF NOT EXISTS public.mf_blueprint (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id              text NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  version                 integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  generated_at            timestamptz NOT NULL DEFAULT now(),
  acsi_scores             jsonb NOT NULL DEFAULT '{}'::jsonb,
  supplementary_scores    jsonb NOT NULL DEFAULT '{}'::jsonb,
  narrative_responses     jsonb NOT NULL DEFAULT '{}'::jsonb,
  synthesis               jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommended_path        jsonb NOT NULL DEFAULT '{}'::jsonb,
  mdt_flags               jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mf_blueprint_athlete_time
  ON public.mf_blueprint (athlete_id, generated_at DESC);

-- ─── 7. mf_assessment_responses — item-level responses ─────────────────────
CREATE TABLE IF NOT EXISTS public.mf_assessment_responses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id  text NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  run_id      uuid NOT NULL,         -- groups responses from one run
  instrument  text NOT NULL,         -- e.g. 'acsi28', 'tops'
  item_id     text NOT NULL,
  response    jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mf_assessment_responses_athlete_run
  ON public.mf_assessment_responses (athlete_id, run_id);
CREATE INDEX IF NOT EXISTS idx_mf_assessment_responses_run
  ON public.mf_assessment_responses (run_id);

-- ─── 8. mf_reflections — free-text reflections (no existing store to reuse)
CREATE TABLE IF NOT EXISTS public.mf_reflections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id  text NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  module_id   uuid REFERENCES public.mf_modules(id) ON DELETE SET NULL,
  step_id     uuid REFERENCES public.mf_module_steps(id) ON DELETE SET NULL,
  content     text NOT NULL,
  flagged     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mf_reflections_athlete_time
  ON public.mf_reflections (athlete_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mf_reflections_module
  ON public.mf_reflections (module_id) WHERE module_id IS NOT NULL;

-- ============================================================================
-- RLS — enable + policies
-- ============================================================================

ALTER TABLE public.mf_modules               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mf_module_steps          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mf_athlete_progress      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mf_xp_ledger             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mf_persona               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mf_blueprint             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mf_assessment_responses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mf_reflections           ENABLE ROW LEVEL SECURITY;

-- ─── Catalogue tables: SELECT open to all, writes staff-only ───────────────
-- mf_modules
DROP POLICY IF EXISTS anon_select_mf_modules    ON public.mf_modules;
CREATE POLICY anon_select_mf_modules    ON public.mf_modules
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS auth_select_mf_modules    ON public.mf_modules;
CREATE POLICY auth_select_mf_modules    ON public.mf_modules
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS staff_insert_mf_modules   ON public.mf_modules;
CREATE POLICY staff_insert_mf_modules   ON public.mf_modules
  FOR INSERT TO authenticated WITH CHECK (public.mf_is_staff());

DROP POLICY IF EXISTS staff_update_mf_modules   ON public.mf_modules;
CREATE POLICY staff_update_mf_modules   ON public.mf_modules
  FOR UPDATE TO authenticated
  USING (public.mf_is_staff()) WITH CHECK (public.mf_is_staff());

DROP POLICY IF EXISTS staff_delete_mf_modules   ON public.mf_modules;
CREATE POLICY staff_delete_mf_modules   ON public.mf_modules
  FOR DELETE TO authenticated USING (public.mf_is_staff());

-- mf_module_steps (same policy shape)
DROP POLICY IF EXISTS anon_select_mf_module_steps    ON public.mf_module_steps;
CREATE POLICY anon_select_mf_module_steps    ON public.mf_module_steps
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS auth_select_mf_module_steps    ON public.mf_module_steps;
CREATE POLICY auth_select_mf_module_steps    ON public.mf_module_steps
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS staff_insert_mf_module_steps   ON public.mf_module_steps;
CREATE POLICY staff_insert_mf_module_steps   ON public.mf_module_steps
  FOR INSERT TO authenticated WITH CHECK (public.mf_is_staff());

DROP POLICY IF EXISTS staff_update_mf_module_steps   ON public.mf_module_steps;
CREATE POLICY staff_update_mf_module_steps   ON public.mf_module_steps
  FOR UPDATE TO authenticated
  USING (public.mf_is_staff()) WITH CHECK (public.mf_is_staff());

DROP POLICY IF EXISTS staff_delete_mf_module_steps   ON public.mf_module_steps;
CREATE POLICY staff_delete_mf_module_steps   ON public.mf_module_steps
  FOR DELETE TO authenticated USING (public.mf_is_staff());

-- ─── Athlete-scoped tables: anon ALL (app-layer gated); staff ALL ─────────
-- Athletes auth via token → anon role → app passes the right athlete_id.
-- Staff use authenticated role; externals (no user_roles row) get nothing
-- because mf_is_staff() returns false for them.
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'mf_athlete_progress','mf_xp_ledger','mf_persona',
    'mf_blueprint','mf_assessment_responses','mf_reflections'
  ])
  LOOP
    EXECUTE format($f$
      DROP POLICY IF EXISTS anon_all_%1$s ON public.%1$I;
      CREATE POLICY anon_all_%1$s ON public.%1$I
        FOR ALL TO anon USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS staff_all_%1$s ON public.%1$I;
      CREATE POLICY staff_all_%1$s ON public.%1$I
        FOR ALL TO authenticated
        USING (public.mf_is_staff()) WITH CHECK (public.mf_is_staff());
    $f$, t);
  END LOOP;
END $$;

-- ─── Reload PostgREST schema cache so the new tables are visible ───────────
NOTIFY pgrst, 'reload schema';

COMMIT;
