import { useMemo } from 'react';
import { Check, Send } from 'lucide-react';
import { CalendarDays } from 'lucide-react';
import { DashCard, Empty, GOLD } from './parts';

/** First name, plus the last initial when two athletes share a first name. */
function shortNames(athletes) {
  const firsts = {};
  athletes.forEach(a => { const f = (a.name || '').split(' ')[0]; firsts[f] = (firsts[f] || 0) + 1; });
  return new Map(athletes.map(a => {
    const [f, ...rest] = (a.name || 'Athlete').split(' ');
    return [a.id, firsts[f] > 1 && rest.length ? `${f} ${rest[rest.length - 1][0]}.` : f];
  }));
}

const dayHead = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });

/**
 * "In person this week": a thin strip, one column per day with the names of who said they're coming.
 * Under the days that are still to come, the names of anyone who hasn't answered.
 */
export default function InPersonStrip({ athletes, days, today, reminders, onRemind, onViewTimetable }) {
  const names = useMemo(() => shortNames(athletes), [athletes]);
  const pendingIds = useMemo(() => [...new Set(days.filter(d => d.date >= today).flatMap(d => d.pending))], [days, today]);
  const anySlots = days.some(d => d.hasSlots);
  const state = reminders.state.timetable;

  return (
    <DashCard icon={CalendarDays} title="In person this week" subtitle="Group sessions. Names are who said they are coming." onViewAll={onViewTimetable} viewAllLabel="View timetable">
      {!anySlots ? <Empty>No timetable published for this week.</Empty> : (
        <>
          <div className="overflow-x-auto -mx-1 px-1">
            <div className="grid grid-cols-5 gap-2 min-w-[720px]">
              {days.map(d => {
                const isToday = d.date === today;
                const later = d.date >= today;
                return (
                  <div key={d.date} className="rounded-lg border px-3 py-2 min-w-0" style={{ borderColor: isToday ? GOLD : '#f4f4f5', backgroundColor: isToday ? '#f1eadc' : '#fafafa' }}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-meta font-bold text-ink-900">{dayHead(d.date)}{isToday ? ' · today' : ''}</span>
                      {d.hasSlots && <span className="text-micro font-semibold text-ink-700">{d.attending.length} in</span>}
                    </div>
                    {!d.hasSlots ? <p className="text-micro text-ink-400 mt-1">No group session</p> : (
                      <>
                        <p className="text-meta text-ink-900 mt-1 leading-relaxed" style={{ columns: 2, columnGap: 10 }}>
                          {d.attending.length ? d.attending.map(id => <span key={id} className="block truncate">{names.get(id) || 'Athlete'}</span>) : <span className="text-ink-400">No one yet</span>}
                        </p>
                        {later && d.pending.length > 0 && (
                          <p className="text-micro text-ink-500 mt-1.5">{d.pending.length} no reply</p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {pendingIds.length > 0 && (
            <button onClick={() => onRemind('timetable', pendingIds, 'timetable')} disabled={state === 'sending' || state === 'sent'}
              className="mt-2 self-start inline-flex items-center gap-1.5 text-meta font-semibold rounded-lg border border-ink-200 px-3 py-1.5 text-ink-700 hover:bg-ink-50 disabled:opacity-60">
              {state === 'sent' ? <><Check size={13} /> Reminded</> : state === 'sending' ? 'Sending…' : state === 'failed' ? 'Retry reminders' : <><Send size={13} /> Remind {pendingIds.length} who haven’t replied</>}
            </button>
          )}
        </>
      )}
    </DashCard>
  );
}
