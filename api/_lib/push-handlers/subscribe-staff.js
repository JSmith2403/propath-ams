// POST /api/push/subscribe-staff
// headers: Authorization: Bearer <coach Supabase session token>
// body: { endpoint, keys_p256dh, keys_auth, user_agent? }
//
// Registers a coach's device for push (athlete replies, etc.). Done through
// the server because push_subscriptions has no coach-facing write policy.

import { requireUser } from '../verifyUser.js';
import { getSupabaseAdmin, isStaffUser } from '../athleteAuth.js';

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

  const { endpoint, keys_p256dh, keys_auth } = body || {};
  if (!endpoint || !keys_p256dh || !keys_auth) {
    res.status(400).json({ ok: false, error: 'Missing subscription details.' });
    return;
  }

  const { error } = await admin.from('push_subscriptions').upsert({
    user_id: user.id,
    athlete_id: null,
    endpoint,
    keys_p256dh,
    keys_auth,
    user_agent: String(body.user_agent || '').slice(0, 300),
  }, { onConflict: 'endpoint' });
  if (error) {
    const hint = /user_id/.test(error.message || '') ? ' (has sql/messaging_v2_two_way_safeguarding_2026-10-07.sql been run?)' : '';
    res.status(500).json({ ok: false, error: error.message + hint });
    return;
  }

  res.status(200).json({ ok: true });
}
