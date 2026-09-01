// POST /api/athlete-auth/reset
// headers: Authorization: Bearer <coach Supabase session token>
// body: { athlete_id }
//
// Coach-only. Deletes the athlete's PIN/login-code and revokes every
// active session, so their next visit to their original token link
// re-triggers PIN setup. No self-service "forgot PIN" — resets are
// deliberately admin-only for now (see conversation: no email
// infrastructure exists, and several athletes are minors).

import { requireUser } from '../_lib/verifyUser.js';
import { getSupabaseAdmin } from '../_lib/athleteAuth.js';

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

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch { res.status(400).json({ ok: false, error: 'Invalid JSON body' }); return; }

  const athleteId = String(body?.athlete_id || '').trim();
  if (!athleteId) { res.status(400).json({ ok: false, error: 'athlete_id is required' }); return; }

  const { error: credErr } = await admin.from('athlete_credentials').delete().eq('athlete_id', athleteId);
  if (credErr) { res.status(500).json({ ok: false, error: credErr.message }); return; }

  const { error: sessErr } = await admin
    .from('athlete_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('athlete_id', athleteId)
    .is('revoked_at', null);
  if (sessErr) { res.status(500).json({ ok: false, error: sessErr.message }); return; }

  res.status(200).json({ ok: true });
}
