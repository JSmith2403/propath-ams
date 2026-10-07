import { useEffect, useRef } from 'react';

const GOLD = '#A58D69';

function stamp(iso) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === new Date().toDateString()) return time;
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, ${time}`;
}

/**
 * ChatBubbles — a read-only chat transcript, shared by the coach Messages view,
 * the athlete app and the parent page. Each message:
 *   { id, mine, name, body, title?, at, role? }   role 'staff' | 'athlete'
 * `showNames` labels every other person's bubbles (group chats, parent view).
 * `light` is the white-on-grey style used inside the athlete bottom sheet.
 */
export default function ChatBubbles({ messages, showNames = true, emptyText = 'No messages yet.', scrollKey }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [messages.length, scrollKey]);

  if (!messages.length) return <p className="py-10 text-center text-xs text-gray-400">{emptyText}</p>;

  return (
    <div className="space-y-2.5">
      {messages.map(m => (
        <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
          <div
            className="max-w-[85%] rounded-2xl px-3.5 py-2"
            style={m.mine
              ? { backgroundColor: GOLD, color: '#fff', borderBottomRightRadius: 6 }
              : { backgroundColor: '#f1f2f4', color: '#1C1C1C', borderBottomLeftRadius: 6 }}
          >
            {showNames && m.name && (
              <p className="text-[10px] font-semibold opacity-70 mb-0.5">
                {m.mine ? 'You' : m.name}{m.role === 'staff' && !m.mine ? ' · Coach' : ''}
              </p>
            )}
            {m.title && <p className="text-xs font-bold mb-0.5">{m.title}</p>}
            {m.body && <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.body}</p>}
            <p className="text-[10px] mt-1 opacity-60 text-right">{stamp(m.at)}</p>
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
