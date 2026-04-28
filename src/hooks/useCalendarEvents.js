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

  return { events, loading, error, addEvent, updateEvent, deleteEvent, refresh };
}
