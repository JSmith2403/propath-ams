import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const STALE_MS = 30 * 60 * 1000;

/**
 * useGarmin — an athlete's Garmin connection status, daily summaries and activities.
 *
 *   forStaff: a coach viewing an athlete (passes their id to the status function). Athletes
 *             always see only their own data — the database enforces that, not this hook.
 *
 * `available` is false when the Garmin SQL hasn't been run or the viewer has no login that can
 * read it (e.g. an old token-only athlete link) — the UI then hides itself.
 *
 * Keys are never read back: connect() hands the pasted key to the server, which validates and
 * encrypts it. Athletes' own app refreshes quietly when opened if the data is >30 min old.
 */
export function useGarmin(athleteId, { forStaff = false } = {}) {
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);       // null = not connected
  const [daily, setDaily] = useState([]);            // newest first
  const [activities, setActivities] = useState([]);  // newest first

  const load = useCallback(async () => {
    if (!athleteId) { setLoading(false); return null; }
    const st = await supabase.rpc('garmin_status', forStaff ? { p_athlete_id: athleteId } : {});
    if (st.error) { setAvailable(false); setLoading(false); return null; }
    setAvailable(true);
    const row = (st.data || [])[0] || null;
    const connected = row && row.connected ? row : null;
    setStatus(connected);
    if (connected || row) {
      const [d, a] = await Promise.all([
        supabase.from('garmin_daily')
          .select('day, steps, resting_hr, avg_stress, body_battery_high, body_battery_low, active_kcal, sleep_seconds, sleep_score, hrv_last_night, hrv_weekly_avg, hrv_status')
          .eq('athlete_id', athleteId).order('day', { ascending: false }).limit(30),
        supabase.from('garmin_activities')
          .select('activity_id, started_at, day, activity_type, name, duration_s, distance_m, avg_hr, max_hr, calories, training_load')
          .eq('athlete_id', athleteId).order('started_at', { ascending: false, nullsFirst: false }).limit(15),
      ]);
      setDaily(d.data || []);
      setActivities(a.data || []);
    } else { setDaily([]); setActivities([]); }
    setLoading(false);
    return connected;
  }, [athleteId, forStaff]);

  const call = useCallback(async (action, body = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`/api/garmin/${action}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
      body: JSON.stringify({ ...body, ...(forStaff ? { athlete_id: athleteId } : {}) }),
    });
    let json = null;
    try { json = await res.json(); } catch { /* non-JSON error page */ }
    return json || { ok: false, error: 'The server didn’t answer — try again.' };
  }, [athleteId, forStaff]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const connected = await load();
      if (cancelled || forStaff || !connected || connected.status === 'needs_attention') return;
      if (!connected.last_sync_at || Date.now() - new Date(connected.last_sync_at).getTime() > STALE_MS) {
        const r = await call('sync');
        if (!cancelled && r.ok && !r.skipped) load();
      }
    })();
    return () => { cancelled = true; };
  }, [load, call, forStaff]);

  const run = useCallback(async (fn) => {
    setBusy(true); setError(null);
    const r = await fn();
    if (!r.ok) setError(r.error || 'Something went wrong.');
    await load();
    setBusy(false);
    return r;
  }, [load]);

  return {
    available, loading, busy, error, status, daily, activities,
    connect: (apiKey, expiresOn) => run(() => call('connect', { apiKey, expiresOn })),
    syncNow: () => run(() => call('sync', { force: true })),
    disconnect: (deleteData = false) => run(() => call('disconnect', { deleteData })),
    diagnose: () => call('diagnose'),
  };
}
