-- ============================================================================
-- Group & direct chats, plus read-only parent links.
-- Date: 2026-10-09.  Safe to re-run.  Run AFTER the earlier messaging SQL files
-- (needs my_athlete_id() and is_staff()).
--
-- Chat model (each athlete's existing shared "team thread" in athlete_messages
-- is unchanged):
--   chat_rooms     kind 'group' (named, any mix of coaches + athletes, coaches-only
--                  allowed) or 'direct' (one coach + one athlete).
--   chat_members   who is in a room. Removing someone sets removed_at (history stays).
--   chat_messages  every message. IMMUTABLE — no edits, no deletes, for anyone.
--
-- Visibility: a member sees their rooms. Admins can read ALL rooms (that is how
-- the Safeguarding Log works). Nobody writes tables directly: sending and
-- membership changes go through the server API so the sender is always the
-- verified login. The only client write is a member marking their own room read.
--
-- Parent links: guardian_links holds a HASH of a secret link per parent. The
-- parent page is served by the API (service role); this table has no client
-- access at all.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.my_athlete_id()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT athlete_id FROM public.user_roles
  WHERE user_id = auth.uid() AND role = 'athlete'
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.my_athlete_id() TO authenticated;


-- ── 1. Tables ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  kind                text        NOT NULL CHECK (kind IN ('group', 'direct')),
  name                text,
  athletes_can_post   boolean     NOT NULL DEFAULT true,   -- false = announcement-only group
  created_by          uuid,
  created_at          timestamptz NOT NULL DEFAULT now(),
  archived_at         timestamptz
);

CREATE TABLE IF NOT EXISTS public.chat_members (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id       uuid        NOT NULL REFERENCES public.chat_rooms(id) ON DELETE RESTRICT,
  member_type   text        NOT NULL CHECK (member_type IN ('staff', 'athlete')),
  user_id       uuid,
  athlete_id    text,
  display_name  text,
  added_at      timestamptz NOT NULL DEFAULT now(),
  removed_at    timestamptz,
  last_read_at  timestamptz,
  CHECK (
    (member_type = 'staff'   AND user_id IS NOT NULL AND athlete_id IS NULL) OR
    (member_type = 'athlete' AND athlete_id IS NOT NULL AND user_id IS NULL)
  )
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_chat_members_user    ON public.chat_members (room_id, user_id)    WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_chat_members_athlete ON public.chat_members (room_id, athlete_id) WHERE athlete_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_members_athlete ON public.chat_members (athlete_id) WHERE athlete_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_members_user    ON public.chat_members (user_id)    WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id           uuid        NOT NULL REFERENCES public.chat_rooms(id) ON DELETE RESTRICT,
  sender_type       text        NOT NULL CHECK (sender_type IN ('staff', 'athlete')),
  sender_user_id    uuid,
  sender_athlete_id text,
  sender_name       text,
  body              text        NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON public.chat_messages (room_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.guardian_links (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id      text        NOT NULL,
  label           text,                              -- e.g. "Mum", "Dad"
  token_hash      text        NOT NULL UNIQUE,       -- sha256 of the secret in the link
  created_by      uuid,
  created_at      timestamptz NOT NULL DEFAULT now(),
  revoked_at      timestamptz,
  last_viewed_at  timestamptz,
  view_count      int         NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_guardian_links_athlete ON public.guardian_links (athlete_id);


-- ── 2. Membership helper (SECURITY DEFINER avoids RLS recursion) ────────────
CREATE OR REPLACE FUNCTION public.is_room_member(p_room uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_members m
    WHERE m.room_id = p_room
      AND m.removed_at IS NULL
      AND (
        (m.user_id IS NOT NULL AND m.user_id = auth.uid())
        OR (m.athlete_id IS NOT NULL AND m.athlete_id = public.my_athlete_id())
      )
  );
$$;
REVOKE ALL ON FUNCTION public.is_room_member(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_room_member(uuid) TO authenticated;


-- ── 3. Row-level security ───────────────────────────────────────────────────
ALTER TABLE public.chat_rooms    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS member_or_admin_select ON public.chat_rooms;
CREATE POLICY member_or_admin_select ON public.chat_rooms
  FOR SELECT TO authenticated USING (public.is_admin() OR public.is_room_member(id));

DROP POLICY IF EXISTS member_or_admin_select ON public.chat_members;
CREATE POLICY member_or_admin_select ON public.chat_members
  FOR SELECT TO authenticated USING (public.is_admin() OR public.is_room_member(room_id));

DROP POLICY IF EXISTS member_or_admin_select ON public.chat_messages;
CREATE POLICY member_or_admin_select ON public.chat_messages
  FOR SELECT TO authenticated USING (public.is_admin() OR public.is_room_member(room_id));

-- A member may only touch their OWN row, and only last_read_at.
DROP POLICY IF EXISTS own_mark_read ON public.chat_members;
CREATE POLICY own_mark_read ON public.chat_members
  FOR UPDATE TO authenticated
  USING      (user_id = auth.uid() OR athlete_id = public.my_athlete_id())
  WITH CHECK (user_id = auth.uid() OR athlete_id = public.my_athlete_id());

REVOKE ALL ON public.chat_rooms, public.chat_members, public.chat_messages, public.guardian_links FROM anon, authenticated;
GRANT SELECT ON public.chat_rooms, public.chat_members, public.chat_messages TO authenticated;
GRANT UPDATE (last_read_at) ON public.chat_members TO authenticated;
-- guardian_links: no policies and no grants — server (service role) only.


-- ── 4. Safeguarding: messages can never be edited or deleted ────────────────
CREATE OR REPLACE FUNCTION public.chat_messages_protect()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Chat messages are a safeguarding record and cannot be edited or deleted.';
END $$;

DROP TRIGGER IF EXISTS chat_messages_protect ON public.chat_messages;
CREATE TRIGGER chat_messages_protect
  BEFORE UPDATE OR DELETE ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.chat_messages_protect();


-- ── 5. Unread count for the nav badge / bell (works for coaches and athletes) ─
CREATE OR REPLACE FUNCTION public.my_chat_unread()
RETURNS integer
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT COALESCE(COUNT(*), 0)::int
  FROM public.chat_members m
  JOIN public.chat_messages msg ON msg.room_id = m.room_id
  WHERE m.removed_at IS NULL
    AND (m.user_id = auth.uid() OR m.athlete_id = public.my_athlete_id())
    AND msg.created_at > COALESCE(m.last_read_at, m.added_at)
    AND NOT (
      (msg.sender_user_id IS NOT NULL AND msg.sender_user_id = auth.uid())
      OR (msg.sender_athlete_id IS NOT NULL AND msg.sender_athlete_id = public.my_athlete_id())
    );
$$;
GRANT EXECUTE ON FUNCTION public.my_chat_unread() TO authenticated;
