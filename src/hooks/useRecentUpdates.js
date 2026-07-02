import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useRecentUpdates — pulls the most recent completed session_logs
 * across every athlete, for the Recent Updates feed (Facebook-style
 * notification pane). Joined to block_sessions for the session name.
 *
 * Athlete data (name, photo) is looked up client-side against the
 * hook consumer's existing `athletes` list — no extra fetch.
 *
 *   returns { updates, loading, error, refresh }
 *
 * updates rows shape:
 *   {
 *     id,                        // session_log id
 *     athlete_id,
 *     completed_at,              // ISO timestamp
 *     duration_min,              // computed from started_at → completed_at
 *     total_rpe,                 // athlete's finish-of-session RPE, nullable
 *     session_name,              // resolved via planned_sessions → block_sessions
 *   }
 */
export function useRecentUpdates({ limit = 50 } = {}) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tick,    setTick]    = useState(0);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error: e } = await supabase
        .from('session_logs')
        .select(`
          id,
          athlete_id,
          started_at,
          completed_at,
          total_rpe,
          planned_session_id,
          planned_sessions ( block_sessions ( session_name ) )
        `)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(limit);
      if (cancelled) return;
      if (e) {
        console.error('[useRecentUpdates] fetch failed', e);
        setError(e);
        setUpdates([]);
      } else {
        setError(null);
        const rows = (data || []).map(r => {
          const started = r.started_at ? new Date(r.started_at).getTime() : null;
          const finished = r.completed_at ? new Date(r.completed_at).getTime() : null;
          const duration_min = (started && finished && finished > started)
            ? Math.round((finished - started) / 60_000)
            : null;
          const session_name = r.planned_sessions?.block_sessions?.session_name || 'Session';
          return {
            id: r.id,
            athlete_id: r.athlete_id,
            completed_at: r.completed_at,
            duration_min,
            total_rpe: r.total_rpe,
            session_name,
          };
        });
        setUpdates(rows);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [limit, tick]);

  return { updates, loading, error, refresh };
}
