import { useMemo } from 'react';
import { CalendarDays, Check, Send } from 'lucide-react';
import { DashCard, GOLD } from './parts';

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

function Names({ ids, names, empty }) {
  if (!ids.length) return <p className="text-micro text-ink-400">{empty}</p>;
  return (
    <p className="text-meta text-ink-900 leading-relaxed" style={{ columns: 2, columnGap: 10 }}>
      {ids.map(id => <span key={id} className="block truncate">{names.get(id) || 'Athlete'}</span>)}
    </p>
  );
}

/**
 * "Training this week": one column per day showing who we expect — the group sessions (names are who said
 * they're coming) and, separately, who has their own programme session that day. Under the days still to
 * come, how many haven't answered the timetable.
 */
export default function InPersonStrip({ athletes, days, today, reminders, onRemind, onViewTimetable }) {
  const names = useMemo(() => shortNames(athletes), [athletes]);
  const pendingIds = useMemo(() => [...new Set(days.filter(d => d.date >= today).flatMap(d => d.pending))], [days, today]);
  const state = reminders.state.timetable;
  const cols = Math.min(Math.max(days.length, 1), 7);

  return (
    <DashCard icon={CalendarDays} title="Training this week" subtitle="Who we expect each day: group sessions and own programme." onViewAll={onViewTimetable} viewAllLabel="View timetable">
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(150px, 1fr))`, minWidth: cols * 150 }}>
          {days.map(d => {
            const isToday = d.date === today;
            const later = d.date >= today;
            const expected = (d.expected || d.attending).length;
            return (
              <div key={d.date} className="rounded-lg border px-3 py-2 min-w-0" style={{ borderColor: isToday ? GOLD : '#f4f4f5', backgroundColor: isToday ? '#f1eadc' : '#fafafa' }}>
                <div className="flex items-baseline justify-between">
                  <span className="text-meta font-bold text-ink-900">{dayHead(d.date)}{isToday ? ' · today' : ''}</span>
                  <span className="text-micro font-semibold text-ink-700">{expected} expected</span>
                </div>
                <p className="text-[10px] font-bold uppercase text-ink-400 mt-1.5 mb-0.5">In person</p>
                <Names ids={d.attending} names={names} empty={d.hasSlots ? 'No one yet' : 'No group session'} />
                <p className="text-[10px] font-bold uppercase text-ink-400 mt-1.5 mb-0.5">Own programme</p>
                <Names ids={d.programme || []} names={names} empty="None planned" />
                {later && d.pending.length > 0 && <p className="text-micro text-ink-500 mt-1.5">{d.pending.length} no reply to the timetable</p>}
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
    </DashCard>
  );
}
