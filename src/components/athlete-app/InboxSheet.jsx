import { useEffect, useRef, useState } from 'react';
import { X, MessageCircle, Send, Loader2 } from 'lucide-react';

const GOLD = '#A58D69';

function when(iso) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === new Date().toDateString()) return time;
  return `${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}, ${time}`;
}

/**
 * InboxSheet — the athlete's conversation with the coaching team. Opening it
 * marks the coach's messages as read (the read receipt the coach sees) and
 * the thread refreshes every few seconds while it's open.
 */
export default function InboxSheet({ messages, loading, markRead, sendReply, refresh, onClose }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    markRead(messages.filter(m => m.sender_type === 'coach').map(m => m.id));
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, 15_000);
    return () => clearInterval(t);
  }, [refresh]);

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [messages.length, loading]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    setError(null);
    const r = await sendReply(text);
    setSending(false);
    if (r.ok) setText(''); else setError(r.error);
  };

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
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-ink-900">Messages</h3>
            <p className="text-micro text-ink-400">Your coaching team</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-ink-50" aria-label="Close">
            <X size={16} className="text-ink-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
          {loading ? (
            <p className="py-8 text-center text-meta text-ink-400">Loading…</p>
          ) : messages.length === 0 ? (
            <div className="py-10 text-center">
              <MessageCircle size={22} className="mx-auto mb-2 text-ink-300" />
              <p className="text-meta text-ink-500">No messages yet. Say hello to your coaches below.</p>
            </div>
          ) : (
            messages.map(m => {
              const mine = m.sender_type === 'athlete';
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[85%] rounded-2xl px-3.5 py-2"
                    style={mine
                      ? { backgroundColor: GOLD, color: '#fff', borderBottomRightRadius: 6 }
                      : { backgroundColor: '#f1f2f4', color: '#1C1C1C', borderBottomLeftRadius: 6 }}
                  >
                    {!mine && m.sent_by && <p className="text-micro font-semibold opacity-70 mb-0.5">{m.sent_by}</p>}
                    {m.title && <p className="text-meta font-bold mb-0.5">{m.title}</p>}
                    {m.body && <p className="text-meta leading-relaxed whitespace-pre-wrap break-words">{m.body}</p>}
                    <p className="text-[10px] mt-1 opacity-60 text-right">{when(m.created_at)}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={submit} className="px-4 pt-2 pb-3 border-t border-ink-100 shrink-0">
          {error && <p className="text-micro text-red-600 mb-1.5" role="alert">{error}</p>}
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={1}
              maxLength={2000}
              placeholder="Message your coaches…"
              className="flex-1 resize-none rounded-xl border border-ink-200 px-3 py-2 text-body focus:outline-none focus:border-gold-500"
              style={{ maxHeight: 110 }}
            />
            <button
              type="submit"
              disabled={!text.trim() || sending}
              aria-label="Send"
              className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-50"
              style={{ backgroundColor: GOLD }}
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <p className="text-[10px] text-ink-400 mt-1.5 leading-snug">
            Messages are saved and can be seen by the ProPath coaching and safeguarding team.
            For anything urgent, speak to a coach in person.
          </p>
        </form>
      </div>
    </div>
  );
}
