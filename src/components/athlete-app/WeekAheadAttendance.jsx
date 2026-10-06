import { useState } from 'react';
import { CalendarCheck, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import AttendanceToggle from './AttendanceToggle';

function dayLabel(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
}

/**
 * WeekAheadAttendance — one place to confirm attendance for every session in
 * the next 7 days (the Sunday 4pm reminder notification opens the app here).
 * Open while anything is unanswered; collapses to a "all confirmed" tick once
 * the athlete has responded to everything.
 */
export default function WeekAheadAttendance({ sessions, attendanceById, onRespond }) {
  const [manualOpen, setManualOpen] = useState(null); // null = follow the default
  if (!sessions.length) return null;

  const unanswered = sessions.filter(s => !attendanceById[s.id]?.attendance).length;
  const open = manualOpen ?? unanswered > 0;

  const byDay = [];
  for (const s of sessions) {
    const last = byDay[byDay.length - 1];
    if (last && last.date === s.planned_date) last.items.push(s);
    else byDay.push({ date: s.planned_date, items: [s] });
  }

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
          ? <CalendarCheck size={18} style={{ color: '#A58D69' }} />
          : <CheckCircle2 size={18} style={{ color: '#16a34a' }} />}
        <div className="flex-1 min-w-0">
          <p className="text-body font-semibold text-ink-900">Which sessions are you attending?</p>
          <p className="text-micro text-ink-500">
            {unanswered
              ? `Next 7 days · ${unanswered} session${unanswered === 1 ? '' : 's'} still to confirm`
              : 'Next 7 days · all confirmed, thanks!'}
          </p>
        </div>
        {open ? <ChevronUp size={16} className="text-ink-400" /> : <ChevronDown size={16} className="text-ink-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-ink-100 pt-3">
          {byDay.map(day => (
            <div key={day.date}>
              <p className="text-micro font-bold uppercase text-ink-400 mb-1.5">{dayLabel(day.date)}</p>
              <div className="space-y-3">
                {day.items.map(s => (
                  <div key={s.id}>
                    <p className="text-meta font-semibold text-ink-800">{s.session_name || 'Training session'}</p>
                    <AttendanceToggle
                      value={attendanceById[s.id]?.attendance}
                      note={attendanceById[s.id]?.note}
                      onRespond={(status, note) => onRespond(s.id, status, note)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
