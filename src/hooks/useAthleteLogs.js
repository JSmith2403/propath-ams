import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Coach-side hook — pulls every completed session_log + set_logs for
 * an athlete plus the exercise_library rows referenced by those sets,
 * so analytics can be computed entirely client-side.
 *
 * Returned shape:
 *   sessions: [{ ...session_log, sets: [{ ...set_log, exercise_name, bilateral_unilateral, category }] }]
 */
export function useAthleteLogs(athleteId) {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!athleteId) { setSessions([]); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);

      // 1. completed session_logs
      const { data: logs } = await supabase
        .from('session_logs')
        .select('*')
        .eq('athlete_id', athleteId)
        .not('completed_at', 'is', null)
        .order('started_at', { ascending: false });

      if (cancelled) return;

      const logIds = (logs || []).map(l => l.id);
      let setRows = [];
      if (logIds.length) {
        const { data } = await supabase
          .from('set_logs')
          .select('*')
          .in('session_log_id', logIds);
        setRows = data || [];
      }

      // 2. resolve exercise_id for each set: prefer set_logs.exercise_id,
      //    fall back to session_exercises.exercise_id.
      const seIds = [...new Set(setRows.map(s => s.session_exercise_id).filter(Boolean))];
      let seById = {};
      if (seIds.length) {
        const { data } = await supabase
          .from('session_exercises')
          .select('id, exercise_id')
          .in('id', seIds);
        seById = Object.fromEntries((data || []).map(r => [r.id, r]));
      }

      const exIds = [...new Set(
        setRows.map(s => s.exercise_id || seById[s.session_exercise_id]?.exercise_id).filter(Boolean)
      )];

      let libById = {};
      if (exIds.length) {
        const { data } = await supabase
          .from('exercise_library')
          .select('id, name, category, bilateral_unilateral, primary_muscle, movement_patterns')
          .in('id', exIds);
        libById = Object.fromEntries((data || []).map(r => [r.id, r]));
      }

      // 3. attach lib + se rows to each set
      const enriched = setRows.map(s => {
        const exId = s.exercise_id || seById[s.session_exercise_id]?.exercise_id;
        const lib = exId ? libById[exId] : null;
        return {
          ...s,
          exercise_id: exId,
          exercise_name: lib?.name || '(unknown)',
          bilateral_unilateral: lib?.bilateral_unilateral || null,
          category: lib?.category || null,
          primary_muscle: lib?.primary_muscle || null,
          movement_patterns: lib?.movement_patterns || null,
        };
      });

      // 4. group sets by session_log_id
      const setsByLog = {};
      for (const s of enriched) {
        (setsByLog[s.session_log_id] ||= []).push(s);
      }

      const result = (logs || []).map(l => ({ ...l, sets: setsByLog[l.id] || [] }));

      if (!cancelled) {
        setSessions(result);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [athleteId]);

  return { sessions, loading };
}
