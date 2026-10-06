import { useMemo, useState } from 'react';
import { CalendarClock, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { useTimetable } from '../../hooks/useTimetable';
import TimetableSlotRow from './TimetableSlotRow';
import { addDaysISO, dayLabel, groupByDay, toISO } from '../../utils/timetable';

/**
 * TimetableCard — the academy timetable on the Train tab: every published slot
 * from today through the end of next week, each with Attending / Can't make it.
 * Open while anything is unanswered, tucked away once everything is confirmed.
 * (The Sunday pop-up asks the same thing; this card is the always-there copy
 * so answers can be changed any time.)
 */
export default function TimetableCard({ athleteId }) {
  const today = toISO(new Date());
  const to = addDaysISO(today, 13);
  const { slots, loading, unanswered, respond } = useTimetable(athleteId, today, to);
  const [manualOpen, setManualOpen] = useState(null);
  const days = useMemo(() => groupByDay(slots), [slots]);

  if (loading || !slots.length) return null;
  const open = manualOpen ?? unanswered > 0;

  return (
    <div
      className="rounded-xl bg-white border shadow-card overflow-hidden"
      style={{ borderColor: unanswered ? '#A58D69' : '#e5e7eb' }}
    >
      <button
        onClick={() => setManualOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        {unanswered
          ? <CalendarClock size={18} style={{ color: '#A58D69' }} />
          : <CheckCircle2 size={18} style={{ color: '#16a34a' }} />}
        <div className="flex-1 min-w-0">
          <p className="text-body font-semibold text-ink-900">Which sessions are you attending?</p>
          <p className="text-micro text-ink-500">
            {unanswered
              ? `Academy timetable · ${unanswered} still to confirm`
              : 'Academy timetable · all confirmed, thanks!'}
          </p>
        </div>
        {open ? <ChevronUp size={16} className="text-ink-400" /> : <ChevronDown size={16} className="text-ink-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-ink-100 pt-3">
          {days.map(day => (
            <div key={day.date}>
              <p className="text-micro font-bold uppercase text-ink-400 mb-1.5">{dayLabel(day.date)}</p>
              <div className="space-y-4">
                {day.items.map(s => <TimetableSlotRow key={s.id} slot={s} onRespond={respond} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
