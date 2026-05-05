-- block_grid_editor_2026-05-05.sql
-- ----------------------------------------------------------------------
-- Atomic batch updates for the Block-Grid Session Editor.
--
-- The editor needs every change in a single transaction so a coach
-- never ends up with a half-applied propagation. Rather than chain
-- individual UPDATEs from the client (no client-side transactions in
-- supabase-js), we ship a JSONB payload to a plpgsql function that
-- applies the lot atomically.
--
-- Smart-overwrite filtering happens CLIENT-SIDE before the RPC call:
-- the payload only contains rows the coach has confirmed should be
-- written (downstream weeks that no longer match the pre-edit
-- baseline are dropped from the payload). This function therefore
-- just performs the writes — fast and easy to reason about.
--
-- Two change kinds are supported:
--
--   prescription_update — update sets / reps / target_value /
--     rest_seconds for a list of (session_exercise_id, week_number)
--     pairs. Any field omitted from the JSON object is left as-is.
--
--   exercise_swap — set or clear override_exercise_id for a list of
--     (session_exercise_id, week_number) pairs. Pass an empty string
--     or NULL to clear (restore the base exercise).
--
-- Returns the number of rows affected so the client can render a
-- "Applied to N cells." toast.
-- ----------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.apply_session_grid_changes(changes jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  ch         jsonb;
  rows_total int := 0;
  wk         int;
  ex_id      uuid;
  new_ovr    uuid;
BEGIN
  IF changes IS NULL OR jsonb_typeof(changes) <> 'array' THEN
    RAISE EXCEPTION 'changes must be a JSON array';
  END IF;

  FOR ch IN SELECT * FROM jsonb_array_elements(changes)
  LOOP
    ex_id := (ch->>'session_exercise_id')::uuid;

    IF ch->>'kind' = 'prescription_update' THEN
      FOR wk IN
        SELECT (value)::int FROM jsonb_array_elements_text(ch->'week_numbers')
      LOOP
        UPDATE public.exercise_week_prescriptions
           SET sets         = COALESCE((ch->>'sets')::int,         sets),
               reps         = COALESCE(NULLIF(ch->>'reps', ''),    reps),
               target_value = COALESCE(NULLIF(ch->>'target_value', ''), target_value),
               rest_seconds = COALESCE((ch->>'rest_seconds')::int, rest_seconds),
               updated_at   = now()
         WHERE session_exercise_id = ex_id
           AND week_number         = wk;
        rows_total := rows_total + 1;
      END LOOP;

    ELSIF ch->>'kind' = 'exercise_swap' THEN
      -- Empty string or null → clear the override (restore base).
      new_ovr := NULLIF(ch->>'override_exercise_id', '')::uuid;
      FOR wk IN
        SELECT (value)::int FROM jsonb_array_elements_text(ch->'week_numbers')
      LOOP
        UPDATE public.exercise_week_prescriptions
           SET override_exercise_id = new_ovr,
               updated_at           = now()
         WHERE session_exercise_id = ex_id
           AND week_number         = wk;
        rows_total := rows_total + 1;
      END LOOP;

    ELSE
      RAISE EXCEPTION 'Unknown change kind: %', ch->>'kind';
    END IF;
  END LOOP;

  RETURN rows_total;
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_session_grid_changes(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_session_grid_changes(jsonb) TO anon;
