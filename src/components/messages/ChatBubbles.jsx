import { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

const GOLD = '#A58D69';
const GROUP_GAP_MS = 10 * 60 * 1000;   // a pause longer than this starts a new group

function stamp(iso) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === new Date().toDateString()) return time;
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, ${time}`;
}
const initials = (name = '') => name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

/**
 * ChatBubbles — a compact chat transcript shared by the coach Messages view,
 * the athlete app and the parent page.
 *   • a bubble holds only the message text (no name / time stacked inside it)
 *   • the sender's name sits above their first bubble, the time under their last
 *   • consecutive messages from the same person (within 10 min) stack tightly,
 *     with one avatar and one name per run
 *   • yours: gold bubble on the right; everyone else: light grey on the left
 * Each message: { id, mine, name, body, title?, at, role?, seen? }
 * `showNames` labels other people's runs (group chats, parent view).
 */
export default function ChatBubbles({ messages, showNames = true, emptyText = 'No messages yet.', scrollKey }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [messages.length, scrollKey]);

  if (!messages.length) return <p className="py-10 text-center text-xs text-gray-400">{emptyText}</p>;

  const sameRun = (a, b) => (
    !!a && !!b && a.mine === b.mine && (a.name || '') === (b.name || '')
    && Math.abs(new Date(b.at) - new Date(a.at)) < GROUP_GAP_MS
  );

  return (
    <div>
      {messages.map((m, i) => {
        const first = !sameRun(messages[i - 1], m);
        const last = !sameRun(m, messages[i + 1]);
        return (
          <div key={m.id} className={`flex items-end gap-2 ${m.mine ? 'justify-end' : 'justify-start'} ${first ? (i === 0 ? '' : 'mt-3.5') : 'mt-1'}`}>
            {!m.mine && (
              // Avatar sits beside the LAST bubble of a run (chat-app convention); a spacer keeps the rest aligned.
              last ? (
                <div
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold"
                  style={{ backgroundColor: 'rgba(165,141,105,0.16)', color: '#7a6748' }}
                  aria-hidden="true"
                >
                  {initials(m.name) || '·'}
                </div>
              ) : <div className="shrink-0 w-7" />
            )}

            <div className={`flex flex-col max-w-[78%] ${m.mine ? 'items-end' : 'items-start'}`}>
              {first && showNames && !m.mine && m.name && (
                <p className="text-[11px] text-gray-400 mb-1 px-1">
                  {m.name}{m.role === 'staff' ? ' · Coach' : ''}
                </p>
              )}
              <div
                className="rounded-2xl px-3.5 py-2"
                style={m.mine
                  ? { backgroundColor: GOLD, color: '#fff' }
                  : { backgroundColor: '#f1f2f4', color: '#1f2937' }}
              >
                {m.title && <p className="text-[13px] font-bold mb-0.5">{m.title}</p>}
                {m.body && <p className="text-[15px] leading-snug whitespace-pre-wrap break-words">{m.body}</p>}
              </div>
              {last && (
                <p className="text-[10px] text-gray-400 mt-1 px-1 flex items-center gap-1">
                  {stamp(m.at)}
                  {m.mine && m.seen && <><Check size={10} /> Seen</>}
                </p>
              )}
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
