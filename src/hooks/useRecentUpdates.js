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
      const [sessRes, wellRes, pbRes, mealRes] = await Promise.all([
        supabase
          .from('session_logs')
          // Direct FK to block_sessions gets the template name when the
          // pointer is intact. planned_sessions is the fallback path
          // when block_session_id is NULL (which happens for logs whose
          // template was later deleted — orphan pointers were nulled by
          // the session-logs-block-session-fk-2026-07-02 migration).
          .select(`
            id, athlete_id, started_at, completed_at, session_rpe,
            block_session_id, planned_session_id,
            block_sessions ( session_name ),
            planned_sessions ( block_sessions ( session_name ) )
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
        supabase
          .from('meal_entries')
          .select('id, athlete_id, log_date, meal_type, description, submitted_at, created_at')
          .not('submitted_at', 'is', null)
          .gte('submitted_at', sinceISO)
          .order('submitted_at', { ascending: false })
          .limit(MAX_ITEMS),
      ]);
      if (cancelled) return;

      const errors = [sessRes.error, wellRes.error, pbRes.error, mealRes.error].filter(Boolean);
      if (errors.length === 4) {
        console.error('[useRecentUpdates] every source failed', errors);
        setError(errors[0]);
        setUpdates([]);
        setLoading(false);
        return;
      }

      const rows = [];

      // Build session rows first so we can enrich them below with a
      // second-pass fetch of set_logs (for total load lifted) and
      // athlete_e1rm (for PB counts on this session).
      const sessionRows = [];
      const sessionLogIds = [];
      for (const r of sessRes.data || []) {
        const started  = r.started_at   ? new Date(r.started_at).getTime()   : null;
        const finished = r.completed_at ? new Date(r.completed_at).getTime() : null;
        const duration_min = (started && finished && finished > started)
          ? Math.round((finished - started) / 60_000)
          : null;
        const session_name =
          r.block_sessions?.session_name
          || r.planned_sessions?.block_sessions?.session_name
          || 'Session';
        const row = {
          id: `session:${r.id}`,
          type: 'session',
          athlete_id: r.athlete_id,
          timestamp: r.completed_at,
          session_log_id: r.id,
          session_name,
          duration_min,
          total_rpe: r.session_rpe,
          total_load_kg: 0,
          pb_count: 0,
          pb_exercises: [],
        };
        sessionRows.push(row);
        sessionLogIds.push(r.id);
      }
      if (sessRes.error) console.error('[useRecentUpdates] session_logs error', sessRes.error);

      // ── Second pass: enrich sessions with total load + PB detail ─
      // Two queries, run in parallel:
      //   1. Every set_log row for these sessions — used both for the
      //      total-load Σ(weight × reps) aggregation AND to build a
      //      set_log_id → session_log_id map so PBs can be attributed
      //      back to the session that produced them.
      //   2. Every athlete_e1rm row in window with a source set. Small
      //      table — pull recent rows, filter client-side by whether
      //      their source_set_log_id maps into one of our sessions.
      if (sessionLogIds.length) {
        const [setsRes, pbRowsRes] = await Promise.all([
          supabase
            .from('set_logs')
            .select('id, session_log_id, weight_kg, reps')
            .in('session_log_id', sessionLogIds),
          supabase
            .from('athlete_e1rm')
            .select('id, source_set_log_id, exercise_library ( name )')
            .gte('created_at', sinceISO)
            .not('source_set_log_id', 'is', null),
        ]);
        if (setsRes.error)   console.error('[useRecentUpdates] set_logs error', setsRes.error);
        if (pbRowsRes.error) console.error('[useRecentUpdates] e1rm assoc error', pbRowsRes.error);

        const loadBySession = new Map();
        const setToSession  = new Map();
        for (const s of setsRes.data || []) {
          setToSession.set(s.id, s.session_log_id);
          if (s.weight_kg == null || s.reps == null) continue;
          const cur = loadBySession.get(s.session_log_id) || 0;
          loadBySession.set(s.session_log_id, cur + Number(s.weight_kg) * Number(s.reps));
        }

        const pbsBySession = new Map();
        for (const pb of pbRowsRes.data || []) {
          const sessId = setToSession.get(pb.source_set_log_id);
          if (!sessId) continue;
          const name = pb.exercise_library?.name || 'Exercise';
          if (!pbsBySession.has(sessId)) pbsBySession.set(sessId, []);
          pbsBySession.get(sessId).push(name);
        }

        for (const row of sessionRows) {
          row.total_load_kg = Math.round(loadBySession.get(row.session_log_id) || 0);
          const pbs         = pbsBySession.get(row.session_log_id) || [];
          row.pb_count      = pbs.length;
          row.pb_exercises  = pbs;
        }
      }

      rows.push(...sessionRows);
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

      for (const r of mealRes.data || []) {
        rows.push({
          id: `meal:${r.id}`,
          type: 'meal',
          athlete_id: r.athlete_id,
          timestamp: r.submitted_at || r.created_at,
          meal_type:  (r.meal_type || 'meal').toLowerCase(),
          description: r.description || null,
        });
      }
      if (mealRes.error) console.error('[useRecentUpdates] meal_entries error', mealRes.error);

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
