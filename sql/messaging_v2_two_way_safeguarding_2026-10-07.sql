-- ============================================================================
-- Messaging v2: two-way conversations + safeguarding record.
-- Date: 2026-10-07.  Safe to re-run.  Run AFTER messaging_and_attendance_2026-10-06.sql.
--
-- Model: each athlete has ONE conversation with the coaching team, stored in
-- athlete_messages. Every coach (admin / co_admin) can read and reply; the
-- athlete sees the whole thread. A row is either
--     sender_type = 'coach'   (read_at = when the ATHLETE read it)
--     sender_type = 'athlete' (read_at = when a COACH read it)
--
-- Safeguarding: messages are a permanent, tamper-evident record.
--   * No client role can INSERT, UPDATE (except read_at) or DELETE rows.
--     All writes go through the server API (service role), which sets the
--     sender from the verified login — a sender can't be spoofed.
--   * A trigger blocks DELETE and any edit other than read_at, for EVERYONE
--     including the service role, so even a coach/admin (or a bug) can't
--     rewrite history. Removing the trigger is a deliberate DBA action.
--   * The athlete FK is dropped so deleting an athlete never cascades away
--     their message history.
-- ============================================================================


-- ── 1. Columns / defaults ───────────────────────────────────────────────────
ALTER TABLE public.athlete_messages
  ADD COLUMN IF NOT EXISTS sender_type    text NOT NULL DEFAULT 'coach',
  ADD COLUMN IF NOT EXISTS sender_user_id uuid;

ALTER TABLE public.athlete_messages DROP CONSTRAINT IF EXISTS athlete_messages_sender_type_check;
ALTER TABLE public.athlete_messages
  ADD CONSTRAINT athlete_messages_sender_type_check CHECK (sender_type IN ('coach', 'athlete'));

-- Replies have no title; every row gets its own batch if none supplied.
ALTER TABLE public.athlete_messages ALTER COLUMN title    SET DEFAULT '';
ALTER TABLE public.athlete_messages ALTER COLUMN batch_id SET DEFAULT gen_random_uuid();

-- Keep history if an athlete record is ever removed.
ALTER TABLE public.athlete_messages DROP CONSTRAINT IF EXISTS athlete_messages_athlete_id_fkey;

CREATE INDEX IF NOT EXISTS idx_athlete_messages_created ON public.athlete_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_athlete_messages_sender  ON public.athlete_messages (sender_type, read_at);


-- ── 2. Row-level security ───────────────────────────────────────────────────
-- Staff can read every conversation and mark athlete messages as read.
-- Staff WRITES (sending) go through the API, not direct inserts.
DROP POLICY IF EXISTS staff_all    ON public.athlete_messages;
DROP POLICY IF EXISTS staff_select ON public.athlete_messages;
CREATE POLICY staff_select ON public.athlete_messages
  FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS staff_mark_read ON public.athlete_messages;
CREATE POLICY staff_mark_read ON public.athlete_messages
  FOR UPDATE TO authenticated
  USING (public.is_staff() AND sender_type = 'athlete')
  WITH CHECK (public.is_staff() AND sender_type = 'athlete');

-- Athletes: own conversation only; may only mark COACH messages as read.
DROP POLICY IF EXISTS athlete_select ON public.athlete_messages;
CREATE POLICY athlete_select ON public.athlete_messages
  FOR SELECT TO authenticated USING (athlete_id = public.my_athlete_id());

DROP POLICY IF EXISTS athlete_mark_read ON public.athlete_messages;
CREATE POLICY athlete_mark_read ON public.athlete_messages
  FOR UPDATE TO authenticated
  USING (athlete_id = public.my_athlete_id() AND sender_type = 'coach')
  WITH CHECK (athlete_id = public.my_athlete_id() AND sender_type = 'coach');

-- Table privileges: nobody writes directly except flipping read_at.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.athlete_messages FROM anon, authenticated;
GRANT  UPDATE (read_at) ON public.athlete_messages TO authenticated;


-- ── 3. Tamper-evidence trigger ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.athlete_messages_protect()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Messages are a safeguarding record and cannot be deleted.';
  END IF;

  IF NEW.id             IS DISTINCT FROM OLD.id
  OR NEW.batch_id       IS DISTINCT FROM OLD.batch_id
  OR NEW.athlete_id     IS DISTINCT FROM OLD.athlete_id
  OR NEW.title          IS DISTINCT FROM OLD.title
  OR NEW.body           IS DISTINCT FROM OLD.body
  OR NEW.sent_by        IS DISTINCT FROM OLD.sent_by
  OR NEW.created_at     IS DISTINCT FROM OLD.created_at
  OR NEW.sender_type    IS DISTINCT FROM OLD.sender_type
  OR NEW.sender_user_id IS DISTINCT FROM OLD.sender_user_id THEN
    RAISE EXCEPTION 'Messages are a safeguarding record and cannot be edited.';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS athlete_messages_protect ON public.athlete_messages;
CREATE TRIGGER athlete_messages_protect
  BEFORE UPDATE OR DELETE ON public.athlete_messages
  FOR EACH ROW EXECUTE FUNCTION public.athlete_messages_protect();


-- ── 4. Coach devices can receive push ───────────────────────────────────────
-- push_subscriptions was athlete-only. Staff subscriptions carry user_id
-- instead of athlete_id.
DO $$
BEGIN
  IF to_regclass('public.push_subscriptions') IS NOT NULL THEN
    ALTER TABLE public.push_subscriptions ADD COLUMN IF NOT EXISTS user_id uuid;
    ALTER TABLE public.push_subscriptions ALTER COLUMN athlete_id DROP NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON public.push_subscriptions (user_id);
  END IF;
END $$;
