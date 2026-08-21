// Vercel Cron — daily. Nudges athletes whose current quarterly
// development plan is closing soon and hasn't been pinged yet, so they
// have a chance to add their own goals before the coach closes the
// review. Coach-side reminders are a live in-app banner instead (see
// GoalsTab.jsx) — there's no push subscription flow for the coach
// dashboard, only the athlete PWA.
//
//   GET /api/cron/quarterly-nudges
//   header: Authorization: Bearer <CRON_SECRET>   (Vercel sends this
//           automatically for scheduled invocations once CRON_SECRET
//           is set as a project env var)
//
// Requires the same VAPID_* + SUPABASE_SECRET_KEY env vars as
// /api/push/send (see that file for details) plus CRON_SECRET.

import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import { sendPushToAthlete } from '../_lib/push.js';

const REMINDER_WINDOW_DAYS = 10;

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) return null;
  return createClient(url, secretKey);
}

export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.authorization || '';
    if (authHeader !== `Bearer ${cronSecret}`) {
      res.status(401).json({ ok: false, error: 'Unauthorized' });
      return;
    }
  }

  const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
  const { VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
    res.status(503).json({ ok: false, error: 'Push is not configured on the server.' });
    return;
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    res.status(503).json({ ok: false, error: 'Server is not configured (SUPABASE_SECRET_KEY missing).' });
    return;
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const today = new Date().toLocaleDateString('en-CA');
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + REMINDER_WINDOW_DAYS);
  const cutoffIso = cutoff.toLocaleDateString('en-CA');

  const { data: duePlans, error: plansErr } = await supabaseAdmin
    .from('development_plans')
    .select('id, athlete_id, period_label')
    .in('status', ['draft', 'active'])
    .is('athlete_reminder_sent_at', null)
    .gte('period_end', today)
    .lte('period_end', cutoffIso);

  if (plansErr) {
    res.status(500).json({ ok: false, error: plansErr.message });
    return;
  }

  if (!duePlans || duePlans.length === 0) {
    res.status(200).json({ ok: true, nudged: 0 });
    return;
  }

  const athleteIds = [...new Set(duePlans.map(p => p.athlete_id))];
  const { data: tokens } = await supabaseAdmin
    .from('athlete_app_tokens')
    .select('athlete_id, token')
    .in('athlete_id', athleteIds);
  const tokenByAthlete = new Map((tokens || []).map(t => [t.athlete_id, t.token]));

  let nudged = 0;
  const failures = [];

  for (const plan of duePlans) {
    const token = tokenByAthlete.get(plan.athlete_id);
    try {
      const result = await sendPushToAthlete(supabaseAdmin, plan.athlete_id, {
        title: 'Your quarterly report is closing soon',
        body: `${plan.period_label} wraps up shortly — add your own goals before your coach finalises it.`,
        url: token ? `/athlete/${token}` : '/',
      });
      if (result.sent > 0) nudged++;
      // Mark sent regardless of device count so we don't retry an
      // athlete with no registered devices every day.
      await supabaseAdmin.from('development_plans')
        .update({ athlete_reminder_sent_at: new Date().toISOString() })
        .eq('id', plan.id);
    } catch (err) {
      failures.push({ plan_id: plan.id, error: err.message });
    }
  }

  res.status(200).json({ ok: true, checked: duePlans.length, nudged, failures });
}
