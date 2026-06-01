import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useNutritionSettings — fetches (and lets the coach update) the
 * per-athlete meal-logging configuration. One row per athlete in
 * nutrition_settings; "no row" is interpreted as disabled, with
 * require_photo defaulting to true so a future enable doesn't
 * accidentally accept text-only meal entries.
 *
 *   settings:    { meal_logging_enabled, require_photo } | null while loading
 *   loading:     boolean
 *   updating:    boolean  (true while a save is in flight)
 *   update(patch) — upserts the patch; optimistic.
 *   refresh()    — re-fetches from the server.
 */
export function useNutritionSettings(athleteId) {
  const [settings, setSettings] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);
  const [tick,     setTick]     = useState(0);

  useEffect(() => {
    if (!athleteId) {
      setLoading(false);
      setSettings({ meal_logging_enabled: false, require_photo: true });
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('nutrition_settings')
        .select('meal_logging_enabled, require_photo')
        .eq('athlete_id', athleteId)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error('[useNutritionSettings] fetch failed', error);
      }
      // Default = disabled / photo required. Matches the brief's
      // "if no row exists, treat it as disabled" rule.
      setSettings(data || { meal_logging_enabled: false, require_photo: true });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [athleteId, tick]);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  const update = useCallback(async (patch) => {
    if (!athleteId) return { ok: false, error: new Error('No athlete id') };
    // Optimistic — flip the UI immediately, roll back on failure.
    const prev = settings;
    setSettings(s => ({ ...(s || {}), ...patch }));
    setUpdating(true);
    const payload = {
      athlete_id: athleteId,
      meal_logging_enabled: settings?.meal_logging_enabled ?? false,
      require_photo:        settings?.require_photo        ?? true,
      ...patch,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('nutrition_settings')
      .upsert(payload, { onConflict: 'athlete_id' });
    setUpdating(false);
    if (error) {
      console.error('[useNutritionSettings] update failed', error);
      setSettings(prev);
      return { ok: false, error };
    }
    return { ok: true };
  }, [athleteId, settings]);

  return { settings, loading, updating, update, refresh };
}
