import { useMemo, useState } from 'react';
import { CalendarDays, Check, Send } from 'lucide-react';
import { Avatar, DashCard, GOLD } from './parts';

/** First name, plus the last initial when two athletes share a first name. */
function shortNames(athletes) {
  const firsts = {};
  athletes.forEach(a => { const f = (a.name || '').split(' ')[0]; firsts[f] = (firsts[f] || 0) + 1; });
  return new Map(athletes.map(a => {
    const [f, ...rest] = (a.name || 'Athlete').split(' ');
    return [a.id, firsts[f] > 1 && rest.length ? `${f} ${rest[rest.length - 1][0]}.` : f];
  }));
}

const dow = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short' });
const dom = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const longDay = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });

function Names({ ids, names, empty }) {
  if (!ids.length) return <p className="text-micro text-ink-400">{empty}</p>;
  return (
    <p className="text-meta text-ink-900 leading-relaxed" style={{ columns: 2, columnGap: 10 }}>
      {ids.map(id => <span key={id} className="block truncate">{names.get(id) || 'Athlete'}</span>)}
    </p>
  );
}

/**
 * "Who's training this week?": a tile for each day with how many we expect and a few faces. Pick a day to see the
 * names: who is coming to the group session, who has their own programme that day, and who hasn't answered.
 */
export default function InPersonStrip({ athletes, days, today, reminders, onRemind, onViewTimetable }) {
  const names = useMemo(() => shortNames(athletes), [athletes]);
  const byId = useMemo(() => new Map(athletes.map(a => [a.id, a])), [athletes]);
  const [picked, setPicked] = useState(null);
  const selected = days.find(d => d.date === (picked || today)) || days.find(d => d.date >= today) || days[0];
  const pendingIds = useMemo(() => [...new Set(days.filter(d => d.date >= today).flatMap(d => d.pending))], [days, today]);
  const state = reminders.state.timetable;

  return (
    <DashCard icon={CalendarDays} title="Who’s training this week?" onViewAll={onViewTimetable} viewAllLabel="View timetable">
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.max(days.length, 1)}, minmax(86px, 1fr))`, minWidth: days.length * 86 }}>
          {days.map(d => {
            const expected = d.expected || d.attending;
            const isToday = d.date === today;
            const on = selected && d.date === selected.date;
            return (
              <button key={d.date} onClick={() => setPicked(d.date)} aria-pressed={on}
                className="rounded-lg border px-2 py-2 text-center transition"
                style={{ borderColor: on ? GOLD : isToday ? '#d9cdb3' : '#e5e5e7', backgroundColor: on ? '#f1eadc' : '#ffffff', boxShadow: on ? '0 0 0 2px rgba(165,141,105,0.25)' : 'none' }}>
                <span className="block text-body font-bold text-ink-900">{dow(d.date)}</span>
                <span className="block text-[11px] text-ink-500">{dom(d.date)}</span>
                {expected.length === 0 ? (
                  <span className="block text-meta text-ink-400 mt-2 mb-1">Rest day</span>
                ) : (
                  <>
                    <span className="block text-meta font-semibold text-ink-700 mt-1.5">{expected.length} athlete{expected.length === 1 ? '' : 's'}</span>
                    <span className="flex items-center justify-center mt-1">
                      {expected.slice(0, 2).map((id, i) => (
                        <span key={id} className="rounded-full ring-2 ring-white" style={{ marginLeft: i ? -8 : 0 }}><Avatar athlete={byId.get(id)} size={22} /></span>
                      ))}
                      {expected.length > 2 && <span className="text-[11px] font-semibold text-ink-600 ml-1">+{expected.length - 2}</span>}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="mt-3 rounded-lg border border-ink-100 bg-ink-50 px-3 py-2.5">
          <p className="text-meta font-bold text-ink-900 mb-1.5">{longDay(selected.date)} · {(selected.expected || selected.attending).length} expected</p>
          <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase text-ink-400 mb-0.5">In person</p>
              <Names ids={selected.attending} names={names} empty={selected.hasSlots ? 'No one yet' : 'No group session'} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-ink-400 mb-0.5">Own programme</p>
              <Names ids={selected.programme || []} names={names} empty="None planned" />
            </div>
          </div>
          {selected.date >= today && selected.pending.length > 0 && (
            <p className="text-micro text-ink-500 mt-2">No reply to the timetable: {selected.pending.map(id => names.get(id)).join(', ')}</p>
          )}
        </div>
      )}

      {pendingIds.length > 0 && (
        <button onClick={() => onRemind('timetable', pendingIds, 'timetable')} disabled={state === 'sending' || state === 'sent'}
          className="mt-2 self-start inline-flex items-center gap-1.5 text-meta font-semibold rounded-lg border border-ink-200 px-3 py-1.5 text-ink-700 hover:bg-ink-50 disabled:opacity-60">
          {state === 'sent' ? <><Check size={13} /> Reminded</> : state === 'sending' ? 'Sending…' : state === 'failed' ? 'Retry reminders' : <><Send size={13} /> Remind {pendingIds.length} who haven’t replied</>}
        </button>
      )}
    </DashCard>
  );
}
