// Vercel serverless — coach sends a message to one or more athletes.
//
//   POST /api/messages/send
//   headers: Authorization: Bearer <coach Supabase session token>
//   body: { athlete_ids: ['em4', ...], title: '...', body: '...', sent_by?: 'Name' }
//
// Does two things per recipient:
//   1. Stores a row in athlete_messages (the athlete's in-app inbox + read
//      receipt). This always happens, even if push isn't configured.
//   2. Sends a Web Push nudge to their subscribed devices (best effort).
//
// Unlike the older /api/push/send, this checks the caller is actually staff
// (admin / co_admin in user_roles) — a valid JWT alone isn't enough, since
// athletes are real Supabase Auth users too.
//
// Requires the same env vars as /api/push/send (VAPID_*, SUPABASE_SECRET_KEY).

import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { requireUser } from '../_lib/verifyUser.js';
import { sendPushToAthlete } from '../_lib/push.js';

const MAX_RECIPIENTS = 200;

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
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

  const admin = getSupabaseAdmin();
  if (!admin) {
    res.status(503).json({ ok: false, error: 'Server not configured (SUPABASE_SECRET_KEY missing).' });
    return;
  }

  // Staff gate — requireUser only proves the JWT is valid.
  const { data: roleRow } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!roleRow || !['admin', 'co_admin'].includes(roleRow.role)) {
    res.status(403).json({ ok: false, error: 'Only coaches can send messages.' });
    return;
  }

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch { res.status(400).json({ ok: false, error: 'Invalid JSON body' }); return; }

  const title = String(body?.title || '').trim().slice(0, 120);
  const messageBody = String(body?.body || '').trim().slice(0, 2000);
  const sentBy = body?.sent_by ? String(body.sent_by).slice(0, 120) : (user.email || null);
  const athleteIds = [...new Set((Array.isArray(body?.athlete_ids) ? body.athlete_ids : [])
    .map(x => String(x || '').trim()).filter(Boolean))];

  if (!title) { res.status(400).json({ ok: false, error: 'A title is required.' }); return; }
  if (!athleteIds.length) { res.status(400).json({ ok: false, error: 'Pick at least one athlete.' }); return; }
  if (athleteIds.length > MAX_RECIPIENTS) {
    res.status(400).json({ ok: false, error: `Too many recipients (max ${MAX_RECIPIENTS}).` });
    return;
  }

  // 1. Store the messages (the inbox) — this is the source of truth.
  const batchId = randomUUID();
  const rows = athleteIds.map(athlete_id => ({
    batch_id: batchId, athlete_id, title, body: messageBody, sent_by: sentBy,
  }));
  const { error: insErr } = await admin.from('athlete_messages').insert(rows);
  if (insErr) {
    const hint = /athlete_messages/.test(insErr.message || '')
      ? ' (has sql/messaging_and_attendance_2026-10-06.sql been run?)' : '';
    res.status(500).json({ ok: false, error: insErr.message + hint });
    return;
  }

  // 2. Push nudge, best effort. Token athletes open via their token URL;
  //    PIN athletes via the stable /athlete entry.
  const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
  const { VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
    res.status(200).json({ ok: true, stored: athleteIds.length, pushed: 0, pushConfigured: false });
    return;
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const { data: tokenRows } = await admin
    .from('athlete_app_tokens')
    .select('athlete_id, token, is_active, pin_login_enabled')
    .in('athlete_id', athleteIds);
  const tokenByAthlete = new Map((tokenRows || []).map(t => [t.athlete_id, t]));

  let pushed = 0;
  await Promise.all(athleteIds.map(async (athleteId) => {
    const t = tokenByAthlete.get(athleteId);
    const url = t?.pin_login_enabled || !t?.token
      ? '/athlete?inbox=1'
      : `/athlete/${t.token}?inbox=1`;
    try {
      const r = await sendPushToAthlete(admin, athleteId, {
        title, body: messageBody.slice(0, 140), url,
      });
      pushed += r.sent;
    } catch (err) {
      console.error('[messages] push failed for', athleteId, err.message);
    }
  }));

  res.status(200).json({ ok: true, stored: athleteIds.length, pushed, pushConfigured: true });
}
