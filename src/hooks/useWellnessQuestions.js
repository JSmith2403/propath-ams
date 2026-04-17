import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Fetch + manage the global wellness question bank.
 *
 * Mutations throw on error so callers can surface messages to the user.
 */
export function useWellnessQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from('wellness_questions')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) console.error('[Wellness] fetch questions:', error);
    setQuestions(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createQuestion = useCallback(async (payload) => {
    const { data, error } = await supabase
      .from('wellness_questions')
      .insert(payload)
      .select()
      .single();
    if (error) {
      console.error('[Wellness] create question:', error);
      throw error;
    }
    await fetchAll();
    return data;
  }, [fetchAll]);

  const updateQuestion = useCallback(async (id, patch) => {
    const { error } = await supabase
      .from('wellness_questions')
      .update(patch)
      .eq('id', id);
    if (error) {
      console.error('[Wellness] update question:', error);
      throw error;
    }
    await fetchAll();
  }, [fetchAll]);

  const deleteQuestion = useCallback(async (id) => {
    const { error } = await supabase
      .from('wellness_questions')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('[Wellness] delete question:', error);
      throw error;
    }
    await fetchAll();
  }, [fetchAll]);

  return { questions, loading, createQuestion, updateQuestion, deleteQuestion, refresh: fetchAll };
}
