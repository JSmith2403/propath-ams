// Turns what Garmin PUSHES to /api/garmin/webhook into rows for our tables. Pure functions — no network, no
// database — so the mapping can be tested against sample payloads.
//
// A push is a JSON object whose top-level keys name the data type and whose values are arrays of records, e.g.
//   { "dailies": [ { userId, calendarDate, steps, … } ], "sleeps": [ … ], "deregistrations": [ { userId } ] }
// Every record carries the Garmin `userId`, which we match to an athlete.
//
// Garmin's field names are matched tolerantly (several spellings, a few levels deep) and each original record is
// kept in a raw_* column, so a wrong guess can be corrected later without asking Garmin to resend anything.
// Use Garmin's "Data Generator" / "Data Viewer" in the developer portal to check the mapping end to end.

function find(obj, names, depth = 2) {
  if (obj == null || typeof obj !== 'object') return undefined;
  for (const n of names) if (obj[n] != null && typeof obj[n] !== 'object') return obj[n];
  if (depth <= 0) return undefined;
  for (const v of Object.values(obj)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) { const hit = find(v, names, depth - 1); if (hit !== undefined) return hit; }
  }
  return undefined;
}
const num = (v) => { const n = Number(v); return v == null || v === '' || !Number.isFinite(n) ? null : n; };
const int = (v) => { const n = num(v); return n == null ? null : Math.round(n); };
const isoDay = (v) => (/^\d{4}-\d{2}-\d{2}/.test(String(v || '')) ? String(v).slice(0, 10) : null);
const list = (v) => (Array.isArray(v) ? v.filter(r => r && typeof r === 'object') : []);

/** Local calendar date of an activity: start time (epoch seconds, UTC) shifted by the watch's own UTC offset. */
export function localDay(startSeconds, offsetSeconds) {
  const s = num(startSeconds);
  if (s == null) return null;
  return new Date((s + (num(offsetSeconds) || 0)) * 1000).toISOString().slice(0, 10);
}

const dropNulls = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v != null));

export const mapDaily = (r) => dropNulls({
  steps: int(find(r, ['steps', 'totalSteps'])),
  resting_hr: int(find(r, ['restingHeartRateInBeatsPerMinute', 'restingHeartRate'])),
  avg_stress: int(find(r, ['averageStressLevel', 'avgStressLevel'])),
  body_battery_high: int(find(r, ['bodyBatteryHighestValue', 'bodyBatteryHigh'])),
  body_battery_low: int(find(r, ['bodyBatteryLowestValue', 'bodyBatteryLow'])),
  active_kcal: int(find(r, ['activeKilocalories', 'activeCalories'])),
});

export const mapSleep = (r) => dropNulls({
  sleep_seconds: int(find(r, ['durationInSeconds', 'sleepTimeSeconds', 'totalSleepSeconds'], 0)),
  sleep_score: int(r?.overallSleepScore?.value ?? r?.sleepScores?.overall?.value ?? find(r, ['overallScore', 'sleepScore'], 0)),
});

export const mapHrv = (r) => dropNulls({
  hrv_last_night: int(find(r, ['lastNightAvg', 'lastNight'], 0)),
  hrv_weekly_avg: int(find(r, ['weeklyAvg'], 0)),
  hrv_status: find(r, ['status'], 0) ?? null,
});

export function mapActivity(a) {
  const id = num(a?.activityId);
  if (!id) return null;
  const start = num(a.startTimeInSeconds);
  return {
    activity_id: id,
    started_at: start != null ? new Date(start * 1000).toISOString() : null,
    day: localDay(a.startTimeInSeconds, a.startTimeOffsetInSeconds),
    activity_type: a.activityType ? String(a.activityType).toLowerCase() : null,
    name: a.activityName || null,
    duration_s: num(a.durationInSeconds),
    distance_m: num(a.distanceInMeters),
    avg_hr: int(a.averageHeartRateInBeatsPerMinute),
    max_hr: int(a.maxHeartRateInBeatsPerMinute),
    calories: int(a.activeKilocalories ?? a.calories),
    training_load: num(a.activityTrainingLoad ?? a.trainingLoad),
    raw: a,
  };
}

/**
 * body → {
 *   daily:        [{ userId, day, cols, rawCol, raw }]        merged per athlete-day by the caller
 *   activities:   [{ userId, row }]
 *   deregistered: [userId]                                     the athlete removed access on Garmin's side
 *   permissions:  [{ userId, permissions: [string] }]          the athlete changed what they share
 *   ignored:      [data type names we don't store yet]
 * }
 */
export function parsePush(body) {
  const out = { daily: [], activities: [], deregistered: [], permissions: [], ignored: [] };
  if (!body || typeof body !== 'object') return out;

  for (const [type, value] of Object.entries(body)) {
    const rows = list(value);
    if (!rows.length) continue;
    switch (type) {
      case 'dailies':
        rows.forEach(r => { const day = isoDay(r.calendarDate); if (r.userId && day) out.daily.push({ userId: String(r.userId), day, cols: mapDaily(r), rawCol: 'raw_daily', raw: r }); });
        break;
      case 'sleeps':
        rows.forEach(r => { const day = isoDay(r.calendarDate); if (r.userId && day) out.daily.push({ userId: String(r.userId), day, cols: mapSleep(r), rawCol: 'raw_sleep', raw: r }); });
        break;
      case 'hrv':
        rows.forEach(r => { const day = isoDay(r.calendarDate); if (r.userId && day) out.daily.push({ userId: String(r.userId), day, cols: mapHrv(r), rawCol: 'raw_hrv', raw: r }); });
        break;
      case 'activities':
        rows.forEach(r => { const row = mapActivity(r); if (r.userId && row) out.activities.push({ userId: String(r.userId), row }); });
        break;
      case 'deregistrations':
        rows.forEach(r => { if (r.userId) out.deregistered.push(String(r.userId)); });
        break;
      case 'userPermissionsChange':
        rows.forEach(r => { if (r.userId) out.permissions.push({ userId: String(r.userId), permissions: Array.isArray(r.permissions) ? r.permissions.map(String) : [] }); });
        break;
      default:
        out.ignored.push(type);
    }
  }
  return out;
}
