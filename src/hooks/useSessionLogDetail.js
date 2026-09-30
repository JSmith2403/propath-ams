import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useSessionLogDetail — full exercise/set breakdown for ONE completed
 * session_logs row, grouped by exercise in programme order. Built for
 * the Physio Portal's "show what they actually did that session" card
 * (and reused by Goals & Development notes) — lazy: pass `enabled:
 * false` until the coach actually expands the card, since most notes
 * are never opened this way and this is 2-3 extra round trips.
 *
 * Live schema note (see usePreviousExerciseSets.js's own comment):
 * set_logs carries `exercise_id` directly on newer rows; older rows
 * only have `session_exercise_id` -> session_exercises.exercise_id.
 * Both paths are resolved here, same fallback useAthleteLogs.js uses
 * for the coach's Logged Sessions tab.
 *
 * Shape: { groups, loading, error }
 *   groups: [{ key, name, sets: [{ id, set_number, weight_kg, reps, is_extra }] }]
 *   ordered by the session's programme display_order where known,
 *   otherwise by first appearance in the set log.
 */
export function useSessionLogDetail(sessionLogId, { enabled = true } = {}) {
  const [groups,  setGroups]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!enabled || !sessionLogId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);

      const { data: sets, error: setsErr } = await supabase
        .from('set_logs')
        .select('id, session_exercise_id, exercise_id, set_number, weight_kg, reps, is_extra')
        .eq('session_log_id', sessionLogId)
        .order('set_number', { ascending: true });
      if (cancelled) return;
      if (setsErr) {
        console.error('[useSessionLogDetail] set_logs fetch failed', setsErr);
        setError(setsErr); setGroups([]); setLoading(false);
        return;
      }
      if (!sets?.length) { setGroups([]); setLoading(false); return; }

      const sessionExerciseIds = [...new Set(sets.map(s => s.session_exercise_id).filter(Boolean))];
      const sessionExercisesById = new Map();
      if (sessionExerciseIds.length) {
        const { data: sessExs, error: seErr } = await supabase
          .from('session_exercises')
          .select('id, exercise_id, display_order')
          .in('id', sessionExerciseIds);
        if (seErr) console.error('[useSessionLogDetail] session_exercises fetch failed', seErr);
        (sessExs || []).forEach(se => sessionExercisesById.set(se.id, se));
      }
      if (cancelled) return;

      const exerciseIds = [...new Set(
        sets
          .map(s => s.exercise_id || sessionExercisesById.get(s.session_exercise_id)?.exercise_id)
          .filter(Boolean),
      )];
      const exerciseNamesById = new Map();
      if (exerciseIds.length) {
        const { data: exs, error: exErr } = await supabase
          .from('exercise_library')
          .select('id, name')
          .in('id', exerciseIds);
        if (exErr) console.error('[useSessionLogDetail] exercise_library fetch failed', exErr);
        (exs || []).forEach(e => exerciseNamesById.set(e.id, e.name));
      }
      if (cancelled) return;

      // Group by resolved exercise id (falling back to session_exercise_id,
      // then a synthetic per-row key so nothing silently disappears),
      // ordering groups by the template's display_order where known,
      // otherwise by first appearance in the set log.
      const groupMap  = new Map();
      const orderHint = new Map();
      sets.forEach((s, i) => {
        const se   = sessionExercisesById.get(s.session_exercise_id);
        const exId = s.exercise_id || se?.exercise_id || null;
        const key  = exId || s.session_exercise_id || `unknown-${i}`;
        if (!groupMap.has(key)) {
          groupMap.set(key, { key, name: exerciseNamesById.get(exId) || 'Exercise', sets: [] });
          orderHint.set(key, se?.display_order ?? i);
        }
        groupMap.get(key).sets.push(s);
      });

      const ordered = [...groupMap.values()].sort((a, b) => orderHint.get(a.key) - orderHint.get(b.key));
      setGroups(ordered);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [sessionLogId, enabled]);

  return { groups, loading, error };
}
