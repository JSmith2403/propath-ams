import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const iso = (d) => d.toLocaleDateString('en-CA');

/**
 * An athlete's own log of activity their watch didn't record (a game, training without the watch).
 * `available` is false until sql/intensity_and_untracked_activity_2026-11-07.sql has been run; the UI then hides itself.
 */
export function useUntrackedActivity(athleteId) {
  const [logs, setLogs] = useState([]);
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!athleteId) return;
    const since = new Date(); since.setDate(since.getDate() - 13);
    const { data, error: e } = await supabase.from('untracked_activity_logs')
      .select('id, activity_date, name, duration_min, rpe, load_au')
      .eq('athlete_id', athleteId).gte('activity_date', iso(since))
      .order('activity_date', { ascending: false }).order('created_at', { ascending: false });
    if (e) { setAvailable(false); return; }
    setAvailable(true); setLogs(data || []);
  }, [athleteId]);

  useEffect(() => { load(); }, [load]);

  const add = useCallback(async ({ name, dateISO, minutes, rpe }) => {
    setSaving(true); setError(null);
    const { error: e } = await supabase.from('untracked_activity_logs')
      .insert({ athlete_id: athleteId, name: name.trim().slice(0, 80), activity_date: dateISO, duration_min: minutes, rpe });
    setSaving(false);
    if (e) { setError('Couldn’t save that. Try again.'); return false; }
    await load();
    return true;
  }, [athleteId, load]);

  const remove = useCallback(async (id) => {
    await supabase.from('untracked_activity_logs').delete().eq('id', id);
    load();
  }, [load]);

  return { logs, available, saving, error, add, remove };
}
