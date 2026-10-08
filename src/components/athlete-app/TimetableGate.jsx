import { useEffect, useState } from 'react';
import { CalendarClock, Ticket } from 'lucide-react';
import { useTimetable } from '../../hooks/useTimetable';
import { useOneToOne } from '../../hooks/useOneToOne';
import TimetableDay from './TimetableDay';
import { addDaysISO, groupByDay, ONE_TO_ONE_OPEN } from '../../utils/timetable';

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
 * timetable for the coming week (Mon–Sun) has days the athlete hasn't answered.
 * Each day is a row of pills — pick one session, or "Can't make it" — so nobody
 * is ever stuck. The Train-tab card has the same list for anyone who misses it.
 */
export default function TimetableGate({ athleteId, children }) {
  const now = uaeNow();
  const active = now.weekday === 'Sun' && now.hour >= OPEN_HOUR;
  const from = addDaysISO(now.date, 1);        // Monday
  const to = addDaysISO(now.date, 7);          // following Sunday

  // Outside the Sunday window no athlete id is passed, so no query is made.
  const { slots, loading, respondDay, confirmRemaining } = useTimetable(active ? athleteId : null, from, to);
  const [saving, setSaving] = useState(false);
  const { balance, requests, request } = useOneToOne(active ? athleteId : null);

  // Decide ONCE, when the timetable first loads, whether to block: only if
  // there's something to answer. Without this, answering the last day would
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

  const days = groupByDay(slots);
  const pickedDays = days.filter(d => d.items.some(s => s.status === 'attending')).length;

  const confirm = async () => {
    setSaving(true);
    await confirmRemaining();       // days with no pick are recorded as not attending
    setSaving(false);
    setMode('skip');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-ink-100">
      <div className="w-full flex flex-col bg-ink-50 shadow-card" style={{ maxWidth: 480 }}>
        <div className="px-6 pt-10 pb-4 text-center shrink-0">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-gold-50">
            <CalendarClock size={24} className="text-gold-600" />
          </div>
          <h1 className="text-h2 font-bold text-ink-900">Next week&rsquo;s timetable</h1>
          <p className="text-meta mt-2 leading-relaxed text-ink-500">
            Tap the session you&rsquo;re coming to each day — <strong>one per day</strong>. Any day you don&rsquo;t pick
            counts as not attending.
          </p>
          {ONE_TO_ONE_OPEN && balance && (
            <p className="flex items-center justify-center gap-1.5 text-micro text-ink-500 mt-2">
              <Ticket size={12} style={{ color: '#A58D69' }} /> 1:1 tokens: <strong className="text-ink-800">{balance.left} of {balance.monthly}</strong> left
            </p>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 space-y-3 pb-2">
          {days.map(day => (
            <TimetableDay
              key={day.date}
              date={day.date}
              slots={day.items}
              balance={balance}
              requests={requests}
              onChoose={respondDay}
              onRequest={request}
            />
          ))}
        </div>

        <div className="px-6 pt-3 pb-8 shrink-0 space-y-3">
          <button
            onClick={confirm}
            disabled={saving}
            className="w-full rounded-md py-3.5 text-body font-bold transition-all active:scale-[0.99] bg-gold-500 text-white hover:bg-gold-600 disabled:opacity-60 shadow-xs"
          >
            {saving ? 'Saving…' : 'Confirm my week'}
          </button>
          <p className="text-center text-micro text-ink-400">
            {pickedDays === 0 ? 'No sessions picked — you\'ll be marked as not attending all week.' : `Attending ${pickedDays} of ${days.length} days.`}
          </p>
        </div>
      </div>
    </div>
  );
}
