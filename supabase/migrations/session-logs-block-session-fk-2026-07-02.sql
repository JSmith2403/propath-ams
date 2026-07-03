-- ============================================================================
-- session_logs.block_session_id → block_sessions.id foreign key
-- Date: 2026-07-02
--
-- The column has always existed but the FK constraint was never declared,
-- so PostgREST's schema cache refuses to auto-join `session_logs (
-- block_sessions ( session_name ) )` — which is exactly what the Recent
-- Updates feed needs. Adding the FK unlocks the direct join and also
-- makes cascade behaviour explicit: if the coach deletes a block_session
-- template, the log row's pointer becomes NULL rather than dangling.
--
-- Safe to re-run — checks for the constraint first.
-- ============================================================================

BEGIN;

-- First, null out any orphan pointers. A prior block_session deletion
-- left session_logs rows pointing at ids that no longer exist. Those
-- logs are still valid records of the athlete's work; they just lost
-- the link to the template name. Setting the pointer to NULL matches
-- what the new ON DELETE SET NULL rule will do going forward.
UPDATE public.session_logs sl
   SET block_session_id = NULL
 WHERE block_session_id IS NOT NULL
   AND NOT EXISTS (
     SELECT 1 FROM public.block_sessions bs WHERE bs.id = sl.block_session_id
   );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'session_logs_block_session_id_fkey'
      AND table_name = 'session_logs'
  ) THEN
    ALTER TABLE public.session_logs
      ADD CONSTRAINT session_logs_block_session_id_fkey
      FOREIGN KEY (block_session_id)
      REFERENCES public.block_sessions(id)
      ON DELETE SET NULL;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';

COMMIT;
