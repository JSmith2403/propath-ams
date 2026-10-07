// POST /api/athlete-auth/family-view   { token }      (public — no login)
//
// Read-only view for a parent/guardian: everything their child can see —
// the shared coach thread and every group/direct chat the child is in. The
// parent holds a secret link (/family/<token>); only its sha256 is stored, the
// link can be revoked, and every open is counted. Only this athlete's own
// conversations are ever returned.

import { getSupabaseAdmin, hashClaim } from '../athleteAuth.js';

const MAX_PER_CHAT = 300;

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'POST only' }); return; }
  const admin = getSupabaseAdmin();
  if (!admin) { res.status(503).json({ ok: false, error: 'Server not configured.' }); return; }

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch { res.status(400).json({ ok: false, error: 'Invalid request.' }); return; }

  const token = String(body?.token || '');
  const invalid = () => res.status(404).json({ ok: false, error: 'This link isn\'t valid any more. Please ask the academy for a new one.' });
  if (token.length < 20) { invalid(); return; }

  const { data: link } = await admin.from('guardian_links')
    .select('id, athlete_id, label, revoked_at, view_count').eq('token_hash', hashClaim(token)).maybeSingle();
  if (!link || link.revoked_at) { invalid(); return; }

  const athleteId = link.athlete_id;
  const { data: athlete } = await admin.from('athletes').select('data').eq('id', athleteId).maybeSingle();

  // The shared coach thread.
  const { data: team } = await admin.from('athlete_messages')
    .select('id, body, title, sent_by, sender_type, created_at')
    .eq('athlete_id', athleteId).order('created_at', { ascending: false }).limit(MAX_PER_CHAT);

  // Group + direct chats the child is currently in.
  const { data: mine } = await admin.from('chat_members')
    .select('room_id').eq('athlete_id', athleteId).is('removed_at', null);
  const roomIds = (mine || []).map(m => m.room_id);
  let chats = [];
  if (roomIds.length) {
    const [{ data: rooms }, { data: members }, { data: msgs }] = await Promise.all([
      admin.from('chat_rooms').select('id, kind, name').in('id', roomIds).is('archived_at', null),
      admin.from('chat_members').select('room_id, display_name, member_type').in('room_id', roomIds).is('removed_at', null),
      admin.from('chat_messages')
        .select('id, room_id, sender_type, sender_name, body, created_at')
        .in('room_id', roomIds).order('created_at', { ascending: false }).limit(MAX_PER_CHAT * roomIds.length),
    ]);
    chats = (rooms || []).map(r => ({
      id: r.id,
      kind: r.kind,
      name: r.kind === 'group'
        ? (r.name || 'Group chat')
        : `Private chat with ${(members || []).find(m => m.room_id === r.id && m.member_type === 'staff')?.display_name || 'a coach'}`,
      members: (members || []).filter(m => m.room_id === r.id).map(m => m.display_name).filter(Boolean),
      messages: (msgs || []).filter(m => m.room_id === r.id).slice(0, MAX_PER_CHAT).reverse(),
    }));
  }

  await admin.from('guardian_links').update({
    last_viewed_at: new Date().toISOString(), view_count: (link.view_count || 0) + 1,
  }).eq('id', link.id);

  res.status(200).json({
    ok: true,
    athlete: { name: athlete?.data?.name || 'Your child' },
    label: link.label,
    team: (team || []).reverse(),
    chats,
  });
}
