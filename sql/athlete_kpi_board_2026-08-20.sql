-- ─────────────────────────────────────────────────────────────────────────────
-- Per-athlete KPI board layout — replaces the old fixed-10-slot,
-- localStorage-only tile config (propath_perf_ui) with a server-synced
-- board so coaches on different devices see the same pinned metrics.
--
-- One row per pinned tile. metric_key uses the same key scheme the app
-- already resolves metrics by (sessionMetrics.js key, 'vald:<TEST>:<name>',
-- or a custom-metric key) — this table only owns layout, not metric
-- definitions or values.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.athlete_kpi_board (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id   text        NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,

  metric_key   text        NOT NULL,
  span         smallint    NOT NULL DEFAULT 1 CHECK (span BETWEEN 1 AND 4),
  position     smallint    NOT NULL,

  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  UNIQUE (athlete_id, metric_key)
);

CREATE INDEX IF NOT EXISTS idx_athlete_kpi_board_athlete_position
  ON public.athlete_kpi_board (athlete_id, position);

-- ─── Row-level security ─────────────────────────────────────────────────
-- Same posture as the rest of the app: anon / public never reaches this
-- table; authenticated users (coaches, co-admins) have full access.
ALTER TABLE public.athlete_kpi_board ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'athlete_kpi_board'
      AND policyname = 'athlete_kpi_board_authed_all'
  ) THEN
    CREATE POLICY athlete_kpi_board_authed_all
      ON public.athlete_kpi_board
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
