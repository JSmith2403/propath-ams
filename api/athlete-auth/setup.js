// POST /api/athlete-auth/setup
// body: { token, username, pin }
//
// First-time (or re-setup after a coach reset) account creation. Only
// reachable via a valid, active, pin_login_enabled token — proves the
// caller holds the original coach-issued link. Creates a REAL Supabase
// Auth user (synthetic email, the PIN as its real password) rather
// than a custom credential — the client signs in with it immediately
// after this returns.

import { getSupabaseAdmin, loadAthleteDisplay, sanitizeUsername, ATHLETE_EMAIL_DOMAIN } from '../_lib/athleteAuth.js';

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
  const username = sanitizeUsername(body?.username);
  const pin = String(body?.pin || '');
  if (!token) { res.status(400).json({ ok: false, error: 'token is required' }); return; }
  if (username.length < 3) { res.status(400).json({ ok: false, error: 'Username must be at least 3 characters.' }); return; }
  if (!/^\d{6,}$/.test(pin)) { res.status(400).json({ ok: false, error: 'PIN must be at least 6 digits (Supabase Auth\'s own minimum password length).' }); return; }

  const { data: tokenRow, error: tErr } = await admin
    .from('athlete_app_tokens')
    .select('athlete_id, is_active, pin_login_enabled')
    .eq('token', token)
    .maybeSingle();
  if (tErr) { res.status(500).json({ ok: false, error: tErr.message }); return; }
  if (!tokenRow || !tokenRow.is_active) { res.status(404).json({ ok: false, error: 'Invalid or inactive token.' }); return; }
  if (!tokenRow.pin_login_enabled) { res.status(200).json({ ok: true, enabled: false }); return; }

  // Self-heal: wipe any stale account from a previous partial setup
  // (e.g. account created but role-row insert failed) so this is safe
  // to retry rather than getting permanently stuck.
  const { data: existingRole } = await admin
    .from('user_roles')
    .select('user_id')
    .eq('athlete_id', tokenRow.athlete_id)
    .maybeSingle();
  if (existingRole) {
    await admin.auth.admin.deleteUser(existingRole.user_id).catch(() => {});
    await admin.from('user_roles').delete().eq('user_id', existingRole.user_id);
  }

  const display = await loadAthleteDisplay(admin, tokenRow.athlete_id);
  const fullName = display.ok ? display.athlete.name : null;

  const email = `${username}@${ATHLETE_EMAIL_DOMAIN}`;
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email,
    password: pin,
    email_confirm: true,
  });
  if (cErr) {
    const taken = /already.*(registered|exists)/i.test(cErr.message || '');
    res.status(400).json({ ok: false, error: taken ? 'That username is taken — try another.' : cErr.message });
    return;
  }

  const { error: roleErr } = await admin.from('user_roles').insert({
    user_id: created.user.id,
    role: 'athlete',
    athlete_id: tokenRow.athlete_id,
    full_name: fullName,
  });
  if (roleErr) {
    await admin.auth.admin.deleteUser(created.user.id).catch(() => {});
    res.status(500).json({ ok: false, error: roleErr.message });
    return;
  }

  res.status(200).json({ ok: true, enabled: true, email });
}
