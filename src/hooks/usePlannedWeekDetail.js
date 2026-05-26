import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { buildSessionItems } from '../utils/sessionLayout';

/**
 * Loads the full per-day breakdown of an athlete's planned sessions
 * across one calendar week (Mon..Sun) — used by AthleteWeekView's
 * TeamBuildr-style column layout.
 *
 * For each planned_session in range:
 *   - block_session metadata (name + order)
 *   - the session's exercises with library names
 *   - this week's prescriptions (sets / reps / target)
 *   - any inline coach notes
 *   - a letter (A, B, C…) per superset group so paired exercises
 *     visually share the same prefix
 *
 * Heavy enough that we keep it scoped to the visible week, not the
 * whole programme.
 */
export function usePlannedWeekDetail(athleteId, fromISO, toISO, refreshTick = 0) {
  const [planned, setPlanned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!athleteId || !fromISO || !toISO) {
      setPlanned([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);

      // 1. planned_sessions in range with the block_session join
      const { data: rows, error: pErr } = await supabase
        .from('planned_sessions')
        .select(`
          id, planned_date, week_number, block_session_id, block_id, status,
          block_sessions ( id, session_name, session_order )
        `)
        .eq('athlete_id', athleteId)
        .gte('planned_date', fromISO)
        .lte('planned_date', toISO)
        .order('planned_date', { ascending: true });

      if (cancelled) return;
      if (pErr) {
        console.error('[PlannedWeekDetail] planned_sessions fetch failed', pErr);
        setError(pErr); setPlanned([]); setLoading(false);
        return;
      }

      if (!rows || rows.length === 0) {
        setError(null); setPlanned([]); setLoading(false);
        return;
      }

      const sessionIds = [...new Set(rows.map(r => r.block_session_id))];

      // 2. exercises + sections + step notes in parallel
      const [
        { data: exercises, error: eErr },
        { data: sections,  error: sErr },
        { data: notes,     error: nErr },
      ] = await Promise.all([
        supabase.from('session_exercises')
          .select('id, block_session_id, section_id, exercise_id, display_order, prescription_type, notes, superset_group_id')
          .in('block_session_id', sessionIds)
          .order('display_order', { ascending: true }),
        supabase.from('session_sections')
          .select('id, block_session_id, name, display_order, is_warm_up')
          .in('block_session_id', sessionIds)
          .order('display_order', { ascending: true }),
        supabase.from('session_step_notes')
          .select('id, block_session_id, section_id, display_order, content')
          .in('block_session_id', sessionIds)
          .order('display_order', { ascending: true }),
      ]);

      if (cancelled) return;
      if (eErr || sErr || nErr) {
        const e = eErr || sErr || nErr;
        console.error('[PlannedWeekDetail] sub-fetch failed', e);
        setError(e); setPlanned([]); setLoading(false);
        return;
      }

      const exerciseIds = (exercises || []).map(e => e.id);

      // 3. week prescriptions (we need the row matching each planned
      //    session's week_number; over-fetch and filter in JS)
      let wps = [];
      if (exerciseIds.length) {
        const { data, error: wErr } = await supabase
          .from('exercise_week_prescriptions')
          .select('session_exercise_id, week_number, sets, reps, target_value, rest_seconds, override_exercise_id')
          .in('session_exercise_id', exerciseIds);
        if (wErr) {
          console.error('[PlannedWeekDetail] prescriptions fetch failed', wErr);
          setError(wErr); setPlanned([]); setLoading(false);
          return;
        }
        wps = data || [];
      }

      // 4. exercise_library names. We need both the original
      //    exercise_id and any per-week override_exercise_id so the
      //    week-view shows the replaced exercise from the chosen
      //    week onwards (and the original up to that point).
      const overrideIds = [...new Set(wps.map(w => w.override_exercise_id).filter(Boolean))];
      const libIds = [...new Set([
        ...(exercises || []).map(e => e.exercise_id),
        ...overrideIds,
      ])];
      let libById = {};
      if (libIds.length) {
        const { data: lib, error: lErr } = await supabase
          .from('exercise_library')
          .select('id, name, category, bilateral_unilateral, demo_video_url')
          .in('id', libIds);
        if (lErr) {
          console.error('[PlannedWeekDetail] library fetch failed', lErr);
          setError(lErr); setPlanned([]); setLoading(false);
          return;
        }
        libById = Object.fromEntries((lib || []).map(l => [l.id, l]));
      }

      // 5. Assemble per planned_session — shared with athlete-app TrainingTab
      const result = rows.map(p => {
        const sessExs   = (exercises || []).filter(e => e.block_session_id === p.block_session_id);
        const sessSecs  = (sections  || []).filter(s => s.block_session_id === p.block_session_id);
        const sessNotes = (notes     || []).filter(n => n.block_session_id === p.block_session_id);

        const items = buildSessionItems({
          sessExs, sessNotes, sessSecs, wps, libById,
          weekNumber: p.week_number,
        });

        return {
          id:               p.id,
          planned_date:     p.planned_date,
          week_number:      p.week_number,
          block_id:         p.block_id,
          block_session_id: p.block_session_id,
          status:           p.status,  // 'planned' | 'in_progress' | 'completed'
          session_name:     p.block_sessions?.session_name
                            || (p.block_sessions?.session_order != null
                                  ? `Session ${p.block_sessions.session_order + 1}`
                                  : 'Session'),
          session_order:    p.block_sessions?.session_order ?? 0,
          items,
        };
      });

      setError(null);
      setPlanned(result);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [athleteId, fromISO, toISO, refreshTick]);

  return { planned, loading, error };
}
