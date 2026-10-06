import { useEffect, useState } from 'react';
import { CalendarClock, Lock } from 'lucide-react';
import { useTimetable } from '../../hooks/useTimetable';
import TimetableSlotRow from './TimetableSlotRow';
import { addDaysISO, dayLabel, groupByDay } from '../../utils/timetable';

const TZ = 'Asia/Dubai';            // UAE — no daylight saving
const OPEN_HOUR = 15;               // Sunday 3pm…

function uaeNow() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ, weekday: 'short', hour: '2-digit', hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date()).map(x => [x.type, x.value])
  );
  return { weekday: p.weekday, hour: Number(p.hour), date: `${p.year}-${p.month}-${p.day}` };
}

/**
 * Full-screen weekly timetable pop-up — same treatment as the daily wellness
 * check-in, and always shown AFTER it (it sits inside that gate), so on a
 * Sunday it's wellness first, then this. Nothing else ever stacks.
 *
 * Appears on Sunday from 3pm (UAE) only, and only while the published
 * timetable for the coming week (Mon–Sun) has slots the athlete hasn't
 * answered. Every slot has a "can't make it" option, so nobody is ever stuck.
 * The Train-tab card has the same list for anyone who misses the pop-up.
 */
export default function TimetableGate({ athleteId, children }) {
  const now = uaeNow();
  const active = now.weekday === 'Sun' && now.hour >= OPEN_HOUR;
  const from = addDaysISO(now.date, 1);        // Monday
  const to = addDaysISO(now.date, 7);          // following Sunday

  // Outside the Sunday window no athlete id is passed, so no query is made.
  const { slots, loading, respond } = useTimetable(active ? athleteId : null, from, to);

  // Decide ONCE, when the timetable first loads, whether to block: only if
  // there's something to answer. Without this, answering the last slot would
  // make the screen vanish before the athlete can review or correct it —
  // they tap "Continue" instead.
  const [mode, setMode] = useState(() => (active ? 'checking' : 'skip'));   // checking | show | skip
  useEffect(() => {
    if (!active) { setMode('skip'); return; }
    if (loading || mode !== 'checking') return;
    setMode(slots.some(s => !s.status) ? 'show' : 'skip');
  }, [active, loading, slots, mode]);

  if (mode === 'skip') return children;
  if (mode === 'checking') return null;

  const unanswered = slots.filter(s => !s.status).length;
  const answeredNow = slots.length - unanswered;
  const allDone = unanswered === 0;
  const days = groupByDay(slots);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-ink-100">
      <div className="w-full flex flex-col bg-ink-50 shadow-card" style={{ maxWidth: 480 }}>
        <div className="px-6 pt-10 pb-4 text-center shrink-0">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-gold-50">
            <CalendarClock size={24} className="text-gold-600" />
          </div>
          <h1 className="text-h2 font-bold text-ink-900">Next week&rsquo;s timetable</h1>
          <p className="text-meta mt-2 leading-relaxed text-ink-500">
            Which sessions are you attending? Tap <strong>Attending</strong> or <strong>Can&rsquo;t make it</strong> for
            each one so your coaches can plan.
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 space-y-3 pb-2">
          {days.map(day => (
            <div key={day.date} className="rounded-xl p-4 bg-white border border-ink-100 shadow-card">
              <p className="text-micro font-bold uppercase text-ink-400 mb-2">{dayLabel(day.date)}</p>
              <div className="space-y-4">
                {day.items.map(s => <TimetableSlotRow key={s.id} slot={s} onRespond={respond} />)}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pt-3 pb-8 shrink-0 space-y-3">
          <button
            onClick={() => setMode('skip')}
            disabled={!allDone}
            className="w-full rounded-md py-3.5 text-body font-bold transition-all active:scale-[0.99] bg-gold-500 text-white hover:bg-gold-600 disabled:opacity-40 disabled:active:scale-100 shadow-xs"
          >
            {allDone ? 'Continue' : `${answeredNow} of ${slots.length} answered`}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-micro text-ink-400">
            <Lock size={11} />
            Dashboard unlocks once you&rsquo;ve answered every session
          </p>
        </div>
      </div>
    </div>
  );
}
