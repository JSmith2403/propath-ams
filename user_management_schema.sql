-- ================================================================
-- ProPath AMS — User Management Schema (Phase 2)
-- Run this entire script in the Supabase SQL Editor AFTER
-- auth_schema.sql has already been applied.
-- ================================================================


-- ── 1. user_profiles table ────────────────────────────────────
-- Stores display name, email cache, and active flag for each user.
-- Required because the anon/service key cannot read auth.users directly.

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL DEFAULT '',
  email      text NOT NULL DEFAULT '',
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;


-- ── 2. is_admin() — security definer helper ───────────────────
-- Used in RLS policies to avoid recursion when the policy itself
-- queries user_roles (which also has RLS enabled).

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;


-- ── 3. user_profiles — RLS policies ──────────────────────────

-- Users can read and update their own profile
CREATE POLICY "profiles_select_own"
  ON public.user_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_insert_own"
  ON public.user_profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_update_own"
  ON public.user_profiles FOR UPDATE TO authenticated
  USING  (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_delete_admin"
  ON public.user_profiles FOR DELETE TO authenticated
  USING (public.is_admin());


-- ── 4. Update user_roles — admin can read all ─────────────────
-- Phase 1 only allowed users to read their own role.
-- Admin now needs to read all roles to build the user list.

CREATE POLICY "user_roles_select_admin"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- Drop the old policy that only covered own-row reads
-- (new policy above is a superset)
DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;

-- Admin can insert/update/delete roles (needed for invite + role changes)
CREATE POLICY "user_roles_write_admin"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "user_roles_update_admin"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "user_roles_delete_admin"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.is_admin());


-- ── 5. Update provider_allocations — admin can read/write all ─

-- Drop old own-row policy
DROP POLICY IF EXISTS "allocations_select_own" ON public.provider_allocations;

-- Replacement: own-row OR admin
CREATE POLICY "allocations_select"
  ON public.provider_allocations FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "allocations_insert_admin"
  ON public.provider_allocations FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "allocations_delete_admin"
  ON public.provider_allocations FOR DELETE TO authenticated
  USING (public.is_admin());


-- ================================================================
-- After running this script, the invite-user Edge Function handles
-- inserting rows into user_profiles and user_roles automatically.
--
-- To manually back-fill a profile for an existing user:
--   INSERT INTO public.user_profiles (user_id, name, email)
--   VALUES ('<uuid>', 'Full Name', 'email@example.com')
--   ON CONFLICT (user_id) DO NOTHING;
-- ================================================================
