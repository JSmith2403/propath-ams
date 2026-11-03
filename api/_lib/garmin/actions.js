// /api/garmin/<action> handlers (dispatched from api/garmin/[action].js).
//
//   POST start       { share? }  (athlete)  begin sign-in → { url } to send the athlete to Garmin; share = what coaches may see
//   GET  callback    (Garmin redirects)   swap the one-time code for tokens, store them, send the athlete back to the app
//   POST webhook     (Garmin pushes)      receive sleep / daily / activity data and deregistrations
//   POST disconnect  { deleteData?, athlete_id? }   athlete, or a coach on their behalf
//
// Starter access is push-only, so there is nothing to "sync": data arrives when the athlete's watch syncs.
// The athlete id for start/disconnect always comes from the verified login, never from the request body —
// except for staff, who may disconnect any athlete.

import { timingSafeEqual } from 'node:crypto';
import { requireUser } from '../verifyUser.js';
import { getSupabaseAdmin, isStaffUser } from '../athleteAuth.js';
import { encryptKey, decryptKey, encryptionConfigured } from './crypto.js';
import {
  oauthConfigured, makePkce, newState, authorizeUrl, exchangeCode, refreshTokens,
  fetchUserId, fetchPermissions, deleteRegistration,
} from './oauth.js';
import { parsePush } from './push.js';
import { cleanShare } from './share.js';

const STATE_TTL_MS = 15 * 60 * 1000;
const APP_RETURN = '/athlete?tab=progress';

function bodyOf(req) {
  try { return typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); } catch { return null; }
}

/** Verify the login and work out which athlete this call is for. */
async function begin(req, res, { athleteOnly = false } = {}) {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'POST only' }); return null; }
  const user = await requireUser(req, res);
  if (!user) return null;
  const admin = getSupabaseAdmin();
  if (!admin) { res.status(503).json({ ok: false, error: 'Server not configured (SUPABASE_SECRET_KEY missing).' }); return null; }
  const body = bodyOf(req);
  if (!body) { res.status(400).json({ ok: false, error: 'Invalid JSON body' }); return null; }

  const { data: role } = await admin.from('user_roles').select('role, athlete_id').eq('user_id', user.id).maybeSingle();
  let athleteId = null;
  if (role?.role === 'athlete') athleteId = role.athlete_id;
  else if (!athleteOnly && await isStaffUser(admin, user.id)) athleteId = String(body.athlete_id || '');
  if (!athleteId) { res.status(403).json({ ok: false, error: athleteOnly ? 'Only the athlete can connect their own Garmin account.' : 'Not allowed.' }); return null; }
  return { admin, body, athleteId };
}

const saveTokens = (tok) => encryptKey(JSON.stringify({ access: tok.access, refresh: tok.refresh }));

/** A usable access token for a connection, refreshing (and saving) it when it has expired. */
async function accessTokenFor(admin, conn) {
  const t = JSON.parse(decryptKey(conn.tokens_ciphertext));
  if (conn.access_expires_at && new Date(conn.access_expires_at).getTime() > Date.now()) return t.access;
  const fresh = await refreshTokens(t.refresh);
  await admin.from('garmin_connections').update({
    tokens_ciphertext: saveTokens(fresh),
    access_expires_at: fresh.accessExpiresAt,
    refresh_expires_at: fresh.refreshExpiresAt,
    updated_at: new Date().toISOString(),
  }).eq('athlete_id', conn.athlete_id);
  return fresh.access;
}

// ── start ──────────────────────────────────────────────────────────────────
async function start(req, res) {
  const ctx = await begin(req, res, { athleteOnly: true }); if (!ctx) return;
  const { admin, body, athleteId } = ctx;
  if (!oauthConfigured()) { res.status(503).json({ ok: false, error: 'Garmin isn’t set up on the server yet.' }); return; }
  if (!encryptionConfigured()) { res.status(503).json({ ok: false, error: 'Garmin storage isn’t set up yet (GARMIN_KEY_SECRET missing on the server).' }); return; }

  const { verifier, challenge } = makePkce();
  const state = newState();
  await admin.from('garmin_oauth_states').delete().or(`athlete_id.eq.${athleteId},expires_at.lt.${new Date().toISOString()}`);
  const { error } = await admin.from('garmin_oauth_states').insert({
    state,
    athlete_id: athleteId,
    verifier_ciphertext: encryptKey(verifier),
    share: cleanShare(body.share),                                // what they chose to let coaches see, applied when they come back
    expires_at: new Date(Date.now() + STATE_TTL_MS).toISOString(),
  });
  if (error) { res.status(500).json({ ok: false, error: 'Couldn’t start the Garmin sign-in.' }); return; }
  res.status(200).json({ ok: true, url: authorizeUrl({ state, challenge }) });
}

// ── callback ───────────────────────────────────────────────────────────────
const back = (res, outcome) => { res.setHeader('Location', `${APP_RETURN}&garmin=${outcome}`); res.status(302).end(); };

async function callback(req, res) {
  const q = req.query || {};
  const code = String(q.code || '');
  const state = String(q.state || '');
  if (!state) return back(res, 'error');
  if (!code) return back(res, 'denied');                       // the athlete declined, or Garmin reported an error

  const admin = getSupabaseAdmin();
  if (!admin || !oauthConfigured() || !encryptionConfigured()) return back(res, 'error');

  // The state is single-use: take it and delete it in one step.
  const { data: st } = await admin.from('garmin_oauth_states').delete().eq('state', state).select().maybeSingle();
  if (!st || new Date(st.expires_at).getTime() < Date.now()) return back(res, 'expired');

  try {
    const tok = await exchangeCode({ code, verifier: decryptKey(st.verifier_ciphertext) });
    const garminUserId = await fetchUserId(tok.access);
    if (!garminUserId) return back(res, 'error');
    let permissions = [];
    try { permissions = await fetchPermissions(tok.access); } catch { /* shown later if it arrives by push */ }

    const now = new Date().toISOString();
    const { error } = await admin.from('garmin_connections').upsert({
      athlete_id: st.athlete_id,
      garmin_user_id: garminUserId,
      tokens_ciphertext: saveTokens(tok),
      access_expires_at: tok.accessExpiresAt,
      refresh_expires_at: tok.refreshExpiresAt,
      permissions,
      share: cleanShare(st.share),
      status: 'connected',
      connected_at: now,
      last_error: null,
      updated_at: now,
    }, { onConflict: 'athlete_id' });
    if (error) return back(res, error.code === '23505' ? 'taken' : 'error');   // that Garmin account is already linked to another athlete
    return back(res, 'connected');
  } catch (e) {
    console.error('[garmin callback]', e.message);
    return back(res, 'error');
  }
}

// ── webhook ────────────────────────────────────────────────────────────────
function webhookKeyOk(req) {
  const want = (process.env.GARMIN_WEBHOOK_KEY || '').trim();
  if (!want) return true;                                       // not configured → open (the URL itself is the only secret)
  const got = String(req.query?.k || '');
  const a = Buffer.from(got); const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function webhook(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'POST only' }); return; }
  if (!webhookKeyOk(req)) { res.status(401).json({ ok: false }); return; }
  const admin = getSupabaseAdmin();
  if (!admin) { res.status(503).json({ ok: false }); return; }
  const body = bodyOf(req);
  if (!body) { res.status(400).json({ ok: false }); return; }

  const parsed = parsePush(body);
  if (parsed.ignored.length) console.log('[garmin webhook] ignored data types:', parsed.ignored.join(', '));

  const ids = [...new Set([
    ...parsed.daily.map(d => d.userId), ...parsed.activities.map(a => a.userId),
    ...parsed.deregistered, ...parsed.permissions.map(p => p.userId),
  ])];
  if (!ids.length) { res.status(200).json({ ok: true, received: 0 }); return; }

  const { data: conns, error: cErr } = await admin.from('garmin_connections')
    .select('athlete_id, garmin_user_id, status').in('garmin_user_id', ids);
  if (cErr) { console.error('[garmin webhook] lookup failed', cErr.message); res.status(500).json({ ok: false }); return; }
  const athleteOf = new Map((conns || []).filter(c => c.status !== 'disconnected').map(c => [c.garmin_user_id, c.athlete_id]));
  const now = new Date().toISOString();
  const errors = [];
  const touched = new Set();

  // The athlete removed access on Garmin's side → forget the tokens, keep the history.
  for (const userId of parsed.deregistered) {
    const { error } = await admin.from('garmin_connections').update({
      tokens_ciphertext: null, status: 'disconnected', last_error: null, updated_at: now,
    }).eq('garmin_user_id', userId);
    if (error) errors.push(error.message);
  }
  for (const p of parsed.permissions) {
    if (!athleteOf.has(p.userId)) continue;
    const { error } = await admin.from('garmin_connections').update({ permissions: p.permissions, updated_at: now }).eq('garmin_user_id', p.userId);
    if (error) errors.push(error.message);
  }

  // Daily records arrive in separate pushes (dailies, sleeps, hrv) — merge them into one row per athlete-day.
  const merged = new Map();
  for (const d of parsed.daily) {
    const athleteId = athleteOf.get(d.userId);
    if (!athleteId) continue;
    const key = `${athleteId}|${d.day}`;
    const row = merged.get(key) || { athlete_id: athleteId, day: d.day, updated_at: now };
    Object.assign(row, d.cols, { [d.rawCol]: d.raw });
    merged.set(key, row);
    touched.add(athleteId);
  }
  if (merged.size) {
    const { error } = await admin.from('garmin_daily').upsert([...merged.values()], { onConflict: 'athlete_id,day' });
    if (error) errors.push(`garmin_daily: ${error.message}`);
  }

  const acts = parsed.activities
    .filter(a => athleteOf.has(a.userId))
    .map(a => ({ athlete_id: athleteOf.get(a.userId), ...a.row, updated_at: now }));
  acts.forEach(a => touched.add(a.athlete_id));
  if (acts.length) {
    const { error } = await admin.from('garmin_activities').upsert(acts, { onConflict: 'athlete_id,activity_id' });
    if (error) errors.push(`garmin_activities: ${error.message}`);
  }

  if (touched.size) {
    await admin.from('garmin_connections').update({
      last_sync_at: now, last_error: errors.length ? errors.join(' · ').slice(0, 300) : null, updated_at: now,
    }).in('athlete_id', [...touched]);
  }

  if (errors.length) { console.error('[garmin webhook]', errors.join(' | ')); res.status(500).json({ ok: false }); return; }   // 5xx → Garmin retries
  res.status(200).json({ ok: true, received: ids.length });
}

// ── disconnect ─────────────────────────────────────────────────────────────
async function disconnect(req, res) {
  const ctx = await begin(req, res); if (!ctx) return;
  const { admin, body, athleteId } = ctx;

  const { data: conn } = await admin.from('garmin_connections').select('*').eq('athlete_id', athleteId).maybeSingle();
  let warning = null;
  // Garmin requires us to tell them when consent is removed from inside our app.
  if (conn?.tokens_ciphertext && encryptionConfigured() && oauthConfigured()) {
    try { await deleteRegistration(await accessTokenFor(admin, conn)); }
    catch (e) { warning = 'Garmin couldn’t be told just now — you can also remove ProPath in your Garmin Connect account settings.'; console.error('[garmin disconnect]', e.message); }
  }
  await admin.from('garmin_connections').update({
    tokens_ciphertext: null, status: 'disconnected', last_error: null, updated_at: new Date().toISOString(),
  }).eq('athlete_id', athleteId);
  if (body.deleteData) {
    await admin.from('garmin_daily').delete().eq('athlete_id', athleteId);
    await admin.from('garmin_activities').delete().eq('athlete_id', athleteId);
  }
  res.status(200).json({ ok: true, warning });
}

export default { start, callback, webhook, disconnect };
