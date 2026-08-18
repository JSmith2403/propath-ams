import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Single-athlete wellness hook for the coach side.
 *
 * Reads from the new model:
 *   - wellness_question_library  (global question catalogue)
 *   - athlete_wellness_questions (per-athlete selections + featured)
 *   - wellness_responses         (jsonb keyed by question_id)
 *   - wellness_tokens            (whether the athlete app accepts wellness)
 *
 * Returns the athlete's selected questions, every submission they've
 * made (oldest first), and a refresh callback.
 */
export function useWellness(athleteId) {
  const [tokenData,    setTokenData]    = useState(null);   // { id, token, is_active } | null
  const [questions,    setQuestions]    = useState([]);     // selected library rows for this athlete
  const [featuredIds,  setFeaturedIds]  = useState(new Set());
  const [submissions,  setSubmissions]  = useState([]);     // wellness_responses rows
  const [loading,      setLoading]      = useState(true);

  const fetchAll = useCallback(async () => {
    if (!athleteId) {
      setTokenData(null); setQuestions([]); setFeaturedIds(new Set()); setSubmissions([]);
      return;
    }
    const [
      { data: token },
      { data: selections },
      { data: library },
      { data: responses },
    ] = await Promise.all([
      supabase.from('wellness_tokens')
        .select('id, token, is_active').eq('athlete_id', athleteId).maybeSingle(),
      supabase.from('athlete_wellness_questions')
        .select('question_id, is_featured').eq('athlete_id', athleteId),
      supabase.from('wellness_question_library')
        .select('*').eq('is_active', true).order('display_order', { ascending: true }),
      supabase.from('wellness_responses')
        .select('*').eq('athlete_id', athleteId)
        .order('submission_date', { ascending: true }),
    ]);

    const libById = Object.fromEntries((library || []).map(q => [q.id, q]));
    const selIds  = new Set((selections || []).map(s => s.question_id));
    const feat    = new Set((selections || []).filter(s => s.is_featured).map(s => s.question_id));
    const qs      = (library || []).filter(q => selIds.has(q.id)); // already in display_order

    setTokenData(token || null);
    setQuestions(qs);
    setFeaturedIds(feat);
    setSubmissions(responses || []);
  }, [athleteId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await fetchAll();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [fetchAll]);

  // Coach retrospective note attached to a specific submission day.
  // Optimistic local update so the tooltip/popover feels instant.
  const saveCoachNote = useCallback(async (submissionId, note) => {
    const clean = (note ?? '').trim() || null;
    setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, coach_notes: clean } : s));
    const { error } = await supabase.from('wellness_responses')
      .update({ coach_notes: clean }).eq('id', submissionId);
    if (error) {
      console.error('[Wellness] save coach note failed:', error);
      await fetchAll(); // revert
      throw error;
    }
  }, [fetchAll]);

  return {
    tokenData,
    questions,
    featuredIds,
    submissions,
    loading,
    refresh: fetchAll,
    saveCoachNote,
  };
}
