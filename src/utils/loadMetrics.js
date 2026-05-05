/**
 * Training-load + compliance metrics for the per-athlete Progress
 * Dashboard. All calculations live here (server-free) so the UI stays
 * thin and easy to verify.
 *
 * Inputs:
 *   sessions  — completed session_logs rows enriched with their
 *               set_logs (shape produced by useAthleteLogs)
 *   planned   — planned_sessions rows for the same athlete
 *   weeks     — visible window in weeks (default 8)
 *
 * Output: a structured `metrics` bundle the dashboard renders directly.
 */

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isoDay(d) {
  const x = startOfDay(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function shortLabel(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ── Atomic per-session load values ─────────────────────────────────────────
function rpeLoad(s) {
  const rpe = Number(s?.session_rpe || 0);
  const minutes = Number(s?.duration_seconds || 0) / 60;
  return rpe * minutes;
}

function volumeLoad(s) {
  if (!Array.isArray(s?.sets)) return 0;
  let v = 0;
  for (const set of s.sets) {
    const kg   = Number(set?.weight_kg || 0);
    const reps = Number(set?.reps || 0);
    v += kg * reps;
  }
  return v;
}

// ── Daily series builder ───────────────────────────────────────────────────
// Returns [{ date: 'YYYY-MM-DD', label: '12 Jun', value: number }] across
// the visible window. Days with no sessions return 0 so the bar chart
// doesn't have gaps.
function buildDailySeries(sessions, valueFn, weeks) {
  const today = startOfDay(new Date());
  const start = new Date(today.getTime() - (weeks * 7 - 1) * ONE_DAY_MS);
  const map = new Map();
  for (let d = new Date(start); d <= today; d = new Date(d.getTime() + ONE_DAY_MS)) {
    map.set(isoDay(d), 0);
  }
  for (const s of sessions) {
    const day = isoDay(new Date(s.started_at));
    if (!map.has(day)) continue;
    map.set(day, (map.get(day) || 0) + valueFn(s));
  }
  return Array.from(map.entries()).map(([date, value]) => ({
    date,
    label: shortLabel(date),
    value,
  }));
}

// ── 8-week rolling average overlay (per day) ───────────────────────────────
// Rolling window = 56 days. For each day we average all daily values in
// the trailing window; gives a smooth load trend overlay on the bar chart.
function attachRollingAvg(daily, windowDays = 56) {
  const arr = daily.map(d => d.value);
  return daily.map((d, i) => {
    const from = Math.max(0, i - windowDays + 1);
    const slice = arr.slice(from, i + 1);
    const avg = slice.length ? slice.reduce((a, b) => a + b, 0) / slice.length : 0;
    return { ...d, rolling: avg };
  });
}

// ── ACWR (acute:chronic workload ratio) per day ────────────────────────────
// Acute  = sum of last 7 days
// Chronic = mean weekly load over last 28 days (i.e. sum/4)
// ACWR = acute / chronic
//
// We only emit a value once we have a full 28 days of history behind a
// point. Days before that show as `null` so Recharts skips them and we
// don't display the artificial spike that comes from a near-zero
// chronic baseline at the start of a block.
function attachACWR(daily) {
  const arr = daily.map(d => d.value);
  const MIN_BASELINE_DAYS = 28;
  return daily.map((d, i) => {
    if (i + 1 < MIN_BASELINE_DAYS) return { ...d, acwr: null };
    const acuteFrom   = Math.max(0, i - 6);
    const chronicFrom = Math.max(0, i - 27);
    const acute   = arr.slice(acuteFrom, i + 1).reduce((a, b) => a + b, 0);
    const chronic = arr.slice(chronicFrom, i + 1).reduce((a, b) => a + b, 0) / 4;
    const ratio   = chronic > 0 ? acute / chronic : null;
    return { ...d, acwr: ratio };
  });
}

// ── KPIs for the four header cards ─────────────────────────────────────────
function computeKpis(sessions, planned, weeks) {
  const today = startOfDay(new Date());
  const start = new Date(today.getTime() - weeks * 7 * ONE_DAY_MS);

  const inSessions = sessions.filter(s => new Date(s.started_at) >= start);
  const inPlanned  = planned.filter(p => {
    const pd = new Date(p.planned_date + 'T00:00:00');
    return pd >= start && pd <= today;
  });

  const completed = inSessions.length;
  const plannedCount = inPlanned.length;

  // Compliance — completed/planned for the window. Cap at 100 visually.
  const compliancePct = plannedCount > 0
    ? Math.min(100, Math.round((completed / plannedCount) * 100))
    : 0;

  // Total session load (RPE × Duration in min) and total volume load (kg).
  const totalRpe    = inSessions.reduce((s, x) => s + rpeLoad(x), 0);
  const totalVolume = inSessions.reduce((s, x) => s + volumeLoad(x), 0);

  return {
    sessionsCompleted: { count: completed, planned: plannedCount },
    compliance:        compliancePct,
    rpeTotal:          totalRpe,
    volumeTotal:       totalVolume,
  };
}

// ── Latest 7-day average for the rolling-average label on each KPI card ──
function trailingWeekAverage(daily) {
  const last7 = daily.slice(-7).map(d => d.value);
  if (!last7.length) return 0;
  return last7.reduce((a, b) => a + b, 0) / last7.length;
}

// Auto-detect if an exercise is best tracked as 1RM (Mayhew) or as
// best-reps-per-session. The Mayhew formula doesn't apply when the
// load is bodyweight or the load doesn't vary across sessions —
// trying to use it then produces flat / misleading numbers.
//
// Heuristics (in order):
//   1. Name match — common bodyweight movements always use reps.
//   2. Variance check — if every set across all sessions is at the
//      same load, treat it as a reps progression (consistent with
//      bodyweight isolation movements).
//   3. Default to 1RM Mayhew.
const BODYWEIGHT_NAME_PATTERNS = [
  /push[-\s]?up/i,
  /pull[-\s]?up/i,
  /chin[-\s]?up/i,
  /^dip\b/i,
  /burpee/i,
  /sit[-\s]?up/i,
  /plank/i,
];

function detectMetric(name, weights) {
  if (BODYWEIGHT_NAME_PATTERNS.some(re => re.test(name))) return 'reps';
  const numericWeights = weights.filter(w => w != null && isFinite(Number(w)));
  if (numericWeights.length === 0) return 'reps';
  const min = Math.min(...numericWeights);
  const max = Math.max(...numericWeights);
  if (max - min < 1) return 'reps';   // weight is effectively constant
  return 'e1rm';
}

// ── Exercise progress series ────────────────────────────────────────────
// Returns [{ exerciseId, name, metric, unit, points, latest }]
//   * metric: 'e1rm' | 'reps'  (per-exercise auto-detected)
//   * One point per session per exercise — best Mayhew 1RM (weighted)
//     or best rep count (bodyweight) across the session's sets.
//   * Filtered to the visible window so the chart aligns with the others.
export function computeExerciseSeries(sessions, weeks) {
  const today = startOfDay(new Date());
  const start = new Date(today.getTime() - weeks * 7 * ONE_DAY_MS);
  const inSessions = sessions.filter(s => new Date(s.started_at) >= start);

  // First pass — collect raw sets per exercise so we can decide the metric.
  const raw = new Map(); // exId -> { name, setsByDay: Map<day, set[]> }
  for (const s of inSessions) {
    if (!Array.isArray(s.sets)) continue;
    const day = isoDay(new Date(s.started_at));
    for (const set of s.sets) {
      if (!set.exercise_id) continue;
      const key = set.exercise_id;
      if (!raw.has(key)) raw.set(key, { name: set.exercise_name || '(unknown)', setsByDay: new Map() });
      const bucket = raw.get(key).setsByDay;
      if (!bucket.has(day)) bucket.set(day, []);
      bucket.get(day).push(set);
    }
  }

  const out = [];
  for (const [exerciseId, info] of raw) {
    const allSets   = Array.from(info.setsByDay.values()).flat();
    const allWeights = allSets.map(s => Number(s.weight_kg));
    const metric    = detectMetric(info.name, allWeights);

    const points = [];
    for (const [day, sets] of info.setsByDay) {
      let bestVal = null;
      if (metric === 'e1rm') {
        for (const s of sets) {
          const e1 = mayhew1RM(s.weight_kg, s.reps);
          if (e1 != null && (bestVal == null || e1 > bestVal)) bestVal = e1;
        }
      } else {
        // Best reps in a single set this day.
        for (const s of sets) {
          const r = Number(s.reps || 0);
          if (r > 0 && (bestVal == null || r > bestVal)) bestVal = r;
        }
      }
      if (bestVal == null) continue;
      points.push({
        date:   day,
        label:  shortLabel(day),
        value:  round(bestVal, metric === 'e1rm' ? 1 : 0),
      });
    }
    if (points.length === 0) continue;
    points.sort((a, b) => a.date.localeCompare(b.date));

    out.push({
      exerciseId,
      name:       info.name,
      metric,                                 // 'e1rm' | 'reps'
      unit:       metric === 'e1rm' ? 'kg' : 'reps',
      metricLabel: metric === 'e1rm' ? 'Estimated 1RM (Mayhew)' : 'Best Reps per Session',
      points,
      latest:     points[points.length - 1].value,
    });
  }
  out.sort((a, b) => {
    const aLast = a.points[a.points.length - 1].date;
    const bLast = b.points[b.points.length - 1].date;
    if (aLast !== bLast) return bLast.localeCompare(aLast);
    return b.latest - a.latest;
  });
  return out;
}

// ── Mayhew 1RM (kept here as well so this module stands alone) ─────────
function mayhew1RM(weight, reps) {
  const w = Number(weight);
  const r = Number(reps);
  if (!isFinite(w) || w <= 0 || !isFinite(r) || r < 1) return null;
  if (r === 1) return w;
  if (r > 12)  return null;
  return (100 * w) / (52.2 + 41.9 * Math.exp(-0.055 * r));
}

function round(v, dp = 1) {
  if (v == null || !isFinite(v)) return null;
  const f = Math.pow(10, dp);
  return Math.round(v * f) / f;
}

// ── Public: assemble the dashboard data bundle ──────────────────────────
export function computeDashboardMetrics({ sessions = [], planned = [], weeks = 8 }) {
  const kpis = computeKpis(sessions, planned, weeks);

  const dailyRpe = buildDailySeries(sessions, rpeLoad,    weeks);
  const dailyVol = buildDailySeries(sessions, volumeLoad, weeks);

  const rpeSeries = attachACWR(attachRollingAvg(dailyRpe));
  const volSeries = attachACWR(attachRollingAvg(dailyVol));

  const exerciseSeries = computeExerciseSeries(sessions, weeks);

  return {
    kpis: {
      sessionsCompleted: kpis.sessionsCompleted,
      compliance:        kpis.compliance,
      rpe: {
        total:        Math.round(kpis.rpeTotal),
        rolling8wAvg: Math.round(trailingWeekAverage(rpeSeries) * 7),
        latestACWR:   round(rpeSeries[rpeSeries.length - 1]?.acwr, 2),
      },
      volume: {
        total:        Math.round(kpis.volumeTotal),
        rolling8wAvg: Math.round(trailingWeekAverage(volSeries) * 7),
        latestACWR:   round(volSeries[volSeries.length - 1]?.acwr, 2),
      },
    },
    rpeSeries,        // [{ date, label, value, rolling, acwr }]
    volumeSeries: volSeries,
    exerciseSeries,
  };
}
