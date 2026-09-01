// POST /api/athlete-auth/reset
// headers: Authorization: Bearer <coach Supabase session token>
// body: { athlete_id }
//
// Coach-only. Deletes the athlete's real Supabase Auth account and
// user_roles row entirely, so their next visit to their original
// token link re-triggers setup.js with a clean slate. No self-service
// "forgot PIN" — resets are deliberately admin-only (no email
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

  const { data: roleRow, error: findErr } = await admin
    .from('user_roles')
    .select('user_id')
    .eq('athlete_id', athleteId)
    .maybeSingle();
  if (findErr) { res.status(500).json({ ok: false, error: findErr.message }); return; }
  if (!roleRow) { res.status(200).json({ ok: true, hadAccount: false }); return; }

  const { error: delErr } = await admin.auth.admin.deleteUser(roleRow.user_id);
  if (delErr) { res.status(500).json({ ok: false, error: delErr.message }); return; }
  await admin.from('user_roles').delete().eq('user_id', roleRow.user_id);

  res.status(200).json({ ok: true, hadAccount: true });
}
