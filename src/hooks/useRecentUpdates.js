import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const READ_STORAGE_KEY = 'updates:read';

// ── localStorage-backed read state ────────────────────────────────────
// Per-device for now (fine as MVP). If coaches want read state to sync
// across their phone + laptop, we'd move this to a Supabase table
// keyed on user_id. For now the friction is low: opening on a second
// device shows everything as unread once, then they can hit "Mark all
// read".
function loadRead() {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(READ_STORAGE_KEY) : null;
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch { return new Set(); }
}
function persistRead(set) {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...set]));
  } catch { /* quota / private mode — silently ignore */ }
}

// ── Wellness roll-up ──────────────────────────────────────────────────
// Each wellness_submissions row has four 1-10 sub-scores. Bucket them
// into green/amber/red so the feed shows an at-a-glance status.
function wellnessRag(row) {
  const scores = [row.sleep_quality, row.fatigue, row.muscle_soreness, row.stress]
    .filter(v => v != null);
  if (!scores.length) return 'grey';
  // 1-10 scale where LOW = better (fatigue/soreness/stress) and HIGH =
  // better (sleep_quality). Normalise all onto "worse-is-higher"
  // ourselves. For MVP just look for any red flags.
  const invSleep = row.sleep_quality != null ? (11 - row.sleep_quality) : null;
  const worst = Math.max(
    invSleep ?? 0,
    row.fatigue ?? 0,
    row.muscle_soreness ?? 0,
    row.stress ?? 0,
  );
  if (worst >= 8) return 'red';
  if (worst >= 6) return 'amber';
  return 'green';
}

/**
 * useRecentUpdates — pulls a unified feed of recent activity across
 * every athlete for the coach-side Updates tab. Three sources merged:
 *
 *   1. session      — session_logs.completed_at (physical dev session
 *                     complete). Session name resolved via
 *                     planned_sessions → block_sessions.
 *   2. wellness     — wellness_submissions.created_at (morning
 *                     check-in). RAG rolled up from sub-scores.
 *   3. pb           — athlete_e1rm.created_at (append-only: every row
 *                     IS a new highest e1RM by construction).
 *                     Exercise name joined from exercise_library.
 *
 * Each row carries a namespaced `id` ("session:<uuid>", "wellness:<id>",
 * "pb:<id>") so read-state keys don't collide across sources.
 *
 * Returns:
 *   {
 *     updates, loading, error, refresh,
 *     readIds,          // Set<string> of seen ids
 *     isRead(id),
 *     markRead(id),     // add one id
 *     markAllRead(),    // add every currently-visible id
 *     unreadCount,      // updates.length - readIds ∩ currently-visible
 *   }
 */
export function useRecentUpdates({ limit = 50 } = {}) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tick,    setTick]    = useState(0);
  const [readIds, setReadIds] = useState(() => loadRead());

  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [sessRes, wellRes, pbRes] = await Promise.all([
        supabase
          .from('session_logs')
          .select(`
            id, athlete_id, started_at, completed_at, total_rpe, planned_session_id,
            planned_sessions ( block_sessions ( session_name ) )
          `)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(limit),
        supabase
          .from('wellness_submissions')
          .select('id, athlete_id, submission_date, created_at, sleep_quality, fatigue, muscle_soreness, stress')
          .order('created_at', { ascending: false })
          .limit(limit),
        supabase
          .from('athlete_e1rm')
          .select('id, athlete_id, exercise_id, e1rm_kg, created_at, exercise_library ( name )')
          .order('created_at', { ascending: false })
          .limit(limit),
      ]);
      if (cancelled) return;

      // Any of the three can fail independently; only surface a top-
      // level error if EVERY source failed (some coach setups may
      // legitimately have no wellness or PB tables populated).
      const errors = [sessRes.error, wellRes.error, pbRes.error].filter(Boolean);
      if (errors.length === 3) {
        console.error('[useRecentUpdates] every source failed', errors);
        setError(errors[0]);
        setUpdates([]);
        setLoading(false);
        return;
      }

      const rows = [];

      for (const r of sessRes.data || []) {
        const started  = r.started_at   ? new Date(r.started_at).getTime()   : null;
        const finished = r.completed_at ? new Date(r.completed_at).getTime() : null;
        const duration_min = (started && finished && finished > started)
          ? Math.round((finished - started) / 60_000)
          : null;
        rows.push({
          id: `session:${r.id}`,
          type: 'session',
          athlete_id: r.athlete_id,
          timestamp: r.completed_at,
          session_name: r.planned_sessions?.block_sessions?.session_name || 'Session',
          duration_min,
          total_rpe: r.total_rpe,
        });
      }

      for (const r of wellRes.data || []) {
        rows.push({
          id: `wellness:${r.id}`,
          type: 'wellness',
          athlete_id: r.athlete_id,
          timestamp: r.created_at,
          rag: wellnessRag(r),
          scores: {
            sleep_quality:    r.sleep_quality,
            fatigue:          r.fatigue,
            muscle_soreness:  r.muscle_soreness,
            stress:           r.stress,
          },
        });
      }

      for (const r of pbRes.data || []) {
        rows.push({
          id: `pb:${r.id}`,
          type: 'pb',
          athlete_id: r.athlete_id,
          timestamp: r.created_at,
          exercise_name: r.exercise_library?.name || 'Exercise',
          e1rm_kg: r.e1rm_kg,
        });
      }

      rows.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
      setError(null);
      setUpdates(rows.slice(0, limit * 2)); // cap combined feed
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [limit, tick]);

  const isRead = useCallback((id) => readIds.has(id), [readIds]);

  const markRead = useCallback((id) => {
    setReadIds(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      persistRead(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds(prev => {
      const next = new Set(prev);
      for (const u of updates) next.add(u.id);
      persistRead(next);
      return next;
    });
  }, [updates]);

  const unreadCount = useMemo(
    () => updates.reduce((n, u) => n + (readIds.has(u.id) ? 0 : 1), 0),
    [updates, readIds],
  );

  return { updates, loading, error, refresh, readIds, isRead, markRead, markAllRead, unreadCount };
}
