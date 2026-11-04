import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { summariseCheckIn } from '../utils/checkIn';

const todayLocal = () => new Date().toLocaleDateString('en-CA');
function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-CA');
}
export const DEFAULT_WATER_TARGET = 6; // glasses — same default as the athlete app

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
 *   wellness  : each athlete's latest check-in (sleep, stress, what was flagged, RAG) plus Garmin sleep / HRV /
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
      const [meals, water, settings, subs, library, garmin] = await Promise.all([
        supabase.from('meal_entries')
          .select('id, athlete_id, log_date, meal_type, description, status, submitted_at, meal_photos ( storage_path, thumbnail_path )')
          .in('athlete_id', athleteIds).not('submitted_at', 'is', null).gte('log_date', yesterday)
          .order('submitted_at', { ascending: false }).limit(60),
        supabase.from('water_intake_logs').select('athlete_id, log_date, glasses').in('athlete_id', athleteIds).gte('log_date', yesterday),
        supabase.from('nutrition_settings').select('athlete_id, meal_logging_enabled, water_daily_target').in('athlete_id', athleteIds),
        // The daily check-in athletes fill in today (the older wellness_submissions table stopped being written in April).
        supabase.from('wellness_responses')
          .select('athlete_id, submission_date, created_at, responses')
          .in('athlete_id', athleteIds).gte('submission_date', weekAgo)
          .order('submission_date', { ascending: false }).order('created_at', { ascending: false }),
        supabase.from('wellness_question_library').select('id, label, question_type, direction, rag_thresholds'),
        // Through the function so only what each athlete lets coaches see comes back.
        supabase.rpc('garmin_daily_for', { p_athlete_ids: athleteIds, p_since: addDays(today, -2) }),
      ]);
      if (cancelled) return;

      // ── Nutrition ──────────────────────────────────────────────────────
      const mealRows = meals.data || [];
      const settingsBy = new Map((settings.data || []).map(s => [s.athlete_id, s]));
      const waterBy = new Map((water.data || []).map(w => [`${w.athlete_id}|${w.log_date}`, w.glasses]));
      const loggers = athleteIds.filter(id => settingsBy.get(id)?.meal_logging_enabled);
      const submittedTodayIds = new Set(mealRows.filter(m => m.log_date === today).map(m => m.athlete_id));
      const incompleteIds = loggers.filter(id => !submittedTodayIds.has(id));

      const latest = mealRows.slice(0, 20).map(m => {
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
          fullPath: photo ? photo.storage_path : null,   // full-size, for the tap-to-enlarge pop-up
          thumb: null,
          full: null,
        };
      });
      const paths = [...new Set(latest.flatMap(r => [r.photoPath, r.fullPath]).filter(Boolean))];
      if (paths.length) {
        const { data: urls } = await supabase.storage.from('meal-photos').createSignedUrls(paths, 3600);
        const map = {};
        (urls || []).forEach((u, i) => { if (u?.signedUrl) map[paths[i]] = u.signedUrl; });
        latest.forEach(r => {
          r.thumb = r.photoPath ? (map[r.photoPath] || null) : null;
          r.full = r.fullPath ? (map[r.fullPath] || null) : null;
        });
      }
      if (cancelled) return;

      // ── Wellness ───────────────────────────────────────────────────────
      const libById = new Map((library.data || []).map(q => [q.id, q]));
      const latestSub = new Map();
      (subs.data || []).forEach(s => { if (!latestSub.has(s.athlete_id)) latestSub.set(s.athlete_id, s); });
      const latestGarmin = new Map();
      (garmin.error ? [] : (garmin.data || [])).forEach(g => { if (!latestGarmin.has(g.athlete_id)) latestGarmin.set(g.athlete_id, g); });

      const rows = athleteIds
        .filter(id => latestSub.has(id) || latestGarmin.has(id))
        .map(id => {
          const s = latestSub.get(id);
          const g = latestGarmin.get(id);
          const c = s ? summariseCheckIn(s.responses, libById) : null;
          return {
            athleteId: id,
            date: s?.submission_date || g?.day,
            sleepHours: g?.sleep_seconds != null ? g.sleep_seconds / 3600 : c?.sleepHours ?? null,
            sleepFromGarmin: g?.sleep_seconds != null,
            hrv: g?.hrv_last_night ?? null,
            flagged: c ? c.flagged : [],
            stress: c?.stress ?? null,
            battery: g?.body_battery_high ?? null,
            rag: c ? c.rag : 'grey',
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
            flagged: rows.filter(r => r.rag === 'red' || r.rag === 'amber').length,
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
