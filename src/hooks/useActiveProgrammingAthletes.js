import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Returns the set of athlete IDs that have programming_active = true.
 * Re-fetches on `version` changes so callers can force a refresh after
 * a toggle elsewhere.
 *
 * Returns: { activeIds: Set<string>, loading, refresh: () => void }
 */
export function useActiveProgrammingAthletes(version = 0) {
  const [activeIds, setActiveIds] = useState(() => new Set());
  const [loading,   setLoading]   = useState(true);
  const [tick,      setTick]      = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('programming_settings')
        .select('athlete_id, programming_active')
        .eq('programming_active', true);
      if (error) {
        console.error('[Programming] active list fetch failed:', error);
      }
      if (!cancelled) {
        setActiveIds(new Set((data || []).map(r => r.athlete_id)));
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [version, tick]);

  return {
    activeIds,
    loading,
    refresh: () => setTick(t => t + 1),
  };
}
