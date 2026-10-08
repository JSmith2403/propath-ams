// 1:1 session requests (behind /api/push/<action>):
//
//   POST one-to-one-request  athlete  { date: 'YYYY-MM-DD', time: 'HH:MM' }
//        Checks the athlete has a token left (rolling 30 days), records the request
//        (reserving a token), and posts "I'd like to request a 1:1 on <day> — would
//        you be available at <time>?" into their coaching-team chat, notifying coaches.
//        → { ok, request, tokens_left, message }
//   POST one-to-one-decide   coach    { request_id, decision, coach_note? }
//        decision: 'confirmed' | 'declined' | 'cancelled' | 'completed'. Confirmed /
//        declined / cancelled send the athlete a chat message + notification;
//        declined and cancelled give the token back.
//
// Sender names come from the verified login. Both messages go into
// athlete_messages — the permanent safeguarding record.

import { requireUser } from '../verifyUser.js';
import { getSupabaseAdmin } from '../athleteAuth.js';
import { configureWebPush, sendPushToAthlete, sendPushToUsers, MESSAGE_PUSH } from '../push.js';

const MAX_DAYS_AHEAD = 90;
const DECISIONS = ['confirmed', 'declined', 'cancelled', 'completed'];

async function begin(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'POST only' }); return null; }
  const user = await requireUser(req, res);
  if (!user) return null;
  const admin = getSupabaseAdmin();
  if (!admin) { res.status(503).json({ ok: false, error: 'Server not configured (SUPABASE_SECRET_KEY missing).' }); return null; }
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch { res.status(400).json({ ok: false, error: 'Invalid JSON body' }); return null; }
  return { user, admin, body };
}

const uaeToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai' }).format(new Date());   // YYYY-MM-DD
const addDays = (iso, n) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const dayLabel = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' });
function timeLabel(hhmm) {
  const [h, m] = String(hhmm || '').split(':').map(Number);
  if (Number.isNaN(h)) return '';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${m ? `:${String(m).padStart(2, '0')}` : ''}${h >= 12 ? 'pm' : 'am'}`;
}

export async function oneToOneRequest(req, res) {
  const ctx = await begin(req, res); if (!ctx) return;
  const { user, admin, body } = ctx;

  const { data: role } = await admin.from('user_roles').select('role, athlete_id, full_name').eq('user_id', user.id).maybeSingle();
  if (!role || role.role !== 'athlete' || !role.athlete_id) { res.status(403).json({ ok: false, error: 'Athletes only.' }); return; }

  const date = String(body?.date || '');
  const time = String(body?.time || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { res.status(400).json({ ok: false, error: 'Pick a day.' }); return; }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) { res.status(400).json({ ok: false, error: 'Pick a time.' }); return; }
  const today = uaeToday();
  if (date < today || date > addDays(today, MAX_DAYS_AHEAD)) { res.status(400).json({ ok: false, error: 'Pick a day in the next few weeks.' }); return; }

  const { data: dup } = await admin.from('one_to_one_requests').select('id')
    .eq('athlete_id', role.athlete_id).eq('request_date', date).in('status', ['requested', 'confirmed']).limit(1);
  if (dup?.length) { res.status(409).json({ ok: false, error: 'You already have a 1:1 requested for that day.' }); return; }

  const { data: bal, error: balErr } = await admin.rpc('token_balance', { p_athlete: role.athlete_id });
  if (balErr) {
    const hint = /token_balance/.test(balErr.message || '') ? ' (has sql/timetable_pills_one_to_one_2026-10-10.sql been run?)' : '';
    res.status(500).json({ ok: false, error: balErr.message + hint }); return;
  }
  const b = Array.isArray(bal) ? bal[0] : bal;
  const left = (b?.monthly_tokens ?? 4) - (b?.used ?? 0);
  if (left < 1) {
    const when = b?.next_free ? ` Your next token comes back on ${dayLabel(b.next_free)}.` : '';
    res.status(403).json({ ok: false, error: `You've used all your 1:1 tokens for now.${when}` }); return;
  }

  const { data: request, error: insErr } = await admin.from('one_to_one_requests')
    .insert({ athlete_id: role.athlete_id, request_date: date, request_time: time })
    .select('id, request_date, request_time, status, tokens, created_at').single();
  if (insErr) { res.status(500).json({ ok: false, error: insErr.message }); return; }

  const name = (role.full_name || '').trim() || 'Athlete';
  const text = `Hi coach, I'd like to request a 1:1 on ${dayLabel(date)}. Would you be available at ${timeLabel(time)}?`;
  const { data: message } = await admin.from('athlete_messages').insert({
    athlete_id: role.athlete_id, title: '', body: text, sent_by: name,
    sender_type: 'athlete', sender_user_id: user.id,
  }).select('id, athlete_id, title, body, sent_by, created_at, read_at, sender_type').single();

  try {
    if (configureWebPush()) {
      const { data: staff } = await admin.from('user_roles').select('user_id').in('role', ['admin', 'co_admin']);
      await sendPushToUsers(admin, (staff || []).map(s => s.user_id), {
        title: `${name} · 1:1 request`,
        body: text.slice(0, 140),
        url: `/?messages=${encodeURIComponent(role.athlete_id)}`,
        tag: `team-${role.athlete_id}`,
      }, MESSAGE_PUSH);
    }
  } catch (err) {
    console.error('[one-to-one] staff push failed', err.message);
  }

  res.status(200).json({ ok: true, request, tokens_left: left - 1, message });
}

export async function oneToOneDecide(req, res) {
  const ctx = await begin(req, res); if (!ctx) return;
  const { user, admin, body } = ctx;

  const { data: me } = await admin.from('user_roles').select('role, full_name').eq('user_id', user.id).maybeSingle();
  if (!me || !['admin', 'co_admin'].includes(me.role)) { res.status(403).json({ ok: false, error: 'Coaches only.' }); return; }

  const decision = String(body?.decision || '');
  if (!DECISIONS.includes(decision)) { res.status(400).json({ ok: false, error: 'Unknown decision.' }); return; }

  const { data: reqRow } = await admin.from('one_to_one_requests').select('*').eq('id', String(body?.request_id || '')).maybeSingle();
  if (!reqRow) { res.status(404).json({ ok: false, error: 'Request not found.' }); return; }

  const coachNote = String(body?.coach_note || '').trim().slice(0, 300) || null;
  const { error: updErr } = await admin.from('one_to_one_requests').update({
    status: decision, coach_note: coachNote, decided_by: user.id, decided_at: new Date().toISOString(),
  }).eq('id', reqRow.id);
  if (updErr) { res.status(500).json({ ok: false, error: updErr.message }); return; }

  // Tell the athlete (confirmed / declined / cancelled) in their coaching-team chat.
  const when = `${dayLabel(reqRow.request_date)}${reqRow.request_time ? ` at ${timeLabel(reqRow.request_time)}` : ''}`;
  const text = {
    confirmed: `Your 1:1 on ${when} is confirmed ✓${coachNote ? ` ${coachNote}` : ''}`,
    declined: `I can't do your 1:1 on ${when}, so your token is back with you.${coachNote ? ` ${coachNote}` : ' Send me another time that suits you.'}`,
    cancelled: `I've had to cancel your 1:1 on ${when} — your token is back with you.${coachNote ? ` ${coachNote}` : ''}`,
  }[decision];

  if (text) {
    const sentBy = (me.full_name || '').trim() || user.email || 'Coach';
    await admin.from('athlete_messages').insert({
      athlete_id: reqRow.athlete_id, title: '', body: text, sent_by: sentBy,
      sender_type: 'coach', sender_user_id: user.id,
    });
    try {
      if (configureWebPush()) {
        await sendPushToAthlete(admin, reqRow.athlete_id, {
          title: decision === 'confirmed' ? '1:1 confirmed' : '1:1 update', body: text.slice(0, 140),
          url: '/athlete?inbox=1', tag: `team-${reqRow.athlete_id}`,
        }, MESSAGE_PUSH);
      }
    } catch (err) {
      console.error('[one-to-one] athlete push failed', err.message);
    }
  }

  res.status(200).json({ ok: true });
}
