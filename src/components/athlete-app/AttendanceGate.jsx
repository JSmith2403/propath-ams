import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useMyAttendance } from '../../hooks/useSessionAttendance';
import AttendanceToggle from './AttendanceToggle';

const TZ = 'Asia/Dubai';          // UAE — no daylight saving
const WINDOW_START = { day: 'Sun', hour: 15 };   // opens with the Sunday 3pm reminder
const WINDOW_DAYS = ['Sun', 'Mon', 'Tue'];       // …and stays open until the end of Tuesday

function uaeNow() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', hour: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).map(x => [x.type, x.value])
  );
  return { weekday: p.weekday, hour: Number(p.hour) };
}

/** True from Sunday 3pm through Tuesday night, UAE time. */
function windowIsOpen() {
  const { weekday, hour } = uaeNow();
  if (!WINDOW_DAYS.includes(weekday)) return false;
  if (weekday === WINDOW_START.day && hour < WINDOW_START.hour) return false;
  return true;
}

const todayLocal = () => new Date().toLocaleDateString('en-CA');
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString('en-CA'); };
const snoozeKey = (athleteId) => `propath_attendance_snooze_${athleteId}`;
const dayLabel = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });

function isSnoozed(athleteId) {
  try { return localStorage.getItem(snoozeKey(athleteId)) === todayLocal(); } catch (_) { return false; }
}

/**
 * Full-screen weekly attendance pop-up — the same treatment as the daily
 * wellness check-in, and always shown AFTER it (it sits inside that gate), so
 * an athlete never faces two blockers at once.
 *
 * It only appears when ALL of these are true:
 *   • it's Sunday 3pm–Tuesday night, UAE time (the "week ahead" window)
 *   • they still have sessions in the next 7 days with no answer
 *   • they haven't tapped "Not sure yet" today
 * Once every session is answered it never shows again that week. "Not sure
 * yet" only hides it until tomorrow (the Week ahead card stays on the Train
 * tab) so an athlete who genuinely can't answer yet isn't trapped.
 */
export default function AttendanceGate({ athleteId, children }) {
  const [state, setState] = useState('checking');   // checking | blocked | clear
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!windowIsOpen() || isSnoozed(athleteId)) { setState('clear'); return; }
      const { data, error } = await supabase
        .from('planned_sessions')
        .select('id, planned_date, session_name, session_order, attendance')
        .eq('athlete_id', athleteId)
        .gte('planned_date', todayLocal())
        .lte('planned_date', addDays(6))
        .order('planned_date', { ascending: true })
        .order('session_order', { ascending: true });
      if (cancelled) return;
      // No sessions, the attendance column doesn't exist yet, or they've
      // already answered everything (e.g. on another device) → no pop-up.
      if (error || !data?.length || data.every(s => s.attendance)) { setState('clear'); return; }
      setSessions(data);
      setState('blocked');
    })();
    return () => { cancelled = true; };
  }, [athleteId]);

  const ids = useMemo(() => sessions.map(s => s.id), [sessions]);
  const { byId, respond } = useMyAttendance(athleteId, ids);
  const answered = sessions.filter(s => byId[s.id]?.attendance).length;
  const allAnswered = sessions.length > 0 && answered === sessions.length;

  if (state === 'checking') return null;
  if (state === 'clear') return children;

  const snooze = () => {
    try { localStorage.setItem(snoozeKey(athleteId), todayLocal()); } catch (_) { /* best effort */ }
    setState('clear');
  };

  const byDay = [];
  for (const s of sessions) {
    const last = byDay[byDay.length - 1];
    if (last && last.date === s.planned_date) last.items.push(s);
    else byDay.push({ date: s.planned_date, items: [s] });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-ink-100">
      <div className="w-full flex flex-col bg-ink-50 shadow-card" style={{ maxWidth: 480 }}>
        <div className="px-6 pt-10 pb-4 text-center shrink-0">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-gold-50">
            <CalendarCheck size={24} className="text-gold-600" />
          </div>
          <h1 className="text-h2 font-bold text-ink-900">Which sessions are you attending this week?</h1>
          <p className="text-meta mt-2 leading-relaxed text-ink-500">
            Tap <strong>Attending</strong> or <strong>Can&rsquo;t make it</strong> for each one so your coaches can plan.
            Takes about 10 seconds.
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 space-y-3 pb-2">
          {byDay.map(day => (
            <div key={day.date} className="rounded-xl p-4 bg-white border border-ink-100 shadow-card">
              <p className="text-micro font-bold uppercase text-ink-400 mb-2">{dayLabel(day.date)}</p>
              <div className="space-y-3">
                {day.items.map(s => (
                  <div key={s.id}>
                    <p className="text-meta font-semibold text-ink-800">{s.session_name || 'Training session'}</p>
                    <AttendanceToggle
                      value={byId[s.id]?.attendance}
                      note={byId[s.id]?.note}
                      onRespond={(status, note) => respond(s.id, status, note)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pt-3 pb-8 shrink-0 space-y-3">
          <button
            onClick={() => setState('clear')}
            disabled={!allAnswered}
            className="w-full rounded-md py-3.5 text-body font-bold transition-all active:scale-[0.99] bg-gold-500 text-white hover:bg-gold-600 disabled:opacity-40 disabled:active:scale-100 shadow-xs"
          >
            {allAnswered ? 'Done' : `${answered} of ${sessions.length} answered`}
          </button>
          <button onClick={snooze} className="w-full text-micro text-ink-400 underline underline-offset-2">
            Not sure yet — ask me again tomorrow
          </button>
        </div>
      </div>
    </div>
  );
}
