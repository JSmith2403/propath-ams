// Vercel serverless — sends a Web Push notification to one athlete's
// subscribed devices.
//
//   POST /api/push/send
//   headers: Authorization: Bearer <coach Supabase session token>
//   body: { athlete_id: 'em4', title: '...', body: '...', url?: '/athlete/...' }
//
// Requires on Vercel:
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY   (generate once with web-push, never rotate
//                                          without re-subscribing every athlete)
//   VAPID_SUBJECT                         mailto: address or https: URL, per the
//                                          Web Push spec
//   SUPABASE_SECRET_KEY                   this project's current name for the
//                                          RLS-bypassing server key (formerly
//                                          "service_role") — needed because
//                                          push_subscriptions has no anon SELECT
//                                          policy, the endpoint/keys are sensitive
//
// Coach-only for now (verified via requireUser) — this is the send-path
// behind the Wellness Overview panel's "Send reminder" button. A
// scheduled/cron sender (e.g. for a Sunday reflection prompt) would reuse
// the same sendToAthlete() logic with a different auth check.

import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import { requireUser } from '../_lib/verifyUser.js';

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  // SUPABASE_SECRET_KEY is the current name for this project (it's on
  // Supabase's newer sb_publishable_/sb_secret_ key system, not the old
  // anon/service_role JWTs) — SUPABASE_SERVICE_ROLE_KEY kept as a fallback
  // in case an older-style key ever gets used instead.
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) return null;
  return createClient(url, secretKey);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'POST only' });
    return;
  }

  const user = await requireUser(req, res);
  if (!user) return;

  // VITE_VAPID_PUBLIC_KEY fallback so the public key only needs setting
  // once in Vercel — same pattern as SUPABASE_URL/ANON_KEY in verifyUser.js.
  const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
  const { VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
    res.status(503).json({
      ok: false,
      error: 'Push is not configured on the server (VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT missing).',
    });
    return;
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    res.status(503).json({
      ok: false,
      error: 'Push is not configured on the server (SUPABASE_SECRET_KEY missing).',
    });
    return;
  }

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch { res.status(400).json({ ok: false, error: 'Invalid JSON body' }); return; }

  const athleteId = String(body?.athlete_id || '').trim();
  const title = String(body?.title || '').trim();
  const messageBody = String(body?.body || '').trim();
  const url = body?.url ? String(body.url) : '/';

  if (!athleteId || !title) {
    res.status(400).json({ ok: false, error: 'athlete_id and title are required' });
    return;
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const { data: subs, error: fetchErr } = await supabaseAdmin
    .from('push_subscriptions')
    .select('id, endpoint, keys_p256dh, keys_auth')
    .eq('athlete_id', athleteId);

  if (fetchErr) {
    res.status(500).json({ ok: false, error: fetchErr.message });
    return;
  }

  if (!subs || subs.length === 0) {
    res.status(200).json({ ok: true, sent: 0, message: 'Athlete has no registered devices.' });
    return;
  }

  const payload = JSON.stringify({ title, body: messageBody, url });
  const deadIds = [];
  let sent = 0;

  await Promise.all(subs.map(async (sub) => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
    };
    try {
      await webpush.sendNotification(pushSubscription, payload);
      sent++;
    } catch (err) {
      // 404/410 = the subscription is dead (uninstalled, permission revoked,
      // endpoint expired) — clean it up so future sends don't keep retrying it.
      if (err.statusCode === 404 || err.statusCode === 410) {
        deadIds.push(sub.id);
      } else {
        console.error('[push/send] failed for subscription', sub.id, err.statusCode, err.message);
      }
    }
  }));

  if (deadIds.length) {
    await supabaseAdmin.from('push_subscriptions').delete().in('id', deadIds);
  }

  res.status(200).json({ ok: true, sent, removed: deadIds.length, total: subs.length });
}
