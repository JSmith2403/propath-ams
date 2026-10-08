import { useMemo, useState } from 'react';
import { CalendarClock, ChevronDown, ChevronUp, CheckCircle2, Ticket } from 'lucide-react';
import { useTimetable } from '../../hooks/useTimetable';
import { useOneToOne } from '../../hooks/useOneToOne';
import TimetableDay from './TimetableDay';
import { addDaysISO, groupByDay, todayUAE, ONE_TO_ONE_OPEN } from '../../utils/timetable';

/**
 * TimetableCard — the academy timetable on the Train tab: each published day
 * from today through the end of next week as a row of pills (pick one session,
 * or "can't make it", or ask for a 1:1). Open while anything is unanswered,
 * tucked away once everything is confirmed. The Sunday pop-up asks the same
 * thing; this card is the always-there copy so answers can be changed any time.
 *
 * `onOpenMessages` is called after a 1:1 request is sent, to take the athlete to
 * the chat with their coach where the request message has been posted.
 */
export default function TimetableCard({ athleteId, onOpenMessages }) {
  const today = todayUAE();
  const to = addDaysISO(today, 13);
  const { slots, loading, unanswered, respondDay, confirmRemaining } = useTimetable(athleteId, today, to);
  const [confirming, setConfirming] = useState(false);
  const { balance, requests, request } = useOneToOne(athleteId);
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
            {unanswered ? `Academy timetable · ${unanswered} still to confirm` : 'Academy timetable · all confirmed, thanks!'}
          </p>
        </div>
        {open ? <ChevronUp size={16} className="text-ink-400" /> : <ChevronDown size={16} className="text-ink-400" />}
      </button>

      {open && (
        <div className="px-3 pb-3 pt-3 space-y-3 border-t border-ink-100 bg-ink-50">
          {ONE_TO_ONE_OPEN && balance && (
            <p className="flex items-center gap-1.5 text-micro text-ink-500 px-1">
              <Ticket size={12} style={{ color: '#A58D69' }} />
              1:1 tokens: <strong className="text-ink-800">{balance.left} of {balance.monthly}</strong> left
              <span className="text-ink-400">(rolling 30 days)</span>
            </p>
          )}
          {days.map(day => (
            <TimetableDay
              key={day.date}
              date={day.date}
              slots={day.items}
              balance={balance}
              requests={requests}
              onChoose={respondDay}
              onRequest={request}
              onRequested={onOpenMessages}
            />
          ))}
          {unanswered > 0 && (
            <button
              disabled={confirming}
              onClick={async () => { setConfirming(true); await confirmRemaining(); setConfirming(false); }}
              className="w-full rounded-xl py-3 text-body font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: '#A58D69' }}
            >
              {confirming ? 'Saving…' : 'Confirm my week'}
            </button>
          )}
          <p className="text-micro text-ink-400 text-center">Days you don&rsquo;t pick a session count as not attending.</p>
        </div>
      )}
    </div>
  );
}
