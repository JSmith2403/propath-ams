// Vercel Cron — Sunday afternoon, UAE time. Pushes every athlete who still has
// unanswered slots in the published academy timetable for the week ahead
// (Mon–Sun) a reminder to confirm attendance. Tapping it opens the athlete app
// on the Train tab (the in-app timetable pop-up takes over from there).
//
//   GET /api/cron/weekly-attendance
//   header: Authorization: Bearer <CRON_SECRET>   (sent automatically by
//           Vercel once CRON_SECRET is set as a project env var)
//
// Scheduling: Vercel crons run in UTC. UAE (Asia/Dubai) is UTC+4 all year with
// no daylight saving, so one schedule — "0 11 * * 0" = Sunday 11:00 UTC = 3pm
// UAE — is enough. Hobby-plan crons can fire at any point within their hour,
// so in practice the reminder lands between 3:00pm and 3:59pm. The handler
// still checks the Dubai clock so a stray or manual call outside that hour
// does nothing.
//
//   ?force=1 (with the CRON_SECRET header) skips the time check, to test it.

import { createClient } from '@supabase/supabase-js';
import { configureWebPush, sendPushToAthlete } from '../push.js';
import { eligibilityForSubscribers } from '../timetable.js';

const TZ = 'Asia/Dubai';
const REMINDER_DAY = 'Sun';
const REMINDER_HOUR = 15;

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) return null;
  return createClient(url, secretKey);
}

/** Current UAE weekday ('Sun'…), hour (0–23) and date (YYYY-MM-DD). */
function uaeNow(now = new Date()) {
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
  const now = uaeNow();
  if (!force && !(now.weekday === REMINDER_DAY && now.hour === REMINDER_HOUR)) {
    res.status(200).json({ ok: true, skipped: 'not Sunday 3pm UAE time', uae: now });
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
  // through seven days later; `force` on another day still uses "from tomorrow".
  const from = addDaysISO(now.date, 1);
  const to = addDaysISO(now.date, 7);

  // The academy timetable the coaches published for that week.
  const { data: slots, error } = await admin
    .from('timetable_slots')
    .select('id, cohorts')
    .not('published_at', 'is', null)
    .gte('slot_date', from)
    .lte('slot_date', to);
  if (error) { res.status(500).json({ ok: false, error: error.message }); return; }
  if (!slots?.length) {
    res.status(200).json({ ok: true, window: { from, to }, slots: 0, reminded: 0 });
    return;
  }

  const eligibility = await eligibilityForSubscribers(admin, slots);

  let reminded = 0;
  let pending = 0;
  const failures = [];
  for (const [athleteId, info] of eligibility) {
    if (info.unanswered === 0) continue;
    pending++;
    try {
      const r = await sendPushToAthlete(admin, athleteId, {
        title: 'Which sessions are you attending next week?',
        body: `${info.unanswered} to confirm — it only takes a moment.`,
        url: '/athlete?tab=train',
      });
      if (r.sent > 0) reminded++;
    } catch (err) {
      failures.push({ athlete_id: athleteId, error: err.message });
    }
  }

  res.status(200).json({ ok: true, window: { from, to }, slots: slots.length, athletesWithUnanswered: pending, reminded, failures });
}
