// POST /api/athlete-auth/status
// body: { token }
//
// Called from the original /athlete/:token entry point after the
// existing validate_athlete_token RPC succeeds. Reports whether real
// PIN-login is switched on for this athlete (athlete_app_tokens has no
// anon SELECT at all, hence the service-role re-check) and whether
// they already have an account — if the flag is off, the caller falls
// straight back to today's token-only behaviour untouched.

import { getSupabaseAdmin, suggestUsername } from '../_lib/athleteAuth.js';

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
  if (!token) { res.status(400).json({ ok: false, error: 'token is required' }); return; }

  const { data: tokenRow, error } = await admin
    .from('athlete_app_tokens')
    .select('athlete_id, is_active, pin_login_enabled')
    .eq('token', token)
    .maybeSingle();
  if (error) { res.status(500).json({ ok: false, error: error.message }); return; }
  if (!tokenRow || !tokenRow.is_active) {
    res.status(404).json({ ok: false, error: 'Invalid or inactive token.' });
    return;
  }
  if (!tokenRow.pin_login_enabled) {
    res.status(200).json({ ok: true, enabled: false });
    return;
  }

  const { data: roleRow } = await admin
    .from('user_roles')
    .select('user_id')
    .eq('athlete_id', tokenRow.athlete_id)
    .maybeSingle();

  let suggestedUsername = null;
  if (!roleRow) {
    const { data: athleteRow } = await admin
      .from('athletes')
      .select('data, dob')
      .eq('id', tokenRow.athlete_id)
      .maybeSingle();
    suggestedUsername = suggestUsername(athleteRow?.data?.name, athleteRow?.dob);
  }

  res.status(200).json({ ok: true, enabled: true, hasAccount: !!roleRow, suggestedUsername });
}
