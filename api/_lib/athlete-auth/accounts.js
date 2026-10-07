// POST /api/athlete-auth/accounts
// headers: Authorization: Bearer <coach Supabase session token>
//
// Coach-only. Coaches NEVER see or choose an athlete's password — they only
// create the account (username) and approve the athlete's own set-password
// request. Actions:
//
//   { action: 'list' }
//     → { ok, accounts: { [athlete_id]: { username } },
//             requests: [{ id, athlete_id, username, status, created_at, expires_at }] }
//     accounts = who already has a login; requests = set-password requests
//     waiting for approval (or approved and waiting for the athlete).
//
//   { action: 'provision', athlete_ids: [...] }
//     → { ok, results: [{ athlete_id, name, status: 'created'|'exists'|'error', username? }] }
//     Creates a real Supabase Auth account (+ athlete user_roles row) with a
//     username derived from the athlete's name and a random password that is
//     never shown to anyone. The athlete sets their own via the approval flow.
//
//   { action: 'approve', request_id, code }
//     The athlete reads a 6-digit code off their screen to the coach (on
//     another platform); the coach types it here. A match lets that athlete's
//     browser set a password for the next 15 minutes.
//
//   { action: 'deny', request_id }
//
// Also makes sure the athlete has an active athlete_app_tokens + wellness_tokens
// row, because the athlete app's wellness check-in and legacy link depend on it
// (same thing the coach's "Activate app" button does).

import { randomUUID, randomBytes } from 'node:crypto';
import { requireUser } from '../verifyUser.js';
import {
  getSupabaseAdmin, isStaffUser, loadAthleteDisplay,
  unknownPassword, usernameFromName, hashClaim, ATHLETE_EMAIL_DOMAIN,
} from '../athleteAuth.js';

const MAX_PER_CALL = 100;
const MAX_CODE_ATTEMPTS = 5;
const APPROVED_WINDOW_MS = 15 * 60 * 1000;

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

async function provisionOne(admin, athleteId, emailById) {
  const display = await loadAthleteDisplay(admin, athleteId);
  if (!display.ok) return { athlete_id: athleteId, name: null, status: 'error', error: display.error };
  const name = display.athlete.name || athleteId;

  const { data: existing } = await admin
    .from('user_roles').select('user_id').eq('athlete_id', athleteId).maybeSingle();
  if (existing) {
    const email = emailById.get(existing.user_id) || '';
    const username = email.endsWith(`@${ATHLETE_EMAIL_DOMAIN}`) ? email.split('@')[0] : null;
    return { athlete_id: athleteId, name, status: 'exists', username };
  }

  const base = usernameFromName(display.athlete.name);
  let created = null;
  let username = base;
  // Two athletes can share a name — retry with a numeric suffix if taken.
  for (let n = 1; n <= 9 && !created; n++) {
    username = n === 1 ? base : `${base}${n}`;
    const { data, error } = await admin.auth.admin.createUser({
      email: `${username}@${ATHLETE_EMAIL_DOMAIN}`,
      password: unknownPassword(),
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
  return { athlete_id: athleteId, name, status: 'created', username };
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

  const loadEmails = async () => {
    const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
    return new Map((users?.users || []).map(u => [u.id, u.email || '']));
  };

  if (body?.action === 'list') {
    const { data: roles, error } = await admin
      .from('user_roles').select('user_id, athlete_id').eq('role', 'athlete');
    if (error) { res.status(500).json({ ok: false, error: error.message }); return; }
    const emailById = await loadEmails();

    const accounts = {};
    for (const r of roles || []) {
      if (!r.athlete_id) continue;
      const email = emailById.get(r.user_id) || '';
      accounts[r.athlete_id] = { username: email.endsWith(`@${ATHLETE_EMAIL_DOMAIN}`) ? email.split('@')[0] : null };
    }

    // Tidy up, then return anything still live. (Table missing → the SQL
    // hasn't been run yet; the panel just shows no requests.)
    const nowIso = new Date().toISOString();
    await admin.from('athlete_setup_requests')
      .update({ status: 'expired' }).in('status', ['pending', 'approved']).lt('expires_at', nowIso);
    const { data: requests } = await admin
      .from('athlete_setup_requests')
      .select('id, athlete_id, username, status, created_at, expires_at')
      .in('status', ['pending', 'approved'])
      .order('created_at', { ascending: false });

    res.status(200).json({ ok: true, accounts, requests: requests || [] });
    return;
  }

  if (body?.action === 'provision') {
    const ids = [...new Set((body.athlete_ids || []).map(String).filter(Boolean))];
    if (!ids.length) { res.status(400).json({ ok: false, error: 'athlete_ids is required' }); return; }
    if (ids.length > MAX_PER_CALL) { res.status(400).json({ ok: false, error: `Max ${MAX_PER_CALL} athletes per request.` }); return; }

    const emailById = await loadEmails();
    // Sequential on purpose — Supabase Auth admin calls are rate limited and
    // username collisions need to be resolved one at a time.
    const results = [];
    for (const id of ids) results.push(await provisionOne(admin, id, emailById));
    res.status(200).json({ ok: true, results });
    return;
  }

  if (body?.action === 'approve' || body?.action === 'deny') {
    const requestId = String(body.request_id || '');
    if (!requestId) { res.status(400).json({ ok: false, error: 'request_id is required' }); return; }

    const { data: row } = await admin
      .from('athlete_setup_requests').select('*').eq('id', requestId).maybeSingle();
    if (!row || row.status !== 'pending' || new Date(row.expires_at) < new Date()) {
      res.status(409).json({ ok: false, error: 'That request has expired or was already handled.' });
      return;
    }

    if (body.action === 'deny') {
      await admin.from('athlete_setup_requests').update({ status: 'denied' }).eq('id', row.id);
      res.status(200).json({ ok: true });
      return;
    }

    if (row.attempts >= MAX_CODE_ATTEMPTS) {
      await admin.from('athlete_setup_requests').update({ status: 'denied' }).eq('id', row.id);
      res.status(429).json({ ok: false, error: 'Too many wrong codes — the athlete needs to start again.' });
      return;
    }
    if (String(body.code || '').replace(/\s/g, '') !== row.code) {
      await admin.from('athlete_setup_requests').update({ attempts: row.attempts + 1 }).eq('id', row.id);
      res.status(400).json({ ok: false, error: 'That code doesn\'t match what the athlete sees — check it with them.' });
      return;
    }

    const { data: me } = await admin.from('user_roles').select('full_name').eq('user_id', user.id).maybeSingle();
    await admin.from('athlete_setup_requests').update({
      status: 'approved',
      approved_by: user.id,
      approved_name: (me?.full_name || '').trim() || user.email || null,
      approved_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + APPROVED_WINDOW_MS).toISOString(),
    }).eq('id', row.id);
    res.status(200).json({ ok: true });
    return;
  }

  // ── Parent links (read-only view of a child's chats, no parent account) ────
  if (body?.action === 'family-list') {
    const athleteId = String(body.athlete_id || '');
    if (!athleteId) { res.status(400).json({ ok: false, error: 'athlete_id is required' }); return; }
    const { data, error } = await admin
      .from('guardian_links')
      .select('id, label, created_at, last_viewed_at, view_count, revoked_at')
      .eq('athlete_id', athleteId)
      .order('created_at', { ascending: false });
    if (error) {
      const hint = /guardian_links/.test(error.message || '') ? ' (has sql/group_chats_parent_links_2026-10-09.sql been run?)' : '';
      res.status(500).json({ ok: false, error: error.message + hint }); return;
    }
    res.status(200).json({ ok: true, links: data || [] });
    return;
  }

  if (body?.action === 'family-create') {
    const athleteId = String(body.athlete_id || '');
    if (!athleteId) { res.status(400).json({ ok: false, error: 'athlete_id is required' }); return; }
    const token = randomBytes(24).toString('base64url');   // 192 bits — unguessable
    const { data, error } = await admin.from('guardian_links').insert({
      athlete_id: athleteId,
      label: String(body.label || '').trim().slice(0, 40) || null,
      token_hash: hashClaim(token),
      created_by: user.id,
    }).select('id').single();
    if (error) {
      const hint = /guardian_links/.test(error.message || '') ? ' (has sql/group_chats_parent_links_2026-10-09.sql been run?)' : '';
      res.status(500).json({ ok: false, error: error.message + hint }); return;
    }
    // The link is only ever shown now — just a hash is stored.
    res.status(200).json({ ok: true, link_id: data.id, token });
    return;
  }

  if (body?.action === 'family-revoke') {
    const { error } = await admin.from('guardian_links')
      .update({ revoked_at: new Date().toISOString() }).eq('id', String(body.link_id || '')).is('revoked_at', null);
    if (error) { res.status(500).json({ ok: false, error: error.message }); return; }
    res.status(200).json({ ok: true });
    return;
  }

  res.status(400).json({ ok: false, error: 'Unknown action.' });
}
