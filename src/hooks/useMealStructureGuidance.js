import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useMealStructureGuidance — one row per athlete carrying the
 * nutritionist's recommended-plate text. Sections are optional so
 * the editor can render the same shape as the athlete viewer.
 *
 *   content: {
 *     general:    "...",
 *     breakfast:  "...",
 *     lunch:      "...",
 *     snack:      "...",
 *     dinner:     "...",
 *     hydration:  "...",
 *   }
 *
 *   { content, loading, saving, save(patch) }
 */
const EMPTY = { general: '', breakfast: '', lunch: '', snack: '', dinner: '', hydration: '' };

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
      setContent({ ...EMPTY, ...(data?.content || {}) });
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

  // Convenience for the athlete view — true if anything is filled in.
  const isEmpty = !Object.values(content).some(v => String(v || '').trim());

  return { content, loading, saving, save, isEmpty };
}

// Section metadata — drives both editor and viewer ordering / labels.
export const GUIDANCE_SECTIONS = [
  { key: 'general',   label: 'Overall guidance',  hint: 'General principles, energy intake, what to prioritise.' },
  { key: 'breakfast', label: 'Breakfast',         hint: 'Recommended structure — protein, carbs, fats.' },
  { key: 'lunch',     label: 'Lunch',             hint: 'Recommended structure — protein, carbs, fats.' },
  { key: 'snack',     label: 'Snacks',            hint: 'When and what to snack on between meals.' },
  { key: 'dinner',    label: 'Dinner',            hint: 'Recommended structure — protein, carbs, fats.' },
  { key: 'hydration', label: 'Hydration',         hint: 'Daily fluid targets, electrolyte timing, around training.' },
];
