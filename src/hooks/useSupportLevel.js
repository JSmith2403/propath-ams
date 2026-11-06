import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { levelOf } from '../utils/support';

/**
 * One athlete's support level (full / programmed / tracked / hands_off).
 * `available` is false until sql/support_levels_2026-11-06.sql has been run; until then everyone reads as full support.
 */
export function useSupportLevel(athleteId) {
  const [level, setLevel] = useState('full');
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!athleteId) return undefined;
    let cancelled = false;
    setLoading(true);
    supabase.from('programming_settings').select('support_level').eq('athlete_id', athleteId).maybeSingle()
      .then(({ data, error: e }) => {
        if (cancelled) return;
        setAvailable(!e);
        setLevel(levelOf(data?.support_level).key);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [athleteId]);

  const save = useCallback(async (key) => {
    const previous = level;
    setLevel(key); setSaving(true); setError(null);
    // programming_active stays true (it is legacy and always on); the level is what counts now.
    const { error: e } = await supabase.from('programming_settings')
      .upsert({ athlete_id: athleteId, programming_active: true, support_level: key }, { onConflict: 'athlete_id' });
    setSaving(false);
    if (e) { setLevel(previous); setError('Couldn’t save that. Try again.'); }
  }, [athleteId, level]);

  return { level, available, loading, saving, error, save };
}
