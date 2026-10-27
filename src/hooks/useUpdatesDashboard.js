import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const todayLocal = () => new Date().toLocaleDateString('en-CA');
function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-CA');
}
export const DEFAULT_WATER_TARGET = 6; // glasses — same default as the athlete app

// Same thresholds as the Recent Updates feed: worst single score decides the colour.
function formRag(s) {
  const scores = [s.sleep_quality, s.fatigue, s.muscle_soreness, s.stress].filter(v => v != null);
  if (!scores.length) return 'grey';
  const worst = Math.max(s.sleep_quality != null ? 11 - s.sleep_quality : 0, s.fatigue ?? 0, s.muscle_soreness ?? 0, s.stress ?? 0);
  return worst >= 8 ? 'red' : worst >= 6 ? 'amber' : 'green';
}

// "Readiness" = one 1–10 number (higher is better) from today's check-in:
// sleep quality, plus fatigue / soreness / stress turned the right way round.
function readiness(s) {
  const parts = [s.sleep_quality, s.fatigue != null ? 11 - s.fatigue : null, s.muscle_soreness != null ? 11 - s.muscle_soreness : null, s.stress != null ? 11 - s.stress : null]
    .filter(v => v != null);
  return parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : null;
}

const mean = (vals) => {
  const v = vals.filter(x => x != null && Number.isFinite(x));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};

/**
 * useUpdatesDashboard — the data behind the coach Updates dashboard's Nutrition and Athlete Wellness
 * panels. (Recent Updates and Wellness Compliance have their own hooks.)
 *
 *   nutrition : who has logged today, what's waiting for review, who hasn't logged, the latest
 *               submissions with their photo and that day's water.
 *   wellness  : each athlete's latest check-in (sleep, readiness, stress, RAG) plus Garmin sleep / HRV /
 *               body battery where an athlete has Garmin connected.
 *
 * Garmin is optional: if its tables aren't there yet, or nobody is connected, those columns are just empty.
 */
export function useUpdatesDashboard(athleteIds) {
  const [state, setState] = useState({ loading: true, nutrition: null, wellness: null });
  const key = (athleteIds || []).join(',');

  useEffect(() => {
    if (!athleteIds?.length) { setState({ loading: false, nutrition: null, wellness: null }); return undefined; }
    let cancelled = false;
    (async () => {
      const today = todayLocal();
      const yesterday = addDays(today, -1);
      const weekAgo = addDays(today, -6);
      const [meals, water, settings, subs, garmin] = await Promise.all([
        supabase.from('meal_entries')
          .select('id, athlete_id, log_date, meal_type, description, status, submitted_at, meal_photos ( storage_path, thumbnail_path )')
          .in('athlete_id', athleteIds).not('submitted_at', 'is', null).gte('log_date', yesterday)
          .order('submitted_at', { ascending: false }).limit(60),
        supabase.from('water_intake_logs').select('athlete_id, log_date, glasses').in('athlete_id', athleteIds).gte('log_date', yesterday),
        supabase.from('nutrition_settings').select('athlete_id, meal_logging_enabled, water_daily_target').in('athlete_id', athleteIds),
        supabase.from('wellness_submissions')
          .select('athlete_id, submission_date, created_at, sleep_duration, sleep_quality, fatigue, muscle_soreness, stress')
          .in('athlete_id', athleteIds).gte('submission_date', weekAgo)
          .order('submission_date', { ascending: false }).order('created_at', { ascending: false }),
        supabase.from('garmin_daily')
          .select('athlete_id, day, sleep_seconds, hrv_last_night, body_battery_high')
          .in('athlete_id', athleteIds).gte('day', addDays(today, -2)).order('day', { ascending: false }),
      ]);
      if (cancelled) return;

      // ── Nutrition ──────────────────────────────────────────────────────
      const mealRows = meals.data || [];
      const settingsBy = new Map((settings.data || []).map(s => [s.athlete_id, s]));
      const waterBy = new Map((water.data || []).map(w => [`${w.athlete_id}|${w.log_date}`, w.glasses]));
      const loggers = athleteIds.filter(id => settingsBy.get(id)?.meal_logging_enabled);
      const submittedTodayIds = new Set(mealRows.filter(m => m.log_date === today).map(m => m.athlete_id));
      const incompleteIds = loggers.filter(id => !submittedTodayIds.has(id));

      const latest = mealRows.slice(0, 5).map(m => {
        const photo = (m.meal_photos || [])[0];
        return {
          id: m.id,
          athleteId: m.athlete_id,
          when: m.submitted_at,
          logDate: m.log_date,
          mealType: m.meal_type,
          description: m.description,
          reviewed: m.status === 'reviewed',
          glasses: waterBy.get(`${m.athlete_id}|${m.log_date}`) ?? 0,
          target: settingsBy.get(m.athlete_id)?.water_daily_target ?? DEFAULT_WATER_TARGET,
          photoPath: photo ? (photo.thumbnail_path || photo.storage_path) : null,
          thumb: null,
        };
      });
      const paths = [...new Set(latest.map(r => r.photoPath).filter(Boolean))];
      if (paths.length) {
        const { data: urls } = await supabase.storage.from('meal-photos').createSignedUrls(paths, 3600);
        const map = {};
        (urls || []).forEach((u, i) => { if (u?.signedUrl) map[paths[i]] = u.signedUrl; });
        latest.forEach(r => { r.thumb = r.photoPath ? (map[r.photoPath] || null) : null; });
      }
      if (cancelled) return;

      // ── Wellness ───────────────────────────────────────────────────────
      const latestSub = new Map();
      (subs.data || []).forEach(s => { if (!latestSub.has(s.athlete_id)) latestSub.set(s.athlete_id, s); });
      const latestGarmin = new Map();
      (garmin.error ? [] : (garmin.data || [])).forEach(g => { if (!latestGarmin.has(g.athlete_id)) latestGarmin.set(g.athlete_id, g); });

      const rows = athleteIds
        .filter(id => latestSub.has(id) || latestGarmin.has(id))
        .map(id => {
          const s = latestSub.get(id);
          const g = latestGarmin.get(id);
          return {
            athleteId: id,
            date: s?.submission_date || g?.day,
            sleepHours: g?.sleep_seconds != null ? g.sleep_seconds / 3600 : (s?.sleep_duration != null ? Number(s.sleep_duration) : null),
            sleepFromGarmin: g?.sleep_seconds != null,
            hrv: g?.hrv_last_night ?? null,
            readiness: s ? readiness(s) : null,
            stress: s?.stress ?? null,
            battery: g?.body_battery_high ?? null,
            rag: s ? formRag(s) : 'grey',
          };
        });
      const order = { red: 0, amber: 1, green: 2, grey: 3 };
      rows.sort((a, b) => order[a.rag] - order[b.rag]);

      setState({
        loading: false,
        nutrition: {
          submittedToday: submittedTodayIds.size,
          pendingReview: mealRows.filter(m => m.status === 'submitted').length,
          incompleteIds,
          latest,
        },
        wellness: {
          rows,
          hasGarmin: rows.some(r => r.sleepFromGarmin || r.hrv != null || r.battery != null),
          avg: {
            sleepHours: mean(rows.map(r => r.sleepHours)),
            hrv: mean(rows.map(r => r.hrv)),
            readiness: mean(rows.map(r => r.readiness)),
            stress: mean(rows.map(r => r.stress)),
            battery: mean(rows.map(r => r.battery)),
          },
        },
      });
    })();
    return () => { cancelled = true; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
