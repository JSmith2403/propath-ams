import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Count of messages a coach hasn't opened yet — athlete replies in the shared
 * team threads PLUS unread group/private chat messages. Drives the badge on the
 * Messages nav item. Re-checks on focus and every minute. Each part falls back
 * to 0 (rather than erroring) if its migration hasn't been run.
 */
export function useStaffUnread(enabled = true) {
  const [count, setCount] = useState(0);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    Promise.all([
      supabase.from('athlete_messages').select('id', { count: 'exact', head: true })
        .eq('sender_type', 'athlete').is('read_at', null),
      supabase.rpc('my_chat_unread'),
    ]).then(([team, chats]) => {
      if (cancelled) return;
      const t = team.error ? 0 : (team.count || 0);
      const c = chats.error || typeof chats.data !== 'number' ? 0 : chats.data;
      setCount(t + c);
    });
    return () => { cancelled = true; };
  }, [enabled, tick]);

  useEffect(() => {
    if (!enabled) return undefined;
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
