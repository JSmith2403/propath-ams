// POST /api/athlete-auth/me
// headers: Authorization: Bearer <athlete's real Supabase session token>
//
// Resolves an authenticated athlete-role session to their display info.
// athlete_app_tokens/wellness_tokens are staff-only for SELECT (see
// security-lockdown-2026-07-06.sql), so an athlete's own browser can't
// read them directly even though they're now a real authenticated
// user — this endpoint does it server-side with the service-role key.

import { requireUser } from '../_lib/verifyUser.js';
import { getSupabaseAdmin, loadAthleteDisplay } from '../_lib/athleteAuth.js';

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

  const { data: roleRow } = await admin
    .from('user_roles')
    .select('role, athlete_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!roleRow || roleRow.role !== 'athlete' || !roleRow.athlete_id) {
    res.status(403).json({ ok: false, error: 'Not an athlete account.' });
    return;
  }

  const display = await loadAthleteDisplay(admin, roleRow.athlete_id);
  if (!display.ok) { res.status(500).json({ ok: false, error: display.error }); return; }

  res.status(200).json({ ok: true, athlete: display.athlete });
}
