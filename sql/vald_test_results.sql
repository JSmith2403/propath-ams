-- ─────────────────────────────────────────────────────────────────────────────
-- VALD ForceDecks integration — store one row per imported jump (trial).
--
-- Each ForceDecks "test" (CMJ session) typically has multiple "trials"
-- (individual jumps). Per coach decision: every trial is its own row so
-- coaches can drill into individual jumps; presentation can summarise
-- (best/avg) on top of this.
--
-- The vald_trial_id is unique-per-tenant so it doubles as our idempotency
-- key — running Sync twice never duplicates. raw_metrics JSONB stores the
-- full VALD payload so future metrics we want to surface don't need a
-- backfill — we just read more keys from the JSON.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.vald_test_results (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id         text        NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,

  -- VALD identifiers (per-tenant unique).
  vald_test_id       text        NOT NULL,
  vald_trial_id      text        NOT NULL UNIQUE,
  vald_profile_id    text        NOT NULL,

  test_type          text,                 -- 'CMJ' | 'SJ' | 'IMTP' | 'DJ' | …
  recorded_at        timestamptz NOT NULL,

  -- Surfaced metrics (the 6 the coach asked for, plus room to grow).
  jump_height_cm        numeric,
  cmj_depth_cm          numeric,
  peak_force_n          numeric,
  peak_impulse_ns       numeric,
  rsi_modified          numeric,
  lr_asymmetry_pct      numeric,

  -- Full VALD trial payload — keeps every metric in case we want to
  -- surface something extra later without re-pulling.
  raw_metrics        jsonb,

  imported_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vald_results_athlete_recorded
  ON public.vald_test_results (athlete_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_vald_results_test
  ON public.vald_test_results (vald_test_id);

-- ─── Row-level security ─────────────────────────────────────────────────
-- Same posture as the rest of the app: anon / public never reaches this
-- table; authenticated users (coaches, co-admins) have full access.
ALTER TABLE public.vald_test_results ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'vald_test_results'
      AND policyname = 'vald_test_results_authed_all'
  ) THEN
    CREATE POLICY vald_test_results_authed_all
      ON public.vald_test_results
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
