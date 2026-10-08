// POST /api/athlete-auth/request-reset   { username }     (public — no login)
//
// "Forgot your password?" on the athlete sign-in screen. It does NOT change
// anything by itself: it only tells the coaches that this athlete asked, so a
// coach can confirm it's really them and issue a new starting password
// (accounts.js → issue-temp). That keeps a stranger who merely knows a username
// from taking an account over, and avoids needing email.
//
// The response is identical whether or not the username exists, so usernames
// can't be probed. Repeat requests are collapsed (one open request per athlete)
// and capped, so nobody can spam the coaches' notifications.
//
// Table: sql/athlete_setup_requests_2026-10-07.sql. It still has code / claim_hash
// columns from an earlier design; they're filled with placeholders here rather
// than asking for a schema change.

import {
  getSupabaseAdmin, sanitizeUsername, findAthleteAuthUser,
} from '../athleteAuth.js';
import { configureWebPush, sendPushToUsers, MESSAGE_PUSH } from '../push.js';

const REQUEST_LIFETIME_MS = 14 * 24 * 60 * 60 * 1000;
const MAX_REQUESTS_PER_DAY = 5;
const GENERIC = { ok: true, message: 'If that username exists, your coach has been told and will send you a new password.' };

export async function requestReset(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'POST only' }); return; }
  const admin = getSupabaseAdmin();
  if (!admin) { res.status(503).json({ ok: false, error: 'Server not configured (SUPABASE_SECRET_KEY missing).' }); return; }

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch { res.status(400).json({ ok: false, error: 'Invalid JSON body' }); return; }

  const username = sanitizeUsername(body?.username);
  if (username.length < 3) { res.status(200).json(GENERIC); return; }

  const authUser = await findAthleteAuthUser(admin, username);
  const { data: roleRow } = authUser
    ? await admin.from('user_roles').select('role, athlete_id, full_name').eq('user_id', authUser.id).maybeSingle()
    : { data: null };
  if (!authUser || !roleRow || roleRow.role !== 'athlete' || !roleRow.athlete_id) {
    res.status(200).json(GENERIC); return;
  }

  // One open request per athlete — repeat taps don't create more or re-notify.
  const { data: open } = await admin.from('athlete_setup_requests')
    .select('id').eq('athlete_id', roleRow.athlete_id).eq('status', 'pending')
    .gt('expires_at', new Date().toISOString()).limit(1);
  if (open?.length) { res.status(200).json(GENERIC); return; }

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await admin.from('athlete_setup_requests')
    .select('id', { count: 'exact', head: true }).eq('athlete_id', roleRow.athlete_id).gte('created_at', dayAgo);
  if ((count || 0) >= MAX_REQUESTS_PER_DAY) { res.status(200).json(GENERIC); return; }

  const { error } = await admin.from('athlete_setup_requests').insert({
    athlete_id: roleRow.athlete_id,
    user_id: authUser.id,
    username,
    code: '-', claim_hash: '-',                       // unused legacy columns
    expires_at: new Date(Date.now() + REQUEST_LIFETIME_MS).toISOString(),
  });
  if (error) {
    const hint = /athlete_setup_requests/.test(error.message || '')
      ? ' (has sql/athlete_setup_requests_2026-10-07.sql been run?)' : '';
    res.status(500).json({ ok: false, error: `Couldn't send your request.${hint}` });
    return;
  }

  // Tell the coaches (best effort): "X requested a password reset".
  try {
    if (configureWebPush()) {
      const { data: staff } = await admin.from('user_roles').select('user_id').in('role', ['admin', 'co_admin']);
      await sendPushToUsers(admin, (staff || []).map(s => s.user_id), {
        title: 'Password reset requested',
        body: `${roleRow.full_name || username} asked for a new password. Confirm it's them, then reset it in Athlete logins.`,
        url: '/?view=users',
        tag: `pwreset-${roleRow.athlete_id}`,
      }, MESSAGE_PUSH);
    }
  } catch (err) {
    console.error('[reset-request] staff push failed', err.message);
  }

  res.status(200).json(GENERIC);
}
