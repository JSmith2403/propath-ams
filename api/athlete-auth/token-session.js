// POST /api/athlete-auth/token-session
// body: { token }
//
// Called after the existing validate_athlete_token RPC succeeds. Re-
// validates the token server-side (service role — athlete_app_tokens
// has no anon SELECT at all) and, ONLY if pin_login_enabled is true
// for this athlete, mints a session and reports whether they've set a
// PIN yet. If the flag is off, returns { ok: true, enabled: false } and
// the caller falls back to today's token-only behaviour untouched —
// this is the single gate that keeps every other athlete unaffected.

import { getSupabaseAdmin, newSessionToken, loadAthleteDisplay } from '../_lib/athleteAuth.js';

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

  const token = String(body?.token || '').trim();
  if (!token) { res.status(400).json({ ok: false, error: 'token is required' }); return; }

  const { data: tokenRow, error: tErr } = await admin
    .from('athlete_app_tokens')
    .select('athlete_id, is_active, pin_login_enabled')
    .eq('token', token)
    .maybeSingle();
  if (tErr) { res.status(500).json({ ok: false, error: tErr.message }); return; }
  if (!tokenRow || !tokenRow.is_active) {
    res.status(404).json({ ok: false, error: 'Invalid or inactive token.' });
    return;
  }
  if (!tokenRow.pin_login_enabled) {
    res.status(200).json({ ok: true, enabled: false });
    return;
  }

  const { data: creds } = await admin
    .from('athlete_credentials')
    .select('login_code')
    .eq('athlete_id', tokenRow.athlete_id)
    .maybeSingle();

  const sessionToken = newSessionToken();
  const { error: sErr } = await admin.from('athlete_sessions').insert({
    athlete_id: tokenRow.athlete_id,
    session_token: sessionToken,
    user_agent: req.headers['user-agent'] || null,
  });
  if (sErr) { res.status(500).json({ ok: false, error: sErr.message }); return; }

  const display = await loadAthleteDisplay(admin, tokenRow.athlete_id);
  if (!display.ok) { res.status(500).json({ ok: false, error: display.error }); return; }

  res.status(200).json({
    ok: true,
    enabled: true,
    sessionToken,
    hasPin: !!creds,
    loginCode: creds?.login_code || null,
    athlete: display.athlete,
  });
}
