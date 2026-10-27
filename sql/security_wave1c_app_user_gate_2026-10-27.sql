-- ============================================================================
-- SECURITY WAVE 1c — "signed in" must mean "has a ProPath account".      2026-10-27
-- APPLIED to live as migration "security_wave1c_app_user_gate".
--
-- FOUND: public sign-up was ON in Supabase Auth (disable_signup = false), and 41 tables had rules for the
-- `authenticated` role that said "any signed-in user" (USING true). So anyone could register an account with
-- their own email and then read — and on 13 tables modify — training logs, meals, wellness answers, test
-- results, goals and more. Tested before applying (rolled back): a brand-new account saw 4,452 training sets
-- and could modify all 155 test results; after the gate it sees and changes nothing. Coaches and athletes
-- (anyone with a row in user_roles) are unaffected — counts identical before and after.
--
-- FIX: is_app_user() = the caller has a row in user_roles. Every `authenticated`-only rule that was open to
-- everyone, plus the 6 storage rules (meal photos, recipe images, resources), now also requires it.
--
-- STILL TO DO BY HAND: Supabase dashboard → Authentication → Sign In / Providers → turn OFF
-- "Allow new users to sign up". (The app only creates accounts through admin calls, never public sign-up.)
-- NOT covered here (wave 2, once every athlete has their own login): the old private-link athlete app still
-- needs the public key to reach several tables, and signed-in athletes can still see/change each other's rows.
--
-- Undo (reopens the hole): recreate each policy with USING (true) — see the docs/ audit for the list.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_app_user()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid());
$$;
REVOKE ALL ON FUNCTION public.is_app_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_app_user() TO authenticated;

DO $$
DECLARE p record; stmt text;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname, cmd, qual, with_check FROM pg_policies
    WHERE schemaname IN ('public', 'storage')
      AND roles::text ~ 'authenticated' AND roles::text !~ '(anon|public)'
      AND (qual = 'true' OR with_check = 'true' OR schemaname = 'storage')
      AND COALESCE(qual, '') NOT ILIKE '%is_app_user%' AND COALESCE(with_check, '') NOT ILIKE '%is_app_user%'
  LOOP
    stmt := format('ALTER POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
    IF p.cmd IN ('SELECT', 'DELETE', 'UPDATE', 'ALL') AND p.qual IS NOT NULL THEN
      stmt := stmt || format(' USING ((%s) AND (SELECT public.is_app_user()))', p.qual);
    END IF;
    IF p.cmd IN ('INSERT', 'UPDATE', 'ALL') AND p.with_check IS NOT NULL THEN
      stmt := stmt || format(' WITH CHECK ((%s) AND (SELECT public.is_app_user()))', p.with_check);
    END IF;
    EXECUTE stmt;
  END LOOP;
END $$;
