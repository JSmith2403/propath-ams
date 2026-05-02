-- ─────────────────────────────────────────────────────────────────────────────
-- Brief: Overview tabs + Programme weekly view (Part 2)
--
-- Adds a 'technical_session' value to athlete_calendar_events.event_type.
--
-- The CHECK constraint is dropped by lookup (any name pattern) and re-added
-- with the widened set, so this works regardless of the auto-generated
-- constraint name.
--
-- Idempotent: safe to run multiple times. Strictly widens the allowed set —
-- no existing rows can violate the new constraint.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  cname text;
BEGIN
  -- Find any CHECK constraint on event_type and drop it.
  FOR cname IN
    SELECT con.conname
    FROM   pg_constraint con
    JOIN   pg_class      rel ON rel.oid = con.conrelid
    JOIN   pg_namespace  ns  ON ns.oid  = rel.relnamespace
    WHERE  rel.relname = 'athlete_calendar_events'
      AND  ns.nspname  = 'public'
      AND  con.contype = 'c'
      AND  pg_get_constraintdef(con.oid) ILIKE '%event_type%'
  LOOP
    EXECUTE format('ALTER TABLE public.athlete_calendar_events DROP CONSTRAINT %I', cname);
  END LOOP;
END $$;

ALTER TABLE public.athlete_calendar_events
  ADD CONSTRAINT athlete_calendar_events_event_type_check
  CHECK (event_type IN (
    'competition',
    'training_camp',
    'testing',
    'technical_session',
    'other'
  ));

-- Refresh the PostgREST schema cache so the API picks up the new check.
NOTIFY pgrst, 'reload schema';
