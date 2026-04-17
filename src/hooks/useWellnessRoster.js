import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Batch-fetch wellness data for the roster.
 * Returns:
 *   wellnessMap: { [athleteId]: {
 *     isActive,
 *     latestSubmission,         // full row with responses jsonb
 *     latestDate,
 *     rosterQuestions: [ question, ... ]   // full question objects, ordered
 *   }}
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

      const [tokensRes, subsRes, aqRes] = await Promise.all([
        supabase.from('wellness_tokens').select('athlete_id, is_active').in('athlete_id', athleteIds),
        supabase.from('wellness_submissions').select('*').in('athlete_id', athleteIds).order('submission_date', { ascending: false }),
        supabase.from('wellness_athlete_questions').select('athlete_id, question_id, show_on_roster, display_order').in('athlete_id', athleteIds).eq('show_on_roster', true).order('display_order', { ascending: true }),
      ]);

      if (cancelled) return;

      // Fetch only the questions needed
      const questionIds = [...new Set((aqRes.data || []).map(r => r.question_id))];
      let questions = [];
      if (questionIds.length > 0) {
        const { data: qs } = await supabase
          .from('wellness_questions')
          .select('*')
          .in('id', questionIds);
        questions = qs || [];
      }
      const qMap = Object.fromEntries(questions.map(q => [q.id, q]));

      const tokenMap = {};
      (tokensRes.data || []).forEach(t => { tokenMap[t.athlete_id] = t; });

      const subMap = {};
      (subsRes.data || []).forEach(s => {
        if (!subMap[s.athlete_id]) subMap[s.athlete_id] = s;
      });

      const rosterMap = {};
      (aqRes.data || []).forEach(r => {
        if (!rosterMap[r.athlete_id]) rosterMap[r.athlete_id] = [];
        const q = qMap[r.question_id];
        if (q) rosterMap[r.athlete_id].push(q);
      });

      const map = {};
      athleteIds.forEach(id => {
        const tok = tokenMap[id];
        const sub = subMap[id];
        map[id] = {
          isActive: tok?.is_active ?? false,
          latestSubmission: sub || null,
          latestDate: sub?.submission_date || null,
          rosterQuestions: rosterMap[id] || [],
        };
      });

      setWellnessMap(map);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [athleteIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return { wellnessMap, loading };
}
