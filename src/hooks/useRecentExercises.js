import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'propath:recent-exercises:v1';
const MAX_RECENT = 5;

/**
 * Tracks the last few exercise IDs the coach added via the picker, so
 * the Recent section in the picker can surface frequent picks.
 *
 * Storage shape: an array of { id, ts } sorted by ts DESC. id is the
 * exercise_library row id; ts is millisecond epoch.
 *
 * Per-coach scoping: this is browser-local so each device has its own
 * recent list. That matches the brief and avoids any cross-coach
 * leakage on shared kiosks.
 */
export function useRecentExercises() {
  const [recent, setRecent] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('[RecentExercises] read failed', e);
      return [];
    }
  });

  // Persist on every change.
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(recent)); }
    catch (e) { console.warn('[RecentExercises] write failed', e); }
  }, [recent]);

  const recordAdd = useCallback((exerciseId) => {
    if (!exerciseId) return;
    setRecent(prev => {
      const filtered = prev.filter(r => r.id !== exerciseId);
      return [{ id: exerciseId, ts: Date.now() }, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  const clear = useCallback(() => setRecent([]), []);

  return { recent, recordAdd, clear };
}
