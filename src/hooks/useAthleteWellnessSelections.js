import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const FEATURED_MAX = 5;

/**
 * Per-athlete wellness state. Two flags per question:
 *
 *   selected  — appears in the athlete's daily check-in (no cap)
 *   featured  — appears on the roster card (max 5 per athlete)
 *
 * Both backed by the `athlete_wellness_questions` junction:
 *   row exists  → selected
 *   is_featured → featured
 *
 * Mutations are optimistic; rollback on error.
 */
export function useAthleteWellnessSelections(athleteId) {
  const [selectedIds,  setSelected]  = useState(() => new Set());
  const [featuredIds,  setFeatured]  = useState(() => new Set());
  const [loading,      setLoading]   = useState(true);

  useEffect(() => {
    if (!athleteId) {
      setSelected(new Set()); setFeatured(new Set()); setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('athlete_wellness_questions')
        .select('question_id, is_featured')
        .eq('athlete_id', athleteId);
      if (cancelled) return;
      if (error) console.error('[selections] fetch failed', error);
      const sel = new Set(), feat = new Set();
      for (const r of (data || [])) {
        sel.add(r.question_id);
        if (r.is_featured) feat.add(r.question_id);
      }
      setSelected(sel);
      setFeatured(feat);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [athleteId]);

  // Tick / untick — toggles whether the question goes to the
  // athlete app at all. Unticking also unfeatures.
  const toggle = useCallback(async (questionId) => {
    if (!athleteId) return;
    const wasSelected = selectedIds.has(questionId);

    setSelected(prev => {
      const next = new Set(prev);
      if (wasSelected) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
    if (wasSelected) {
      // also drop featured if it was featured
      setFeatured(prev => {
        if (!prev.has(questionId)) return prev;
        const next = new Set(prev); next.delete(questionId); return next;
      });
    }

    if (wasSelected) {
      const { error } = await supabase
        .from('athlete_wellness_questions')
        .delete()
        .eq('athlete_id', athleteId)
        .eq('question_id', questionId);
      if (error) {
        console.error('[selections] delete failed', error);
        setSelected(prev => { const n = new Set(prev); n.add(questionId); return n; });
        alert('Failed to remove selection: ' + error.message);
      }
    } else {
      const { error } = await supabase
        .from('athlete_wellness_questions')
        .insert({ athlete_id: athleteId, question_id: questionId, is_featured: false });
      if (error) {
        console.error('[selections] insert failed', error);
        setSelected(prev => { const n = new Set(prev); n.delete(questionId); return n; });
        alert('Failed to add selection: ' + error.message);
      }
    }
  }, [athleteId, selectedIds]);

  // Toggle featured-on-roster. Requires the question to already be
  // selected. Caps the total featured at FEATURED_MAX.
  const toggleFeatured = useCallback(async (questionId) => {
    if (!athleteId) return;
    if (!selectedIds.has(questionId)) {
      alert('Tick the question first to send it to the athlete, then star it for the roster.');
      return;
    }
    const wasFeatured = featuredIds.has(questionId);
    if (!wasFeatured && featuredIds.size >= FEATURED_MAX) {
      alert(`Maximum ${FEATURED_MAX} questions can appear on the roster. Unstar another first.`);
      return;
    }

    setFeatured(prev => {
      const next = new Set(prev);
      if (wasFeatured) next.delete(questionId);
      else next.add(questionId);
      return next;
    });

    const { error } = await supabase
      .from('athlete_wellness_questions')
      .update({ is_featured: !wasFeatured })
      .eq('athlete_id', athleteId)
      .eq('question_id', questionId);

    if (error) {
      console.error('[selections] feature toggle failed', error);
      setFeatured(prev => {
        const next = new Set(prev);
        if (wasFeatured) next.add(questionId);
        else next.delete(questionId);
        return next;
      });
      alert('Failed to update roster status: ' + error.message);
    }
  }, [athleteId, selectedIds, featuredIds]);

  return {
    selectedIds, featuredIds,
    featuredMax: FEATURED_MAX,
    loading,
    toggle,
    toggleFeatured,
  };
}
