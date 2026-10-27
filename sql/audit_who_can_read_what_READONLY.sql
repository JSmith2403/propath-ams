-- READ-ONLY. Changes nothing. Run in the Supabase SQL Editor (live project) and look at the result.
-- Shows every access rule on every table in `public`, so we can see what the live database really
-- allows (the SQL files in this repo are only what we *intended* to run).
--
-- What to look for in the result:
--   roles = {anon}            → anyone holding the public key in the web app's code can do this
--   roles = {authenticated}   → ANY signed-in user can — athletes now count as signed-in users
--   using_expr = true         → no condition at all (every row)
SELECT
  tablename,
  policyname,
  cmd                       AS action,         -- SELECT / INSERT / UPDATE / DELETE / ALL
  roles,
  qual                      AS using_expr,
  with_check                AS check_expr
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- Tables with row-level security switched OFF (these are open to everyone with the public key):
SELECT c.relname AS table_without_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity
ORDER BY 1;
