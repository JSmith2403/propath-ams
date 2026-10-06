// POST /api/push/timetable-publish
// headers: Authorization: Bearer <coach Supabase session token>
// body: { week_start: 'YYYY-MM-DD' }   (the Monday of the week being published)
//
// Makes every not-yet-published slot in that Mon–Sun week visible to athletes
// and pushes the athletes it applies to: "next week's timetable is up". Safe to
// call again after adding slots — only the new ones are published, and only
// athletes affected by them are notified.

import { requireUser } from '../verifyUser.js';
import { getSupabaseAdmin, isStaffUser } from '../athleteAuth.js';
import { configureWebPush, sendPushToAthlete } from '../push.js';
import { eligibilityForSubscribers } from '../timetable.js';

function addDays(iso, n) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'POST only' });
    return;
  }

  const user = await requireUser(req, res);
  if (!user) return;

  const admin = getSupabaseAdmin();
  if (!admin) {
    res.status(503).json({ ok: false, error: 'Server not configured (SUPABASE_SECRET_KEY missing).' });
    return;
  }
  if (!(await isStaffUser(admin, user.id))) {
    res.status(403).json({ ok: false, error: 'Coaches only.' });
    return;
  }

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch { res.status(400).json({ ok: false, error: 'Invalid JSON body' }); return; }

  const weekStart = String(body?.week_start || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
    res.status(400).json({ ok: false, error: 'week_start (YYYY-MM-DD) is required.' });
    return;
  }

  const { data: published, error } = await admin
    .from('timetable_slots')
    .update({ published_at: new Date().toISOString() })
    .gte('slot_date', weekStart)
    .lte('slot_date', addDays(weekStart, 6))
    .is('published_at', null)
    .select('id, cohorts');
  if (error) {
    const hint = /timetable_slots/.test(error.message || '') ? ' (has sql/timetable_2026-10-08.sql been run?)' : '';
    res.status(500).json({ ok: false, error: error.message + hint });
    return;
  }
  if (!published?.length) {
    res.status(200).json({ ok: true, published: 0, notified: 0, pushConfigured: true });
    return;
  }

  if (!configureWebPush()) {
    res.status(200).json({ ok: true, published: published.length, notified: 0, pushConfigured: false });
    return;
  }

  // Notify athletes the newly published slots apply to.
  const eligibility = await eligibilityForSubscribers(admin, published);
  let notified = 0;
  for (const [athleteId, info] of eligibility) {
    try {
      const r = await sendPushToAthlete(admin, athleteId, {
        title: 'The timetable is up',
        body: `Tell us which sessions you're attending — ${info.eligible} to confirm.`,
        url: '/athlete?tab=train',
      });
      if (r.sent > 0) notified++;
    } catch (err) {
      console.error('[timetable-publish] push failed for', athleteId, err.message);
    }
  }

  res.status(200).json({ ok: true, published: published.length, notified, pushConfigured: true });
}
