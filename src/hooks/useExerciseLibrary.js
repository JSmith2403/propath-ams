import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Loads the master exercise library (active rows only) for the
 * exercise picker. Static-ish data — fetched once per mount with a
 * refresh callback used by the custom-create flow to pick up newly
 * inserted rows.
 */
export function useExerciseLibrary() {
  const [exercises, setExercises] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tick,      setTick]      = useState(0);

  const refresh = useCallback(() => setTick(n => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // Supabase Postgrest defaults to a 1000-row response cap. The
      // library is now larger than that, so we page through with
      // explicit ranges and concatenate. PAGE_SIZE just under the cap
      // keeps each request well under the limit.
      const PAGE_SIZE = 1000;
      const all = [];
      let from = 0;
      while (!cancelled) {
        const to = from + PAGE_SIZE - 1;
        const { data, error } = await supabase
          .from('exercise_library')
          .select('id, name, category, movement_patterns, bilateral_unilateral, equipment, complexity, posterior_anterior, primary_muscle, supporting_muscles, muscle_bias, joint_count_level, dynamic_isometric, movement_plane, notes')
          .eq('is_active', true)
          .order('name', { ascending: true })
          .range(from, to);
        if (cancelled) return;
        if (error) {
          console.error('[ExerciseLibrary] fetch failed:', error);
          break;
        }
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < PAGE_SIZE) break; // last page
        from += PAGE_SIZE;
      }
      // Brief 5c — default_prescription_type column dropped. Default
      // to kg everywhere; coach picks per-exercise via the pill.
      setExercises(all.map(row => ({ ...row, default_prescription_type: 'kg' })));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [tick]);

  return { exercises, loading, refresh };
}
