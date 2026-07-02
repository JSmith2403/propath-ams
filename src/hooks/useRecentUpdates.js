import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

// Feed shape — deliberately narrow to keep it fast:
//   - only pulls the last MAX_AGE_DAYS days (server-side date filter)
//   - caps the merged result at MAX_ITEMS so the DOM stays light
const MAX_AGE_DAYS  = 30;
const MAX_ITEMS     = 50;

// localStorage keys
const READ_THROUGH_KEY = 'updates:read_through_ts'; // ISO, everything ≤ this is implicitly read
const READ_IDS_KEY     = 'updates:read_ids';        // explicit reads for items AFTER read_through_ts

// ── localStorage-backed read state ────────────────────────────────────
// Per-device. If coaches later want read state to sync between phone +
// laptop, this moves to a Supabase table keyed on user_id.
function loadReadIds() {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(READ_IDS_KEY) : null;
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch { return new Set(); }
}
function persistReadIds(set) {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(READ_IDS_KEY, JSON.stringify([...set]));
  } catch { /* quota / private mode — silently ignore */ }
}
function loadReadThrough() {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(READ_THROUGH_KEY) : null;
    return raw || null;
  } catch { return null; }
}
function persistReadThrough(iso) {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(READ_THROUGH_KEY, iso);
  } catch { /* ignore */ }
}

// ── Wellness roll-up ──────────────────────────────────────────────────
function wellnessRag(row) {
  const scores = [row.sleep_quality, row.fatigue, row.muscle_soreness, row.stress]
    .filter(v => v != null);
  if (!scores.length) return 'grey';
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
 * useRecentUpdates — unified coach-side activity feed.
 *
 * Sources merged (server-side date-filtered to the last 30 days):
 *   • session   — session_logs.completed_at
 *   • wellness  — wellness_submissions.created_at
 *   • pb        — athlete_e1rm.created_at
 *
 * Read state model — two tiers for speed:
 *   readThroughTs   — ISO water line. Everything ≤ this ISO is implicitly
 *                     considered read. Set once, when the coach first
 *                     opens the feature (deploy-time backdate). Also
 *                     updated by "Mark all read" so we never accumulate
 *                     thousands of explicit ids.
 *   readIds         — explicit reads for items whose timestamp is AFTER
 *                     the water line. Tiny set in practice.
 *
 * Both survive across sessions in localStorage. Per-device for MVP.
 */
export function useRecentUpdates() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tick,    setTick]    = useState(0);
  const [readThroughTs, setReadThroughTs] = useState(() => loadReadThrough());
  const [readIds,       setReadIds]       = useState(() => loadReadIds());

  // Initialise read-through water line to "now" the first time this
  // hook ever mounts on a given device. That backdates every existing
  // update to read (last 4 weeks + anything else) so the coach starts
  // with a clean slate — new items from this moment onward count as
  // unread as normal.
  useEffect(() => {
    if (!readThroughTs) {
      const now = new Date().toISOString();
      persistReadThrough(now);
      setReadThroughTs(now);
    }
  }, [readThroughTs]);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const sinceISO = new Date(Date.now() - MAX_AGE_DAYS * 86_400_000).toISOString();
      const [sessRes, wellRes, pbRes] = await Promise.all([
        supabase
          .from('session_logs')
          // Real LIVE columns: `session_rpe` (not `total_rpe`),
          // `block_session_id` sits directly on session_logs so no need
          // to join through planned_sessions at all. Earlier revision
          // referenced total_rpe which crashed the whole select — that's
          // why the feed came back empty even though rows exist.
          .select(`
            id, athlete_id, started_at, completed_at, session_rpe,
            block_session_id,
            block_sessions ( session_name )
          `)
          .not('completed_at', 'is', null)
          .gte('completed_at', sinceISO)
          .order('completed_at', { ascending: false })
          .limit(MAX_ITEMS),
        supabase
          .from('wellness_submissions')
          .select('id, athlete_id, submission_date, created_at, sleep_quality, fatigue, muscle_soreness, stress')
          .gte('created_at', sinceISO)
          .order('created_at', { ascending: false })
          .limit(MAX_ITEMS),
        supabase
          .from('athlete_e1rm')
          .select('id, athlete_id, exercise_id, e1rm_kg, created_at, exercise_library ( name )')
          .gte('created_at', sinceISO)
          .order('created_at', { ascending: false })
          .limit(MAX_ITEMS),
      ]);
      if (cancelled) return;

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
          session_name: r.block_sessions?.session_name || 'Session',
          duration_min,
          total_rpe: r.session_rpe,
        });
      }
      if (sessRes.error) console.error('[useRecentUpdates] session_logs error', sessRes.error);
      if (wellRes.error) console.error('[useRecentUpdates] wellness_submissions error', wellRes.error);
      if (pbRes.error)   console.error('[useRecentUpdates] athlete_e1rm error', pbRes.error);

      for (const r of wellRes.data || []) {
        rows.push({
          id: `wellness:${r.id}`,
          type: 'wellness',
          athlete_id: r.athlete_id,
          timestamp: r.created_at,
          rag: wellnessRag(r),
          scores: {
            sleep_quality:   r.sleep_quality,
            fatigue:         r.fatigue,
            muscle_soreness: r.muscle_soreness,
            stress:          r.stress,
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
      setUpdates(rows.slice(0, MAX_ITEMS));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [tick]);

  // ── Read-state helpers ─────────────────────────────────────────
  const isRead = useCallback((u) => {
    if (!u) return false;
    if (readThroughTs && u.timestamp && u.timestamp <= readThroughTs) return true;
    return readIds.has(u.id);
  }, [readIds, readThroughTs]);

  const markRead = useCallback((u) => {
    if (!u || isRead(u)) return;
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(u.id);
      persistReadIds(next);
      return next;
    });
  }, [isRead]);

  const markAllRead = useCallback(() => {
    // Move the water line to now — every currently visible item flips
    // to read in one stroke, and readIds can be pruned to just those
    // items that are still after the new water line (which is none).
    const now = new Date().toISOString();
    persistReadThrough(now);
    setReadThroughTs(now);
    if (readIds.size) {
      setReadIds(new Set());
      persistReadIds(new Set());
    }
  }, [readIds.size]);

  const unreadCount = useMemo(
    () => updates.reduce((n, u) => n + (isRead(u) ? 0 : 1), 0),
    [updates, isRead],
  );

  return {
    updates, loading, error, refresh,
    isRead, markRead, markAllRead, unreadCount,
    // Exposed so the view can put a copy note next to the "Mark all read"
    // button if it wants ("showing last N days").
    maxAgeDays: MAX_AGE_DAYS,
    maxItems:   MAX_ITEMS,
  };
}
