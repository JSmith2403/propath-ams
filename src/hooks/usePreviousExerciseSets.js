import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * usePreviousExerciseSets — for each exercise the athlete is about to
 * train, fetch their most recent *prior* completed log of that exercise
 * so the session logger can show a "Last week" reference strip
 * (8 × 70, 8 × 72.5, 7 × 75 — 19 May).
 *
 *   Returns:
 *     { loading, byExercise: Map<exercise_id, {
 *         date: ISO date,
 *         sets: [{ set_number, reps, weight_kg }],
 *       }> }
 *
 * Notes:
 *   - "Prior" = completed_at IS NOT NULL and session_log_id !=
 *     excludeSessionLogId (the in-progress log we're logging into now).
 *   - Match is by exercise_id, not session_exercise_id, so a per-week
 *     swap still surfaces the last time the athlete actually performed
 *     the exercise they're being prescribed now.
 *   - Picks the single most recent prior session per exercise (by
 *     session_logs.started_at). Earlier sessions are ignored.
 */
export function usePreviousExerciseSets(athleteId, exerciseIds, excludeSessionLogId = null) {
  const [state, setState] = useState({ loading: true, byExercise: new Map() });

  const key = (exerciseIds || []).join(',');

  useEffect(() => {
    if (!athleteId || !exerciseIds?.length) {
      setState({ loading: false, byExercise: new Map() });
      return;
    }
    let cancelled = false;
    (async () => {
      setState(s => ({ ...s, loading: true }));

      // Inner join to session_logs so we can filter on athlete +
      // completed_at server-side. Sorted newest-first so the
      // single-pass JS grouping below grabs the most recent session
      // per exercise.
      const { data, error } = await supabase
        .from('set_logs')
        .select(`
          exercise_id, set_number, reps, weight_kg, session_log_id,
          session_logs!inner ( id, athlete_id, started_at, completed_at )
        `)
        .eq('session_logs.athlete_id', athleteId)
        .not('session_logs.completed_at', 'is', null)
        .in('exercise_id', exerciseIds)
        .order('set_number', { ascending: true });

      if (cancelled) return;
      if (error) {
        console.error('[usePreviousExerciseSets] fetch failed', error);
        setState({ loading: false, byExercise: new Map() });
        return;
      }

      // Group by exercise_id, then pick the most recent session for each.
      const byEx = new Map();
      for (const row of data || []) {
        if (excludeSessionLogId && row.session_log_id === excludeSessionLogId) continue;
        const slog = row.session_logs;
        if (!slog?.started_at) continue;
        const existing = byEx.get(row.exercise_id);
        if (!existing || slog.started_at > existing.startedAt) {
          // Found a more recent session for this exercise — restart the bucket.
          byEx.set(row.exercise_id, {
            startedAt: slog.started_at,
            sessionLogId: row.session_log_id,
            sets: [{ set_number: row.set_number, reps: row.reps, weight_kg: row.weight_kg }],
          });
        } else if (slog.started_at === existing.startedAt
                   && row.session_log_id === existing.sessionLogId) {
          existing.sets.push({ set_number: row.set_number, reps: row.reps, weight_kg: row.weight_kg });
        }
        // older session for the same exercise → ignore
      }

      // Project to the public shape and sort sets within each.
      const out = new Map();
      for (const [exId, bucket] of byEx.entries()) {
        out.set(exId, {
          date: bucket.startedAt,
          sets: bucket.sets.sort((a, b) => a.set_number - b.set_number),
        });
      }

      setState({ loading: false, byExercise: out });
    })();
    return () => { cancelled = true; };
  }, [athleteId, key, excludeSessionLogId]); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
