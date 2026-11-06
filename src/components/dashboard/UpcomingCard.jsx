import { useEffect, useMemo, useState } from 'react';
import { Cake, CalendarClock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { EVENT_LABEL, fmtUpcomingDate, mergeUpcoming, upcomingBirthdays, upcomingEvents } from '../../utils/upcoming';
import { addDaysISO } from '../../utils/timetable';
import { Avatar, Chip, DashCard, Empty, Scroll } from './parts';

const DAYS = 14;
const TYPE_TONE = { competition: { fg: '#b91c1c', bg: '#fef2f2' }, training_camp: { fg: '#085777', bg: '#dfe9ed' }, testing: { fg: '#6f5e3e', bg: '#f1eadc' } };
const NEUTRAL = { fg: '#52525b', bg: '#f4f4f5' };

/**
 * Coming up in the next two weeks: calendar events (competitions, camps, testing, team events) and birthdays.
 * Events are added on the programme calendar; birthdays come from the athlete's date of birth.
 */
export default function UpcomingCard({ athletes, athleteById, today, onOpenAthlete, onNavigate }) {
  const [events, setEvents] = useState(null);   // null while loading
  const ids = useMemo(() => athletes.map(a => a.id), [athletes]);
  const key = ids.join(',');

  useEffect(() => {
    if (!ids.length) { setEvents([]); return undefined; }
    let cancelled = false;
    const end = addDaysISO(today, DAYS);
    Promise.all([
      supabase.from('athlete_calendar_events').select('id, athlete_id, event_name, event_type, start_date, end_date, is_team_event')
        .in('athlete_id', ids).lte('start_date', end).gte('end_date', today),
      supabase.from('athlete_calendar_events').select('id, athlete_id, event_name, event_type, start_date, end_date, is_team_event')
        .eq('is_team_event', true).lte('start_date', end).gte('end_date', today),
    ]).then(([a, t]) => {
      if (cancelled) return;
      const seen = new Set();
      setEvents([...(a.data || []), ...(t.data || [])].filter(e => !seen.has(e.id) && seen.add(e.id)));
    });
    return () => { cancelled = true; };
  }, [key, today]); // eslint-disable-line react-hooks/exhaustive-deps

  const items = useMemo(
    () => mergeUpcoming(upcomingEvents(events || [], today, DAYS), upcomingBirthdays(athletes, today, DAYS)),
    [events, athletes, today],
  );

  return (
    <DashCard icon={CalendarClock} title="Upcoming" subtitle="Events and birthdays in the next two weeks." onViewAll={() => onNavigate('shared-calendar')} viewAllLabel="Calendar">
      {events === null ? <Empty>Loading…</Empty> : items.length === 0 ? <Empty>Nothing coming up.</Empty> : (
        <Scroll className="max-h-[320px]">
          <ul className="divide-y divide-ink-100">
            {items.map(it => {
              const who = it.athleteId ? athleteById.get(it.athleteId) : null;
              return (
                <li key={it.id} className="flex items-center gap-3 py-2">
                  <span className="w-[86px] shrink-0 text-meta font-semibold text-ink-700">{fmtUpcomingDate(it.date, today)}</span>
                  {it.kind === 'birthday' ? (
                    <>
                      <Cake size={16} className="shrink-0" style={{ color: '#A58D69' }} />
                      <button onClick={() => onOpenAthlete(it.athleteId)} className="flex-1 min-w-0 text-left text-meta text-ink-900 truncate hover:underline">
                        <b>{it.name}</b> turns {it.turning}
                      </button>
                    </>
                  ) : (
                    <>
                      {who ? <Avatar athlete={who} size={24} /> : <span className="w-6 h-6 rounded-full bg-ink-100 text-[9px] font-bold text-ink-500 flex items-center justify-center shrink-0">ALL</span>}
                      <span className="flex-1 min-w-0 text-meta text-ink-900 truncate">
                        <b>{it.name}</b>
                        <span className="text-ink-500"> · {it.team ? 'Team' : who?.name || 'Athlete'}{it.end !== it.start ? ` · until ${fmtUpcomingDate(it.end, today)}` : ''}</span>
                      </span>
                      <Chip tone={TYPE_TONE[it.type] || NEUTRAL}>{EVENT_LABEL[it.type] || 'Event'}</Chip>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </Scroll>
      )}
    </DashCard>
  );
}
