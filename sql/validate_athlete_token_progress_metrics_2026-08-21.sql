-- validate_athlete_token_progress_metrics_2026-08-21.sql
-- ----------------------------------------------------------------------
-- The athlete app has no direct SELECT on athletes (anon can't read the
-- record at all — validate_athlete_token is a SECURITY DEFINER RPC that
-- hands back only the specific fields the app needs). Extends it to also
-- return progress_metrics (phase2.progressMetrics, falling back to the
-- legacy phase2.reportMetrics key) so the Progress tab knows which
-- metric_keys to query performance_test_results for, without needing
-- any broader read access to the athlete record.
-- ----------------------------------------------------------------------

-- Postgres won't let CREATE OR REPLACE change a function's return type
-- (adding the progress_metrics column counts as a change), so the old
-- signature has to be dropped first.
DROP FUNCTION IF EXISTS public.validate_athlete_token(text);

CREATE FUNCTION public.validate_athlete_token(p_token text)
 RETURNS TABLE(
   athlete_id text, is_active boolean, name text, photo text, sport text,
   use_custom_wellness boolean, wellness_token text, progress_metrics jsonb
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT t.athlete_id, t.is_active,
         a.data->>'name', a.data->>'photo', a.data->>'sport',
         COALESCE(t.use_custom_wellness, false),
         (SELECT w.token FROM wellness_tokens w
          WHERE w.athlete_id = t.athlete_id AND w.is_active = true
          LIMIT 1),
         COALESCE(
           a.data->'phase2'->'progressMetrics',
           a.data->'phase2'->'reportMetrics',
           '[]'::jsonb
         )
  FROM athlete_app_tokens t
  LEFT JOIN athletes a ON a.id = t.athlete_id
  WHERE t.token = p_token;
$function$;

NOTIFY pgrst, 'reload schema';
