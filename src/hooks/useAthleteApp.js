import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const UNIQUE_VIOLATION = '23505';

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

  // Guards against a double-click (or any other near-simultaneous double
  // call) firing two inserts for the same brand-new athlete — the first
  // succeeds, the second used to hit athlete_app_tokens' unique
  // athlete_id constraint and surface as a raw alert().
  const activating = useRef(false);
  const [submitting, setSubmitting] = useState(false);

  const activate = useCallback(async () => {
    if (activating.current) return;
    activating.current = true;
    setSubmitting(true);
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
        // A row already exists for this athlete (the guard above still
        // leaves a window for a genuinely concurrent request, e.g. two
        // browser tabs) — fall back to reactivating it instead of
        // failing, since the desired end state is the same either way.
        if (error && error.code === UNIQUE_VIOLATION) {
          const { error: updErr } = await supabase
            .from('athlete_app_tokens')
            .update({ is_active: true })
            .eq('athlete_id', athleteId);
          if (updErr) throw updErr;
        } else if (error) {
          throw error;
        }
      }
      await ensureWellnessToken(true);
      await fetchToken();
    } catch (err) {
      console.error('[AthleteApp] activate failed:', err);
      alert('Failed to activate athlete app: ' + (err.message || err));
    } finally {
      activating.current = false;
      setSubmitting(false);
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

  return { tokenData, loading, submitting, activate, deactivate };
}
