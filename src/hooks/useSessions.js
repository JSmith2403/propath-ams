import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

async function persistSession(session) {
  const { error } = await supabase
    .from('sessions')
    .upsert({ id: session.id, data: session, updated_at: new Date().toISOString() });
  if (error) console.error('[ProPath] Failed to save session', session.id, error);
}

export function useSessions() {
  const [sessions, setSessions] = useState([]);

  // ── Initial load + real-time subscription ───────────────────
  useEffect(() => {
    let isMounted = true;

    supabase.from('sessions').select('id, data').then(({ data, error }) => {
      if (!isMounted) return;
      if (error) { console.error('[ProPath] Failed to load sessions', error); return; }
      setSessions((data || []).map(row => row.data));
    });

    const channel = supabase
      .channel('sessions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        payload => {
          if (!isMounted) return;
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const incoming = payload.new.data;
            setSessions(prev => {
              const exists = prev.some(s => s.id === incoming.id);
              return exists
                ? prev.map(s => s.id === incoming.id ? incoming : s)
                : [incoming, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            setSessions(prev => prev.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Mutations ────────────────────────────────────────────────
  const createSession = useCallback(({ date, label, athleteIds, metricKeys, customMetrics = {} }) => {
    const id = uid();
    const session = {
      id, date, label: label || '',
      athleteIds, metricKeys,
      metricOrder: [...metricKeys],
      customMetrics, data: {},
      savedAt: null,
      createdAt: new Date().toISOString(),
    };
    setSessions(prev => [session, ...prev]);
    persistSession(session);
    return session;
  }, []);

  const upsertSession = useCallback(session => {
    setSessions(prev => {
      const exists = prev.some(s => s.id === session.id);
      const next = exists
        ? prev.map(s => s.id === session.id ? session : s)
        : [session, ...prev];
      persistSession(session);
      return next;
    });
  }, []);

  const markSaved = useCallback(id => {
    setSessions(prev => {
      const next = prev.map(s =>
        s.id === id ? { ...s, savedAt: new Date().toISOString() } : s
      );
      const updated = next.find(s => s.id === id);
      if (updated) persistSession(updated);
      return next;
    });
  }, []);

  const getSession = useCallback(id => sessions.find(s => s.id === id) ?? null, [sessions]);

  const deleteSession = useCallback(async id => {
    setSessions(prev => prev.filter(s => s.id !== id));
    const { error } = await supabase.from('sessions').delete().eq('id', id);
    if (error) console.error('[ProPath] Failed to delete session', id, error);
  }, []);

  return { sessions, createSession, upsertSession, markSaved, getSession, deleteSession };
}
