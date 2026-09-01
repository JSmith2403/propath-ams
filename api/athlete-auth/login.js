// POST /api/athlete-auth/login
// body: { loginCode, pin }
//
// Used from the stable /athlete URL when no local session exists yet
// (new device, cleared storage). No rate-limiting yet — acceptable for
// the single-athlete beta, worth adding before a wider rollout.

import { getSupabaseAdmin, verifyPin, newSessionToken, loadAthleteDisplay } from '../_lib/athleteAuth.js';

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

  const loginCode = String(body?.loginCode || '').trim().toUpperCase();
  const pin = String(body?.pin || '');
  if (!loginCode || !pin) {
    res.status(400).json({ ok: false, error: 'loginCode and pin are required' });
    return;
  }

  const { data: creds, error } = await admin
    .from('athlete_credentials')
    .select('athlete_id, pin_hash, pin_salt')
    .eq('login_code', loginCode)
    .maybeSingle();
  if (error) { res.status(500).json({ ok: false, error: error.message }); return; }
  if (!creds || !verifyPin(pin, creds.pin_hash, creds.pin_salt)) {
    res.status(401).json({ ok: false, error: 'Incorrect login ID or PIN.' });
    return;
  }

  const sessionToken = newSessionToken();
  const { error: sErr } = await admin.from('athlete_sessions').insert({
    athlete_id: creds.athlete_id,
    session_token: sessionToken,
    user_agent: req.headers['user-agent'] || null,
  });
  if (sErr) { res.status(500).json({ ok: false, error: sErr.message }); return; }

  const display = await loadAthleteDisplay(admin, creds.athlete_id);
  if (!display.ok) { res.status(500).json({ ok: false, error: display.error }); return; }

  res.status(200).json({ ok: true, sessionToken, athlete: display.athlete });
}
