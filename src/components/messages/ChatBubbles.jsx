import { useEffect, useRef } from 'react';
import { Camera, Check } from 'lucide-react';

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
 *   • the sender's name and avatar sit at the top of their run, the time under their last bubble
 *   • every message has its own bubble; consecutive messages from the same person
 *     (within 10 min) stack closely under ONE name and ONE avatar per run
 *   • yours: gold bubble on the right; everyone else: light grey on the left
 * Each message: { id, mine, name, body, title?, at, role?, seen?, quote? }
 * `quote` shows what the message replies to, WhatsApp style: { label, sub?, text?, thumb?, onOpen? }.
 * `photo` makes it a photo message (a meal): { label, text?, thumb?, onOpen?, onReply? }.
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
        // Every message keeps its own bubble. Inside a run the corners that face
        // the neighbouring bubble are tightened, so a run reads as one group.
        const corners = m.mine
          ? `${first ? '' : 'rounded-tr-md'} ${last ? '' : 'rounded-br-md'}`
          : `${first ? '' : 'rounded-tl-md'} ${last ? '' : 'rounded-bl-md'}`;
        return (
          <div key={m.id} className={`flex items-start gap-2 ${m.mine ? 'justify-end' : 'justify-start'} ${first ? (i === 0 ? '' : 'mt-4') : 'mt-[3px]'}`}>
            {!m.mine && (
              // One avatar per run, at the top beside the sender's name; a spacer keeps the rest aligned.
              first ? (
                <div
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold"
                  style={{ backgroundColor: 'rgba(165,141,105,0.16)', color: '#7a6748' }}
                  aria-hidden="true"
                >
                  {initials(m.name) || '·'}
                </div>
              ) : <div className="shrink-0 w-8" />
            )}

            <div className={`flex flex-col max-w-[78%] ${m.mine ? 'items-end' : 'items-start'}`}>
              {first && showNames && !m.mine && m.name && (
                <p className="text-[11px] text-gray-400 mb-1 px-1">
                  {m.name}{m.role === 'staff' ? ' · Coach' : ''}
                </p>
              )}
              <div
                className={`rounded-2xl ${m.photo ? 'p-1' : 'px-3.5 py-2'} ${corners}`}
                style={m.mine
                  ? { backgroundColor: GOLD, color: '#fff' }
                  : { backgroundColor: '#f1f2f4', color: '#1f2937' }}
              >
                {m.photo && (
                  <div>
                    {m.photo.thumb ? (
                      <button type="button" onClick={m.photo.onOpen} disabled={!m.photo.onOpen} className="block">
                        <img src={m.photo.thumb} alt={m.photo.label} className="block rounded-xl object-cover w-full" style={{ maxWidth: 240, maxHeight: 300 }} />
                      </button>
                    ) : null}
                    <div className="px-2.5 pt-1.5 pb-1">
                      <p className="text-[12px] font-bold">{m.photo.label}{m.photo.day ? <span className="font-normal opacity-70"> · {m.photo.day}</span> : null}</p>
                      {m.photo.text && <p className="text-[14px] leading-snug break-words">{m.photo.text}</p>}
                      {m.photo.onReply && (
                        <button type="button" onClick={m.photo.onReply} className="mt-1 text-[11px] font-semibold underline underline-offset-2" style={{ color: m.mine ? '#fff' : '#7a6748' }}>Reply</button>
                      )}
                    </div>
                  </div>
                )}
                {m.quote && (
                  <button type="button" onClick={m.quote.onOpen} disabled={!m.quote.onOpen}
                    className="mb-1.5 w-full flex items-stretch rounded-xl overflow-hidden text-left"
                    style={{ backgroundColor: m.mine ? 'rgba(255,255,255,0.22)' : '#e3e5e9', color: m.mine ? '#fff' : '#1f2937' }}>
                    <span className="w-1 shrink-0" style={{ backgroundColor: m.mine ? '#fff' : GOLD }} />
                    <span className="flex-1 min-w-0 px-2.5 py-2">
                      <span className="block text-[12px] font-bold" style={{ color: m.mine ? '#fff' : '#7a6748' }}>{m.quote.label}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-[13px] opacity-80 min-w-0">
                        {!m.quote.text && m.quote.thumb && <Camera size={13} className="shrink-0" />}
                        <span className="break-words" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.quote.text || m.quote.sub || 'Photo'}</span>
                      </span>
                    </span>
                    {m.quote.thumb && <img src={m.quote.thumb} alt="" className="w-[72px] self-stretch min-h-[64px] object-cover shrink-0" />}
                  </button>
                )}
                {m.title && !m.quote && <p className="text-[13px] font-bold mb-0.5">{m.title}</p>}
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
