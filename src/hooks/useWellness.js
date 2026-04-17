import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Manages wellness token + submissions for a single athlete.
 * Submissions now store { question_id: value } pairs in the responses jsonb column.
 */
export function useWellness(athleteId) {
  const [tokenData, setTokenData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchToken = useCallback(async () => {
    if (!athleteId) return;
    const { data } = await supabase
      .from('wellness_tokens')
      .select('id, token, is_active')
      .eq('athlete_id', athleteId)
      .maybeSingle();
    setTokenData(data || null);
  }, [athleteId]);

  const fetchSubmissions = useCallback(async () => {
    if (!athleteId) return;
    const { data } = await supabase
      .from('wellness_submissions')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('submission_date', { ascending: true });
    setSubmissions(data || []);
  }, [athleteId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await Promise.all([fetchToken(), fetchSubmissions()]);
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [fetchToken, fetchSubmissions]);

  const activateWellness = useCallback(async () => {
    try {
      if (tokenData) {
        const { error } = await supabase
          .from('wellness_tokens')
          .update({ is_active: true })
          .eq('id', tokenData.id);
        if (error) throw error;
      } else {
        const newToken = crypto.randomUUID();
        const { error } = await supabase
          .from('wellness_tokens')
          .insert({ athlete_id: athleteId, token: newToken, is_active: true });
        if (error) throw error;
      }
      await fetchToken();
    } catch (err) {
      console.error('[Wellness] activate failed:', err);
      alert('Failed to activate wellness tracking: ' + (err.message || err));
    }
  }, [athleteId, tokenData, fetchToken]);

  const deactivateWellness = useCallback(async () => {
    if (!tokenData) return;
    const { error } = await supabase
      .from('wellness_tokens')
      .update({ is_active: false })
      .eq('id', tokenData.id);
    if (error) console.error('[Wellness] deactivate error:', error);
    await fetchToken();
  }, [tokenData, fetchToken]);

  const refreshSubmissions = useCallback(async () => {
    await fetchSubmissions();
  }, [fetchSubmissions]);

  return {
    tokenData,
    submissions,
    loading,
    activateWellness,
    deactivateWellness,
    refreshSubmissions,
  };
}
