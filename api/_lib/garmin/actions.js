// /api/garmin/<action> handlers (dispatched from api/garmin/[action].js).
//
//   POST connect     { apiKey, expiresOn?, athlete_id? }  validate the key with Garmin, store it
//                                                          encrypted, run a first 28-day sync
//   POST sync        { force?, athlete_id? }               refresh now (throttled to every 5 min)
//   POST disconnect  { deleteData?, athlete_id? }          forget the key (optionally the data too)
//   POST diagnose    { athlete_id? }                       field names Garmin returns (no values)
//
// Callers: an athlete acts on their own account; a coach passes athlete_id. The athlete id always
// comes from the verified login, never from the request, unless the caller is staff.

import { requireUser } from '../verifyUser.js';
import { getSupabaseAdmin, isStaffUser } from '../athleteAuth.js';
import { encryptKey, encryptionConfigured } from './crypto.js';
import { getBearer } from './client.js';
import { syncAthlete, diagnose } from './sync.js';

const THROTTLE_MS = 5 * 60 * 1000;

async function begin(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'POST only' }); return null; }
  const user = await requireUser(req, res);
  if (!user) return null;
  const admin = getSupabaseAdmin();
  if (!admin) { res.status(503).json({ ok: false, error: 'Server not configured (SUPABASE_SECRET_KEY missing).' }); return null; }
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch { res.status(400).json({ ok: false, error: 'Invalid JSON body' }); return null; }

  const { data: role } = await admin.from('user_roles').select('role, athlete_id').eq('user_id', user.id).maybeSingle();
  let athleteId = null;
  if (role?.role === 'athlete') athleteId = role.athlete_id;
  else if (await isStaffUser(admin, user.id)) athleteId = String(body.athlete_id || '');
  if (!athleteId) { res.status(403).json({ ok: false, error: 'Not allowed.' }); return null; }
  return { admin, body, athleteId };
}

async function connect(req, res) {
  const ctx = await begin(req, res); if (!ctx) return;
  const { admin, body, athleteId } = ctx;
  if (!encryptionConfigured()) {
    res.status(503).json({ ok: false, error: 'Garmin storage isn’t set up yet (GARMIN_KEY_SECRET missing on the server).' });
    return;
  }
  const apiKey = String(body.apiKey || '').replace(/\s+/g, '');
  if (apiKey.length < 16 || apiKey.length > 400) { res.status(400).json({ ok: false, error: 'That doesn’t look like a Garmin key — paste the whole thing.' }); return; }

  try { await getBearer(apiKey); }
  catch (e) { res.status(400).json({ ok: false, error: e.message }); return; }

  const expiresOn = /^\d{4}-\d{2}-\d{2}$/.test(body.expiresOn || '') ? body.expiresOn : null;
  const { error } = await admin.from('garmin_connections').upsert({
    athlete_id: athleteId,
    auth_type: 'personal_key',
    key_ciphertext: encryptKey(apiKey),
    key_expires_on: expiresOn,
    status: 'connected',
    connected_at: new Date().toISOString(),
    last_error: null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'athlete_id' });
  if (error) { res.status(500).json({ ok: false, error: 'Couldn’t save the connection.' }); return; }

  const result = await syncAthlete(admin, athleteId, { days: 28 });
  res.status(200).json({ ok: true, sync: result });
}

async function sync(req, res) {
  const ctx = await begin(req, res); if (!ctx) return;
  const { admin, body, athleteId } = ctx;
  const { data: conn } = await admin.from('garmin_connections').select('status, last_sync_at').eq('athlete_id', athleteId).maybeSingle();
  if (!conn || conn.status === 'disconnected') { res.status(400).json({ ok: false, error: 'Garmin is not connected.' }); return; }
  if (!body.force && conn.last_sync_at && Date.now() - new Date(conn.last_sync_at).getTime() < THROTTLE_MS) {
    res.status(200).json({ ok: true, skipped: true });
    return;
  }
  const result = await syncAthlete(admin, athleteId, { days: conn.last_sync_at ? 7 : 28 });
  res.status(result.ok ? 200 : 502).json(result);
}

async function disconnect(req, res) {
  const ctx = await begin(req, res); if (!ctx) return;
  const { admin, body, athleteId } = ctx;
  await admin.from('garmin_connections').update({
    key_ciphertext: null, status: 'disconnected', last_error: null, updated_at: new Date().toISOString(),
  }).eq('athlete_id', athleteId);
  if (body.deleteData) {
    await admin.from('garmin_daily').delete().eq('athlete_id', athleteId);
    await admin.from('garmin_activities').delete().eq('athlete_id', athleteId);
  }
  res.status(200).json({ ok: true });
}

async function diagnoseAction(req, res) {
  const ctx = await begin(req, res); if (!ctx) return;
  try { res.status(200).json(await diagnose(ctx.admin, ctx.athleteId)); }
  catch (e) { res.status(502).json({ ok: false, error: e.message }); }
}

export default { connect, sync, disconnect, diagnose: diagnoseAction };
