import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Loads everything the BlockGridEditor needs for one block_session
 * across every week of its parent block:
 *
 *   - block_session metadata (name, order, notes)
 *   - session_exercises (rows in display_order)
 *   - exercise_week_prescriptions for every week of every exercise
 *   - exercise_library names for both base + override exercise ids
 *   - section metadata (so coach notes / warm-up flag are available
 *     if we want to surface them later — currently unused)
 *
 * Heavier than the per-week fetch in usePlannedWeekDetail, but the
 * editor needs the full grid in memory anyway. Refresh re-runs the
 * full query so post-RPC reads reflect the new state.
 */
export function useBlockGridSession(blockSessionId) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const [tick,  setTick]  = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!blockSessionId) {
      setState({ loading: false, data: null, error: null });
      return;
    }
    let cancelled = false;
    (async () => {
      setState(s => ({ ...s, loading: true }));

      const [bsRes, exRes, secRes] = await Promise.all([
        supabase.from('block_sessions')
          .select('id, block_id, session_name, session_order, coach_notes')
          .eq('id', blockSessionId)
          .single(),
        supabase.from('session_exercises')
          .select('id, block_session_id, section_id, exercise_id, display_order, prescription_type, notes, superset_group_id')
          .eq('block_session_id', blockSessionId)
          .order('display_order', { ascending: true }),
        supabase.from('session_sections')
          .select('id, name, display_order, is_warm_up')
          .eq('block_session_id', blockSessionId)
          .order('display_order', { ascending: true }),
      ]);

      if (cancelled) return;
      if (bsRes.error || exRes.error || secRes.error) {
        const err = bsRes.error || exRes.error || secRes.error;
        console.error('[useBlockGridSession] base fetch failed', err);
        setState({ loading: false, data: null, error: err });
        return;
      }

      const exercises  = exRes.data  || [];
      const sections   = secRes.data || [];
      const blockSess  = bsRes.data;
      const exerciseIds = exercises.map(e => e.id);

      // Pull every week's prescription for these exercises in one go.
      let wps = [];
      if (exerciseIds.length) {
        const { data, error } = await supabase
          .from('exercise_week_prescriptions')
          .select('id, session_exercise_id, week_number, sets, reps, target_value, rest_seconds, override_exercise_id')
          .in('session_exercise_id', exerciseIds);
        if (cancelled) return;
        if (error) {
          console.error('[useBlockGridSession] wps fetch failed', error);
          setState({ loading: false, data: null, error });
          return;
        }
        wps = data || [];
      }

      // Library names for every exercise the editor needs to render —
      // both the original session exercise and any per-week override.
      const overrideIds = [...new Set(wps.map(w => w.override_exercise_id).filter(Boolean))];
      const baseIds     = [...new Set(exercises.map(e => e.exercise_id))];
      const libIds      = [...new Set([...baseIds, ...overrideIds])];

      let libById = {};
      if (libIds.length) {
        const { data: lib, error } = await supabase
          .from('exercise_library')
          .select('id, name, category')
          .in('id', libIds);
        if (cancelled) return;
        if (error) {
          console.error('[useBlockGridSession] library fetch failed', error);
          setState({ loading: false, data: null, error });
          return;
        }
        libById = Object.fromEntries((lib || []).map(l => [l.id, l]));
      }

      setState({
        loading: false,
        error: null,
        data: { blockSession: blockSess, exercises, sections, wps, libById },
      });
    })();
    return () => { cancelled = true; };
  }, [blockSessionId, tick]);

  return { ...state, refresh };
}
