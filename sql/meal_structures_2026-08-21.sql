-- meal_structures_2026-08-21.sql
-- ----------------------------------------------------------------------
-- Replaces the single meal_structure_guidance row-per-athlete with
-- multiple named, day-scoped structures — a coach can define a
-- "Training Day Structure" (Mon/Wed) and a separate "Rest Day
-- Structure" (all other days), each with its own chronological block
-- sequence. When more than one structure could apply to the same day,
-- `priority` breaks the tie (higher wins).
--
-- meal_structure_guidance is left in place, untouched, as a historical
-- record — nothing reads from it after this migration's backfill runs.
-- ----------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.meal_structures (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id  text NOT NULL
              REFERENCES public.athletes(id) ON DELETE CASCADE,
  name        text NOT NULL DEFAULT '',
  all_days    boolean NOT NULL DEFAULT true,
  -- lowercase day keys, e.g. {monday,wednesday} — ignored when all_days is true
  days        text[] NOT NULL DEFAULT '{}',
  -- 1=Low, 2=Medium, 3=High — highest wins when multiple structures match a day
  priority    smallint NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  blocks      jsonb NOT NULL DEFAULT '[]',   -- [{ id, type, text }]
  general     text NOT NULL DEFAULT '',
  hydration   text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meal_structures_athlete
  ON public.meal_structures (athlete_id);

ALTER TABLE public.meal_structures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS meal_structures_authed_all ON public.meal_structures;
CREATE POLICY meal_structures_authed_all ON public.meal_structures
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Athlete app needs to read every structure for its own athlete_id so it
-- can work out which one applies today — same trust model as the rest
-- of the athlete-facing tables (private token URL, app-layer scoped).
DROP POLICY IF EXISTS meal_structures_anon_select ON public.meal_structures;
CREATE POLICY meal_structures_anon_select ON public.meal_structures
  FOR SELECT TO anon USING (true);

NOTIFY pgrst, 'reload schema';
