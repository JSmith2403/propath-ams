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
import { sendPushToAthlete } from '../_lib/push.js';

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

  try {
    const result = await sendPushToAthlete(supabaseAdmin, athleteId, { title, body: messageBody, url });
    res.status(200).json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
