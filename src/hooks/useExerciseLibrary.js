import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Loads the master exercise library (active rows only) for the search
 * dropdown in the session builder. Static data — fetch once per mount.
 */
export function useExerciseLibrary() {
  const [exercises, setExercises] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('exercise_library')
        .select('id, name, category, default_prescription_type, movement_patterns, bilateral_unilateral, notes')
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (cancelled) return;
      if (error) console.error('[ExerciseLibrary] fetch failed:', error);
      setExercises(data || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return { exercises, loading };
}
