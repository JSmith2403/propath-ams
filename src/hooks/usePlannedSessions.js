import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Loads planned_sessions rows for one or more athletes, plus the
 * block_session metadata (name + order) the calendar pill needs.
 *
 * Brief 5d/5e: planned_sessions are generated when a template is
 * applied via the Assign tab. Each row pins a specific block_session
 * to a specific calendar date so the per-athlete (and optionally the
 * shared) calendar can show "Yassin's Session 1 lands on Mon May 5".
 *
 * @param {string[]} athleteIds  list of athletes to load for. Empty →
 *                               returns no rows, no network call.
 */
export function usePlannedSessions(athleteIds = []) {
  const [planned, setPlanned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tick,    setTick]    = useState(0);

  // Stable key so we don't refetch on every render.
  const key = (athleteIds || []).slice().sort().join(',');

  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!key) { setPlanned([]); setLoading(false); return; }
      setLoading(true);
      const ids = key.split(',');
      const { data, error: e } = await supabase
        .from('planned_sessions')
        .select(`
          id,
          athlete_id,
          block_id,
          block_session_id,
          standalone_session_id,
          week_number,
          planned_date,
          status,
          block_sessions ( id, session_name, session_order ),
          standalone_sessions ( id, session_name, coach_notes )
        `)
        .in('athlete_id', ids)
        .order('planned_date', { ascending: true });
      if (cancelled) return;
      if (e) {
        console.error('[PlannedSessions] fetch failed:', e);
        setError(e);
        setPlanned([]);
      } else {
        setError(null);
        setPlanned(data || []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [key, tick]);

  return { planned, loading, error, refresh };
}

/**
 * Convert planned_sessions rows into virtual "events" suitable for
 * ProgrammeCalendar. The pill style branches on `is_planned` so we
 * render outlined teal instead of the solid event background.
 */
export function plannedSessionsAsEvents(planned) {
  return (planned || []).map(p => {
    const isStandalone = !!p.standalone_session_id;
    const sess = isStandalone ? (p.standalone_sessions || {}) : (p.block_sessions || {});
    const sessionName = sess.session_name
      || (sess.session_order != null ? `Session ${sess.session_order + 1}` : 'Session');
    return {
      id:               `planned-${p.id}`,
      athlete_id:       p.athlete_id,
      event_name:       sessionName,
      event_type:       'other',
      priority:         null,
      start_date:       p.planned_date,
      end_date:         null,
      notes:            isStandalone ? (sess.coach_notes || null) : null,
      is_team_event:    false,
      is_planned:       true,
      is_standalone:    isStandalone,
      _planned_id:            p.id,
      _block_id:              p.block_id,
      _block_session_id:      p.block_session_id,
      _standalone_session_id: p.standalone_session_id,
      _week_number:      p.week_number,
      _status:           p.status,
    };
  });
}
