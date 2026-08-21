import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { currentYearQuarter, buildGoalTree } from '../utils/goalTree';

/**
 * useAthleteGoals — athlete-app read of the current quarter's
 * development plan + goal tree, plus the ability to add the athlete's
 * own goals (owner='athlete') against it. A plan only exists once the
 * coach has opened the quarter's review (draft or later) — until then
 * there's nothing for the athlete to attach goals to, surfaced via
 * `hasPlan: false` so the UI can show a waiting state.
 */
export function useAthleteGoals(athleteId) {
  const [plan, setPlan] = useState(null);
  const [goals, setGoals] = useState([]); // flat, every goal on the current plan
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!athleteId) { setPlan(null); setGoals([]); setLoading(false); return; }
    setLoading(true);
    const { year, quarter } = currentYearQuarter();
    const { data: planRow, error: planErr } = await supabase
      .from('development_plans')
      .select('*')
      .eq('athlete_id', athleteId)
      .eq('year', year)
      .eq('quarter', quarter)
      .maybeSingle();
    if (planErr) console.error('[useAthleteGoals] plan fetch failed', planErr);

    if (!planRow) {
      setPlan(null);
      setGoals([]);
      setLoading(false);
      return;
    }

    const { data: goalRows, error: goalsErr } = await supabase
      .from('goals')
      .select('*')
      .eq('plan_id', planRow.id)
      .order('created_at', { ascending: true });
    if (goalsErr) console.error('[useAthleteGoals] goals fetch failed', goalsErr);

    setPlan(planRow);
    setGoals(goalRows || []);
    setLoading(false);
  }, [athleteId]);

  useEffect(() => { load(); }, [load]);

  const addAthleteGoal = useCallback(async ({ tier, domain, description, targetDate = null }) => {
    if (!plan) return { ok: false, error: new Error('No plan open for this quarter yet') };
    const { data, error } = await supabase.from('goals').insert({
      plan_id: plan.id, athlete_id: athleteId, parent_goal_id: null,
      tier, domain, owner: 'athlete', description, target_date: targetDate,
    }).select('*').single();
    if (error) {
      console.error('[useAthleteGoals] addAthleteGoal failed', error);
      return { ok: false, error };
    }
    setGoals(prev => [...prev, data]);
    return { ok: true, goal: data };
  }, [plan, athleteId]);

  const coachGoals = goals.filter(g => g.owner === 'coach');
  const athleteOwnGoals = goals.filter(g => g.owner === 'athlete');
  const coachTree = buildGoalTree(coachGoals);

  return {
    plan, goals, coachTree, athleteOwnGoals, loading, hasPlan: !!plan,
    // The narrative/RAG summary only becomes visible once the coach
    // explicitly sends it — goal submission works on an open plan
    // regardless, so athletes can still add their own goals beforehand.
    reportSent: !!plan?.sent_at,
    addAthleteGoal, refresh: load,
  };
}
