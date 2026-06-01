import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useMealEntries — reads an athlete's meals for a given log_date,
 * including the photo storage paths. Used by:
 *   - the athlete app to render today's filled slots and pick the
 *     next unused snack_N slot for a "Snack" tap.
 *   - the coach Food Diary view to render meals + photos + history.
 *
 * Shape:
 *   { entries, loading, refresh }
 *   entries: [{ id, log_date, meal_type, description, notes, status,
 *               submitted_at, photos: [{ id, storage_path, thumbnail_path,
 *               width, height }] }]
 */
export function useMealEntries(athleteId, logDate) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick,    setTick]    = useState(0);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!athleteId || !logDate) {
      setEntries([]); setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('meal_entries')
        .select(`
          id, log_date, meal_type, description, notes, status,
          submitted_at, created_by,
          meal_photos ( id, storage_path, thumbnail_path, width, height )
        `)
        .eq('athlete_id', athleteId)
        .eq('log_date',   logDate)
        .order('submitted_at', { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error('[useMealEntries] fetch failed', error);
        setEntries([]); setLoading(false);
        return;
      }
      setEntries((data || []).map(e => ({
        ...e,
        photos: e.meal_photos || [],
      })));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [athleteId, logDate, tick]);

  return { entries, loading, refresh };
}

// Map a generic "Snack" press to the first unused snack slot for the
// day. Returns null when all three slots are taken — callers should
// reject the submit attempt in that case.
export function nextSnackSlot(entriesForDate) {
  const used = new Set(entriesForDate.map(e => e.meal_type));
  for (const k of ['snack_1','snack_2','snack_3']) {
    if (!used.has(k)) return k;
  }
  return null;
}
