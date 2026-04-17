import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Manage the per-athlete question assignment (wellness_athlete_questions).
 * Returns a list of { question_id, show_on_roster, display_order } for the athlete.
 */
export function useAthleteSurvey(athleteId) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = useCallback(async () => {
    if (!athleteId) return;
    const { data } = await supabase
      .from('wellness_athlete_questions')
      .select('id, question_id, show_on_roster, display_order')
      .eq('athlete_id', athleteId)
      .order('display_order', { ascending: true });
    setAssignments(data || []);
    setLoading(false);
  }, [athleteId]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  /**
   * Replace all assignments for this athlete with the given list.
   * Each item: { question_id, show_on_roster, display_order }
   */
  const saveAssignments = useCallback(async (items) => {
    if (!athleteId) return;

    // Delete all existing assignments for this athlete
    const { error: delError } = await supabase
      .from('wellness_athlete_questions')
      .delete()
      .eq('athlete_id', athleteId);
    if (delError) { console.error('[Wellness] delete assignments:', delError); throw delError; }

    if (items.length === 0) {
      setAssignments([]);
      return;
    }

    // Insert new assignments
    const rows = items.map(i => ({
      athlete_id: athleteId,
      question_id: i.question_id,
      show_on_roster: !!i.show_on_roster,
      display_order: i.display_order ?? 0,
    }));

    const { error: insError } = await supabase
      .from('wellness_athlete_questions')
      .insert(rows);
    if (insError) { console.error('[Wellness] insert assignments:', insError); throw insError; }

    await fetchAssignments();
  }, [athleteId, fetchAssignments]);

  return { assignments, loading, saveAssignments, refresh: fetchAssignments };
}
