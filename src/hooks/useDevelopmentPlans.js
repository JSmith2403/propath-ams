import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { quarterBounds } from '../utils/goalTree';

/**
 * useDevelopmentPlans — coach-facing CRUD over an athlete's quarterly
 * development plans + goal tree. Replaces the old
 * athlete.data.quarterlyReviews JSONB blob (src/components/
 * QuarterlyReviews.jsx, retired) with the normalized development_plans
 * + goals tables so the athlete app can read the same data.
 */
export function useDevelopmentPlans(athleteId) {
  const [plans, setPlans] = useState([]);
  const [goals, setGoals] = useState([]); // flat, every goal across every plan for this athlete
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!athleteId) { setPlans([]); setGoals([]); setLoading(false); return; }
    setLoading(true);
    const [plansRes, goalsRes] = await Promise.all([
      supabase.from('development_plans').select('*').eq('athlete_id', athleteId)
        .order('year', { ascending: false }).order('quarter', { ascending: false }),
      supabase.from('goals').select('*').eq('athlete_id', athleteId).order('created_at', { ascending: true }),
    ]);
    if (plansRes.error) console.error('[useDevelopmentPlans] plans fetch failed', plansRes.error);
    if (goalsRes.error) console.error('[useDevelopmentPlans] goals fetch failed', goalsRes.error);
    setPlans(plansRes.data || []);
    setGoals(goalsRes.data || []);
    setLoading(false);
  }, [athleteId]);

  useEffect(() => { load(); }, [load]);

  const goalsForPlan = useCallback((planId) => goals.filter(g => g.plan_id === planId), [goals]);

  // Opens (or returns the existing) plan for a given quarter. When
  // opening fresh, unresolved Long/Medium goals from the athlete's most
  // recent prior plan are carried forward as new rows against the new
  // plan — short-term and process steps are deliberately not copied,
  // since "how we get there" is meant to be re-set each quarter.
  const startReview = useCallback(async (year, quarter) => {
    const existing = plans.find(p => p.year === year && p.quarter === quarter);
    if (existing) return { ok: true, plan: existing };

    const { start, end } = quarterBounds(year, quarter);
    const { data: plan, error } = await supabase
      .from('development_plans')
      .insert({
        athlete_id: athleteId,
        year, quarter,
        period_label: `Q${quarter} ${year}`,
        period_start: start,
        period_end: end,
        status: 'draft',
      })
      .select('*').single();
    if (error) {
      console.error('[useDevelopmentPlans] startReview failed', error);
      return { ok: false, error };
    }

    // Find the most recent prior plan (by year/quarter) with any
    // unresolved long/medium goals to carry forward.
    const prior = plans
      .filter(p => p.year < year || (p.year === year && p.quarter < quarter))
      .sort((a, b) => (b.year - a.year) || (b.quarter - a.quarter))[0];

    let carried = [];
    if (prior) {
      const priorGoals = goalsForPlan(prior.id).filter(g =>
        (g.tier === 'long' || g.tier === 'medium') &&
        !['achieved', 'missed'].includes(g.status) &&
        !g.parent_goal_id // only top-level Long goals carry as roots; Mediums come along via their own carry below
      );
      // Carry Long goals first (as new roots), then re-parent their
      // still-open Medium children under the freshly-inserted Long row.
      for (const longGoal of priorGoals.filter(g => g.tier === 'long')) {
        const { data: newLong, error: e1 } = await supabase.from('goals').insert({
          plan_id: plan.id, athlete_id: athleteId, parent_goal_id: null,
          tier: 'long', domain: longGoal.domain, owner: longGoal.owner,
          description: longGoal.description, target_date: longGoal.target_date, status: longGoal.status,
        }).select('*').single();
        if (e1) { console.error('[useDevelopmentPlans] carry-forward (long) failed', e1); continue; }
        carried.push(newLong);

        const openMediums = goals.filter(g => g.parent_goal_id === longGoal.id && g.tier === 'medium' && !['achieved', 'missed'].includes(g.status));
        for (const medGoal of openMediums) {
          const { data: newMed, error: e2 } = await supabase.from('goals').insert({
            plan_id: plan.id, athlete_id: athleteId, parent_goal_id: newLong.id,
            tier: 'medium', domain: medGoal.domain, owner: medGoal.owner,
            description: medGoal.description, target_date: medGoal.target_date, status: medGoal.status,
          }).select('*').single();
          if (e2) { console.error('[useDevelopmentPlans] carry-forward (medium) failed', e2); continue; }
          carried.push(newMed);
        }
      }
    }

    setPlans(prev => [plan, ...prev]);
    if (carried.length) setGoals(prev => [...prev, ...carried]);
    return { ok: true, plan, carried: carried.length };
  }, [athleteId, plans, goals, goalsForPlan]);

  const addGoal = useCallback(async ({ planId, parentGoalId = null, tier, domain, description, targetDate = null, owner = 'coach' }) => {
    const { data, error } = await supabase.from('goals').insert({
      plan_id: planId, athlete_id: athleteId, parent_goal_id: parentGoalId,
      tier, domain, owner, description, target_date: targetDate,
    }).select('*').single();
    if (error) {
      console.error('[useDevelopmentPlans] addGoal failed', error);
      return { ok: false, error };
    }
    setGoals(prev => [...prev, data]);
    return { ok: true, goal: data };
  }, [athleteId]);

  const updateGoal = useCallback(async (id, patch) => {
    const prevGoals = goals;
    setGoals(list => list.map(g => g.id === id ? { ...g, ...patch } : g));
    const { error } = await supabase.from('goals')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      console.error('[useDevelopmentPlans] updateGoal failed', error);
      setGoals(prevGoals);
      return { ok: false, error };
    }
    return { ok: true };
  }, [goals]);

  // Cascades in the DB (parent_goal_id ON DELETE CASCADE) — children are
  // removed automatically, so the optimistic update here mirrors that.
  const deleteGoal = useCallback(async (id) => {
    const prevGoals = goals;
    const descendantIds = new Set([id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const g of goals) {
        if (g.parent_goal_id && descendantIds.has(g.parent_goal_id) && !descendantIds.has(g.id)) {
          descendantIds.add(g.id);
          grew = true;
        }
      }
    }
    setGoals(list => list.filter(g => !descendantIds.has(g.id)));
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) {
      console.error('[useDevelopmentPlans] deleteGoal failed', error);
      setGoals(prevGoals);
      return { ok: false, error };
    }
    return { ok: true };
  }, [goals]);

  // Clones an athlete-submitted goal into a coach-owned mirror in the
  // same plan, pairing the two via linked_goal_id both ways.
  const adoptAthleteGoal = useCallback(async (athleteGoal) => {
    const { data: coachGoal, error } = await supabase.from('goals').insert({
      plan_id: athleteGoal.plan_id, athlete_id: athleteId, parent_goal_id: null,
      tier: athleteGoal.tier, domain: athleteGoal.domain, owner: 'coach',
      description: athleteGoal.description, target_date: athleteGoal.target_date,
      linked_goal_id: athleteGoal.id,
    }).select('*').single();
    if (error) {
      console.error('[useDevelopmentPlans] adoptAthleteGoal failed', error);
      return { ok: false, error };
    }
    const { error: linkErr } = await supabase.from('goals')
      .update({ linked_goal_id: coachGoal.id }).eq('id', athleteGoal.id);
    if (linkErr) console.error('[useDevelopmentPlans] adopt back-link failed', linkErr);

    setGoals(prev => [...prev.map(g => g.id === athleteGoal.id ? { ...g, linked_goal_id: coachGoal.id } : g), coachGoal]);
    return { ok: true, goal: coachGoal };
  }, [athleteId]);

  const closeReview = useCallback(async (planId, { narrative, ragSummary, conductedBy }) => {
    const patch = {
      status: 'closed', narrative, rag_summary: ragSummary, conducted_by: conductedBy,
      closed_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    const prevPlans = plans;
    setPlans(list => list.map(p => p.id === planId ? { ...p, ...patch } : p));
    const { error } = await supabase.from('development_plans').update(patch).eq('id', planId);
    if (error) {
      console.error('[useDevelopmentPlans] closeReview failed', error);
      setPlans(prevPlans);
      return { ok: false, error };
    }
    return { ok: true };
  }, [plans]);

  // Stamps sent_at — the point at which the narrative/RAG summary
  // becomes visible on the athlete's Progress tab. Caller is
  // responsible for actually notifying the athlete (push).
  const sendToAthlete = useCallback(async (planId) => {
    const patch = { sent_at: new Date().toISOString() };
    const prevPlans = plans;
    setPlans(list => list.map(p => p.id === planId ? { ...p, ...patch } : p));
    const { error } = await supabase.from('development_plans').update(patch).eq('id', planId);
    if (error) {
      console.error('[useDevelopmentPlans] sendToAthlete failed', error);
      setPlans(prevPlans);
      return { ok: false, error };
    }
    return { ok: true };
  }, [plans]);

  // Saves narrative/RAG/conductedBy without closing — same shape, status left alone.
  const saveDraft = useCallback(async (planId, { narrative, ragSummary, conductedBy }) => {
    const patch = { narrative, rag_summary: ragSummary, conducted_by: conductedBy, status: 'active', updated_at: new Date().toISOString() };
    const prevPlans = plans;
    setPlans(list => list.map(p => p.id === planId ? { ...p, ...patch } : p));
    const { error } = await supabase.from('development_plans').update(patch).eq('id', planId);
    if (error) {
      console.error('[useDevelopmentPlans] saveDraft failed', error);
      setPlans(prevPlans);
      return { ok: false, error };
    }
    return { ok: true };
  }, [plans]);

  return {
    plans, goals, loading, goalsForPlan,
    startReview, addGoal, updateGoal, deleteGoal, adoptAthleteGoal, closeReview, saveDraft, sendToAthlete,
    refresh: load,
  };
}
