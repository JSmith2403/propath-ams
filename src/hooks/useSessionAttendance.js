import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Session attendance ("attending" / "not_attending") lives on
 * planned_sessions (attendance, attendance_note, attendance_at — see
 * sql/messaging_and_attendance_2026-10-06.sql). It's read through its own
 * small query rather than being added to the big planned_sessions selects,
 * so if that migration hasn't been run the rest of the programme keeps
 * loading normally and attendance just shows as "no response".
 */

// ── Athlete app: respond to sessions ────────────────────────────────────────
// Returns { byId: { [plannedId]: { attendance, note } }, respond(...) }.
export function useMyAttendance(athleteId, plannedIds) {
  const [byId, setById] = useState({});
  const key = (plannedIds || []).slice().sort().join(',');

  useEffect(() => {
    if (!key) { setById({}); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('planned_sessions')
        .select('id, attendance, attendance_note')
        .in('id', key.split(','));
      if (cancelled) return;
      if (error) { console.warn('[useMyAttendance] fetch failed', error.message); return; }
      const map = {};
      (data || []).forEach(r => {
        if (r.attendance) map[r.id] = { attendance: r.attendance, note: r.attendance_note };
      });
      setById(map);
    })();
    return () => { cancelled = true; };
  }, [key]);

  // status: 'attending' | 'not_attending' | null (clear). Optimistic, rolls
  // back on failure; returns { ok, error? }.
  const respond = useCallback(async (plannedId, status, note = '') => {
    const prev = byId[plannedId];
    setById(m => {
      const next = { ...m };
      if (status) next[plannedId] = { attendance: status, note: status === 'not_attending' ? (note || null) : null };
      else delete next[plannedId];
      return next;
    });
    const { error } = await supabase.rpc('set_session_attendance', {
      p_planned_session_id: plannedId,
      p_athlete_id: athleteId,
      p_status: status,
      p_note: note || null,
    });
    if (error) {
      console.error('[useMyAttendance] respond failed', error);
      setById(m => {
        const next = { ...m };
        if (prev) next[plannedId] = prev; else delete next[plannedId];
        return next;
      });
      return { ok: false, error };
    }
    return { ok: true };
  }, [athleteId, byId]);

  return { byId, respond };
}

// ── Coach app: see responses ────────────────────────────────────────────────
// All responses for these athletes within [fromISO, toISO]. `refreshKey` lets
// a caller force a re-read. Re-checks when the tab regains focus so a
// response that arrives while the coach has the calendar open shows up.
export function useAttendanceForRange(athleteIds, fromISO, toISO, refreshKey = 0) {
  const [byId, setById] = useState({});
  const [tick, setTick] = useState(0);
  const idsKey = (athleteIds || []).slice().sort().join(',');

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') setTick(t => t + 1); };
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(onVisible, 60_000);
    return () => { document.removeEventListener('visibilitychange', onVisible); clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (!idsKey) { setById({}); return; }
    let cancelled = false;
    (async () => {
      let q = supabase
        .from('planned_sessions')
        .select('id, attendance, attendance_note, attendance_at')
        .in('athlete_id', idsKey.split(','))
        .not('attendance', 'is', null);
      if (fromISO) q = q.gte('planned_date', fromISO);
      if (toISO)   q = q.lte('planned_date', toISO);
      const { data, error } = await q;
      if (cancelled) return;
      if (error) { console.warn('[useAttendanceForRange] fetch failed', error.message); setById({}); return; }
      const map = {};
      (data || []).forEach(r => {
        map[r.id] = { attendance: r.attendance, note: r.attendance_note, at: r.attendance_at };
      });
      setById(map);
    })();
    return () => { cancelled = true; };
  }, [idsKey, fromISO, toISO, tick, refreshKey]);

  return byId;
}
