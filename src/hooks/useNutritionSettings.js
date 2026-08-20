import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useNutritionSettings — fetches (and lets the coach update) the
 * per-athlete meal-logging configuration. One row per athlete in
 * nutrition_settings; "no row" is interpreted as disabled, with
 * require_photo defaulting to true so a future enable doesn't
 * accidentally accept text-only meal entries.
 *
 *   settings:    { meal_logging_enabled, require_photo, water_daily_target } | null while loading
 *   loading:     boolean
 *   updating:    boolean  (true while a save is in flight)
 *   update(patch) — upserts the patch; optimistic. authenticated-only
 *                    at the RLS level (coach-side toggles).
 *   updateWaterTarget(n) — sets water_daily_target via a narrow
 *                    SECURITY DEFINER RPC so the anon-role athlete app
 *                    can change it without a blanket write grant on
 *                    the coach-controlled columns.
 *   refresh()    — re-fetches from the server.
 */
const DEFAULT_SETTINGS = { meal_logging_enabled: false, require_photo: true, water_daily_target: 6 };

export function useNutritionSettings(athleteId) {
  const [settings, setSettings] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);
  const [tick,     setTick]     = useState(0);

  useEffect(() => {
    if (!athleteId) {
      setLoading(false);
      setSettings(DEFAULT_SETTINGS);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('nutrition_settings')
        .select('meal_logging_enabled, require_photo, water_daily_target')
        .eq('athlete_id', athleteId)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error('[useNutritionSettings] fetch failed', error);
      }
      // Default = disabled / photo required. Matches the brief's
      // "if no row exists, treat it as disabled" rule.
      setSettings(data || DEFAULT_SETTINGS);
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
      water_daily_target:   settings?.water_daily_target    ?? 6,
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

  const updateWaterTarget = useCallback(async (n) => {
    if (!athleteId) return { ok: false, error: new Error('No athlete id') };
    const prev = settings;
    setSettings(s => ({ ...(s || {}), water_daily_target: n }));
    const { error } = await supabase.rpc('set_water_daily_target', { p_athlete_id: athleteId, p_target: n });
    if (error) {
      console.error('[useNutritionSettings] updateWaterTarget failed', error);
      setSettings(prev);
      return { ok: false, error };
    }
    return { ok: true };
  }, [athleteId, settings]);

  return { settings, loading, updating, update, updateWaterTarget, refresh };
}
