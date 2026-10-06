-- ============================================================================
-- Weekly academy timetable + athlete attendance.
-- Date: 2026-10-08.  Safe to re-run.
--
-- Coaches build next week's timetable (e.g. "Tue 4-5pm", "Tue 5-6pm", "1:1"),
-- publish it (usually Fridays), and each athlete says Attending / Can't make
-- it for every slot that applies to them. This is separate from the sessions
-- planned in an athlete's programme.
--
--   timetable_slots      one row per slot. cohorts = {} means everyone; otherwise
--                        only athletes in those cohorts (Elite / Gold / Mini).
--                        Athletes only see slots once published_at is set.
--   timetable_responses  one row per (slot, athlete).
--
-- Athletes never touch these tables directly. They go through two SECURITY
-- DEFINER functions that work out WHO they are from their login (my_athlete_id),
-- so an athlete can only read their own timetable and answer for themselves.
-- ============================================================================

-- Resolves the signed-in athlete's id (also created by the messaging SQL).
CREATE OR REPLACE FUNCTION public.my_athlete_id()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT athlete_id FROM public.user_roles
  WHERE user_id = auth.uid() AND role = 'athlete'
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.my_athlete_id() TO authenticated;


-- ── 1. Tables ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.timetable_slots (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date     date        NOT NULL,
  start_time    time        NOT NULL,
  end_time      time        NOT NULL,
  title         text        NOT NULL DEFAULT 'Group session',
  kind          text        NOT NULL DEFAULT 'session' CHECK (kind IN ('session', 'one_to_one')),
  cohorts       text[]      NOT NULL DEFAULT '{}',
  location      text,
  notes         text,
  published_at  timestamptz,
  created_by    uuid        DEFAULT auth.uid(),
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_date ON public.timetable_slots (slot_date, start_time);

CREATE TABLE IF NOT EXISTS public.timetable_responses (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id       uuid        NOT NULL REFERENCES public.timetable_slots(id) ON DELETE CASCADE,
  athlete_id    text        NOT NULL,
  status        text        NOT NULL CHECK (status IN ('attending', 'not_attending')),
  note          text,
  responded_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slot_id, athlete_id)
);
CREATE INDEX IF NOT EXISTS idx_timetable_responses_athlete ON public.timetable_responses (athlete_id);


-- ── 2. Row-level security ───────────────────────────────────────────────────
-- Coaches (admin / co_admin): full control of slots, read-only on responses.
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS staff_all ON public.timetable_slots;
CREATE POLICY staff_all ON public.timetable_slots
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

ALTER TABLE public.timetable_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS staff_select ON public.timetable_responses;
CREATE POLICY staff_select ON public.timetable_responses
  FOR SELECT TO authenticated USING (public.is_staff());

-- Athletes get no direct table access at all.
REVOKE ALL ON public.timetable_slots, public.timetable_responses FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.timetable_responses FROM authenticated;


-- ── 3. What an athlete can see: published slots for their cohort ────────────
CREATE OR REPLACE FUNCTION public.my_timetable(p_from date, p_to date)
RETURNS TABLE (
  id uuid, slot_date date, start_time time, end_time time,
  title text, kind text, location text, notes text,
  status text, note text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.id, s.slot_date, s.start_time, s.end_time,
         s.title, s.kind, s.location, s.notes,
         r.status, r.note
  FROM public.timetable_slots s
  LEFT JOIN public.timetable_responses r
         ON r.slot_id = s.id AND r.athlete_id = public.my_athlete_id()
  WHERE public.my_athlete_id() IS NOT NULL
    AND s.published_at IS NOT NULL
    AND s.slot_date BETWEEN p_from AND p_to
    AND (
      cardinality(s.cohorts) = 0
      OR (SELECT a.data->>'cohort' FROM public.athletes a WHERE a.id = public.my_athlete_id()) = ANY (s.cohorts)
    )
  ORDER BY s.slot_date, s.start_time;
$$;
REVOKE ALL ON FUNCTION public.my_timetable(date, date) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.my_timetable(date, date) TO authenticated;


-- ── 4. Answering: p_status = 'attending' | 'not_attending' | NULL (clear) ───
CREATE OR REPLACE FUNCTION public.set_timetable_response(p_slot_id uuid, p_status text, p_note text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_athlete text := public.my_athlete_id();
BEGIN
  IF v_athlete IS NULL THEN
    RAISE EXCEPTION 'Not signed in as an athlete';
  END IF;
  IF p_status IS NOT NULL AND p_status NOT IN ('attending', 'not_attending') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  -- Only slots that are published AND meant for this athlete's cohort.
  IF NOT EXISTS (
    SELECT 1 FROM public.timetable_slots s
    WHERE s.id = p_slot_id
      AND s.published_at IS NOT NULL
      AND (
        cardinality(s.cohorts) = 0
        OR (SELECT a.data->>'cohort' FROM public.athletes a WHERE a.id = v_athlete) = ANY (s.cohorts)
      )
  ) THEN
    RAISE EXCEPTION 'That session isn''t available to you';
  END IF;

  IF p_status IS NULL THEN
    DELETE FROM public.timetable_responses WHERE slot_id = p_slot_id AND athlete_id = v_athlete;
  ELSE
    INSERT INTO public.timetable_responses (slot_id, athlete_id, status, note, responded_at)
    VALUES (p_slot_id, v_athlete, p_status, NULLIF(left(btrim(coalesce(p_note, '')), 300), ''), now())
    ON CONFLICT (slot_id, athlete_id)
    DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note, responded_at = now();
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.set_timetable_response(uuid, text, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.set_timetable_response(uuid, text, text) TO authenticated;
