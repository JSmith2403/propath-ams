-- ============================================================================
-- Timetable: one choice per day + 1:1 session tokens.
-- Date: 2026-10-10.  Safe to re-run.  Run AFTER sql/timetable_2026-10-08.sql.
--
-- 1) set_timetable_day(): the athlete picks ONE session per day (or "can't make
--    it"). The chosen slot becomes 'attending' and the other group sessions that
--    day are recorded as 'not_attending' with the marker note '__other__' so the
--    coach can tell "chose the other session" from "can't come at all".
--
-- 2) 1:1 tokens. An athlete has a monthly allowance (placeholder default 4 until
--    packages are locked in; editable per athlete). Requesting a 1:1 reserves one
--    token; declined / cancelled requests give it back. The count is ROLLING: a
--    1:1 uses a token for the 30 days from its date.
--      one_to_one_allowance   monthly_tokens per athlete
--      one_to_one_requests    one row per request: requested → confirmed / declined
--                             / cancelled / completed
-- Athletes never write these tables: requests go through the server (which also
-- sends the chat message) and they read their own rows / balance.
-- ============================================================================

-- ── 1. One choice per day ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_timetable_day(
  p_date    date,
  p_slot_id uuid    DEFAULT NULL,    -- the session they're attending (NULL = can't make it)
  p_note    text    DEFAULT NULL,    -- "arriving 4:30" / reason for not coming
  p_clear   boolean DEFAULT false    -- remove their answers for the day
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_athlete text := public.my_athlete_id();
  v_cohort  text;
  v_ids     uuid[];
  v_slot    uuid;
  v_note    text := NULLIF(left(btrim(coalesce(p_note, '')), 300), '');
BEGIN
  IF v_athlete IS NULL THEN
    RAISE EXCEPTION 'Not signed in as an athlete';
  END IF;

  SELECT a.data->>'cohort' INTO v_cohort FROM public.athletes a WHERE a.id = v_athlete;

  -- Published group sessions that day that apply to this athlete's cohort.
  SELECT coalesce(array_agg(s.id), '{}') INTO v_ids
  FROM public.timetable_slots s
  WHERE s.slot_date = p_date
    AND s.published_at IS NOT NULL
    AND s.kind = 'session'
    AND (cardinality(s.cohorts) = 0 OR v_cohort = ANY (s.cohorts));

  IF cardinality(v_ids) = 0 THEN
    RAISE EXCEPTION 'There are no sessions for you on that day';
  END IF;

  IF p_clear THEN
    DELETE FROM public.timetable_responses WHERE athlete_id = v_athlete AND slot_id = ANY (v_ids);
    RETURN;
  END IF;

  IF p_slot_id IS NOT NULL AND NOT (p_slot_id = ANY (v_ids)) THEN
    RAISE EXCEPTION 'That session isn''t available to you';
  END IF;

  FOREACH v_slot IN ARRAY v_ids LOOP
    INSERT INTO public.timetable_responses (slot_id, athlete_id, status, note, responded_at)
    VALUES (
      v_slot, v_athlete,
      CASE WHEN p_slot_id IS NOT NULL AND v_slot = p_slot_id THEN 'attending' ELSE 'not_attending' END,
      CASE WHEN p_slot_id IS NULL THEN v_note                       -- can't make it: their reason
           WHEN v_slot = p_slot_id THEN v_note                      -- chosen: arrival note
           ELSE '__other__' END,                                    -- the session they didn't pick
      now()
    )
    ON CONFLICT (slot_id, athlete_id)
    DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note, responded_at = now();
  END LOOP;
END $$;
REVOKE ALL ON FUNCTION public.set_timetable_day(date, uuid, text, boolean) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.set_timetable_day(date, uuid, text, boolean) TO authenticated;


-- ── 2. 1:1 tokens ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.one_to_one_allowance (
  athlete_id     text        PRIMARY KEY,
  monthly_tokens int         NOT NULL DEFAULT 4 CHECK (monthly_tokens >= 0),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  updated_by     uuid
);

CREATE TABLE IF NOT EXISTS public.one_to_one_requests (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id    text        NOT NULL,
  request_date  date        NOT NULL,
  request_time  text,                                  -- 'HH:MM' the athlete asked for
  status        text        NOT NULL DEFAULT 'requested'
                CHECK (status IN ('requested', 'confirmed', 'declined', 'cancelled', 'completed')),
  tokens        int         NOT NULL DEFAULT 1,
  coach_note    text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  decided_by    uuid,
  decided_at    timestamptz
);
CREATE INDEX IF NOT EXISTS idx_one_to_one_athlete ON public.one_to_one_requests (athlete_id, request_date DESC);
CREATE INDEX IF NOT EXISTS idx_one_to_one_status  ON public.one_to_one_requests (status, request_date);

ALTER TABLE public.one_to_one_allowance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.one_to_one_requests  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS staff_all ON public.one_to_one_allowance;
CREATE POLICY staff_all ON public.one_to_one_allowance
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS staff_all ON public.one_to_one_requests;
CREATE POLICY staff_all ON public.one_to_one_requests
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Athletes read their OWN rows; they never write (requests go through the server).
DROP POLICY IF EXISTS athlete_select ON public.one_to_one_allowance;
CREATE POLICY athlete_select ON public.one_to_one_allowance
  FOR SELECT TO authenticated USING (athlete_id = public.my_athlete_id());
DROP POLICY IF EXISTS athlete_select ON public.one_to_one_requests;
CREATE POLICY athlete_select ON public.one_to_one_requests
  FOR SELECT TO authenticated USING (athlete_id = public.my_athlete_id());

-- Signed-out visitors get nothing. Signed-in athletes have SELECT policies only
-- (no insert/update/delete policy exists for them, so row-level security blocks
-- any write); coaches write through staff_all.
REVOKE ALL ON public.one_to_one_allowance, public.one_to_one_requests FROM anon;


-- Rolling balance for ANY athlete (server use): a 1:1 holds a token for the 30
-- days from its date. Requested / confirmed / completed count; declined and
-- cancelled give the token back. "Today" is UAE time.
CREATE OR REPLACE FUNCTION public.token_balance(p_athlete text)
RETURNS TABLE (monthly_tokens int, used int, next_free date)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH today AS (SELECT (now() AT TIME ZONE 'Asia/Dubai')::date AS d),
  counted AS (
    SELECT r.request_date, r.tokens
    FROM public.one_to_one_requests r, today t
    WHERE r.athlete_id = p_athlete
      AND r.status IN ('requested', 'confirmed', 'completed')
      AND r.request_date > t.d - 30
  )
  SELECT
    coalesce((SELECT a.monthly_tokens FROM public.one_to_one_allowance a WHERE a.athlete_id = p_athlete), 4) AS monthly_tokens,
    coalesce((SELECT sum(c.tokens) FROM counted c), 0)::int AS used,
    (SELECT min(c.request_date) + 30 FROM counted c) AS next_free;
$$;
REVOKE ALL ON FUNCTION public.token_balance(text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.token_balance(text) TO service_role;

-- What the signed-in athlete sees.
CREATE OR REPLACE FUNCTION public.my_token_balance()
RETURNS TABLE (monthly_tokens int, used int, next_free date)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.monthly_tokens, b.used, b.next_free
  FROM public.token_balance(public.my_athlete_id()) b
  WHERE public.my_athlete_id() IS NOT NULL;
$$;
REVOKE ALL ON FUNCTION public.my_token_balance() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.my_token_balance() TO authenticated;
