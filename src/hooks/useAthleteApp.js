import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Coach-side hook for managing an athlete's permanent app token.
 * Used by the activation panel on the Overview tab.
 *
 * The token mints the public /athlete/:token URL. One token per
 * athlete (unique), no expiry — coaches toggle is_active to revoke.
 */
export function useAthleteApp(athleteId) {
  const [tokenData, setTokenData] = useState(null); // { id, token, is_active } | null
  const [loading,   setLoading]   = useState(true);

  const fetchToken = useCallback(async () => {
    if (!athleteId) return;
    const { data } = await supabase
      .from('athlete_app_tokens')
      .select('id, token, is_active')
      .eq('athlete_id', athleteId)
      .maybeSingle();
    setTokenData(data || null);
  }, [athleteId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await fetchToken();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [fetchToken]);

  // Wellness rides along with the app token — when the coach activates
  // the app we auto-create or reactivate the athlete's wellness_token,
  // so they never have to manage two switches.
  const ensureWellnessToken = useCallback(async (active) => {
    const { data: existing } = await supabase
      .from('wellness_tokens')
      .select('id, is_active')
      .eq('athlete_id', athleteId)
      .maybeSingle();

    if (existing) {
      if (existing.is_active !== active) {
        await supabase
          .from('wellness_tokens')
          .update({ is_active: active })
          .eq('id', existing.id);
      }
    } else if (active) {
      await supabase
        .from('wellness_tokens')
        .insert({ athlete_id: athleteId, token: crypto.randomUUID(), is_active: true });
    }
  }, [athleteId]);

  const activate = useCallback(async () => {
    try {
      if (tokenData) {
        const { error } = await supabase
          .from('athlete_app_tokens')
          .update({ is_active: true })
          .eq('id', tokenData.id);
        if (error) throw error;
      } else {
        const newToken = crypto.randomUUID();
        const { error } = await supabase
          .from('athlete_app_tokens')
          .insert({ athlete_id: athleteId, token: newToken, is_active: true });
        if (error) throw error;
      }
      await ensureWellnessToken(true);
      await fetchToken();
    } catch (err) {
      console.error('[AthleteApp] activate failed:', err);
      alert('Failed to activate athlete app: ' + (err.message || err));
    }
  }, [athleteId, tokenData, fetchToken, ensureWellnessToken]);

  const deactivate = useCallback(async () => {
    if (!tokenData) return;
    const { error } = await supabase
      .from('athlete_app_tokens')
      .update({ is_active: false })
      .eq('id', tokenData.id);
    if (error) console.error('[AthleteApp] deactivate error:', error);
    await ensureWellnessToken(false);
    await fetchToken();
  }, [tokenData, fetchToken, ensureWellnessToken]);

  return { tokenData, loading, activate, deactivate };
}
