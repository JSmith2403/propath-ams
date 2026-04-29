import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const SELECT_COLS = 'id, athlete_id, event_name, event_type, priority, start_date, end_date, notes, is_team_event';

/**
 * Fetches athlete_calendar_events for one or more athletes.
 * Designed to work for Surface 1 (single athlete inside the profile)
 * and Surface 2 (top-level master calendar across many athletes).
 *
 * Brief 5a — when `includeTeamEvents` is true, team-level events
 * (is_team_event = true, athlete_id IS NULL) are unioned into the
 * result set so the same calendar renders both kinds. The caller is
 * responsible for visual differentiation.
 *
 * @param {string[]} athleteIds  array of athlete IDs to fetch for. If empty
 *                               and includeTeamEvents is false, the hook
 *                               returns an empty list and skips the network.
 * @param {object}   options
 * @param {boolean}  options.includeTeamEvents  also pull team events
 */
export function useCalendarEvents(athleteIds = [], { includeTeamEvents = false } = {}) {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tick,    setTick]    = useState(0);

  const eventsRef = useRef([]);
  useEffect(() => { eventsRef.current = events; }, [events]);

  const key = (athleteIds || []).slice().sort().join(',');

  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!key && !includeTeamEvents) { setEvents([]); setLoading(false); return; }
      setLoading(true);

      const queries = [];
      if (key) {
        const ids = key.split(',');
        queries.push(
          supabase.from('athlete_calendar_events')
            .select(SELECT_COLS)
            .in('athlete_id', ids)
            .order('start_date', { ascending: true }),
        );
      }
      if (includeTeamEvents) {
        queries.push(
          supabase.from('athlete_calendar_events')
            .select(SELECT_COLS)
            .eq('is_team_event', true)
            .order('start_date', { ascending: true }),
        );
      }

      const results = await Promise.all(queries);
      if (cancelled) return;

      const seen = new Set();
      const merged = [];
      let firstErr = null;
      for (const r of results) {
        if (r.error) { firstErr = firstErr || r.error; continue; }
        for (const row of (r.data || [])) {
          if (!seen.has(row.id)) { seen.add(row.id); merged.push(row); }
        }
      }
      merged.sort((a, b) => a.start_date.localeCompare(b.start_date));

      if (firstErr) { setError(firstErr); setEvents(merged); }
      else          { setError(null);    setEvents(merged); }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [key, tick, includeTeamEvents]);

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
