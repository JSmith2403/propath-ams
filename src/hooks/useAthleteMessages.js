import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useAthleteMessages — the athlete's inbox (coach messages sent via
 * /api/messages/send). Newest first, with unread count and markRead.
 * Re-checks when the app returns to the foreground and every minute, so a
 * message that arrives while the app is open shows up without a reload.
 *
 * Degrades quietly to an empty inbox if athlete_messages doesn't exist yet
 * (sql/messaging_and_attendance_2026-10-06.sql not run).
 */
export function useAthleteMessages(athleteId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!athleteId) { setMessages([]); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('athlete_messages')
        .select('id, title, body, sent_by, created_at, read_at')
        .eq('athlete_id', athleteId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (cancelled) return;
      if (error) {
        console.warn('[useAthleteMessages] fetch failed', error.message);
        setMessages([]);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [athleteId, tick]);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(onVisible, 60_000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(timer);
    };
  }, [refresh]);

  const unreadCount = useMemo(() => messages.filter(m => !m.read_at).length, [messages]);

  const markRead = useCallback(async (ids) => {
    const unread = (ids || []).filter(id => messages.find(m => m.id === id && !m.read_at));
    if (!unread.length) return;
    const now = new Date().toISOString();
    setMessages(prev => prev.map(m => (unread.includes(m.id) ? { ...m, read_at: now } : m)));
    const { error } = await supabase
      .from('athlete_messages')
      .update({ read_at: now })
      .in('id', unread);
    if (error) console.warn('[useAthleteMessages] markRead failed', error.message);
  }, [messages]);

  return { messages, loading, unreadCount, markRead, refresh };
}
