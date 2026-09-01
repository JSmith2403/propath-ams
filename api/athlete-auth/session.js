// POST /api/athlete-auth/session
// body: { sessionToken }
//
// Resolves a stored session (the stable /athlete route calls this on
// load) back to the athlete's display info. Touches last_seen_at.

import { getSupabaseAdmin, resolveSession, loadAthleteDisplay } from '../_lib/athleteAuth.js';

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

  const session = await resolveSession(admin, body?.sessionToken);
  if (!session.ok) { res.status(401).json({ ok: false, error: session.error }); return; }

  const display = await loadAthleteDisplay(admin, session.athleteId);
  if (!display.ok) { res.status(500).json({ ok: false, error: display.error }); return; }

  res.status(200).json({ ok: true, athlete: display.athlete });
}
