import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useTimetable — the signed-in athlete's published timetable slots between two
 * dates (already filtered to their cohort by the database) plus their own
 * answers. `respond(slotId, status, note)` saves optimistically and rolls back
 * on failure; status is 'attending' | 'not_attending' | null (clear).
 *
 * Degrades to an empty timetable if the timetable SQL hasn't been run.
 */
export function useTimetable(athleteId, fromISO, toISO) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!athleteId) { setSlots([]); setLoading(false); return undefined; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc('my_timetable', { p_from: fromISO, p_to: toISO });
      if (cancelled) return;
      if (error) {
        console.warn('[useTimetable] load failed', error.message);
        setSlots([]);
      } else {
        setSlots(data || []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [athleteId, fromISO, toISO, tick]);

  // Pick up a timetable published while the app is open.
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refresh]);

  const respond = useCallback(async (slotId, status, note = '') => {
    let prev;
    setSlots(list => list.map(s => {
      if (s.id !== slotId) return s;
      prev = { status: s.status, note: s.note };
      return { ...s, status: status || null, note: status ? (note || null) : null };
    }));
    const { error } = await supabase.rpc('set_timetable_response', {
      p_slot_id: slotId,
      p_status: status,
      p_note: note || null,
    });
    if (error) {
      console.error('[useTimetable] respond failed', error);
      setSlots(list => list.map(s => (s.id === slotId && prev ? { ...s, ...prev } : s)));
      return { ok: false, error };
    }
    return { ok: true };
  }, []);

  const unanswered = slots.filter(s => !s.status).length;
  return { slots, loading, unanswered, respond, refresh };
}
