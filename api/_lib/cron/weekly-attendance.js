// Vercel Cron — Sunday 4pm UK time. Pushes every athlete who still has
// unanswered sessions in the week ahead (Mon–Sun) a reminder to confirm
// attendance. Tapping it opens the athlete app on the Train tab, where the
// "Week ahead" card lists those sessions.
//
//   GET /api/cron/weekly-attendance
//   header: Authorization: Bearer <CRON_SECRET>   (sent automatically by
//           Vercel once CRON_SECRET is set as a project env var)
//
// Scheduling: Vercel crons run in UTC, but 4pm UK moves with daylight saving
// (15:00 UTC in summer, 16:00 UTC in winter). vercel.json therefore schedules
// BOTH, and this handler only acts when it's actually 16:xx on a Sunday in
// Europe/London — the other run is a harmless no-op. (Hobby-plan crons can fire
// at any point within their hour, so "4pm" means 4:00–4:59pm there.)
//
//   ?force=1 (with the CRON_SECRET header) skips the time check, to test it.

import { createClient } from '@supabase/supabase-js';
import { configureWebPush, sendPushToAthlete } from '../push.js';

const TZ = 'Europe/London';
const REMINDER_DAY = 'Sun';
const REMINDER_HOUR = 16;

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) return null;
  return createClient(url, secretKey);
}

/** Current London weekday ('Sun'…), hour (0–23) and date (YYYY-MM-DD). */
function londonNow(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ, weekday: 'short', hour: '2-digit', hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(now).map(p => [p.type, p.value])
  );
  return {
    weekday: parts.weekday,
    hour: Number(parts.hour),
    date: `${parts.year}-${parts.month}-${parts.day}`,
  };
}

function addDaysISO(iso, n) {
  const d = new Date(`${iso}T12:00:00Z`);   // noon UTC: immune to DST shifts
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET;
  const authed = !!cronSecret && (req.headers.authorization || '') === `Bearer ${cronSecret}`;
  if (cronSecret && !authed) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  const q = req.query || {};
  const force = authed && (Array.isArray(q.force) ? q.force[0] : q.force) === '1';
  const now = londonNow();
  if (!force && !(now.weekday === REMINDER_DAY && now.hour === REMINDER_HOUR)) {
    res.status(200).json({ ok: true, skipped: 'not Sunday 4pm UK time', london: now });
    return;
  }

  if (!configureWebPush()) {
    res.status(503).json({ ok: false, error: 'Push is not configured on the server.' });
    return;
  }
  const admin = getSupabaseAdmin();
  if (!admin) {
    res.status(503).json({ ok: false, error: 'Server is not configured (SUPABASE_SECRET_KEY missing).' });
    return;
  }

  // The week ahead = the coming Monday to Sunday. On a Sunday that's tomorrow
  // through six days later; `force` on another day still uses "from tomorrow".
  const from = addDaysISO(now.date, 1);
  const to = addDaysISO(now.date, 7);

  const { data: sessions, error } = await admin
    .from('planned_sessions')
    .select('id, athlete_id, attendance')
    .gte('planned_date', from)
    .lte('planned_date', to);
  if (error) { res.status(500).json({ ok: false, error: error.message }); return; }

  const unanswered = new Map();           // athlete_id → count
  for (const s of sessions || []) {
    if (!s.attendance) unanswered.set(s.athlete_id, (unanswered.get(s.athlete_id) || 0) + 1);
  }
  if (unanswered.size === 0) {
    res.status(200).json({ ok: true, window: { from, to }, reminded: 0 });
    return;
  }

  const ids = [...unanswered.keys()];
  const { data: tokens } = await admin
    .from('athlete_app_tokens').select('athlete_id, token, pin_login_enabled').in('athlete_id', ids);
  const tokenByAthlete = new Map((tokens || []).map(t => [t.athlete_id, t]));

  let reminded = 0;
  const failures = [];
  for (const athleteId of ids) {
    const n = unanswered.get(athleteId);
    const t = tokenByAthlete.get(athleteId);
    const url = t?.pin_login_enabled || !t?.token ? '/athlete?tab=train' : `/athlete/${t.token}?tab=train`;
    try {
      const r = await sendPushToAthlete(admin, athleteId, {
        title: 'Complete your attendance for the week ahead',
        body: `${n} session${n === 1 ? '' : 's'} to confirm — it only takes a moment.`,
        url,
      });
      if (r.sent > 0) reminded++;
    } catch (err) {
      failures.push({ athlete_id: athleteId, error: err.message });
    }
  }

  res.status(200).json({ ok: true, window: { from, to }, athletesWithUnanswered: ids.length, reminded, failures });
}
