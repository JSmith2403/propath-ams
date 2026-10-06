import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Count of athlete messages no coach has opened yet — drives the badge on the
 * Messages nav item. Re-checks on focus and every minute. Returns 0 (rather
 * than erroring) if the messaging v2 migration hasn't been run.
 */
export function useStaffUnread(enabled = true) {
  const [count, setCount] = useState(0);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    supabase
      .from('athlete_messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_type', 'athlete')
      .is('read_at', null)
      .then(({ count: c, error }) => {
        if (!cancelled) setCount(error ? 0 : (c || 0));
      });
    return () => { cancelled = true; };
  }, [enabled, tick]);

  useEffect(() => {
    if (!enabled) return;
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(onVisible, 60_000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(timer);
    };
  }, [enabled, refresh]);

  return { count, refresh };
}
