import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

function todayLocal() { return new Date().toLocaleDateString('en-CA'); }
function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-CA');
}
const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // index = Date#getDay()

/**
 * Per-athlete wellness adherence for the coach dashboard's Wellness
 * Overview panel: today's check-in status, a 7-day completion strip,
 * and today's full response set (for the "View" popup).
 *
 * Only athletes with an active wellness_token are returned — matches
 * the "toggled on" gate used everywhere else in the wellness feature.
 */
export function useWellnessAdherence(athleteIds) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!athleteIds || athleteIds.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      const today = todayLocal();
      const weekAgo = addDays(today, -6); // 7-day window inclusive of today

      const [
        { data: tokens },
        { data: appTokens },
        { data: responses },
        { data: selections },
        { data: library },
      ] = await Promise.all([
        supabase.from('wellness_tokens')
          .select('athlete_id, is_active')
          .in('athlete_id', athleteIds)
          .eq('is_active', true),
        // wellness_tokens.is_active is meant to mirror athlete_app_tokens
        // (the actual "Athlete App" toggle a coach uses), but the two
        // aren't DB-enforced in sync — cross-check both so a stale
        // wellness_tokens row from a deactivated/never-activated athlete
        // app can't make them show up here.
        supabase.from('athlete_app_tokens')
          .select('athlete_id, is_active')
          .in('athlete_id', athleteIds)
          .eq('is_active', true),
        supabase.from('wellness_responses')
          .select('athlete_id, submission_date, responses, created_at')
          .in('athlete_id', athleteIds)
          .gte('submission_date', weekAgo),
        supabase.from('athlete_wellness_questions')
          .select('athlete_id, question_id')
          .in('athlete_id', athleteIds),
        supabase.from('wellness_question_library')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
      ]);
      if (cancelled) return;

      const activeAppIds = new Set((appTokens || []).map(t => t.athlete_id));
      const activeIds = new Set((tokens || []).map(t => t.athlete_id).filter(id => activeAppIds.has(id)));

      const libById = Object.fromEntries((library || []).map(q => [q.id, q]));
      const questionsByAthlete = {};
      (selections || []).forEach(s => {
        const q = libById[s.question_id];
        if (!q) return;
        (questionsByAthlete[s.athlete_id] ||= []).push(q);
      });
      Object.values(questionsByAthlete).forEach(arr =>
        arr.sort((a, b) => a.display_order - b.display_order)
      );

      const responsesByAthlete = {};
      (responses || []).forEach(r => {
        (responsesByAthlete[r.athlete_id] ||= {})[r.submission_date] = r;
      });

      const last7Dates = Array.from({ length: 7 }, (_, i) => addDays(weekAgo, i));

      const result = athleteIds
        .filter(id => activeIds.has(id))
        .map(id => {
          const byDate = responsesByAthlete[id] || {};
          const todayRow = byDate[today] || null;
          const last7 = last7Dates.map(dateISO => {
            const d = new Date(dateISO + 'T00:00:00');
            return {
              dateISO,
              letter: DAY_LETTERS[d.getDay()],
              completed: !!byDate[dateISO],
            };
          });
          const completedCount = last7.filter(d => d.completed).length;
          return {
            athleteId: id,
            todayCompleted: !!todayRow,
            todayTime: todayRow?.created_at || null,
            todayResponses: todayRow?.responses || null,
            questions: questionsByAthlete[id] || [],
            last7,
            adherencePct: Math.round((completedCount / 7) * 100),
            adherenceCount: completedCount,
          };
        });

      setRows(result);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [athleteIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return { rows, loading };
}
