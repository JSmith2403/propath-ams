// POST /api/athlete-auth/accounts
// headers: Authorization: Bearer <coach Supabase session token>
//
// Coach-only. Actions:
//
//   { action: 'list' }
//     → { ok, accounts: { [athlete_id]: { username, awaiting_first_signin } },
//             requests: [{ id, athlete_id, username, created_at }] }
//     requests = athletes who tapped "Forgot your password?" and are waiting.
//
//   { action: 'pending-count' } → { ok, count }     (nav badge)
//
//   { action: 'provision', athlete_ids: [...] }
//     → { ok, results: [{ athlete_id, name, status: 'created'|'exists'|'error', username?, password?, expires_at? }] }
//     Creates a real account with a username from the athlete's name and a random
//     STARTING password (returned once). The athlete must replace it with their own
//     on first sign-in, and it stops working after 7 days if unused.
//
//   { action: 'issue-temp', athlete_id }
//     → { ok, name, username, password, expires_at }
//     New starting password for an existing athlete (a reset). Their old password
//     stops working immediately, so confirm it's really them first. Closes the
//     matching reset request.
//
//   { action: 'deny', request_id }       dismiss a reset request
//
// Also makes sure the athlete has an active athlete_app_tokens + wellness_tokens
// row, because the athlete app's wellness check-in and legacy link depend on it
// (same thing the coach's "Activate app" button does).

import { randomUUID, randomBytes } from 'node:crypto';
import { requireUser } from '../verifyUser.js';
import {
  getSupabaseAdmin, isStaffUser, loadAthleteDisplay,
  generateTempPassword, tempPasswordMeta, usernameFromName, hashClaim, ATHLETE_EMAIL_DOMAIN,
} from '../athleteAuth.js';

const MAX_PER_CALL = 100;

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
  const password = generateTempPassword();
  const meta = tempPasswordMeta();
  // Two athletes can share a name — retry with a numeric suffix if taken.
  for (let n = 1; n <= 9 && !created; n++) {
    username = n === 1 ? base : `${base}${n}`;
    const { data, error } = await admin.auth.admin.createUser({
      email: `${username}@${ATHLETE_EMAIL_DOMAIN}`,
      password,
      email_confirm: true,
      user_metadata: meta,
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
  return { athlete_id: athleteId, name, status: 'created', username, password, expires_at: meta.temp_password_expires_at };
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
  // Who still has an unused starting password (hasn't chosen their own yet).
  const loadAwaiting = async () => {
    const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
    return new Set((users?.users || []).filter(u => u.user_metadata?.must_change_password).map(u => u.id));
  };

  if (body?.action === 'list') {
    const { data: roles, error } = await admin
      .from('user_roles').select('user_id, athlete_id').eq('role', 'athlete');
    if (error) { res.status(500).json({ ok: false, error: error.message }); return; }
    const emailById = await loadEmails();
    const awaiting = await loadAwaiting();

    const accounts = {};
    for (const r of roles || []) {
      if (!r.athlete_id) continue;
      const email = emailById.get(r.user_id) || '';
      accounts[r.athlete_id] = {
        username: email.endsWith(`@${ATHLETE_EMAIL_DOMAIN}`) ? email.split('@')[0] : null,
        awaiting_first_signin: awaiting.has(r.user_id),
      };
    }

    // Reset requests still waiting. (Table missing → the SQL hasn't been run
    // yet; the panel just shows no requests.)
    const nowIso = new Date().toISOString();
    await admin.from('athlete_setup_requests')
      .update({ status: 'expired' }).eq('status', 'pending').lt('expires_at', nowIso);
    const { data: requests } = await admin
      .from('athlete_setup_requests')
      .select('id, athlete_id, username, created_at')
      .eq('status', 'pending')
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

  if (body?.action === 'pending-count') {
    const { count } = await admin.from('athlete_setup_requests')
      .select('id', { count: 'exact', head: true }).eq('status', 'pending').gt('expires_at', new Date().toISOString());
    res.status(200).json({ ok: true, count: count || 0 });
    return;
  }

  if (body?.action === 'deny') {
    await admin.from('athlete_setup_requests').update({ status: 'denied' })
      .eq('id', String(body.request_id || '')).eq('status', 'pending');
    res.status(200).json({ ok: true });
    return;
  }

  if (body?.action === 'issue-temp') {
    const athleteId = String(body.athlete_id || '');
    if (!athleteId) { res.status(400).json({ ok: false, error: 'athlete_id is required' }); return; }

    const { data: role } = await admin.from('user_roles').select('user_id').eq('athlete_id', athleteId).eq('role', 'athlete').maybeSingle();
    if (!role) { res.status(404).json({ ok: false, error: "That athlete doesn't have a login yet." }); return; }

    const password = generateTempPassword();
    const meta = tempPasswordMeta();
    const { error: updErr } = await admin.auth.admin.updateUserById(role.user_id, { password, user_metadata: meta });
    if (updErr) { res.status(500).json({ ok: false, error: updErr.message }); return; }

    const emailById = await loadEmails();
    const email = emailById.get(role.user_id) || '';
    const display = await loadAthleteDisplay(admin, athleteId);

    // Close the matching request(s) so it leaves the coach's list.
    const { data: me } = await admin.from('user_roles').select('full_name').eq('user_id', user.id).maybeSingle();
    await admin.from('athlete_setup_requests').update({
      status: 'used', used_at: new Date().toISOString(), approved_by: user.id,
      approved_name: (me?.full_name || '').trim() || user.email || null, approved_at: new Date().toISOString(),
    }).eq('athlete_id', athleteId).eq('status', 'pending');

    res.status(200).json({
      ok: true,
      name: display.ok ? display.athlete.name : athleteId,
      username: email.endsWith('@' + ATHLETE_EMAIL_DOMAIN) ? email.split('@')[0] : null,
      password,
      expires_at: meta.temp_password_expires_at,
    });
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
