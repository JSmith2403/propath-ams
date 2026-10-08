import { useEffect, useRef } from 'react';
import { User, Check } from 'lucide-react';

function stamp(iso) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === new Date().toDateString()) return time;
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, ${time}`;
}
const initials = (name = '') => name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

function Avatar({ mine, name }) {
  return (
    <div
      className="shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-semibold text-gray-500"
      style={{ border: '1px solid #e5e7eb' }}
      aria-hidden="true"
    >
      {mine || !name ? <User size={14} strokeWidth={1.8} /> : initials(name)}
    </div>
  );
}

/**
 * ChatBubbles — a chat transcript in one clean style, shared by the coach
 * Messages view, the athlete app and the parent page:
 *   • your messages: soft grey bubble on the right with a person avatar
 *   • everyone else: white outlined bubble on the left with their initials
 * Each message: { id, mine, name, body, title?, at, role?, seen? }
 * `showNames` labels other people's messages (group chats, parent view).
 */
export default function ChatBubbles({ messages, showNames = true, emptyText = 'No messages yet.', scrollKey }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [messages.length, scrollKey]);

  if (!messages.length) return <p className="py-10 text-center text-xs text-gray-400">{emptyText}</p>;

  return (
    <div className="space-y-3.5">
      {messages.map(m => (
        <div key={m.id} className={`flex items-start gap-2.5 ${m.mine ? 'flex-row-reverse' : ''}`}>
          <Avatar mine={m.mine} name={m.name} />
          <div
            className="rounded-[18px] px-4 py-2.5 max-w-[78%]"
            style={m.mine
              ? { backgroundColor: '#f1f2f3', color: '#111827' }
              : { backgroundColor: '#fff', color: '#4b5563', border: '1px solid #e5e7eb' }}
          >
            {showNames && !m.mine && m.name && (
              <p className="text-[11px] font-semibold text-gray-400 mb-0.5">
                {m.name}{m.role === 'staff' ? ' · Coach' : ''}
              </p>
            )}
            {m.title && <p className="text-[13px] font-bold mb-0.5" style={{ color: '#111827' }}>{m.title}</p>}
            {m.body && <p className="text-[15px] leading-snug whitespace-pre-wrap break-words">{m.body}</p>}
            <p className={`text-[10px] mt-1 text-gray-400 flex items-center gap-1 ${m.mine ? 'justify-end' : ''}`}>
              {stamp(m.at)}
              {m.mine && m.seen && <><Check size={10} /> Seen</>}
            </p>
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
