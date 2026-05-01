import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Owns the lifecycle of an in-progress session log:
 *
 *   start()           → inserts a session_logs row, returns id
 *   logSet(payload)   → upserts one set_logs row
 *   deleteSet(id)     → removes a logged set
 *   finish(rpe, notes)→ stamps completed_at + duration + session RPE
 *
 * Resume: if the athlete already has an open session_log for this
 * planned_session, we re-attach to it instead of starting a new one.
 */
export function useSessionLogger({ athleteId, plannedSessionId, blockSessionId }) {
  const [sessionLog, setSessionLog] = useState(null);   // session_logs row | null
  const [sets, setSets]             = useState([]);     // set_logs rows
  const [loading, setLoading]       = useState(true);

  // Refresh from DB.
  const refresh = useCallback(async () => {
    if (!athleteId || !plannedSessionId) {
      setSessionLog(null); setSets([]); setLoading(false);
      return;
    }
    setLoading(true);
    // Open log = no completed_at, latest started_at
    const { data: openLog } = await supabase
      .from('session_logs')
      .select('*')
      .eq('athlete_id', athleteId)
      .eq('planned_session_id', plannedSessionId)
      .is('completed_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    setSessionLog(openLog || null);
    if (openLog) {
      const { data: setRows } = await supabase
        .from('set_logs')
        .select('*')
        .eq('session_log_id', openLog.id)
        .order('set_number', { ascending: true });
      setSets(setRows || []);
    } else {
      setSets([]);
    }
    setLoading(false);
  }, [athleteId, plannedSessionId]);

  useEffect(() => { refresh(); }, [refresh]);

  // Start new session log.
  const start = useCallback(async () => {
    const { data, error } = await supabase
      .from('session_logs')
      .insert({
        athlete_id: athleteId,
        planned_session_id: plannedSessionId,
        block_session_id: blockSessionId,
        started_at: new Date().toISOString(),
      })
      .select('*').single();
    if (error) { alert('Failed to start session: ' + error.message); return null; }
    setSessionLog(data);
    setSets([]);
    return data.id;
  }, [athleteId, plannedSessionId, blockSessionId]);

  // Log or update one set. If `id` is present we update, else insert.
  const logSet = useCallback(async ({ id, session_exercise_id, exercise_id, set_number, weight_kg, reps, rpe, is_extra }) => {
    if (!sessionLog) return;
    const payload = {
      session_log_id: sessionLog.id,
      session_exercise_id,
      exercise_id,
      set_number,
      weight_kg: weight_kg === '' || weight_kg == null ? null : Number(weight_kg),
      reps:      reps === '' || reps == null ? null : Number(reps),
      rpe:       rpe === '' || rpe == null ? null : Number(rpe),
      is_extra:  !!is_extra,
    };
    let result;
    if (id) {
      result = await supabase.from('set_logs').update(payload).eq('id', id).select('*').single();
    } else {
      result = await supabase.from('set_logs').insert(payload).select('*').single();
    }
    if (result.error) { alert('Failed to save set: ' + result.error.message); return; }
    // Optimistic local update
    setSets(prev => {
      const idx = prev.findIndex(s => s.id === result.data.id);
      if (idx >= 0) {
        const next = [...prev]; next[idx] = result.data; return next;
      }
      return [...prev, result.data];
    });
  }, [sessionLog]);

  const deleteSet = useCallback(async (id) => {
    await supabase.from('set_logs').delete().eq('id', id);
    setSets(prev => prev.filter(s => s.id !== id));
  }, []);

  // finish() now accepts the new RPE-flow payload:
  //   rpe                 0-10 integer (Rest = 0)
  //   durationMinutes     athlete's confirmed minutes (overrides timer)
  //   reflection          free-text note shared with coach
  const finish = useCallback(async (rpe, durationMinutes, reflection) => {
    if (!sessionLog) return false;
    const completedAt = new Date();
    const startedAt   = new Date(sessionLog.started_at);
    const seconds     = Math.max(0, Math.round((completedAt - startedAt) / 1000));
    const minutes     = (durationMinutes != null && isFinite(durationMinutes))
      ? Math.max(0, Math.round(Number(durationMinutes)))
      : Math.max(0, Math.round(seconds / 60));

    const { error } = await supabase
      .from('session_logs')
      .update({
        completed_at:       completedAt.toISOString(),
        duration_seconds:   seconds,
        duration_minutes:   minutes,
        session_rpe:        rpe == null ? null : Number(rpe),
        athlete_reflection: reflection ? String(reflection).trim() : null,
      })
      .eq('id', sessionLog.id);
    if (error) { alert('Failed to finish session: ' + error.message); return false; }
    await refresh();
    return true;
  }, [sessionLog, refresh]);

  return { sessionLog, sets, loading, start, logSet, deleteSet, finish, refresh };
}
