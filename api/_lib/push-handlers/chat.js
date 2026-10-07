// Group & direct chat endpoints (all behind /api/push/<action>):
//
//   POST chat-staff    coach  → { ok, staff: [{ user_id, name, role }] }       (for the member picker)
//   POST chat-create   coach  { kind: 'group'|'direct', name?, athlete_ids[], staff_user_ids[], athletes_can_post? }
//                             → { ok, room_id }
//   POST chat-members  coach  { room_id, add_athlete_ids?, remove_athlete_ids?, add_staff_ids?,
//                               remove_staff_ids?, name?, athletes_can_post? }
//   POST chat-send     coach or athlete  { room_id, body }   → { ok, message, pushed }
//
// Nothing here trusts the request for identity: the sender is the verified
// login, and sending requires being an ACTIVE member of the room. Messages are
// stored in chat_messages — an immutable safeguarding record (see
// sql/group_chats_parent_links_2026-10-09.sql).

import { requireUser } from '../verifyUser.js';
import { getSupabaseAdmin, isStaffUser } from '../athleteAuth.js';
import { configureWebPush, sendPushToAthlete, sendPushToUsers, MESSAGE_PUSH } from '../push.js';

const MAX_BODY = 2000;
const MAX_NAME = 80;
const MAX_MEMBERS = 200;
const ATHLETE_MAX_PER_HOUR = 40;

const ids = (v) => [...new Set((Array.isArray(v) ? v : []).map(x => String(x || '').trim()).filter(Boolean))];

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

async function staffProfile(admin, userId) {
  const { data } = await admin.from('user_roles').select('role, full_name').eq('user_id', userId).maybeSingle();
  return data && ['admin', 'co_admin'].includes(data.role) ? data : null;
}

async function staffNames(admin, userIds) {
  const { data: roles } = await admin.from('user_roles').select('user_id, role, full_name').in('user_id', userIds);
  const out = new Map();
  for (const r of roles || []) {
    if (!['admin', 'co_admin'].includes(r.role)) continue;
    let name = (r.full_name || '').trim();
    if (!name) {
      const { data } = await admin.auth.admin.getUserById(r.user_id);
      name = data?.user?.email || 'Coach';
    }
    out.set(r.user_id, name);
  }
  return out;
}

async function athleteNames(admin, athleteIds) {
  const { data } = await admin.from('athletes').select('id, data').in('id', athleteIds);
  return new Map((data || []).map(a => [a.id, a.data?.name || a.id]));
}

async function addMembers(admin, roomId, { staffIds = [], athleteIds = [] }) {
  const sNames = staffIds.length ? await staffNames(admin, staffIds) : new Map();
  const aNames = athleteIds.length ? await athleteNames(admin, athleteIds) : new Map();

  for (const uid of staffIds) {
    if (!sNames.has(uid)) continue;                       // not a coach — ignore
    const { data: ex } = await admin.from('chat_members').select('id').eq('room_id', roomId).eq('user_id', uid).maybeSingle();
    if (ex) await admin.from('chat_members').update({ removed_at: null, display_name: sNames.get(uid) }).eq('id', ex.id);
    else await admin.from('chat_members').insert({ room_id: roomId, member_type: 'staff', user_id: uid, display_name: sNames.get(uid) });
  }
  for (const aid of athleteIds) {
    if (!aNames.has(aid)) continue;                       // unknown athlete — ignore
    const { data: ex } = await admin.from('chat_members').select('id').eq('room_id', roomId).eq('athlete_id', aid).maybeSingle();
    if (ex) await admin.from('chat_members').update({ removed_at: null, display_name: aNames.get(aid) }).eq('id', ex.id);
    else await admin.from('chat_members').insert({ room_id: roomId, member_type: 'athlete', athlete_id: aid, display_name: aNames.get(aid) });
  }
}

export async function chatStaff(req, res) {
  const ctx = await begin(req, res); if (!ctx) return;
  const { user, admin } = ctx;
  if (!(await isStaffUser(admin, user.id))) { res.status(403).json({ ok: false, error: 'Coaches only.' }); return; }

  const { data: roles } = await admin.from('user_roles').select('user_id, role').in('role', ['admin', 'co_admin']);
  const names = await staffNames(admin, (roles || []).map(r => r.user_id));
  const staff = (roles || []).map(r => ({ user_id: r.user_id, role: r.role, name: names.get(r.user_id) || 'Coach' }))
    .sort((a, b) => a.name.localeCompare(b.name));
  res.status(200).json({ ok: true, staff });
}

export async function chatCreate(req, res) {
  const ctx = await begin(req, res); if (!ctx) return;
  const { user, admin, body } = ctx;
  const me = await staffProfile(admin, user.id);
  if (!me) { res.status(403).json({ ok: false, error: 'Only coaches can start chats.' }); return; }

  const kind = body.kind === 'direct' ? 'direct' : 'group';
  const athleteIds = ids(body.athlete_ids);
  const staffIds = ids(body.staff_user_ids).filter(id => id !== user.id);

  if (athleteIds.length + staffIds.length + 1 > MAX_MEMBERS) {
    res.status(400).json({ ok: false, error: `Too many members (max ${MAX_MEMBERS}).` }); return;
  }

  if (kind === 'direct') {
    if (athleteIds.length !== 1) { res.status(400).json({ ok: false, error: 'A direct chat is you plus exactly one athlete.' }); return; }
    // Re-use an existing direct chat between this coach and athlete.
    const { data: mine } = await admin.from('chat_members').select('room_id').eq('user_id', user.id).is('removed_at', null);
    const roomIds = (mine || []).map(m => m.room_id);
    if (roomIds.length) {
      const { data: theirs } = await admin.from('chat_members').select('room_id')
        .eq('athlete_id', athleteIds[0]).is('removed_at', null).in('room_id', roomIds);
      const candidateIds = (theirs || []).map(t => t.room_id);
      if (candidateIds.length) {
        const { data: rooms } = await admin.from('chat_rooms').select('id').in('id', candidateIds).eq('kind', 'direct').is('archived_at', null).limit(1);
        if (rooms?.length) { res.status(200).json({ ok: true, room_id: rooms[0].id, existing: true }); return; }
      }
    }
  } else {
    if (!String(body.name || '').trim()) { res.status(400).json({ ok: false, error: 'Give the group a name.' }); return; }
    if (athleteIds.length + staffIds.length < 1) { res.status(400).json({ ok: false, error: 'Add at least one other member.' }); return; }
  }

  const { data: room, error } = await admin.from('chat_rooms').insert({
    kind,
    name: kind === 'group' ? String(body.name).trim().slice(0, MAX_NAME) : null,
    athletes_can_post: body.athletes_can_post !== false,
    created_by: user.id,
  }).select('id').single();
  if (error) {
    const hint = /chat_rooms/.test(error.message || '') ? ' (has sql/group_chats_parent_links_2026-10-09.sql been run?)' : '';
    res.status(500).json({ ok: false, error: error.message + hint }); return;
  }

  await addMembers(admin, room.id, { staffIds: [user.id, ...(kind === 'direct' ? [] : staffIds)], athleteIds });
  res.status(200).json({ ok: true, room_id: room.id });
}

export async function chatMembers(req, res) {
  const ctx = await begin(req, res); if (!ctx) return;
  const { user, admin, body } = ctx;
  const me = await staffProfile(admin, user.id);
  if (!me) { res.status(403).json({ ok: false, error: 'Coaches only.' }); return; }

  const roomId = String(body.room_id || '');
  const { data: room } = await admin.from('chat_rooms').select('id, kind').eq('id', roomId).maybeSingle();
  if (!room) { res.status(404).json({ ok: false, error: 'Chat not found.' }); return; }
  if (room.kind === 'direct') { res.status(400).json({ ok: false, error: 'A direct chat can\'t be changed.' }); return; }

  // Must be in the chat (or an admin) to change it.
  const { data: mem } = await admin.from('chat_members').select('id').eq('room_id', roomId).eq('user_id', user.id).is('removed_at', null).maybeSingle();
  if (!mem && me.role !== 'admin') { res.status(403).json({ ok: false, error: 'You\'re not in this chat.' }); return; }

  const patch = {};
  if (typeof body.name === 'string' && body.name.trim()) patch.name = body.name.trim().slice(0, MAX_NAME);
  if (typeof body.athletes_can_post === 'boolean') patch.athletes_can_post = body.athletes_can_post;
  if (Object.keys(patch).length) await admin.from('chat_rooms').update(patch).eq('id', roomId);

  await addMembers(admin, roomId, { staffIds: ids(body.add_staff_ids), athleteIds: ids(body.add_athlete_ids) });

  const now = new Date().toISOString();
  const rmAthletes = ids(body.remove_athlete_ids);
  const rmStaff = ids(body.remove_staff_ids);
  if (rmAthletes.length) await admin.from('chat_members').update({ removed_at: now }).eq('room_id', roomId).in('athlete_id', rmAthletes);
  if (rmStaff.length) await admin.from('chat_members').update({ removed_at: now }).eq('room_id', roomId).in('user_id', rmStaff);

  res.status(200).json({ ok: true });
}

export async function chatSend(req, res) {
  const ctx = await begin(req, res); if (!ctx) return;
  const { user, admin, body } = ctx;

  const text = String(body.body || '').trim().slice(0, MAX_BODY);
  if (!text) { res.status(400).json({ ok: false, error: 'Write a message first.' }); return; }

  const { data: role } = await admin.from('user_roles').select('role, athlete_id, full_name').eq('user_id', user.id).maybeSingle();
  const isStaff = !!role && ['admin', 'co_admin'].includes(role.role);
  const isAthlete = !!role && role.role === 'athlete' && !!role.athlete_id;
  if (!isStaff && !isAthlete) { res.status(403).json({ ok: false, error: 'Not allowed.' }); return; }

  const roomId = String(body.room_id || '');
  const { data: room } = await admin.from('chat_rooms').select('id, kind, name, athletes_can_post, archived_at').eq('id', roomId).maybeSingle();
  if (!room || room.archived_at) { res.status(404).json({ ok: false, error: 'Chat not found.' }); return; }

  const memberQuery = admin.from('chat_members').select('id, display_name').eq('room_id', roomId).is('removed_at', null);
  const { data: me } = await (isStaff ? memberQuery.eq('user_id', user.id) : memberQuery.eq('athlete_id', role.athlete_id)).maybeSingle();
  if (!me) { res.status(403).json({ ok: false, error: 'You\'re not in this chat.' }); return; }

  if (isAthlete) {
    if (room.kind === 'group' && room.athletes_can_post === false) {
      res.status(403).json({ ok: false, error: 'Only coaches can post in this chat.' }); return;
    }
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin.from('chat_messages').select('id', { count: 'exact', head: true })
      .eq('sender_athlete_id', role.athlete_id).gte('created_at', since);
    if ((count || 0) >= ATHLETE_MAX_PER_HOUR) { res.status(429).json({ ok: false, error: 'Too many messages — try again a little later.' }); return; }
  }

  const senderName = (me.display_name || role.full_name || '').trim() || (isStaff ? 'Coach' : 'Athlete');
  const { data: message, error } = await admin.from('chat_messages').insert({
    room_id: roomId,
    sender_type: isStaff ? 'staff' : 'athlete',
    sender_user_id: user.id,
    sender_athlete_id: isAthlete ? role.athlete_id : null,
    sender_name: senderName,
    body: text,
  }).select('id, room_id, sender_type, sender_user_id, sender_athlete_id, sender_name, body, created_at').single();
  if (error) { res.status(500).json({ ok: false, error: error.message }); return; }

  // Push everyone else in the chat (best effort).
  let pushed = 0;
  try {
    if (configureWebPush()) {
      const { data: members } = await admin.from('chat_members').select('user_id, athlete_id').eq('room_id', roomId).is('removed_at', null);
      const title = room.kind === 'group' ? (room.name || 'Group chat') : senderName;
      const preview = room.kind === 'group' ? `${senderName}: ${text}` : text;
      const payload = { title, body: preview.slice(0, 140), tag: `room-${roomId}` };

      const staffTargets = (members || []).filter(m => m.user_id && m.user_id !== user.id).map(m => m.user_id);
      if (staffTargets.length) {
        const r = await sendPushToUsers(admin, staffTargets, { ...payload, url: `/?chat=${roomId}` }, MESSAGE_PUSH);
        pushed += r.sent;
      }
      for (const m of (members || []).filter(x => x.athlete_id && x.athlete_id !== role.athlete_id)) {
        const r = await sendPushToAthlete(admin, m.athlete_id, { ...payload, url: `/athlete?inbox=1&room=${roomId}` }, MESSAGE_PUSH);
        pushed += r.sent;
      }
    }
  } catch (err) {
    console.error('[chat-send] push failed', err.message);
  }

  res.status(200).json({ ok: true, message, pushed });
}
