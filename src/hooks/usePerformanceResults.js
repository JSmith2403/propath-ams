import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * usePerformanceResults — reads an athlete's normalized performance
 * test results (performance_test_results table) and shapes them into
 * the same { metricKey: [{ id, date, value }|{ id, date, left, right }] }
 * object the old phase2.performance.entries blob used, so it's a
 * drop-in replacement for PerformanceTestingTab / ReportTab's
 * PerformanceSection.
 *
 * Coach-authenticated only (RLS: authenticated FOR ALL) — the athlete
 * app reads this table directly itself, scoped by athlete_id, rather
 * than through this hook.
 */
export function usePerformanceResults(athleteId) {
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!athleteId) { setEntries({}); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('performance_test_results')
        .select('id, metric_key, date, value, value_left, value_right, session_id')
        .eq('athlete_id', athleteId)
        .order('date', { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error('[usePerformanceResults] fetch failed', error);
        setEntries({});
        setLoading(false);
        return;
      }
      const grouped = {};
      (data || []).forEach(row => {
        const entry = { id: row.id, date: row.date, sessionId: row.session_id || undefined };
        if (row.value_left != null || row.value_right != null) {
          entry.left = row.value_left;
          entry.right = row.value_right;
        } else {
          entry.value = row.value;
        }
        (grouped[row.metric_key] ||= []).push(entry);
      });
      setEntries(grouped);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [athleteId, tick]);

  return { entries, loading, refresh };
}
