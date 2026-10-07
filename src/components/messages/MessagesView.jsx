import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, Send, Loader2, ArrowLeft, Bell, BellOff, MessageCircle, Megaphone, Check, Plus, Users, UserRound, Settings2, Link2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { pushSupported, subscribeStaffToPush } from '../../utils/pushSubscribe';
import MessageComposerModal from '../recent/MessageComposerModal';
import RoomThread from './RoomThread';
import ChatSetupModal from './ChatSetupModal';
import ParentLinksModal from './ParentLinksModal';
import { useChatRooms, roomTitle, roomSubtitle } from '../../hooks/useChatRooms';

const GOLD = '#A58D69';
const COLS = 'id, athlete_id, title, body, sent_by, created_at, read_at, sender_type';

function stamp(iso) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === new Date().toDateString()) return time;
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, ${time}`;
}
function short(iso) {
  const d = new Date(iso);
  if (d.toDateString() === new Date().toDateString()) {
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
const initials = (name = '') => name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

/**
 * Messages — every coach's shared inbox. One conversation per athlete with
 * the whole coaching team: any coach can read and reply, and the athlete sees
 * one thread. Everything is stored permanently (see the safeguarding log).
 */
export default function MessagesView({ athletes = [], senderName, initialAthleteId, initialRoomId, onUnreadChange }) {
  const [recent, setRecent] = useState([]);              // latest messages across all athletes
  const [loadError, setLoadError] = useState(null);
  const [selectedId, setSelectedId] = useState(initialRoomId ? null : (initialAthleteId || null));
  const [thread, setThread] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [notif, setNotif] = useState(() => (pushSupported() ? Notification.permission : 'unsupported'));
  const endRef = useRef(null);

  // Group & direct chats this coach is in (the athlete threads below are the
  // shared coach-team inbox).
  const [myUserId, setMyUserId] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId || null);
  const [setupMode, setSetupMode] = useState(null);       // null | 'create' | 'manage'
  const [parentFor, setParentFor] = useState(null);        // athlete whose parent links are open
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setMyUserId(session?.user?.id || null));
  }, []);
  const chat = useChatRooms(myUserId ? { type: 'staff', userId: myUserId } : null);
  const staffMe = useMemo(() => ({ type: 'staff', userId: myUserId }), [myUserId]);
  const selectedRoom = chat.rooms.find(r => r.id === selectedRoomId) || null;
  const hasSelection = !!(selectedId || selectedRoomId);
  const pickAthlete = (id) => { setSelectedRoomId(null); setSelectedId(id); };
  const pickRoom = (id) => { setSelectedId(null); setSelectedRoomId(id); };

  const athleteById = useMemo(() => new Map(athletes.map(a => [a.id, a])), [athletes]);

  // ── Conversation list ────────────────────────────────────────────────────
  const loadRecent = useCallback(async () => {
    const { data, error } = await supabase
      .from('athlete_messages')
      .select(COLS)
      .order('created_at', { ascending: false })
      .limit(600);
    if (error) { setLoadError(error.message); return; }
    setLoadError(null);
    setRecent(data || []);
  }, []);

  useEffect(() => {
    loadRecent();
    const t = setInterval(() => { if (document.visibilityState === 'visible') loadRecent(); }, 30_000);
    return () => clearInterval(t);
  }, [loadRecent]);

  const summaries = useMemo(() => {
    const map = new Map();
    for (const m of recent) {                      // newest first
      const s = map.get(m.athlete_id) || { athleteId: m.athlete_id, last: m, unread: 0 };
      if (m.sender_type === 'athlete' && !m.read_at) s.unread += 1;
      map.set(m.athlete_id, s);
    }
    const q = query.trim().toLowerCase();
    const rows = athletes
      .filter(a => !q || (a.name || '').toLowerCase().includes(q))
      .map(a => map.get(a.id) || { athleteId: a.id, last: null, unread: 0 });
    return rows.sort((a, b) => {
      if (!!b.unread !== !!a.unread) return b.unread ? 1 : -1;
      const at = a.last ? new Date(a.last.created_at).getTime() : 0;
      const bt = b.last ? new Date(b.last.created_at).getTime() : 0;
      if (bt !== at) return bt - at;
      return (athleteById.get(a.athleteId)?.name || '').localeCompare(athleteById.get(b.athleteId)?.name || '');
    });
  }, [recent, athletes, query, athleteById]);

  // ── Open thread ──────────────────────────────────────────────────────────
  const loadThread = useCallback(async (athleteId, { quiet = false } = {}) => {
    if (!athleteId) return;
    if (!quiet) setThreadLoading(true);
    const { data, error } = await supabase
      .from('athlete_messages')
      .select(COLS)
      .eq('athlete_id', athleteId)
      .order('created_at', { ascending: false })
      .limit(300);
    if (!error) setThread((data || []).reverse());
    setThreadLoading(false);
  }, []);

  useEffect(() => {
    setThread([]);
    setSendError(null);
    if (!selectedId) return undefined;
    loadThread(selectedId);
    const t = setInterval(() => { if (document.visibilityState === 'visible') loadThread(selectedId, { quiet: true }); }, 15_000);
    return () => clearInterval(t);
  }, [selectedId, loadThread]);

  // Opening a thread marks the athlete's messages as read (the badge + the
  // athlete's "seen" state both depend on it).
  useEffect(() => {
    const unread = thread.filter(m => m.sender_type === 'athlete' && !m.read_at).map(m => m.id);
    if (!unread.length) return;
    const now = new Date().toISOString();
    supabase.from('athlete_messages').update({ read_at: now }).in('id', unread).then(({ error }) => {
      if (error) return;
      setThread(prev => prev.map(m => (unread.includes(m.id) ? { ...m, read_at: now } : m)));
      setRecent(prev => prev.map(m => (unread.includes(m.id) ? { ...m, read_at: now } : m)));
      onUnreadChange?.();
    });
  }, [thread]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [thread.length, selectedId]);

  // Keep this device registered for push if permission was already granted.
  useEffect(() => {
    if (notif === 'granted') subscribeStaffToPush({ askPermission: false });
  }, [notif]);

  const enableNotifications = async () => {
    const r = await subscribeStaffToPush();
    setNotif(r === 'error' ? Notification.permission : r);
  };

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending || !selectedId) return;
    setSending(true);
    setSendError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/push/message', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ athlete_ids: [selectedId], title: '', body: text.trim() }),
      });
      const json = await res.json().catch(() => ({ ok: false, error: `Server error (${res.status}).` }));
      if (!json.ok) throw new Error(json.error || 'Couldn\'t send.');
      setText('');
      await Promise.all([loadThread(selectedId, { quiet: true }), loadRecent()]);
    } catch (err) {
      setSendError(err.message);
    }
    setSending(false);
  };

  const selected = selectedId ? athleteById.get(selectedId) : null;

  return (
    <div className="flex-1 flex overflow-hidden p-0 md:p-4 gap-4">
      {/* ── Conversation list ── */}
      <div className={`${hasSelection ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 shrink-0 bg-white md:rounded-xl border border-ink-100 overflow-hidden`}>
        <div className="px-4 pt-4 pb-3 border-b border-ink-100">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-bold text-ink-900">Messages</h1>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSetupMode('create')}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md text-white"
                style={{ backgroundColor: GOLD }}
              >
                <Plus size={12} /> New chat
              </button>
              <button
                onClick={() => setAnnounceOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md border border-ink-200 text-ink-700 hover:bg-ink-50"
                title="Send one message to many athletes' team threads"
              >
                <Megaphone size={12} /> Announce
              </button>
            </div>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search athletes"
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-ink-200 focus:outline-none focus:border-gold-500"
            />
          </div>
          {pushSupported() && notif !== 'granted' && (
            <button
              onClick={enableNotifications}
              disabled={notif === 'denied'}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-ink-200 hover:bg-ink-50 disabled:opacity-60"
            >
              {notif === 'denied' ? <BellOff size={12} /> : <Bell size={12} />}
              {notif === 'denied' ? 'Notifications blocked in browser settings' : 'Get notified when athletes reply'}
            </button>
          )}
        </div>

        {loadError && (
          <p className="px-4 py-3 text-xs text-red-600">
            Couldn't load messages — has the messaging SQL been run? ({loadError})
          </p>
        )}

        <div className="flex-1 overflow-y-auto">
        {chat.rooms.length > 0 && (
          <>
            <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-ink-400">Group &amp; private chats</p>
            <ul className="divide-y divide-ink-100 border-b border-ink-100">
              {chat.rooms.map(r => (
                <li key={r.id}>
                  <button
                    onClick={() => pickRoom(r.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-ink-50"
                    style={r.id === selectedRoomId ? { backgroundColor: 'rgba(165,141,105,0.12)' } : {}}
                  >
                    <div className="w-9 h-9 rounded-full bg-ink-100 flex items-center justify-center shrink-0 text-ink-600">
                      {r.kind === 'group' ? <Users size={15} /> : <UserRound size={15} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`text-sm truncate ${r.unread ? 'font-bold text-ink-900' : 'font-medium text-ink-800'}`}>{roomTitle(r, staffMe)}</p>
                        {r.last && <span className="text-[10px] text-ink-400 shrink-0">{short(r.last.created_at)}</span>}
                      </div>
                      <p className={`text-xs truncate ${r.unread ? 'text-ink-700' : 'text-ink-400'}`}>
                        {r.last ? `${chat.isMine(r.last) ? 'You' : r.last.sender_name}: ${r.last.body}` : roomSubtitle(r)}
                      </p>
                    </div>
                    {r.unread > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: '#dc2626' }}>
                        {r.unread}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-ink-400">Athletes · coaching team thread</p>
          </>
        )}
        <ul className="divide-y divide-ink-100">
          {summaries.map(s => {
            const a = athleteById.get(s.athleteId);
            if (!a) return null;
            const active = s.athleteId === selectedId;
            return (
              <li key={s.athleteId}>
                <button
                  onClick={() => pickAthlete(s.athleteId)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-ink-50"
                  style={active ? { backgroundColor: 'rgba(165,141,105,0.12)' } : {}}
                >
                  <div className="w-9 h-9 rounded-full bg-ink-100 flex items-center justify-center shrink-0 overflow-hidden text-[10px] font-bold text-ink-600">
                    {a.photo ? <img src={a.photo} alt="" className="w-full h-full object-cover" /> : initials(a.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`text-sm truncate ${s.unread ? 'font-bold text-ink-900' : 'font-medium text-ink-800'}`}>{a.name}</p>
                      {s.last && <span className="text-[10px] text-ink-400 shrink-0">{short(s.last.created_at)}</span>}
                    </div>
                    <p className={`text-xs truncate ${s.unread ? 'text-ink-700' : 'text-ink-400'}`}>
                      {s.last
                        ? `${s.last.sender_type === 'coach' ? 'You: ' : ''}${s.last.title ? `${s.last.title} — ` : ''}${s.last.body || ''}`
                        : 'No messages yet'}
                    </p>
                  </div>
                  {s.unread > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: '#dc2626' }}>
                      {s.unread}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
          {summaries.length === 0 && <li className="px-4 py-8 text-center text-xs text-ink-400">No athletes match.</li>}
        </ul>
        </div>
      </div>

      {/* ── Thread ── */}
      <div className={`${hasSelection ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 flex-col bg-white md:rounded-xl border border-ink-100 overflow-hidden`}>
        {selectedRoom ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-ink-100 shrink-0">
              <button onClick={() => setSelectedRoomId(null)} className="md:hidden p-1 -ml-1 rounded hover:bg-ink-50" aria-label="Back">
                <ArrowLeft size={18} />
              </button>
              <div className="w-8 h-8 rounded-full bg-ink-100 flex items-center justify-center text-ink-600">
                {selectedRoom.kind === 'group' ? <Users size={14} /> : <UserRound size={14} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink-900 truncate">{roomTitle(selectedRoom, staffMe)}</p>
                <p className="text-[11px] text-ink-400 truncate">
                  {roomSubtitle(selectedRoom)}
                  {selectedRoom.kind === 'group' && selectedRoom.athletesCanPost === false ? ' · announcements only' : ''}
                </p>
              </div>
              {selectedRoom.kind === 'group' && (
                <button
                  onClick={() => setSetupMode('manage')}
                  className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-ink-200 hover:bg-ink-50"
                >
                  <Settings2 size={12} /> Members
                </button>
              )}
            </div>
            <RoomThread
              key={selectedRoom.id}
              room={selectedRoom}
              me={staffMe}
              isMine={chat.isMine}
              onRead={(id) => { chat.markRead(id); onUnreadChange?.(); }}
              onSent={chat.refresh}
              placeholder={`Message ${roomTitle(selectedRoom, staffMe).replace('Private · ', '')} as ${senderName || 'coach'}…`}
            />
          </>
        ) : !selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <MessageCircle size={28} className="text-ink-300 mb-2" />
            <p className="text-sm text-ink-500">Pick an athlete to read or start a conversation.</p>
            <p className="text-xs text-ink-400 mt-1 max-w-xs">
              Every coach sees the same thread. Messages are saved permanently for safeguarding.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-ink-100 shrink-0">
              <button onClick={() => setSelectedId(null)} className="md:hidden p-1 -ml-1 rounded hover:bg-ink-50" aria-label="Back">
                <ArrowLeft size={18} />
              </button>
              <div className="w-8 h-8 rounded-full bg-ink-100 flex items-center justify-center overflow-hidden text-[10px] font-bold text-ink-600">
                {selected.photo ? <img src={selected.photo} alt="" className="w-full h-full object-cover" /> : initials(selected.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink-900 truncate">{selected.name}</p>
                <p className="text-[11px] text-ink-400">Visible to all coaches · saved for safeguarding</p>
              </div>
              <button
                onClick={() => setParentFor(selected)}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-ink-200 hover:bg-ink-50"
                title="Read-only link so a parent can see this athlete's chats"
              >
                <Link2 size={12} /> Parent links
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5" style={{ backgroundColor: '#fafafa' }}>
              {threadLoading ? (
                <p className="py-8 text-center text-xs text-ink-400">Loading…</p>
              ) : thread.length === 0 ? (
                <p className="py-10 text-center text-xs text-ink-400">No messages yet — say hello below.</p>
              ) : thread.map(m => {
                const mine = m.sender_type === 'coach';
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="max-w-[80%] rounded-2xl px-3.5 py-2"
                      style={mine
                        ? { backgroundColor: GOLD, color: '#fff', borderBottomRightRadius: 6 }
                        : { backgroundColor: '#fff', color: '#1C1C1C', border: '1px solid #e5e7eb', borderBottomLeftRadius: 6 }}
                    >
                      {mine && m.sent_by && <p className="text-[10px] font-semibold opacity-80 mb-0.5">{m.sent_by}</p>}
                      {m.title && <p className="text-xs font-bold mb-0.5">{m.title}</p>}
                      {m.body && <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.body}</p>}
                      <p className="text-[10px] mt-1 opacity-60 text-right flex items-center justify-end gap-1">
                        {stamp(m.created_at)}
                        {mine && m.read_at && <><Check size={10} /> Seen</>}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            <form onSubmit={send} className="px-4 py-3 border-t border-ink-100 shrink-0">
              {sendError && <p className="text-xs text-red-600 mb-1.5" role="alert">{sendError}</p>}
              <div className="flex items-end gap-2">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && (e.metaKey || e.ctrlKey)) send(e); }}
                  rows={2}
                  maxLength={2000}
                  placeholder={`Reply to ${selected.name.split(' ')[0]} as ${senderName || 'coach'}…`}
                  className="flex-1 resize-none rounded-xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:border-gold-500"
                />
                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  className="shrink-0 h-10 px-4 rounded-lg flex items-center gap-1.5 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: GOLD }}
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {setupMode && (
        <ChatSetupModal
          mode={setupMode}
          athletes={athletes}
          room={setupMode === 'manage' ? selectedRoom : null}
          myUserId={myUserId}
          onClose={() => setSetupMode(null)}
          onDone={(roomId) => { setSetupMode(null); chat.refresh(); if (roomId) pickRoom(roomId); }}
        />
      )}
      {parentFor && <ParentLinksModal athlete={parentFor} onClose={() => setParentFor(null)} />}

      {announceOpen && (
        <MessageComposerModal
          athletes={athletes}
          senderName={senderName}
          onClose={() => { setAnnounceOpen(false); loadRecent(); }}
        />
      )}
    </div>
  );
}
