-- ================================================================
-- ProPath AMS — Authentication Schema (Phase 1)
-- Run this entire script in the Supabase SQL Editor.
-- ================================================================


-- ── 1. New tables ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text NOT NULL CHECK (role IN ('admin', 'co_admin', 'external')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.provider_allocations (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, athlete_id)
);


-- ── 2. Enable RLS on new tables ───────────────────────────────

ALTER TABLE public.user_roles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_allocations ENABLE ROW LEVEL SECURITY;


-- ── 3. user_roles — each user can read their own role ─────────

CREATE POLICY "user_roles_select_own"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());


-- ── 4. provider_allocations — each user reads their own ───────

CREATE POLICY "allocations_select_own"
  ON public.provider_allocations FOR SELECT TO authenticated
  USING (user_id = auth.uid());


-- ── 5. Drop the existing open-access policies ─────────────────
-- (The original schema created a single "allow_all" policy on each table
--  that permitted unauthenticated public access.  Remove those now.)

DROP POLICY IF EXISTS "allow_all" ON public.athletes;
DROP POLICY IF EXISTS "allow_all" ON public.sessions;
DROP POLICY IF EXISTS "allow_all" ON public.app_settings;


-- ── 6. athletes — SELECT ──────────────────────────────────────
-- admin / co_admin see every athlete.
-- external providers see only athletes explicitly allocated to them.

CREATE POLICY "athletes_select"
  ON public.athletes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'co_admin')
    )
    OR EXISTS (
      SELECT 1 FROM public.provider_allocations
      WHERE user_id = auth.uid()
        AND athlete_id = athletes.id
    )
  );


-- ── 7. athletes — INSERT ──────────────────────────────────────
-- Only admin / co_admin can create new athlete records.

CREATE POLICY "athletes_insert"
  ON public.athletes FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'co_admin')
    )
  );


-- ── 8. athletes — UPDATE ──────────────────────────────────────
-- admin / co_admin can update any athlete.
-- external providers can update athletes allocated to them
-- (needed so they can add notes / pillar entries).

CREATE POLICY "athletes_update"
  ON public.athletes FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'co_admin')
    )
    OR EXISTS (
      SELECT 1 FROM public.provider_allocations
      WHERE user_id = auth.uid()
        AND athlete_id = athletes.id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'co_admin')
    )
    OR EXISTS (
      SELECT 1 FROM public.provider_allocations
      WHERE user_id = auth.uid()
        AND athlete_id = athletes.id
    )
  );


-- ── 9. athletes — DELETE ──────────────────────────────────────
-- Only admin / co_admin can delete athlete records.

CREATE POLICY "athletes_delete"
  ON public.athletes FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'co_admin')
    )
  );


-- ── 10. sessions — authenticated access ───────────────────────
-- All authenticated users may read sessions (external providers
-- see athlete performance data via the athlete profile, not this
-- table directly, but the reads are harmless).
-- Only admin / co_admin write sessions (they run Data Entry).

CREATE POLICY "sessions_select"
  ON public.sessions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "sessions_insert"
  ON public.sessions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'co_admin')
    )
  );

CREATE POLICY "sessions_update"
  ON public.sessions FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'co_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'co_admin')
    )
  );

CREATE POLICY "sessions_delete"
  ON public.sessions FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'co_admin')
    )
  );


-- ── 11. app_settings — all authenticated users ────────────────

CREATE POLICY "settings_all"
  ON public.app_settings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);


-- ================================================================
-- MANUAL SETUP — run these after creating users in Supabase Auth
-- (Authentication → Users → Invite user / Add user)
-- ================================================================
--
-- Assign admin to Jonah:
--   INSERT INTO public.user_roles (user_id, role)
--   VALUES ('<jonahs-auth-uuid>', 'admin');
--
-- Assign co_admin to Nelly, Ned, Tiana:
--   INSERT INTO public.user_roles (user_id, role)
--   VALUES ('<user-uuid>', 'co_admin');
--
-- Add an external provider:
--   INSERT INTO public.user_roles (user_id, role)
--   VALUES ('<provider-uuid>', 'external');
--
--   INSERT INTO public.provider_allocations (user_id, athlete_id)
--   VALUES ('<provider-uuid>', '<athlete-id>'),
--          ('<provider-uuid>', '<athlete-id>');
--
-- Find athlete IDs in the athletes table:
--   SELECT id, data->>'name' AS name FROM public.athletes;
-- ================================================================
