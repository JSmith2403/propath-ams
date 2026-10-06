// Public (no login) endpoints behind the athlete's "First time or forgot your
// password?" flow. Coaches never see a password — see accounts.js for the
// approval side and sql/athlete_setup_requests_2026-10-07.sql for the table.
//
//   POST /api/athlete-auth/request-setup   { username }
//        → { ok, request_id, claim_token, code, expires_at }
//        The athlete's screen shows `code`; their browser keeps `claim_token`
//        (a secret only it knows, stored hashed). Same-shaped response whether
//        or not the username exists, so usernames can't be probed.
//   POST /api/athlete-auth/setup-status    { request_id, claim_token }
//        → { ok, status: 'pending' | 'approved' | 'expired' | 'denied' | 'used' }
//   POST /api/athlete-auth/complete-setup  { request_id, claim_token, password }
//        → { ok, username }   Only works once a coach has approved the code.

import { randomBytes, randomUUID } from 'node:crypto';
import {
  getSupabaseAdmin, sanitizeUsername, findAthleteAuthUser,
  generateSetupCode, hashClaim, claimMatches, ATHLETE_EMAIL_DOMAIN,
} from '../athleteAuth.js';
import { configureWebPush, sendPushToUsers } from '../push.js';

const REQUEST_WINDOW_MS = 30 * 60 * 1000;
const MAX_REQUESTS_PER_HOUR = 5;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 72;

function parseBody(req) {
  try { return typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch { return null; }
}

function setup(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'POST only' }); return null; }
  const admin = getSupabaseAdmin();
  if (!admin) { res.status(503).json({ ok: false, error: 'Server not configured (SUPABASE_SECRET_KEY missing).' }); return null; }
  const body = parseBody(req);
  if (!body) { res.status(400).json({ ok: false, error: 'Invalid JSON body' }); return null; }
  return { admin, body };
}

const effectiveStatus = (row) =>
  (['pending', 'approved'].includes(row.status) && new Date(row.expires_at) < new Date()) ? 'expired' : row.status;

export async function requestSetup(req, res) {
  const ctx = setup(req, res); if (!ctx) return;
  const { admin, body } = ctx;

  const username = sanitizeUsername(body.username);
  const code = generateSetupCode();
  const claimToken = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + REQUEST_WINDOW_MS).toISOString();
  const decoy = { ok: true, request_id: randomUUID(), claim_token: claimToken, code, expires_at: expiresAt };

  if (username.length < 3) { res.status(200).json(decoy); return; }

  const authUser = await findAthleteAuthUser(admin, username);
  const { data: roleRow } = authUser
    ? await admin.from('user_roles').select('role, athlete_id, full_name').eq('user_id', authUser.id).maybeSingle()
    : { data: null };
  if (!authUser || !roleRow || roleRow.role !== 'athlete' || !roleRow.athlete_id) {
    res.status(200).json(decoy);   // don't reveal whether the username exists
    return;
  }

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from('athlete_setup_requests').select('id', { count: 'exact', head: true })
    .eq('athlete_id', roleRow.athlete_id).gte('created_at', hourAgo);
  if ((count || 0) >= MAX_REQUESTS_PER_HOUR) {
    res.status(429).json({ ok: false, error: 'Too many attempts — ask your coach for help.' });
    return;
  }

  // Only the newest request can ever be approved.
  await admin.from('athlete_setup_requests')
    .update({ status: 'cancelled' }).eq('athlete_id', roleRow.athlete_id).in('status', ['pending', 'approved']);

  const { data: row, error } = await admin.from('athlete_setup_requests').insert({
    athlete_id: roleRow.athlete_id,
    user_id: authUser.id,
    username,
    code,
    claim_hash: hashClaim(claimToken),
    expires_at: expiresAt,
  }).select('id').single();
  if (error) {
    const hint = /athlete_setup_requests/.test(error.message || '')
      ? ' (has sql/athlete_setup_requests_2026-10-07.sql been run?)' : '';
    res.status(500).json({ ok: false, error: `Couldn't start setup.${hint}` });
    return;
  }

  // Let coaches know someone is waiting (best effort).
  try {
    if (configureWebPush()) {
      const { data: staff } = await admin.from('user_roles').select('user_id').in('role', ['admin', 'co_admin']);
      await sendPushToUsers(admin, (staff || []).map(s => s.user_id), {
        title: 'Athlete login setup',
        body: `${roleRow.full_name || username} is waiting for a code to be approved.`,
        url: '/',
      });
    }
  } catch (err) {
    console.error('[athlete-setup] staff push failed', err.message);
  }

  res.status(200).json({ ok: true, request_id: row.id, claim_token: claimToken, code, expires_at: expiresAt });
}

export async function setupStatus(req, res) {
  const ctx = setup(req, res); if (!ctx) return;
  const { admin, body } = ctx;

  const { data: row } = await admin
    .from('athlete_setup_requests').select('*').eq('id', String(body.request_id || '')).maybeSingle();
  // Unknown id / wrong secret look identical to "still waiting".
  if (!row || !claimMatches(body.claim_token, row.claim_hash)) {
    res.status(200).json({ ok: true, status: 'pending' });
    return;
  }
  res.status(200).json({ ok: true, status: effectiveStatus(row) });
}

export async function completeSetup(req, res) {
  const ctx = setup(req, res); if (!ctx) return;
  const { admin, body } = ctx;

  const password = String(body.password || '');
  if (password.length < MIN_PASSWORD) { res.status(400).json({ ok: false, error: `Use at least ${MIN_PASSWORD} characters.` }); return; }
  if (password.length > MAX_PASSWORD) { res.status(400).json({ ok: false, error: `Use at most ${MAX_PASSWORD} characters.` }); return; }

  const { data: row } = await admin
    .from('athlete_setup_requests').select('*').eq('id', String(body.request_id || '')).maybeSingle();
  if (!row || !claimMatches(body.claim_token, row.claim_hash)) {
    res.status(403).json({ ok: false, error: 'This setup link isn\'t valid — start again.' });
    return;
  }
  const status = effectiveStatus(row);
  if (status !== 'approved') {
    res.status(409).json({
      ok: false,
      error: status === 'pending' ? 'Your coach hasn\'t approved the code yet.' : 'This setup has expired — start again.',
    });
    return;
  }
  if (password.toLowerCase() === row.username.toLowerCase()) {
    res.status(400).json({ ok: false, error: 'Your password can\'t be the same as your username.' });
    return;
  }

  const { error: updErr } = await admin.auth.admin.updateUserById(row.user_id, { password });
  if (updErr) { res.status(400).json({ ok: false, error: updErr.message }); return; }

  await admin.from('athlete_setup_requests')
    .update({ status: 'used', used_at: new Date().toISOString() }).eq('id', row.id);
  res.status(200).json({ ok: true, username: row.username, email: `${row.username}@${ATHLETE_EMAIL_DOMAIN}` });
}
