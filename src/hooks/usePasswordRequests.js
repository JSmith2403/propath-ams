import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Number of athletes waiting on a password reset ("Forgot your password?") —
 * drives the red badge on User Management. Checks on load, on focus and every
 * minute. Quietly returns 0 if the API/table isn't available.
 */
export function usePasswordRequests(enabled = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch('/api/athlete-auth/accounts', {
          method: 'POST',
          headers: { 'content-type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ action: 'pending-count' }),
        });
        const json = await res.json();
        if (!cancelled) setCount(json.ok ? json.count : 0);
      } catch (_) { /* offline / dev server without the API */ }
    };
    check();
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVisible);
    const t = setInterval(onVisible, 60_000);
    return () => { cancelled = true; document.removeEventListener('visibilitychange', onVisible); clearInterval(t); };
  }, [enabled]);

  return count;
}
