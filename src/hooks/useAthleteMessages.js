import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useAthleteMessages — the athlete's conversation with the coaching team.
 * Coach messages arrive via /api/push/message; the athlete's own replies go
 * out through /api/push/reply (server-side, so the sender can't be spoofed
 * and every message lands in the permanent safeguarding record).
 *
 * Oldest first (chat order). `unreadCount` counts COACH messages the athlete
 * hasn't opened. Re-checks when the app returns to the foreground and every
 * minute; the open chat polls faster (see InboxSheet).
 *
 * Degrades quietly to an empty inbox if athlete_messages doesn't exist yet.
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
        .select('id, title, body, sent_by, created_at, read_at, sender_type')
        .eq('athlete_id', athleteId)
        .order('created_at', { ascending: false })
        .limit(100);
      if (cancelled) return;
      if (error) {
        console.warn('[useAthleteMessages] fetch failed', error.message);
        setMessages([]);
      } else {
        // sender_type may not exist if the v2 migration hasn't run — treat as coach.
        setMessages((data || []).map(m => ({ ...m, sender_type: m.sender_type || 'coach' })).reverse());
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

  const unreadCount = useMemo(
    () => messages.filter(m => m.sender_type === 'coach' && !m.read_at).length,
    [messages]
  );

  const markRead = useCallback(async (ids) => {
    const unread = (ids || []).filter(id => messages.find(m => m.id === id && m.sender_type === 'coach' && !m.read_at));
    if (!unread.length) return;
    const now = new Date().toISOString();
    setMessages(prev => prev.map(m => (unread.includes(m.id) ? { ...m, read_at: now } : m)));
    const { error } = await supabase
      .from('athlete_messages')
      .update({ read_at: now })
      .in('id', unread);
    if (error) console.warn('[useAthleteMessages] markRead failed', error.message);
  }, [messages]);

  /** Sends a reply. Resolves { ok, error? }. */
  const sendReply = useCallback(async (text) => {
    const body = String(text || '').trim();
    if (!body) return { ok: false, error: 'Write a message first.' };
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/push/reply', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ body }),
      });
      const json = await res.json().catch(() => ({ ok: false, error: `Server error (${res.status}).` }));
      if (!json.ok) return { ok: false, error: json.error || 'Couldn\'t send — try again.' };
      setMessages(prev => (prev.some(m => m.id === json.message.id) ? prev : [...prev, json.message]));
      return { ok: true };
    } catch (_) {
      return { ok: false, error: 'Couldn\'t reach the server — check your connection.' };
    }
  }, []);

  return { messages, loading, unreadCount, markRead, sendReply, refresh };
}
