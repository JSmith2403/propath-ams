// POST /api/athlete-auth/setup-pin
// body: { sessionToken, pin }
//
// First-time PIN set (or re-set after a coach-triggered reset). Only
// reachable via a session minted by token-session.js, i.e. the athlete
// already proved they hold the original coach-issued link.

import { getSupabaseAdmin, resolveSession, hashPin, generateLoginCode } from '../_lib/athleteAuth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'POST only' });
    return;
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    res.status(503).json({ ok: false, error: 'Server not configured (SUPABASE_SECRET_KEY missing).' });
    return;
  }

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch { res.status(400).json({ ok: false, error: 'Invalid JSON body' }); return; }

  const pin = String(body?.pin || '');
  if (!/^\d{4,6}$/.test(pin)) {
    res.status(400).json({ ok: false, error: 'PIN must be 4-6 digits.' });
    return;
  }

  const session = await resolveSession(admin, body?.sessionToken);
  if (!session.ok) { res.status(401).json({ ok: false, error: session.error }); return; }

  const { hash, salt } = hashPin(pin);

  // Retry a couple of times on the (very unlikely) login_code collision.
  let lastErr = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const loginCode = generateLoginCode();
    const { error } = await admin.from('athlete_credentials').upsert({
      athlete_id: session.athleteId,
      login_code: loginCode,
      pin_hash: hash,
      pin_salt: salt,
    }, { onConflict: 'athlete_id' });
    if (!error) {
      res.status(200).json({ ok: true, loginCode });
      return;
    }
    lastErr = error;
    if (error.code !== '23505') break; // not a unique-collision — don't retry
  }
  res.status(500).json({ ok: false, error: lastErr?.message || 'Could not save PIN.' });
}
