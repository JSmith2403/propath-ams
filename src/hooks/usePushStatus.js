import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

async function authed(action, payload = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`/api/push/${action}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}) },
    body: JSON.stringify(payload),
  });
  try { return await res.json(); } catch { return { ok: false, error: `Server error (${res.status}).` }; }
}

/**
 * usePushStatus — coach-side: which athletes have at least one device that can
 * receive notifications ({ [athleteId]: deviceCount }). An athlete who isn't in
 * the map simply won't get a lock-screen alert until they turn notifications on.
 */
export function usePushStatus(enabled = true) {
  const [state, setState] = useState({ devices: {}, loaded: false, pushConfigured: true });
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    authed('push-status').then(r => {
      if (cancelled) return;
      if (r.ok) setState({ devices: r.devices || {}, loaded: true, pushConfigured: r.pushConfigured !== false });
      else setState(s => ({ ...s, loaded: true }));
    });
    return () => { cancelled = true; };
  }, [enabled, tick]);

  return { ...state, refresh };
}

/** Sends a real test notification to an athlete's devices. */
export function sendTestPush(athleteId) {
  return authed('push-test', { athlete_id: athleteId });
}
