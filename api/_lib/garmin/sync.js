// Pulls an athlete's recent Garmin data and stores it.
//   garmin_daily       ← dailysummaries + sleep + HRV   (one row per day, merged)
//   garmin_activities  ← activity list
// Each source is fetched and saved independently, so one failing endpoint never wipes or blocks
// the others. Original payloads are kept (raw_*) so field mapping can be corrected later.
//
// Garmin's personal API doesn't publish response schemas, so values are located by well-known
// Garmin Connect field names, searched a few levels deep. `diagnose()` reports what actually comes
// back (field names only, no values) so the mapping can be checked against a real account.

import { decryptKey } from './crypto.js';
import { getBearer, garminGet, GarminError } from './client.js';

const dubaiToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai' }).format(new Date());
const addDays = (iso, n) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

// ── tolerant field lookup ──────────────────────────────────────────────────
function find(obj, names, depth = 3) {
  if (obj == null || typeof obj !== 'object') return undefined;
  for (const n of names) if (obj[n] != null && typeof obj[n] !== 'object') return obj[n];
  if (depth <= 0) return undefined;
  for (const v of Object.values(obj)) {
    if (v && typeof v === 'object') { const hit = find(v, names, depth - 1); if (hit !== undefined) return hit; }
  }
  return undefined;
}
const num = (v) => { const n = Number(v); return v == null || v === '' || !Number.isFinite(n) ? null : n; };
const int = (v) => { const n = num(v); return n == null ? null : Math.round(n); };
const rowsFrom = (json) => {
  if (Array.isArray(json)) return json;
  if (json && typeof json === 'object') {
    const arr = Object.values(json).find(v => Array.isArray(v));
    if (arr) return arr;
    if (find(json, ['calendarDate', 'date'], 0)) return [json];
  }
  return [];
};
const dayOf = (row) => String(find(row, ['calendarDate', 'date', 'summaryDate'], 1) || '').slice(0, 10) || null;

// ── mappers: Garmin row → our columns ──────────────────────────────────────
const mapDaily = (r) => ({
  steps: int(find(r, ['totalSteps', 'steps'])),
  resting_hr: int(find(r, ['restingHeartRate', 'restingHeartRateValue'])),
  avg_stress: int(find(r, ['averageStressLevel', 'avgStressLevel'])),
  body_battery_high: int(find(r, ['bodyBatteryHighestValue', 'bodyBatteryHigh'])),
  body_battery_low: int(find(r, ['bodyBatteryLowestValue', 'bodyBatteryLow'])),
  active_kcal: int(find(r, ['activeKilocalories', 'activeCalories'])),
});
const mapSleep = (r) => ({
  sleep_seconds: int(find(r, ['sleepTimeSeconds', 'totalSleepSeconds'])),
  sleep_score: int(r?.sleepScores?.overall?.value ?? find(r, ['overallScore', 'sleepScore'])),
});
const mapHrv = (r) => ({
  hrv_last_night: int(find(r, ['lastNightAvg', 'lastNight'])),
  hrv_weekly_avg: int(find(r, ['weeklyAvg'])),
  hrv_status: find(r, ['status']) ?? null,
});
const mapActivity = (a) => {
  const id = num(a?.activityId ?? a?.id);
  if (!id) return null;
  const gmt = a.startTimeGMT || a.beginTimestamp;
  const local = String(a.startTimeLocal || '').slice(0, 10);
  const started = typeof gmt === 'string' ? new Date(gmt.replace(' ', 'T') + 'Z') : (gmt ? new Date(Number(gmt)) : null);
  return {
    activity_id: id,
    started_at: started && !isNaN(started) ? started.toISOString() : null,
    day: /^\d{4}-\d{2}-\d{2}$/.test(local) ? local : (started && !isNaN(started) ? started.toISOString().slice(0, 10) : null),
    activity_type: a.activityType?.typeKey || a.activityType || null,
    name: a.activityName || null,
    duration_s: num(a.duration),
    distance_m: num(a.distance),
    avg_hr: int(a.averageHR),
    max_hr: int(a.maxHR),
    calories: int(a.calories),
    training_load: num(a.activityTrainingLoad),
    raw: a,
  };
};

// ── the four sources ───────────────────────────────────────────────────────
const SOURCES = (from, to) => ({
  daily: `/usersummary-service/v2/dailysummaries?startDate=${from}&endDate=${to}`,
  sleep: `/sleep-service/sleep/dailySleepSummariesByDate?startDate=${from}&endDate=${to}`,
  hrv: `/hrv-service/hrv/daily/${from}/${to}`,
  activities: `/activitylist-service/activities/search/activities?start=0&limit=40&startDate=${from}&endDate=${to}`,
});

async function connectionFor(admin, athleteId) {
  const { data } = await admin.from('garmin_connections').select('*').eq('athlete_id', athleteId).maybeSingle();
  return data && data.key_ciphertext && data.status !== 'disconnected' ? data : null;
}

async function markFailed(admin, athleteId, err) {
  const lapsed = err instanceof GarminError && (err.status === 401 || err.status === 403);
  await admin.from('garmin_connections').update({
    status: lapsed ? 'needs_attention' : 'connected',
    last_error: lapsed ? 'Your Garmin key has expired or been removed — create a new one and reconnect.' : String(err.message || err).slice(0, 300),
    updated_at: new Date().toISOString(),
  }).eq('athlete_id', athleteId);
}

/** Sync one athlete. days: how far back (max 28 — one Garmin range call). */
export async function syncAthlete(admin, athleteId, { days = 7 } = {}) {
  const conn = await connectionFor(admin, athleteId);
  if (!conn) return { ok: false, error: 'Garmin is not connected.' };

  let token;
  try { token = await getBearer(decryptKey(conn.key_ciphertext)); }
  catch (e) { await markFailed(admin, athleteId, e); return { ok: false, error: e.message }; }

  const to = dubaiToday();
  const from = addDays(to, -Math.min(Math.max(days, 1), 28));
  const urls = SOURCES(from, to);
  const names = Object.keys(urls);
  const settled = await Promise.allSettled(names.map(n => garminGet(token, urls[n])));
  const got = Object.fromEntries(names.map((n, i) => [n, settled[i]]));

  const errors = [];
  const now = new Date().toISOString();
  const counts = { days: 0, activities: 0 };
  const save = async (table, rows, onConflict) => {
    if (!rows.length) return;
    const { error } = await admin.from(table).upsert(rows, { onConflict });
    if (error) errors.push(`${table}: ${error.message}`);
  };

  const dayRows = (source, mapper, rawCol) => {
    const s = got[source];
    if (s.status === 'rejected') { errors.push(`${source}: ${s.reason?.message || 'failed'}`); return []; }
    return rowsFrom(s.value).map(r => {
      const day = dayOf(r);
      return day ? { athlete_id: athleteId, day, ...mapper(r), [rawCol]: r, updated_at: now } : null;
    }).filter(Boolean);
  };
  const daily = dayRows('daily', mapDaily, 'raw_daily');
  const sleep = dayRows('sleep', mapSleep, 'raw_sleep');
  const hrv = dayRows('hrv', mapHrv, 'raw_hrv');
  await save('garmin_daily', daily, 'athlete_id,day');
  await save('garmin_daily', sleep, 'athlete_id,day');
  await save('garmin_daily', hrv, 'athlete_id,day');
  counts.days = new Set([...daily, ...sleep, ...hrv].map(r => r.day)).size;

  const a = got.activities;
  if (a.status === 'rejected') errors.push(`activities: ${a.reason?.message || 'failed'}`);
  else {
    const rows = rowsFrom(a.value).map(mapActivity).filter(Boolean).map(r => ({ athlete_id: athleteId, ...r, updated_at: now }));
    await save('garmin_activities', rows, 'athlete_id,activity_id');
    counts.activities = rows.length;
  }

  const allFailed = settled.every(s => s.status === 'rejected');
  const lapsed = settled.some(s => s.status === 'rejected' && (s.reason?.status === 401 || s.reason?.status === 403));
  await admin.from('garmin_connections').update({
    status: lapsed ? 'needs_attention' : 'connected',
    last_sync_at: allFailed ? conn.last_sync_at : now,
    last_error: errors.length ? errors.join(' · ').slice(0, 400) : null,
    updated_at: now,
  }).eq('athlete_id', athleteId);

  return { ok: !allFailed, ...counts, errors };
}

/** Field names only (no values) for each source — for checking the mapping against a real account. */
export async function diagnose(admin, athleteId) {
  const conn = await connectionFor(admin, athleteId);
  if (!conn) return { ok: false, error: 'Garmin is not connected.' };
  const token = await getBearer(decryptKey(conn.key_ciphertext));
  const to = dubaiToday();
  const urls = SOURCES(addDays(to, -3), to);
  const out = {};
  for (const [name, path] of Object.entries(urls)) {
    try {
      const json = await garminGet(token, path);
      const rows = rowsFrom(json);
      out[name] = {
        ok: true,
        topLevel: Array.isArray(json) ? 'array' : Object.keys(json || {}),
        rows: rows.length,
        firstRowFields: rows[0] && typeof rows[0] === 'object' ? Object.keys(rows[0]).slice(0, 60) : null,
      };
    } catch (e) { out[name] = { ok: false, error: e.message }; }
  }
  return { ok: true, sources: out };
}

/** Daily housekeeping: refresh every connected athlete (called from the daily cron). */
export async function syncAllConnected(admin, { budgetMs = 8000 } = {}) {
  const started = Date.now();
  const { data } = await admin.from('garmin_connections').select('athlete_id').neq('status', 'disconnected').order('last_sync_at', { ascending: true, nullsFirst: true });
  let done = 0;
  for (const row of data || []) {
    if (Date.now() - started > budgetMs) break;
    try { await syncAthlete(admin, row.athlete_id, { days: 3 }); done++; } catch (e) { console.error('[garmin cron]', row.athlete_id, e.message); }
  }
  return { connected: (data || []).length, synced: done };
}
