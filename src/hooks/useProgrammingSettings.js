import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Manages programming_settings for a single athlete.
 * Used by ProgrammeView (Physical Development → Programme sub-tab).
 *
 * On first interaction with the toggle, creates a row in programming_settings
 * for the athlete if none exists. Mirrors the wellness activation pattern.
 */
export function useProgrammingSettings(athleteId) {
  const [settings, setSettings] = useState(null); // { id, programming_active } | null
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchSettings = useCallback(async () => {
    if (!athleteId) { setSettings(null); return; }
    const { data, error: e } = await supabase
      .from('programming_settings')
      .select('id, programming_active')
      .eq('athlete_id', athleteId)
      .maybeSingle();
    if (e) setError(e); else setSettings(data || null);
  }, [athleteId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await fetchSettings();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [fetchSettings]);

  const setActive = useCallback(async (active) => {
    if (!athleteId) return;
    try {
      if (settings) {
        const { error: e } = await supabase
          .from('programming_settings')
          .update({ programming_active: active })
          .eq('id', settings.id);
        if (e) throw e;
      } else {
        const { error: e } = await supabase
          .from('programming_settings')
          .insert({ athlete_id: athleteId, programming_active: active });
        if (e) throw e;
      }
      await fetchSettings();
    } catch (err) {
      console.error('[Programming] setActive failed:', err);
      alert('Failed to update programming setting: ' + (err.message || err));
    }
  }, [athleteId, settings, fetchSettings]);

  return {
    isActive: !!settings?.programming_active,
    loading,
    error,
    setActive,
    refresh: fetchSettings,
  };
}
