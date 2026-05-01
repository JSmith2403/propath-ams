import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Batch-fetch wellness state for the roster cards under the new
 * library + selections + responses model.
 *
 * Per athlete, returns:
 *   - isActive          : their wellness_tokens.is_active
 *   - latestDate        : most-recent submission date (or null)
 *   - latestResponses   : jsonb keyed by question_id (or null)
 *   - questions         : up to 5 selected library questions to show
 *                         as rings on the roster card. Empty when no
 *                         selections exist.
 *
 * The roster card consumer pairs each ring's value via
 * `latestResponses[question.id]` and resolves the colour with
 * `getRagColour(value, question)` from utils/wellnessRag.
 */
export function useWellnessRoster(athleteIds) {
  const [wellnessMap, setWellnessMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!athleteIds || athleteIds.length === 0) {
      setWellnessMap({});
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);

      const [
        { data: tokens },
        { data: responses },
        { data: selections },
        { data: library },
      ] = await Promise.all([
        supabase.from('wellness_tokens')
          .select('athlete_id, is_active')
          .in('athlete_id', athleteIds),
        supabase.from('wellness_responses')
          .select('athlete_id, submission_date, responses')
          .in('athlete_id', athleteIds)
          .order('submission_date', { ascending: false }),
        supabase.from('athlete_wellness_questions')
          .select('athlete_id, question_id, is_featured')
          .in('athlete_id', athleteIds),
        supabase.from('wellness_question_library')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
      ]);

      if (cancelled) return;

      const tokenByAthlete = {};
      (tokens || []).forEach(t => { tokenByAthlete[t.athlete_id] = t; });

      // Latest response per athlete (responses already sorted desc).
      const latestByAthlete = {};
      (responses || []).forEach(r => {
        if (!latestByAthlete[r.athlete_id]) latestByAthlete[r.athlete_id] = r;
      });

      // Map question_id → library row for quick lookup.
      const libById = Object.fromEntries((library || []).map(q => [q.id, q]));

      // Featured selections per athlete — these are the ones the
      // coach has explicitly starred to appear on the roster card.
      const featuredByAthlete = {};
      (selections || []).forEach(s => {
        if (!s.is_featured) return;
        const q = libById[s.question_id];
        if (!q) return;
        (featuredByAthlete[s.athlete_id] ||= []).push(q);
      });
      Object.values(featuredByAthlete).forEach(arr =>
        arr.sort((a, b) => a.display_order - b.display_order)
      );

      const map = {};
      athleteIds.forEach(id => {
        const tok = tokenByAthlete[id];
        const latest = latestByAthlete[id];
        const featured = featuredByAthlete[id] || [];
        // Only ringable types get rendered as donuts.
        const ringable = featured.filter(q =>
          q.question_type === 'slider'
          || q.question_type === 'slider_1_7'
          || q.question_type === 'number'
          || q.question_type === 'yes_no'
        );

        map[id] = {
          isActive:        tok?.is_active ?? false,
          latestDate:      latest?.submission_date || null,
          latestResponses: latest?.responses || null,
          questions:       ringable,
        };
      });

      setWellnessMap(map);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [athleteIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return { wellnessMap, loading };
}
