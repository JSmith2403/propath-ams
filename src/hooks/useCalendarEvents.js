import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Fetches athlete_calendar_events for one or more athletes.
 * Designed to work for both Surface 1 (single athlete inside the profile)
 * and Surface 2 (top-level master calendar across many athletes).
 *
 * @param {string[]} athleteIds  array of athlete IDs to fetch for. If empty,
 *                               the hook returns an empty list and skips the
 *                               network call.
 *
 * Returns:
 *   events    array of rows ordered by start_date ASC
 *   loading   boolean
 *   error     supabase error or null
 *   addEvent     async (data) => row | null
 *   updateEvent  async (id, data) => row | null
 *   deleteEvent  async (id) => boolean
 *   refresh   () => void
 */
export function useCalendarEvents(athleteIds = []) {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tick,    setTick]    = useState(0);

  // Ref mirror of events for snapshotting outside React batched updates.
  const eventsRef = useRef([]);
  useEffect(() => { eventsRef.current = events; }, [events]);

  // Stable key so we don't refetch on every render — array identity changes
  // each render but the contents may not, so we hash to a string.
  const key = (athleteIds || []).slice().sort().join(',');

  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!key) { setEvents([]); setLoading(false); return; }
      setLoading(true);
      const ids = key.split(',');
      const { data, error: e } = await supabase
        .from('athlete_calendar_events')
        .select('id, athlete_id, event_name, event_type, priority, start_date, end_date, notes')
        .in('athlete_id', ids)
        .order('start_date', { ascending: true });
      if (cancelled) return;
      if (e) { setError(e); setEvents([]); }
      else   { setError(null); setEvents(data || []); }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [key, tick]);

  const addEvent = useCallback(async (data) => {
    const { data: row, error: e } = await supabase
      .from('athlete_calendar_events')
      .insert(data)
      .select()
      .single();
    if (e) {
      console.error('[Calendar] addEvent failed:', {
        payload: data,
        message: e.message, code: e.code, details: e.details, hint: e.hint, fullError: e,
      });
      return { ok: false, error: e };
    }
    refresh();
    return { ok: true, row };
  }, [refresh]);

  const updateEvent = useCallback(async (id, data) => {
    const { data: row, error: e } = await supabase
      .from('athlete_calendar_events')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (e) {
      console.error('[Calendar] updateEvent failed:', e);
      alert('Failed to update event: ' + (e.message || e));
      return null;
    }
    refresh();
    return row;
  }, [refresh]);

  const deleteEvent = useCallback(async (id) => {
    const { error: e } = await supabase
      .from('athlete_calendar_events')
      .delete()
      .eq('id', id);
    if (e) {
      console.error('[Calendar] deleteEvent failed:', e);
      alert('Failed to delete event: ' + (e.message || e));
      return false;
    }
    refresh();
    return true;
  }, [refresh]);

  // ─── Optimistic variants ────────────────────────────────────────────────
  // Apply the change to local state first so the UI reflects it instantly,
  // then fire the network call. On failure, revert the local change and
  // surface an error to the caller. Resolves to { ok, error? }.

  // Snapshot from the ref BEFORE applying the optimistic patch so the
  // revert path is robust against React 18 batched-update timing.
  const updateEventOptimistic = useCallback(async (id, patch) => {
    const snapshot = eventsRef.current.find(e => e.id === id);
    if (!snapshot) {
      console.warn('[Calendar] update: event not in local state, id =', id);
      return { ok: false, error: new Error('Event not found in current view.') };
    }

    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));

    const { data, error: e } = await supabase
      .from('athlete_calendar_events')
      .update(patch)
      .eq('id', id)
      .select();

    if (e) {
      console.error('[Calendar] update failed, reverting:', {
        id, patch,
        message: e.message, code: e.code, details: e.details, hint: e.hint, fullError: e,
      });
      setEvents(prev => prev.map(ev => ev.id === id ? snapshot : ev));
      return { ok: false, error: e };
    }
    if (!data || data.length === 0) {
      console.warn('[Calendar] update returned no row but no error — assuming write succeeded:', { id });
    }
    return { ok: true, row: data?.[0] };
  }, []);

  const deleteEventOptimistic = useCallback(async (id) => {
    const snapshotIdx = eventsRef.current.findIndex(e => e.id === id);
    if (snapshotIdx < 0) {
      return { ok: false, error: new Error('Event not found in current view.') };
    }
    const snapshot = eventsRef.current[snapshotIdx];

    setEvents(prev => prev.filter(e => e.id !== id));

    const { error: e } = await supabase
      .from('athlete_calendar_events')
      .delete()
      .eq('id', id);
    if (e) {
      console.error('[Calendar] delete failed, reverting:', {
        id,
        message: e.message, code: e.code, details: e.details, hint: e.hint, fullError: e,
      });
      setEvents(prev => {
        const next = prev.slice();
        const insertAt = Math.min(snapshotIdx, next.length);
        next.splice(insertAt, 0, snapshot);
        return next;
      });
      return { ok: false, error: e };
    }
    return { ok: true };
  }, []);

  return {
    events, loading, error,
    addEvent, updateEvent, deleteEvent,
    updateEventOptimistic, deleteEventOptimistic,
    refresh,
  };
}
