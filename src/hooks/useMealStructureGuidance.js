import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useMealStructureGuidance — one row per athlete carrying the
 * nutritionist's recommended-plate text, as a chronological sequence
 * of meal blocks (the coach adds +Breakfast, +Snack, +Lunch, +Snack…
 * in whatever order the athlete's day actually runs) bracketed by a
 * general-guidance note and a hydration note.
 *
 *   content: {
 *     general:    "...",
 *     blocks:     [{ id, type: 'breakfast'|'lunch'|'dinner'|'snack'|'drink', text }],
 *     hydration:  "...",
 *   }
 *
 *   { content, loading, saving, save(patch), isEmpty }
 */
const EMPTY = { general: '', blocks: [], hydration: '' };

// Legacy shape (pre chronological-blocks) had one fixed string field
// per meal type instead of an ordered array — lazily upgraded on read
// so existing coach-written guidance isn't lost. Re-saves in the new
// shape the next time the coach edits anything.
function normalizeContent(raw) {
  if (!raw) return { ...EMPTY };
  if (Array.isArray(raw.blocks)) {
    return { general: raw.general || '', hydration: raw.hydration || '', blocks: raw.blocks };
  }
  const blocks = [];
  ['breakfast', 'lunch', 'snack', 'dinner'].forEach(type => {
    const text = String(raw[type] || '').trim();
    if (text) blocks.push({ id: crypto.randomUUID(), type, text });
  });
  return { general: raw.general || '', hydration: raw.hydration || '', blocks };
}

export function useMealStructureGuidance(athleteId) {
  const [content, setContent] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    if (!athleteId) { setContent(EMPTY); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('meal_structure_guidance')
        .select('content')
        .eq('athlete_id', athleteId)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error('[useMealStructureGuidance] fetch failed', error);
      }
      setContent(normalizeContent(data?.content));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [athleteId]);

  const save = useCallback(async (patch) => {
    if (!athleteId) return { ok: false, error: new Error('No athlete id') };
    const next = { ...content, ...patch };
    setContent(next);
    setSaving(true);
    const { error } = await supabase
      .from('meal_structure_guidance')
      .upsert(
        { athlete_id: athleteId, content: next, updated_at: new Date().toISOString() },
        { onConflict: 'athlete_id' },
      );
    setSaving(false);
    if (error) {
      console.error('[useMealStructureGuidance] save failed', error);
      return { ok: false, error };
    }
    return { ok: true };
  }, [athleteId, content]);

  const isEmpty = !content.general.trim()
    && !content.hydration.trim()
    && content.blocks.every(b => !String(b.text || '').trim());

  return { content, loading, saving, save, isEmpty };
}

// Meal-block type metadata — same vocabulary as the athlete's own meal
// picker (MealCaptureSheet) so "Breakfast" means the same thing on
// both sides. Icons are looked up locally per-component (editor vs
// viewer) rather than imported here, matching how FoodDiaryView /
// MealCaptureSheet keep their own icon maps.
export const BLOCK_TYPES = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch',     label: 'Lunch' },
  { key: 'snack',     label: 'Snack' },
  { key: 'dinner',    label: 'Dinner' },
  { key: 'drink',     label: 'Drink' },
];
