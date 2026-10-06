-- ============================================================================
-- Coach -> athlete messages (inbox + read receipts) and session attendance.
-- Date: 2026-10-06
--
-- Deliberately small: ONE new table (athlete_messages) and a few columns
-- on the existing planned_sessions table. Safe to re-run.
--
-- Run in the Supabase SQL editor (live project). The app code is written to
-- degrade gracefully if this hasn't been run yet (inbox/attendance simply
-- show empty), but neither feature works until it is.
-- ============================================================================


-- ── 1. Messages ─────────────────────────────────────────────────────────────
-- One row PER RECIPIENT, so read receipts are just read_at on the row.
-- batch_id groups the rows of one send (e.g. "to all Elite athletes") so the
-- coach side can show "sent to 12, 7 read".
CREATE TABLE IF NOT EXISTS public.athlete_messages (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id    uuid        NOT NULL,
  athlete_id  text        NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  body        text        NOT NULL DEFAULT '',
  sent_by     text,                              -- coach display name / email
  created_at  timestamptz NOT NULL DEFAULT now(),
  read_at     timestamptz
);

CREATE INDEX IF NOT EXISTS idx_athlete_messages_athlete
  ON public.athlete_messages (athlete_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_athlete_messages_batch
  ON public.athlete_messages (batch_id);

ALTER TABLE public.athlete_messages ENABLE ROW LEVEL SECURITY;

-- Staff: full access (compose + see delivery/read status).
DROP POLICY IF EXISTS staff_all ON public.athlete_messages;
CREATE POLICY staff_all ON public.athlete_messages
  FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Athlete app: an athlete signed in with their own account (real Supabase Auth
-- user with an 'athlete' user_roles row) can read ONLY their own messages and
-- mark them read. Anonymous / legacy-token visitors get nothing — messages can
-- be private (injury, selection), so unlike the older athlete-app tables these
-- are not open to the anon key. Athletes can NOT insert or delete messages.
CREATE OR REPLACE FUNCTION public.my_athlete_id()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT athlete_id FROM public.user_roles
  WHERE user_id = auth.uid() AND role = 'athlete'
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.my_athlete_id() TO authenticated;

DROP POLICY IF EXISTS athlete_select ON public.athlete_messages;
CREATE POLICY athlete_select ON public.athlete_messages
  FOR SELECT TO authenticated USING (athlete_id = public.my_athlete_id());

DROP POLICY IF EXISTS athlete_mark_read ON public.athlete_messages;
CREATE POLICY athlete_mark_read ON public.athlete_messages
  FOR UPDATE TO authenticated
  USING (athlete_id = public.my_athlete_id())
  WITH CHECK (athlete_id = public.my_athlete_id());

-- Column-level guard: the athlete-facing role may only ever touch read_at.
-- (Staff updates nothing here either — they only insert/read via staff_all.)
REVOKE UPDATE ON public.athlete_messages FROM anon, authenticated;
GRANT  UPDATE (read_at) ON public.athlete_messages TO authenticated;


-- ── 2. Session attendance ───────────────────────────────────────────────────
-- Lives on planned_sessions itself (no new table). planned_sessions is
-- staff-write only under RLS, so athletes respond through a narrow
-- SECURITY DEFINER function that can ONLY set these three columns, and only
-- on a session that belongs to the athlete id they pass.
ALTER TABLE public.planned_sessions
  ADD COLUMN IF NOT EXISTS attendance      text
    CHECK (attendance IN ('attending', 'not_attending')),
  ADD COLUMN IF NOT EXISTS attendance_note text,
  ADD COLUMN IF NOT EXISTS attendance_at   timestamptz;

CREATE OR REPLACE FUNCTION public.set_session_attendance(
  p_planned_session_id uuid,
  p_athlete_id         text,
  p_status             text,
  p_note               text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_status IS NOT NULL AND p_status NOT IN ('attending', 'not_attending') THEN
    RAISE EXCEPTION 'invalid attendance status';
  END IF;

  UPDATE public.planned_sessions
     SET attendance      = p_status,
         attendance_note = CASE WHEN p_status = 'not_attending' THEN NULLIF(btrim(p_note), '') ELSE NULL END,
         attendance_at   = CASE WHEN p_status IS NULL THEN NULL ELSE now() END
   WHERE id = p_planned_session_id
     AND athlete_id = p_athlete_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'session not found for this athlete';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.set_session_attendance(uuid, text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.set_session_attendance(uuid, text, text, text) TO anon, authenticated;

-- End of migration.
