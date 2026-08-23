import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { buildGoalTree } from '../utils/goalTree';

/**
 * useAthleteReports — every quarterly report the coach has actually
 * sent (sent_at set), newest first, each with its goal tree. This is
 * the athlete's "look back" history on the Progress tab — separate
 * from useAthleteGoals, which tracks the live/current-quarter plan an
 * athlete can still add their own goals to before it's sent.
 */
export function useAthleteReports(athleteId) {
  const [reports, setReports] = useState([]); // [{ plan, coachTree, athleteOwnGoals }]
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!athleteId) { setReports([]); setLoading(false); return; }
    setLoading(true);

    const { data: plans, error: plansErr } = await supabase
      .from('development_plans')
      .select('*')
      .eq('athlete_id', athleteId)
      .not('sent_at', 'is', null)
      .order('year', { ascending: false })
      .order('quarter', { ascending: false });
    if (plansErr) console.error('[useAthleteReports] plans fetch failed', plansErr);

    if (!plans || !plans.length) {
      setReports([]);
      setLoading(false);
      return;
    }

    const { data: goals, error: goalsErr } = await supabase
      .from('goals')
      .select('*')
      .in('plan_id', plans.map(p => p.id))
      .order('created_at', { ascending: true });
    if (goalsErr) console.error('[useAthleteReports] goals fetch failed', goalsErr);

    const byPlan = {};
    (goals || []).forEach(g => { (byPlan[g.plan_id] ||= []).push(g); });

    setReports(plans.map(plan => {
      const planGoals = byPlan[plan.id] || [];
      return {
        plan,
        coachTree: buildGoalTree(planGoals.filter(g => g.owner === 'coach')),
        athleteOwnGoals: planGoals.filter(g => g.owner === 'athlete'),
      };
    }));
    setLoading(false);
  }, [athleteId]);

  useEffect(() => { load(); }, [load]);

  return { reports, loading, refresh: load };
}
