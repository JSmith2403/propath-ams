import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { addDaysISO, todayUAE } from '../utils/timetable';
import { summariseCheckIn } from '../utils/checkIn';
import { levelOf } from '../utils/support';
import { batteryBand, trendOf } from '../utils/garminTrend';
import { buildInsights, buildKpis } from '../utils/dashboardKpis';
import {
  MISSED_WINDOW_DAYS, buildAttention, byAttention, dayAttendance, missedSessions,
  plannedStats, programmingRunway, rowVerdict,
} from '../utils/weekBoard';

const hourUAE = () => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', hour: 'numeric', hour12: false }).format(new Date())) % 24;
const PAIN = /pain|symptom/i;

/**
 * Everything the coach dashboard shows, in one place, for the athletes the coach can see.
 *
 *   rows       — one per athlete: sessions done/planned this week, today's check-in, programme runway,
 *                missed sessions, watch status, and a one-line verdict (see utils/weekBoard.js)
 *   attention  — the "needing coach attention" list, built from the rows
 *   attendance — who is attending each day of the week (timetable)
 *
 * Each source fails soft: if one query errors the rest still show (that part just reads as "no data").
 * Re-reads every minute and when the tab comes back into view.
 */
export function useCoachDashboard(athletes, weekStart) {
  const [state, setState] = useState({ loading: true, rows: [], kpi: null, insights: [], attention: [], attendance: [], today: todayUAE(), errors: [] });
  const [tick, setTick] = useState(0);
  const loadedOnce = useRef(false);
  const ids = useMemo(() => athletes.map(a => a.id), [athletes]);
  const key = ids.join(',') + '|' + weekStart;
  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(onVisible, 60_000);
    return () => { document.removeEventListener('visibilitychange', onVisible); clearInterval(timer); };
  }, [refresh]);

  useEffect(() => {
    if (!ids.length) { setState({ loading: false, rows: [], kpi: null, insights: [], attention: [], attendance: [], today: todayUAE(), errors: [] }); return undefined; }
    let cancelled = false;
    (async () => {
      const today = todayUAE();
      const weekEnd = addDaysISO(weekStart, 6);
      const from = [weekStart, addDaysISO(today, -MISSED_WINDOW_DAYS)].sort()[0];
      const since7 = addDaysISO(today, -6);
      const errors = [];
      const ok = (r, label) => { if (r.error) { errors.push(label); return []; } return r.data || []; };

      const [prog, planned, logs, tok, appTok, resp, lib, slots, garmin, support, meals] = await Promise.all([
        supabase.from('programming_settings').select('athlete_id').eq('programming_active', true).in('athlete_id', ids),
        supabase.from('planned_sessions').select('id, athlete_id, planned_date, attendance').in('athlete_id', ids).gte('planned_date', from).limit(5000),
        supabase.from('session_logs').select('athlete_id, planned_session_id').in('athlete_id', ids).not('completed_at', 'is', null).gte('completed_at', `${from}T00:00:00Z`).limit(5000),
        supabase.from('wellness_tokens').select('athlete_id').eq('is_active', true).in('athlete_id', ids),
        supabase.from('athlete_app_tokens').select('athlete_id').eq('is_active', true).in('athlete_id', ids),
        supabase.from('wellness_responses').select('athlete_id, submission_date, responses').in('athlete_id', ids).gte('submission_date', since7),
        supabase.from('wellness_question_library').select('id, label, question_type, direction, rag_thresholds'),
        supabase.from('timetable_slots').select('id, slot_date, start_time, cohorts').gte('slot_date', weekStart).lte('slot_date', weekEnd).not('published_at', 'is', null),
        supabase.rpc('garmin_daily_for', { p_athlete_ids: ids, p_since: addDaysISO(today, -14) }),
        // Level of support. Read on its own and quietly: until its SQL has been run everyone counts as full support.
        supabase.from('programming_settings').select('athlete_id, support_level').in('athlete_id', ids),
        // Meals submitted in the last 24 hours (for the headline tile). Quiet if it can't be read.
        supabase.from('meal_entries').select('athlete_id').in('athlete_id', ids).not('submitted_at', 'is', null)
          .gte('submitted_at', new Date(Date.now() - 86_400_000).toISOString()).limit(500),
      ]);
      const slotRows = ok(slots, 'timetable');
      const respRes = slotRows.length
        ? await supabase.from('timetable_responses').select('slot_id, athlete_id, status, note').in('slot_id', slotRows.map(s => s.id))
        : { data: [] };
      if (cancelled) return;

      const levelBy = Object.fromEntries((support.error ? [] : (support.data || [])).map(r => [r.athlete_id, levelOf(r.support_level)]));
      const levelFor = (id) => levelBy[id] || levelOf('full');
      // Programmed here = switched on AND a level that gets programmed (full or programmed only).
      const programmingIds = new Set(ok(prog, 'programming').map(r => r.athlete_id).filter(id => levelFor(id).programmed));
      const plannedRows = ok(planned, 'sessions');
      const logRows = ok(logs, 'sessions');
      const appIds = new Set(ok(appTok, 'wellness').map(r => r.athlete_id));
      const expectedIds = new Set(ok(tok, 'wellness').map(r => r.athlete_id).filter(id => appIds.has(id)));
      const respRows = ok(resp, 'wellness');
      const libById = new Map(ok(lib, 'wellness').map(q => [q.id, q]));
      const garminRows = garmin.error ? [] : (garmin.data || []);
      const group = (rows, k = 'athlete_id') => rows.reduce((m, r) => { (m[r[k]] ||= []).push(r); return m; }, {});
      const plannedBy = group(plannedRows), logsBy = group(logRows), respBy = group(respRows), garminBy = group(garminRows);

      // Who has their own programme session on each day (programmed athletes only), alongside the group sessions.
      const programmeOn = (date) => athletes.filter(a => programmingIds.has(a.id) && (plannedBy[a.id] || []).some(p => p.planned_date === date)).map(a => a.id);
      const attendanceDays = dayAttendance(slotRows, ok(respRes, 'timetable'), athletes, Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i)))
        .map(d => ({ ...d, programme: programmeOn(d.date) }))
        .map(d => ({ ...d, expected: [...new Set([...d.attending, ...d.programme])] }));
      const pendingFromToday = new Set(attendanceDays.filter(d => d.date >= today).flatMap(d => d.pending));

      const rows = athletes.map(a => {
        const mine = plannedBy[a.id] || [];
        const myLogs = logsBy[a.id] || [];
        const week = mine.filter(p => p.planned_date >= weekStart && p.planned_date <= weekEnd);

        const expected = expectedIds.has(a.id);
        const byDate = Object.fromEntries((respBy[a.id] || []).map(r => [r.submission_date, r]));
        const todayRow = byDate[today];
        let checkIn = { state: 'none', expected, pain: false, flagged: [], streak: 0, sleepHours: null, readiness: null, readinessRag: null };
        if (todayRow) {
          const s = summariseCheckIn(todayRow.responses, libById);
          checkIn = { ...checkIn, state: s.rag === 'grey' ? 'green' : s.rag, flagged: s.flagged, sleepHours: s.sleepHours, readiness: s.readiness, readinessRag: s.readinessRag, pain: s.flagged.some(f => f.rag === 'red' && PAIN.test(f.label)) };
        } else {
          let streak = 0;
          for (let i = 0; i < 7 && !byDate[addDaysISO(today, -i)]; i += 1) streak += 1;
          checkIn.streak = streak;
        }

        const g = (garminBy[a.id] || []).filter(r => r.day).sort((x, y) => y.day.localeCompare(x.day));   // newest first
        const latest = g.length ? g[0].day : null;
        const level = levelFor(a.id);
        const watch = !level.tracked
          ? { state: 'na', latest: null }
          : { state: !latest ? 'none' : latest <= addDaysISO(today, -2) ? 'silent' : 'ok', latest: latest || null };

        // What the watch says, each next to the athlete's own recent average. Blank where the athlete keeps it private.
        const battery = g.map(r => r.body_battery_high).find(v => v != null) ?? null;
        // Last 14 days, oldest first, for the little trend lines.
        const byDay = new Map(g.map(r => [r.day, r]));
        const series = (pick) => Array.from({ length: 14 }, (_, i) => { const r = byDay.get(addDaysISO(today, i - 13)); return r ? pick(r) : null; });
        const garmin = level.tracked ? {
          day: latest,
          series: {
            sleep: series(r => (r.sleep_seconds != null ? r.sleep_seconds / 3600 : null)),
            hrv: series(r => r.hrv_last_night ?? null),
            battery: series(r => r.body_battery_high ?? null),
            intensity: series(r => r.intensity_min ?? null),
            kcal: series(r => r.active_kcal ?? null),
          },
          sleep: trendOf(g.map(r => (r.sleep_seconds != null ? r.sleep_seconds / 3600 : null))),
          hrv: trendOf(g.map(r => r.hrv_last_night)),
          kcal: trendOf(g.map(r => r.active_kcal)),
          intensity: trendOf(g.map(r => r.intensity_min ?? null)),
          battery, batteryBand: batteryBand(battery),
        } : null;

        const row = {
          id: a.id, name: a.name, athlete: a,
          programmingActive: programmingIds.has(a.id),
          supportLevel: level.key,
          sessions: plannedStats(week, myLogs),
          runway: programmingRunway(mine.map(p => p.planned_date), today),
          missed: missedSessions(mine, myLogs, today).length,
          checkIn, watch, garmin, timetablePending: pendingFromToday.has(a.id),
          readinessSeries: Array.from({ length: 7 }, (_, i) => { const r = byDate[addDaysISO(today, i - 6)]; return r ? summariseCheckIn(r.responses, libById).readiness : null; }),
        };
        return { ...row, verdict: rowVerdict(row) };
      }).sort(byAttention);

      // Headline numbers and the plain-English insights, worked out from the same rows.
      const mealCounts = {};
      (meals.error ? [] : meals.data || []).forEach(m => { mealCounts[m.athlete_id] = (mealCounts[m.athlete_id] || 0) + 1; });
      const topMeal = Object.entries(mealCounts).sort((x, y) => y[1] - x[1])[0];
      const plannedToday = plannedRows.filter(p => p.planned_date === today);
      const linked = new Set(logRows.map(l => l.planned_session_id).filter(Boolean));
      const kpi = buildKpis(rows, {
        sessionsToday: { planned: plannedToday.length, done: plannedToday.filter(p => linked.has(p.id)).length },
        meals: topMeal ? { athleteId: topMeal[0], count: topMeal[1], total: Object.values(mealCounts).reduce((a, b) => a + b, 0) } : null,
      });

      loadedOnce.current = true;
      setState({ loading: false, rows, kpi, insights: buildInsights(rows), attention: buildAttention(rows, { hourUAE: hourUAE() }), attendance: attendanceDays, today, errors });
    })().catch(err => {
      console.error('[useCoachDashboard]', err);
      if (!cancelled) setState(s => ({ ...s, loading: false, errors: ['dashboard'] }));
    });
    return () => { cancelled = true; };
  }, [key, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, refresh };
}
