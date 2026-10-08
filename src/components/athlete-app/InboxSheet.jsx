import { useEffect, useMemo, useRef, useState } from 'react';
import { X, MessageCircle, ArrowLeft, Users, UserRound, ChevronRight } from 'lucide-react';
import RoomThread from '../messages/RoomThread';
import ChatBubbles from '../messages/ChatBubbles';
import ChatComposer from '../messages/ChatComposer';
import { roomTitle, roomSubtitle } from '../../hooks/useChatRooms';
import { NotificationStatusStrip } from './NotificationPrompt';

const GOLD = '#A58D69';

const SAFEGUARD_NOTE = 'Messages are saved and can be seen by the ProPath coaching and safeguarding team, and by your parents/guardians. For anything urgent, speak to a coach in person.';

/**
 * InboxSheet — the athlete's messages. Opens straight into the conversation with
 * the coaching team when that's all there is; once they're in group or private
 * chats it shows a list first. Opening a thread marks it read.
 */
export default function InboxSheet({ messages, loading, markRead, sendReply, refresh, chat, athleteId, initialRoomId, onClose }) {
  const me = useMemo(() => ({ type: 'athlete', athleteId }), [athleteId]);
  const rooms = chat?.rooms || [];
  const [view, setView] = useState(initialRoomId ? { room: initialRoomId } : null);   // null = default
  const current = view ?? (rooms.length ? 'list' : 'team');
  const room = current?.room ? rooms.find(r => r.id === current.room) : null;

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    if (current === 'team') markRead(messages.filter(m => m.sender_type === 'coach').map(m => m.id));
  }, [messages, current]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      refresh();
      chat?.refresh();
    }, 15_000);
    return () => clearInterval(t);
  }, [refresh, chat]);

  useEffect(() => { if (current === 'team') endRef.current?.scrollIntoView({ block: 'end' }); }, [messages.length, loading, current]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true); setError(null);
    const r = await sendReply(text);
    setSending(false);
    if (r.ok) setText(''); else setError(r.error);
  };

  const teamLast = messages[messages.length - 1];
  const teamUnread = messages.filter(m => m.sender_type === 'coach' && !m.read_at).length;
  const showBack = current !== 'list' && rooms.length > 0;
  const heading = current === 'list' ? 'Messages' : current === 'team' ? 'Your coaching team' : (room ? roomTitle(room, me) : 'Messages');
  const sub = current === 'team' ? 'Coaches can all see this conversation' : room ? roomSubtitle(room) : '';

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full bg-white rounded-t-2xl shadow-2xl flex flex-col"
        style={{ maxWidth: 480, height: '85vh', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center gap-2 px-4 py-4 border-b border-ink-100 shrink-0">
          {showBack && (
            <button onClick={() => setView('list')} className="p-1.5 -ml-1 rounded hover:bg-ink-50" aria-label="Back to messages">
              <ArrowLeft size={16} className="text-ink-500" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-ink-900 truncate">{heading}</h3>
            {sub && <p className="text-micro text-ink-400 truncate">{sub}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-ink-50" aria-label="Close">
            <X size={16} className="text-ink-500" />
          </button>
        </div>

        {/* Why alerts might not be arriving, and the one-tap fix. */}
        <NotificationStatusStrip athleteId={athleteId} />

        {/* ── List of conversations ── */}
        {current === 'list' && (
          <div className="flex-1 overflow-y-auto">
            <ul className="divide-y divide-ink-100">
              <li>
                <button onClick={() => setView('team')} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-ink-50">
                  <div className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center shrink-0"><MessageCircle size={17} style={{ color: GOLD }} /></div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-body truncate ${teamUnread ? 'font-bold' : 'font-semibold'} text-ink-900`}>Your coaching team</p>
                    <p className="text-meta text-ink-400 truncate">
                      {teamLast ? `${teamLast.sender_type === 'athlete' ? 'You: ' : ''}${teamLast.title || teamLast.body || ''}` : 'Say hello'}
                    </p>
                  </div>
                  {teamUnread > 0 && <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center bg-red-600">{teamUnread}</span>}
                  <ChevronRight size={16} className="text-ink-300 shrink-0" />
                </button>
              </li>
              {rooms.map(r => (
                <li key={r.id}>
                  <button onClick={() => setView({ room: r.id })} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-ink-50">
                    <div className="w-10 h-10 rounded-full bg-ink-100 flex items-center justify-center shrink-0 text-ink-600">
                      {r.kind === 'group' ? <Users size={17} /> : <UserRound size={17} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-body truncate ${r.unread ? 'font-bold' : 'font-semibold'} text-ink-900`}>{roomTitle(r, me)}</p>
                      <p className="text-meta text-ink-400 truncate">
                        {r.last ? `${chat.isMine(r.last) ? 'You' : r.last.sender_name}: ${r.last.body}` : roomSubtitle(r)}
                      </p>
                    </div>
                    {r.unread > 0 && <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center bg-red-600">{r.unread}</span>}
                    <ChevronRight size={16} className="text-ink-300 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
            <p className="px-4 py-4 text-[10px] text-ink-400 leading-snug">{SAFEGUARD_NOTE}</p>
          </div>
        )}

        {/* ── Coaching team thread ── */}
        {current === 'team' && (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-white">
              {loading ? (
                <p className="py-8 text-center text-meta text-ink-400">Loading…</p>
              ) : (
                <ChatBubbles
                  scrollKey="team"
                  emptyText="No messages yet. Say hello to your coaches below."
                  messages={messages.map(m => ({
                    id: m.id, mine: m.sender_type === 'athlete', name: m.sent_by, body: m.body, title: m.title,
                    at: m.created_at, role: m.sender_type === 'coach' ? 'staff' : 'athlete',
                  }))}
                />
              )}
            </div>
            <ChatComposer
              value={text}
              onChange={setText}
              onSubmit={submit}
              sending={sending}
              error={error}
              placeholder="Message your coaches…"
              note={SAFEGUARD_NOTE}
            />
          </>
        )}

        {/* ── A group / private chat ── */}
        {room && (
          <RoomThread
            key={room.id}
            room={room}
            me={me}
            isMine={chat.isMine}
            onRead={chat.markRead}
            onSent={chat.refresh}
            canPost={room.kind !== 'group' || room.athletesCanPost !== false}
            placeholder="Write a message…"
            note={SAFEGUARD_NOTE}
          />
        )}
        {current?.room && !room && (
          <p className="py-10 text-center text-meta text-ink-400">Loading…</p>
        )}
      </div>
    </div>
  );
}
