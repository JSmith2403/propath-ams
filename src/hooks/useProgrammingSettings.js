import { useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Programming is now always-on for every athlete (Brief: Overview tabs +
 * Programme weekly view, Part 3). The toggle UI has been removed and the
 * `programming_settings.programming_active` column has been backfilled to
 * true for every athlete on LIVE + DEV.
 *
 * The hook keeps its public API (isActive, loading, setActive, refresh) so
 * existing call sites — ProgrammeView, AssignTab, AthleteSidebar — keep
 * compiling. It just always reports active.
 *
 * `setActive` is preserved as a no-op-ish writer: it still upserts the row
 * (always to true) so any external system that reads the table sees the
 * row exists, but it ignores the requested value. This is intentional —
 * Part 3's contract is "always on, the table is just for legacy readers".
 */
export function useProgrammingSettings(athleteId) {
  const setActive = useCallback(async (_active) => {
    if (!athleteId) return;
    // Upsert keeps the row in step with reality even though the toggle
    // is gone. Always writes true regardless of the requested value.
    const { error: e } = await supabase
      .from('programming_settings')
      .upsert(
        { athlete_id: athleteId, programming_active: true },
        { onConflict: 'athlete_id' },
      );
    if (e) console.warn('[Programming] setActive upsert failed (non-fatal):', e);
  }, [athleteId]);

  const refresh = useCallback(async () => { /* no-op — always active */ }, []);

  return {
    isActive: true,
    loading:  false,
    error:    null,
    setActive,
    refresh,
  };
}
