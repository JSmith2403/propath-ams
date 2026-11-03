import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useGarmin — an athlete's Garmin connection status, daily summaries and activities.
 *
 *   forStaff: a coach viewing an athlete (passes their id to the status function). Athletes
 *             always see only their own data — the database enforces that, not this hook.
 *
 * `available` is false when the Garmin SQL hasn't been run or the viewer has no login that can
 * read it — the UI then hides itself.
 *
 * Garmin pushes data to the server as the athlete's watch syncs (Starter access has no pull),
 * so there's no "update now": this just re-reads the tables. connect() asks the server for a
 * Garmin sign-in address and the page navigates there; Garmin sends the athlete back afterwards.
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
    if (row) {
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

  useEffect(() => { load(); }, [load]);

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
    refresh: load,
    /** Athletes only. Sends the browser to Garmin's own sign-in page. */
    connect: async () => {
      setBusy(true); setError(null);
      const r = await call('start');
      if (r.ok && r.url) { window.location.assign(r.url); return r; }     // leaves the app; busy stays on until the page unloads
      setError(r.error || 'Couldn’t start the Garmin sign-in.');
      setBusy(false);
      return r;
    },
    disconnect: (deleteData = false) => run(() => call('disconnect', { deleteData })),
  };
}
