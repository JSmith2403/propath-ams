// POST /api/push/reply
// headers: Authorization: Bearer <athlete's Supabase session token>
// body: { body: '...' }
//
// An athlete replies in their conversation with the coaching team. The
// athlete id and name come from the verified login (user_roles), never from
// the request, so one athlete can't write into another's thread. Stored in
// athlete_messages (the permanent safeguarding record) and every coach with
// a subscribed device gets a push.

import { requireUser } from '../verifyUser.js';
import { getSupabaseAdmin } from '../athleteAuth.js';
import { configureWebPush, sendPushToUsers } from '../push.js';

const MAX_LENGTH = 2000;
const MAX_PER_HOUR = 30;

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
    .from('user_roles').select('role, athlete_id, full_name').eq('user_id', user.id).maybeSingle();
  if (!roleRow || roleRow.role !== 'athlete' || !roleRow.athlete_id) {
    res.status(403).json({ ok: false, error: 'Only athletes can reply here.' });
    return;
  }

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch { res.status(400).json({ ok: false, error: 'Invalid JSON body' }); return; }

  const text = String(body?.body || '').trim().slice(0, MAX_LENGTH);
  if (!text) { res.status(400).json({ ok: false, error: 'Write a message first.' }); return; }

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from('athlete_messages')
    .select('id', { count: 'exact', head: true })
    .eq('athlete_id', roleRow.athlete_id).eq('sender_type', 'athlete').gte('created_at', since);
  if ((count || 0) >= MAX_PER_HOUR) {
    res.status(429).json({ ok: false, error: 'Too many messages — try again a little later.' });
    return;
  }

  const name = (roleRow.full_name || '').trim() || 'Athlete';
  const { data: inserted, error: insErr } = await admin
    .from('athlete_messages')
    .insert({
      athlete_id: roleRow.athlete_id, title: '', body: text, sent_by: name,
      sender_type: 'athlete', sender_user_id: user.id,
    })
    .select('id, batch_id, athlete_id, title, body, sent_by, created_at, read_at, sender_type')
    .single();
  if (insErr) { res.status(500).json({ ok: false, error: insErr.message }); return; }

  // Push every coach's subscribed devices (best effort).
  let pushed = 0;
  try {
    if (configureWebPush()) {
      const { data: staff } = await admin
        .from('user_roles').select('user_id').in('role', ['admin', 'co_admin']);
      const r = await sendPushToUsers(admin, (staff || []).map(s => s.user_id), {
        title: name,
        body: text.slice(0, 140),
        url: `/?messages=${encodeURIComponent(roleRow.athlete_id)}`,
      });
      pushed = r.sent;
    }
  } catch (err) {
    console.error('[reply] push failed', err.message);
  }

  res.status(200).json({ ok: true, message: inserted, pushed });
}
