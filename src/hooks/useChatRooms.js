import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useChatRooms — the group and direct chats the signed-in person is in, with
 * members, the latest message and an unread count. Works for both:
 *   me = { type: 'staff',   userId }
 *   me = { type: 'athlete', athleteId }
 * Re-checks on focus and every 30s. Degrades to "no chats" if the group-chat
 * SQL hasn't been run yet.
 */
export function useChatRooms(me) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  const meKey = me ? `${me.type}:${me.userId || me.athleteId}` : '';

  const isMine = useCallback((m) => (
    me?.type === 'staff' ? m.sender_user_id === me.userId : m.sender_athlete_id === me?.athleteId
  ), [meKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!me || !(me.userId || me.athleteId)) { setRooms([]); setLoading(false); return undefined; }
    let cancelled = false;
    (async () => {
      let q = supabase.from('chat_members').select('room_id, last_read_at, added_at').is('removed_at', null);
      q = me.type === 'staff' ? q.eq('user_id', me.userId) : q.eq('athlete_id', me.athleteId);
      const { data: mine, error } = await q;
      if (cancelled) return;
      if (error || !mine?.length) {
        if (error) console.warn('[useChatRooms]', error.message);
        setRooms([]); setLoading(false); return;
      }
      const roomIds = mine.map(m => m.room_id);
      const [{ data: roomRows }, { data: memberRows }, { data: msgRows }] = await Promise.all([
        supabase.from('chat_rooms').select('id, kind, name, athletes_can_post, created_at').in('id', roomIds).is('archived_at', null),
        supabase.from('chat_members').select('room_id, member_type, user_id, athlete_id, display_name').in('room_id', roomIds).is('removed_at', null),
        supabase.from('chat_messages')
          .select('id, room_id, sender_type, sender_user_id, sender_athlete_id, sender_name, body, created_at')
          .in('room_id', roomIds).order('created_at', { ascending: false }).limit(400),
      ]);
      if (cancelled) return;

      const readAt = new Map(mine.map(m => [m.room_id, m.last_read_at || m.added_at]));
      const built = (roomRows || []).map(r => {
        const msgs = (msgRows || []).filter(m => m.room_id === r.id);
        const since = new Date(readAt.get(r.id) || 0).getTime();
        return {
          id: r.id,
          kind: r.kind,
          name: r.name,
          athletesCanPost: r.athletes_can_post,
          createdAt: r.created_at,
          members: (memberRows || []).filter(m => m.room_id === r.id),
          last: msgs[0] || null,
          unread: msgs.filter(m => !isMine(m) && new Date(m.created_at).getTime() > since).length,
        };
      }).sort((a, b) => new Date(b.last?.created_at || b.createdAt) - new Date(a.last?.created_at || a.createdAt));

      setRooms(built);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [meKey, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    const t = setInterval(onVisible, 30_000);
    return () => { document.removeEventListener('visibilitychange', onVisible); clearInterval(t); };
  }, [refresh]);

  const markRead = useCallback(async (roomId) => {
    if (!me) return;
    const now = new Date().toISOString();
    setRooms(prev => prev.map(r => (r.id === roomId ? { ...r, unread: 0 } : r)));
    let q = supabase.from('chat_members').update({ last_read_at: now }).eq('room_id', roomId);
    q = me.type === 'staff' ? q.eq('user_id', me.userId) : q.eq('athlete_id', me.athleteId);
    const { error } = await q;
    if (error) console.warn('[useChatRooms] markRead failed', error.message);
  }, [meKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalUnread = useMemo(() => rooms.reduce((n, r) => n + r.unread, 0), [rooms]);
  return { rooms, loading, totalUnread, refresh, markRead, isMine };
}

/** Display title for a chat from the viewer's side. */
export function roomTitle(room, me) {
  if (room.kind === 'group') return room.name || 'Group chat';
  const other = room.members.find(m => (me?.type === 'staff' ? m.member_type === 'athlete' : m.member_type === 'staff'));
  return me?.type === 'staff' ? `Private · ${other?.display_name || 'athlete'}` : (other?.display_name || 'Your coach');
}

export function roomSubtitle(room) {
  if (room.kind === 'direct') return 'Private chat · visible to parents and the safeguarding team';
  const coaches = room.members.filter(m => m.member_type === 'staff').length;
  const athletes = room.members.filter(m => m.member_type === 'athlete').length;
  return `${coaches} coach${coaches === 1 ? '' : 'es'} · ${athletes} athlete${athletes === 1 ? '' : 's'}`;
}
