import { useState, useEffect, useCallback } from 'react';
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
      console.error('[Calendar] addEvent failed:', e);
      alert('Failed to add event: ' + (e.message || e));
      return null;
    }
    refresh();
    return row;
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

  const updateEventOptimistic = useCallback(async (id, patch) => {
    // Snapshot the existing row from local state so we can revert on failure.
    // Using a ref because React StrictMode may run the setState updater twice
    // in dev — both runs see the same `prev`, so the captured snapshot is
    // stable, but we don't rely on closure timing for the value.
    const snapshotRef = { current: null };
    setEvents(prev => {
      const found = prev.find(e => e.id === id);
      if (found) snapshotRef.current = found;
      if (!found) return prev;
      return prev.map(e => e.id === id ? { ...e, ...patch } : e);
    });
    const snapshot = snapshotRef.current;
    if (!snapshot) {
      console.warn('[Calendar] optimistic update: event not in local state, id =', id);
      return { ok: false, error: new Error('event not found') };
    }

    // Use .select() so we can confirm the update actually persisted. With
    // postgrest's default minimal-return mode, some transient response
    // shapes can confuse the client. Reading the row back removes ambiguity.
    const { data, error: e } = await supabase
      .from('athlete_calendar_events')
      .update(patch)
      .eq('id', id)
      .select();

    // Treat a clean success — error null and at least one row returned —
    // as success. If the row came back, the write happened, even if some
    // parallel error surfaced (e.g. transient client retry quirks).
    if (data && data.length > 0 && !e) {
      return { ok: true, row: data[0] };
    }

    // If we got a row back but also an error, prefer the row (write went
    // through). Log the error so we can investigate.
    if (data && data.length > 0 && e) {
      console.warn('[Calendar] update returned row + error, treating as success:', e);
      return { ok: true, row: data[0] };
    }

    // True failure path — no row, or explicit error.
    console.error('[Calendar] optimistic update failed, reverting:', { id, patch, error: e, data });
    setEvents(prev => prev.map(ev => ev.id === id ? snapshot : ev));
    return { ok: false, error: e || new Error('no rows updated') };
  }, []);

  const deleteEventOptimistic = useCallback(async (id) => {
    let snapshot = null;
    let snapshotIdx = -1;
    setEvents(prev => {
      snapshotIdx = prev.findIndex(e => e.id === id);
      if (snapshotIdx < 0) return prev;
      snapshot = prev[snapshotIdx];
      return prev.filter(e => e.id !== id);
    });
    if (!snapshot) return { ok: false, error: new Error('event not found') };

    const { error: e } = await supabase
      .from('athlete_calendar_events')
      .delete()
      .eq('id', id);
    if (e) {
      console.error('[Calendar] optimistic delete failed, reverting:', e);
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
