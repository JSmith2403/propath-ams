import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Read-only hook fetching the global ProPath wellness question library.
 * Returns a `refresh()` callback so callers (e.g. threshold editor)
 * can pull the latest after a write.
 */
export function useWellnessLibrary() {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLibrary = useCallback(async () => {
    const { data, error } = await supabase
      .from('wellness_question_library')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) console.error('[wellness_library] fetch failed', error);
    setLibrary(data || []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await fetchLibrary();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [fetchLibrary]);

  return { library, loading, refresh: fetchLibrary };
}
