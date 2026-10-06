import { useEffect } from 'react';
import { X, BellOff } from 'lucide-react';

function when(iso) {
  const d = new Date(iso);
  const today = new Date().toDateString();
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === today) return `Today, ${time}`;
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

/**
 * InboxSheet — bottom sheet listing the coach's messages. Opening it marks
 * everything shown as read (that's the read receipt the coach sees).
 */
export default function InboxSheet({ messages, loading, markRead, onClose }) {
  useEffect(() => {
    markRead(messages.map(m => m.id));
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full bg-white rounded-t-2xl shadow-2xl flex flex-col"
        style={{ maxWidth: 480, maxHeight: '80vh', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 shrink-0">
          <h3 className="text-sm font-bold text-ink-900">Messages</h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-ink-50" aria-label="Close">
            <X size={16} className="text-ink-500" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-3">
          {loading ? (
            <p className="py-8 text-center text-meta text-ink-400">Loading…</p>
          ) : messages.length === 0 ? (
            <div className="py-10 text-center">
              <BellOff size={22} className="mx-auto mb-2 text-ink-300" />
              <p className="text-meta text-ink-500">No messages yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-ink-100">
              {messages.map(m => (
                <li key={m.id} className="py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-body font-semibold text-ink-900">{m.title}</p>
                    <span className="text-micro text-ink-400 shrink-0">{when(m.created_at)}</span>
                  </div>
                  {m.body && (
                    <p className="text-meta text-ink-600 mt-1 leading-relaxed whitespace-pre-wrap">{m.body}</p>
                  )}
                  {m.sent_by && <p className="text-micro text-ink-400 mt-1">From {m.sent_by}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
