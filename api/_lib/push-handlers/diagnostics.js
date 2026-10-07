// Push plumbing endpoints (all behind /api/push/<action>):
//
//   POST subscribe-athlete  athlete  { endpoint, keys_p256dh, keys_auth, user_agent? }
//        Registers (or refreshes) this device for the signed-in athlete. Done
//        through the server so the athlete id comes from the login and the write
//        can't be blocked by table permissions. Safe to call on every app open.
//   POST push-status        coach    → { ok, devices: { [athlete_id]: n }, my_devices }
//        Which athletes have at least one device that can receive notifications.
//   POST push-test          coach    { athlete_id } → { ok, sent, total }
//        Sends a real test notification so you can check it reaches a phone.

import { requireUser } from '../verifyUser.js';
import { getSupabaseAdmin, isStaffUser } from '../athleteAuth.js';
import { configureWebPush, sendPushToAthlete, MESSAGE_PUSH } from '../push.js';

async function begin(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'POST only' }); return null; }
  const user = await requireUser(req, res);
  if (!user) return null;
  const admin = getSupabaseAdmin();
  if (!admin) { res.status(503).json({ ok: false, error: 'Server not configured (SUPABASE_SECRET_KEY missing).' }); return null; }
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch { res.status(400).json({ ok: false, error: 'Invalid JSON body' }); return null; }
  return { user, admin, body };
}

export async function subscribeAthlete(req, res) {
  const ctx = await begin(req, res); if (!ctx) return;
  const { user, admin, body } = ctx;

  const { data: role } = await admin.from('user_roles').select('role, athlete_id').eq('user_id', user.id).maybeSingle();
  if (!role || role.role !== 'athlete' || !role.athlete_id) {
    res.status(403).json({ ok: false, error: 'Athletes only.' }); return;
  }
  const { endpoint, keys_p256dh, keys_auth } = body || {};
  if (!endpoint || !keys_p256dh || !keys_auth) {
    res.status(400).json({ ok: false, error: 'Missing subscription details.' }); return;
  }

  // One row per device (endpoint): if this phone was last used by someone else,
  // it now belongs to the athlete who is signed in.
  const { error } = await admin.from('push_subscriptions').upsert({
    athlete_id: role.athlete_id,
    user_id: null,
    endpoint,
    keys_p256dh,
    keys_auth,
    user_agent: String(body.user_agent || '').slice(0, 300),
  }, { onConflict: 'endpoint' });
  if (error) { res.status(500).json({ ok: false, error: error.message }); return; }
  res.status(200).json({ ok: true });
}

export async function pushStatus(req, res) {
  const ctx = await begin(req, res); if (!ctx) return;
  const { user, admin } = ctx;
  if (!(await isStaffUser(admin, user.id))) { res.status(403).json({ ok: false, error: 'Coaches only.' }); return; }

  const { data: subs, error } = await admin.from('push_subscriptions').select('athlete_id, user_id');
  if (error) { res.status(500).json({ ok: false, error: error.message }); return; }

  const devices = {};
  let mine = 0;
  for (const s of subs || []) {
    if (s.athlete_id) devices[s.athlete_id] = (devices[s.athlete_id] || 0) + 1;
    if (s.user_id === user.id) mine++;
  }
  res.status(200).json({ ok: true, devices, my_devices: mine, pushConfigured: configureWebPush() });
}

export async function testPush(req, res) {
  const ctx = await begin(req, res); if (!ctx) return;
  const { user, admin, body } = ctx;
  if (!(await isStaffUser(admin, user.id))) { res.status(403).json({ ok: false, error: 'Coaches only.' }); return; }

  const athleteId = String(body?.athlete_id || '');
  if (!athleteId) { res.status(400).json({ ok: false, error: 'athlete_id is required' }); return; }
  if (!configureWebPush()) {
    res.status(503).json({ ok: false, error: 'Push isn\'t configured on the server (VAPID keys missing).' }); return;
  }

  try {
    const r = await sendPushToAthlete(admin, athleteId, {
      title: 'ProPath test notification',
      body: 'If you can see this on your lock screen, notifications are working.',
      url: '/athlete?inbox=1',
      tag: 'push-test',
    }, MESSAGE_PUSH);
    res.status(200).json({ ok: true, sent: r.sent, total: r.total, removed: r.removed });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
