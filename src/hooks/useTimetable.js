import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AUTO_NOTE } from '../utils/timetable';

/**
 * useTimetable — the signed-in athlete's published group sessions between two
 * dates (already filtered to their cohort by the database) plus their answers.
 *
 * Answers are ONE CHOICE PER DAY: `respondDay(date, slotId, note)` marks that
 * session as attending and the day's other sessions as "chose the other one";
 * `respondDay(date, null)` = not attending that day (no selection). A day with no
 * answer at all is simply unanswered until they pick or confirm the week.
 * Updates are optimistic and roll back on failure.
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
        // 1:1 now works through tokens (see useOneToOne), not timetable slots.
        setSlots((data || []).filter(s => s.kind === 'session'));
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

  const respondDay = useCallback(async (date, slotId, note = '', clear = false) => {
    let before = [];
    setSlots(list => {
      before = list;
      return list.map(s => {
        if (s.slot_date !== date) return s;
        if (clear) return { ...s, status: null, note: null };
        if (slotId && s.id === slotId) return { ...s, status: 'attending', note: note || null };
        return { ...s, status: 'not_attending', note: slotId ? AUTO_NOTE : (note || null) };
      });
    });
    const { error } = await supabase.rpc('set_timetable_day', {
      p_date: date, p_slot_id: slotId || null, p_note: note || null, p_clear: clear,
    });
    if (error) {
      console.error('[useTimetable] respondDay failed', error);
      setSlots(before);
      return { ok: false, error };
    }
    return { ok: true };
  }, []);

  // "Confirm my week": every day still without an answer is recorded as not attending.
  const confirmRemaining = useCallback(async () => {
    const dates = [...new Set(slots.filter(s => !s.status).map(s => s.slot_date))];
    const results = await Promise.all(dates.map(d => respondDay(d, null, '')));
    return { ok: results.every(r => r.ok) };
  }, [slots, respondDay]);

  const unanswered = slots.filter(s => !s.status).length;
  return { slots, loading, unanswered, respondDay, confirmRemaining, refresh };
}
