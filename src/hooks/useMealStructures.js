import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

// Meal-block type metadata — same vocabulary as the athlete's own meal
// picker (MealCaptureSheet).
export const BLOCK_TYPES = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch',     label: 'Lunch' },
  { key: 'snack',     label: 'Snack' },
  { key: 'dinner',    label: 'Dinner' },
  { key: 'drink',     label: 'Drink' },
];

export const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export const DAY_LABELS = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' };

export function todayDayKey() {
  return DAY_KEYS[(new Date().getDay() + 6) % 7]; // Date#getDay: 0=Sun..6=Sat -> 0=Mon..6=Sun
}

// When more than one structure matches a day, highest priority wins;
// a tie keeps whichever sorts first (stable — earliest-created).
export function pickApplicableStructure(structures, dayKey = todayDayKey()) {
  const candidates = (structures || []).filter(s => s.all_days || (s.days || []).includes(dayKey));
  if (!candidates.length) return null;
  return [...candidates].sort((a, b) => b.priority - a.priority)[0];
}

const DEFAULT_STRUCTURE_PATCH = {
  name: '', all_days: true, days: [], priority: 2, blocks: [], general: '', hydration: '',
};

/**
 * useMealStructures — coach-facing CRUD over an athlete's full list of
 * meal structures (name, day-of-week targeting, priority, chronological
 * blocks). Multiple structures can coexist (e.g. a Training Day
 * structure and a separate Rest Day one) — pickApplicableStructure
 * resolves which one is "today's" for the athlete app.
 */
export function useMealStructures(athleteId) {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!athleteId) { setStructures([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('meal_structures')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('[useMealStructures] fetch failed', error);
      setStructures([]);
      setLoading(false);
      return;
    }
    setStructures(data || []);
    setLoading(false);
  }, [athleteId]);

  useEffect(() => { load(); }, [load]);

  const createStructure = useCallback(async (patch = {}) => {
    if (!athleteId) return { ok: false, error: new Error('No athlete id') };
    const row = { ...DEFAULT_STRUCTURE_PATCH, ...patch, athlete_id: athleteId };
    const { data, error } = await supabase.from('meal_structures').insert(row).select('*').single();
    if (error) {
      console.error('[useMealStructures] create failed', error);
      return { ok: false, error };
    }
    setStructures(prev => [...prev, data]);
    return { ok: true, structure: data };
  }, [athleteId]);

  const updateStructure = useCallback(async (id, patch) => {
    const prev = structures;
    setStructures(list => list.map(s => s.id === id ? { ...s, ...patch } : s));
    const { error } = await supabase
      .from('meal_structures')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      console.error('[useMealStructures] update failed', error);
      setStructures(prev);
      return { ok: false, error };
    }
    return { ok: true };
  }, [structures]);

  const deleteStructure = useCallback(async (id) => {
    const prev = structures;
    setStructures(list => list.filter(s => s.id !== id));
    const { error } = await supabase.from('meal_structures').delete().eq('id', id);
    if (error) {
      console.error('[useMealStructures] delete failed', error);
      setStructures(prev);
    }
  }, [structures]);

  return { structures, loading, createStructure, updateStructure, deleteStructure, refresh: load };
}

/**
 * useTodayMealStructure — athlete-app read-only view: fetches every
 * structure for this athlete (anon-SELECT, scoped by athlete_id) and
 * resolves which one applies today.
 */
export function useTodayMealStructure(athleteId) {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!athleteId) { setStructures([]); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('meal_structures')
        .select('*')
        .eq('athlete_id', athleteId);
      if (cancelled) return;
      if (error) {
        console.error('[useTodayMealStructure] fetch failed', error);
        setStructures([]);
        setLoading(false);
        return;
      }
      setStructures(data || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [athleteId]);

  const today = useMemo(() => pickApplicableStructure(structures), [structures]);
  const hasBlocks = !!today && (today.blocks || []).length > 0;
  const hasGuidanceContent = !!today && (
    String(today.general || '').trim()
    || String(today.hydration || '').trim()
    || (today.blocks || []).some(b => String(b.text || '').trim())
  );

  return { structures, today, loading, hasBlocks, hasGuidanceContent };
}
