// POST /api/athlete-auth/accounts
// headers: Authorization: Bearer <coach Supabase session token>
//
// Coach-only. Two actions, one endpoint:
//
//   { action: 'list' }
//     → { ok, accounts: { [athlete_id]: { username } } }   (who already has a login)
//
//   { action: 'provision', athlete_ids: [...], reset?: boolean }
//     → { ok, results: [{ athlete_id, name, status, username?, password? }] }
//     status: 'created' | 'reset' | 'exists' | 'error'
//     Creates a real Supabase Auth account (+ athlete user_roles row) for each
//     athlete that doesn't have one, with a generated username and password.
//     With reset:true, athletes that already have an account get a NEW password
//     (username unchanged). Passwords are returned ONCE — they're never stored
//     anywhere readable — so the coach copies them straight away.
//
// Also makes sure the athlete has an active athlete_app_tokens + wellness_tokens
// row, because the athlete app's wellness check-in and legacy link depend on it
// (same thing the coach's "Activate app" button does).

import { randomUUID } from 'node:crypto';
import { requireUser } from '../_lib/verifyUser.js';
import {
  getSupabaseAdmin, isStaffUser, loadAthleteDisplay,
  generatePassword, usernameFromName, ATHLETE_EMAIL_DOMAIN,
} from '../_lib/athleteAuth.js';

const MAX_PER_CALL = 100;

async function usernameForUser(admin, userId) {
  const { data } = await admin.auth.admin.getUserById(userId);
  const email = data?.user?.email || '';
  return email.endsWith(`@${ATHLETE_EMAIL_DOMAIN}`) ? email.split('@')[0] : null;
}

async function ensureAppAccess(admin, athleteId) {
  const { data: tok } = await admin
    .from('athlete_app_tokens').select('id, is_active').eq('athlete_id', athleteId).maybeSingle();
  if (!tok) {
    await admin.from('athlete_app_tokens').insert({
      athlete_id: athleteId, token: randomUUID(), is_active: true, pin_login_enabled: true,
    });
  } else if (!tok.is_active) {
    await admin.from('athlete_app_tokens').update({ is_active: true }).eq('id', tok.id);
  }

  const { data: w } = await admin
    .from('wellness_tokens').select('id, is_active').eq('athlete_id', athleteId).maybeSingle();
  if (!w) {
    await admin.from('wellness_tokens').insert({ athlete_id: athleteId, token: randomUUID(), is_active: true });
  } else if (!w.is_active) {
    await admin.from('wellness_tokens').update({ is_active: true }).eq('id', w.id);
  }
}

async function provisionOne(admin, athleteId, reset) {
  const display = await loadAthleteDisplay(admin, athleteId);
  if (!display.ok) return { athlete_id: athleteId, name: null, status: 'error', error: display.error };
  const name = display.athlete.name || athleteId;

  const { data: existing } = await admin
    .from('user_roles').select('user_id').eq('athlete_id', athleteId).maybeSingle();

  if (existing) {
    const username = await usernameForUser(admin, existing.user_id);
    if (!reset) return { athlete_id: athleteId, name, status: 'exists', username };
    const password = generatePassword();
    const { error } = await admin.auth.admin.updateUserById(existing.user_id, { password });
    if (error) return { athlete_id: athleteId, name, status: 'error', error: error.message };
    await ensureAppAccess(admin, athleteId);
    return { athlete_id: athleteId, name, status: 'reset', username, password };
  }

  const base = usernameFromName(display.athlete.name);
  const password = generatePassword();
  let created = null;
  let username = base;
  // Two athletes can share a name — retry with a numeric suffix if taken.
  for (let n = 1; n <= 9 && !created; n++) {
    username = n === 1 ? base : `${base}${n}`;
    const { data, error } = await admin.auth.admin.createUser({
      email: `${username}@${ATHLETE_EMAIL_DOMAIN}`,
      password,
      email_confirm: true,
    });
    if (!error) { created = data.user; break; }
    if (!/already.*(registered|exists)/i.test(error.message || '')) {
      return { athlete_id: athleteId, name, status: 'error', error: error.message };
    }
  }
  if (!created) return { athlete_id: athleteId, name, status: 'error', error: 'Could not find a free username.' };

  const { error: roleErr } = await admin.from('user_roles').insert({
    user_id: created.id, role: 'athlete', athlete_id: athleteId, full_name: display.athlete.name || null,
  });
  if (roleErr) {
    await admin.auth.admin.deleteUser(created.id).catch(() => {});
    return { athlete_id: athleteId, name, status: 'error', error: roleErr.message };
  }

  await ensureAppAccess(admin, athleteId);
  return { athlete_id: athleteId, name, status: 'created', username, password };
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
  if (!(await isStaffUser(admin, user.id))) {
    res.status(403).json({ ok: false, error: 'Coaches only.' });
    return;
  }

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch { res.status(400).json({ ok: false, error: 'Invalid JSON body' }); return; }

  if (body?.action === 'list') {
    const { data: roles, error } = await admin
      .from('user_roles').select('user_id, athlete_id').eq('role', 'athlete');
    if (error) { res.status(500).json({ ok: false, error: error.message }); return; }

    const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const emailById = new Map((users?.users || []).map(u => [u.id, u.email || '']));

    const accounts = {};
    for (const r of roles || []) {
      if (!r.athlete_id) continue;
      const email = emailById.get(r.user_id) || '';
      accounts[r.athlete_id] = { username: email.endsWith(`@${ATHLETE_EMAIL_DOMAIN}`) ? email.split('@')[0] : null };
    }
    res.status(200).json({ ok: true, accounts });
    return;
  }

  if (body?.action === 'provision') {
    const ids = [...new Set((body.athlete_ids || []).map(String).filter(Boolean))];
    if (!ids.length) { res.status(400).json({ ok: false, error: 'athlete_ids is required' }); return; }
    if (ids.length > MAX_PER_CALL) { res.status(400).json({ ok: false, error: `Max ${MAX_PER_CALL} athletes per request.` }); return; }

    // Sequential on purpose — Supabase Auth admin calls are rate limited and
    // username collisions need to be resolved one at a time.
    const results = [];
    for (const id of ids) results.push(await provisionOne(admin, id, !!body.reset));
    res.status(200).json({ ok: true, results });
    return;
  }

  res.status(400).json({ ok: false, error: 'Unknown action.' });
}
