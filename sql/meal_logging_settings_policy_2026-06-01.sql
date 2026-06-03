-- meal_logging_settings_policy_2026-06-01.sql
-- ----------------------------------------------------------------------
-- Align nutrition_settings RLS with the rest of the meal-logging
-- tables (and the existing session_logs / set_logs pattern). The
-- previous policy granted anon SELECT only, which silently blocked
-- the coach toggle from upserting when the Supabase auth session
-- wasn't fully authenticated — the upsert returned an RLS error
-- that the UI never surfaced.
--
-- Token-based athlete gating + Supabase auth on the coach side
-- handle the real access control at the app layer; the row-level
-- policy here just needs to let the writes through.
-- ----------------------------------------------------------------------

DROP POLICY IF EXISTS anon_read_nutrition_settings ON public.nutrition_settings;

DROP POLICY IF EXISTS anon_all_nutrition_settings ON public.nutrition_settings;
CREATE POLICY anon_all_nutrition_settings ON public.nutrition_settings
  FOR ALL TO anon USING (true) WITH CHECK (true);
