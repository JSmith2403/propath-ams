import { useState, useCallback } from 'react';

const STORAGE_KEY = 'propath_sessions';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function persist(sessions) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); } catch {}
}

export function useSessions() {
  const [sessions, setSessions] = useState(load);

  const mutate = useCallback(updater => {
    setSessions(prev => {
      const next = updater(prev);
      persist(next);
      return next;
    });
  }, []);

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
    mutate(prev => [session, ...prev]);
    return session;
  }, [mutate]);

  const upsertSession = useCallback(session => {
    mutate(prev => {
      const exists = prev.some(s => s.id === session.id);
      return exists ? prev.map(s => s.id === session.id ? session : s) : [session, ...prev];
    });
  }, [mutate]);

  const markSaved = useCallback(id => {
    mutate(prev => prev.map(s => s.id === id ? { ...s, savedAt: new Date().toISOString() } : s));
  }, [mutate]);

  const getSession  = useCallback(id => sessions.find(s => s.id === id) ?? null, [sessions]);

  const deleteSession = useCallback(id => {
    mutate(prev => prev.filter(s => s.id !== id));
  }, [mutate]);

  return { sessions, createSession, upsertSession, markSaved, getSession, deleteSession };
}
