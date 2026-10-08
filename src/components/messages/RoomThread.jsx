import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import ChatBubbles from './ChatBubbles';
import ChatComposer from './ChatComposer';

/**
 * RoomThread — the messages of one group/direct chat plus a composer, for both
 * coaches and athletes. Polls every 12s while open and marks the chat read.
 * Sending goes through /api/push/chat-send (sender = verified login).
 */
export default function RoomThread({ room, isMine, onRead, onSent, canPost = true, placeholder = 'Write a message…', note = null }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    const { data, error: err } = await supabase
      .from('chat_messages')
      .select('id, room_id, sender_type, sender_user_id, sender_athlete_id, sender_name, body, created_at')
      .eq('room_id', room.id).order('created_at', { ascending: false }).limit(300);
    if (!err) setMessages((data || []).reverse());
    setLoading(false);
  }, [room.id]);

  useEffect(() => {
    setMessages([]); setError(null);
    load();
    const t = setInterval(() => { if (document.visibilityState === 'visible') load(true); }, 12_000);
    return () => clearInterval(t);
  }, [load]);

  // Opening / receiving messages in this chat counts as reading it.
  useEffect(() => {
    if (messages.some(m => !isMine(m))) onRead?.(room.id);
  }, [messages.length, room.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async (e) => {
    e?.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true); setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/push/chat-send', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({ room_id: room.id, body: text.trim() }),
      });
      const json = await res.json().catch(() => ({ ok: false, error: `Server error (${res.status}).` }));
      if (!json.ok) throw new Error(json.error || 'Couldn\'t send.');
      setText('');
      setMessages(prev => (prev.some(m => m.id === json.message.id) ? prev : [...prev, json.message]));
      onSent?.();
    } catch (err) {
      setError(err.message);
    }
    setSending(false);
  };

  const bubbles = messages.map(m => ({
    id: m.id, mine: isMine(m), name: m.sender_name, body: m.body, at: m.created_at, role: m.sender_type,
  }));

  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 py-4 bg-white">
        {loading
          ? <p className="py-8 text-center text-xs text-gray-400">Loading…</p>
          : <ChatBubbles messages={bubbles} showNames emptyText="No messages yet — say hello below." scrollKey={room.id} />}
      </div>

      {canPost ? (
        <ChatComposer value={text} onChange={setText} onSubmit={send} sending={sending} error={error} placeholder={placeholder} note={note} />
      ) : (
        <p className="px-4 py-3.5 border-t border-gray-100 text-xs text-gray-400 text-center bg-white shrink-0">
          Only coaches can post in this chat.
        </p>
      )}
    </>
  );
}
