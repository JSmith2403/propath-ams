import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Cake, Trophy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { EVENT_LABEL, fmtUpcomingDate, upcomingBirthdays, upcomingEvents } from '../../utils/upcoming';
import { addDaysISO } from '../../utils/timetable';
import { Avatar, DashCard, GOLD } from './parts';

const DAYS = 14;

function Col({ icon: Icon, title, badge, color, onMore, moreLabel, children }) {
  return (
    <div className="min-w-0 px-1 md:px-4 first:pl-0 py-1">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} style={{ color }} />
        <h3 className="text-meta font-bold text-ink-900">{title}</h3>
        {badge ? <span className="text-[11px] font-bold text-white rounded-full px-1.5 min-w-[18px] text-center" style={{ backgroundColor: '#dc2626' }}>{badge}</span> : null}
        {onMore && <button onClick={onMore} className="ml-auto text-micro font-semibold" style={{ color: GOLD }}>{moreLabel}</button>}
      </div>
      {children}
    </div>
  );
}

/**
 * Coaches attention: the three things a coach plans around: who needs programming, the next birthdays, the next
 * events. (Things needing action today, like pain or missed check-ins, are in the strip below.)
 */
export default function CoachesAttentionCard({ athletes, athleteById, rows, today, onOpenAthlete, onNavigate }) {
  const [events, setEvents] = useState(null);
  const ids = useMemo(() => athletes.map(a => a.id), [athletes]);
  const key = ids.join(',');

  useEffect(() => {
    if (!ids.length) { setEvents([]); return undefined; }
    let cancelled = false;
    const end = addDaysISO(today, DAYS);
    const cols = 'id, athlete_id, event_name, event_type, start_date, end_date, is_team_event';
    Promise.all([
      supabase.from('athlete_calendar_events').select(cols).in('athlete_id', ids).lte('start_date', end).gte('end_date', today),
      supabase.from('athlete_calendar_events').select(cols).eq('is_team_event', true).lte('start_date', end).gte('end_date', today),
    ]).then(([a, t]) => {
      if (cancelled) return;
      const seen = new Set();
      setEvents([...(a.data || []), ...(t.data || [])].filter(e => !seen.has(e.id) && seen.add(e.id)));
    });
    return () => { cancelled = true; };
  }, [key, today]); // eslint-disable-line react-hooks/exhaustive-deps

  const needs = rows.filter(r => r.programmingActive && r.runway.state === 'none');
  const ending = rows.filter(r => r.programmingActive && r.runway.state === 'short');
  const birthdays = useMemo(() => upcomingBirthdays(athletes, today, DAYS), [athletes, today]);
  const evs = useMemo(() => upcomingEvents(events || [], today, DAYS), [events, today]);
  const range = (e) => (e.end !== e.start ? `${fmtUpcomingDate(e.start < today ? today : e.start, today)} – ${fmtUpcomingDate(e.end, today)}` : fmtUpcomingDate(e.date, today));

  return (
    <DashCard icon={AlertCircle} title="Coaches attention" onViewAll={() => onNavigate('programme')} viewAllLabel="Programmes">
      <div className="grid gap-4 md:gap-0 md:grid-cols-3 md:divide-x divide-ink-100">
        <Col icon={AlertCircle} title="Need programming" badge={needs.length || null} color="#dc2626">
          {needs.length === 0 ? <p className="text-meta text-ink-400">Everyone has sessions planned.</p> : (
            <ul className="space-y-1.5">
              {needs.slice(0, 4).map(r => (
                <li key={r.id}>
                  <button onClick={() => onOpenAthlete(r.id, { tab: 'physical-dev' })} className="flex items-center gap-2 text-left hover:underline">
                    <Avatar athlete={r.athlete} size={26} /><span className="text-meta font-semibold text-ink-900">{r.name}</span>
                  </button>
                </li>
              ))}
              {needs.length > 4 && <li className="text-micro text-ink-500">+{needs.length - 4} more</li>}
            </ul>
          )}
          {ending.length > 0 && <p className="text-micro text-ink-500 mt-2">{ending.length} more run out within a week</p>}
        </Col>

        <Col icon={Cake} title="Upcoming birthday" color={GOLD}>
          {birthdays.length === 0 ? <p className="text-meta text-ink-400">None in the next two weeks.</p> : (
            <ul className="space-y-2">
              {birthdays.slice(0, 2).map(b => (
                <li key={b.id}>
                  <button onClick={() => onOpenAthlete(b.athleteId)} className="flex items-center gap-2 text-left hover:underline">
                    <Avatar athlete={athleteById.get(b.athleteId)} size={28} />
                    <span><span className="block text-meta font-semibold text-ink-900">{b.name}</span><span className="block text-micro text-ink-500">Turns {b.turning} on {fmtUpcomingDate(b.date, today)}</span></span>
                  </button>
                </li>
              ))}
              {birthdays.length > 2 && <li className="text-micro text-ink-500">+{birthdays.length - 2} more</li>}
            </ul>
          )}
        </Col>

        <Col icon={Trophy} title="Upcoming event" color={GOLD} onMore={() => onNavigate('shared-calendar')} moreLabel="Calendar">
          {events === null ? <p className="text-meta text-ink-400">Loading…</p> : evs.length === 0 ? <p className="text-meta text-ink-400">None in the next two weeks.</p> : (
            <ul className="space-y-2">
              {evs.slice(0, 2).map(e => (
                <li key={e.id}>
                  <p className="text-meta font-semibold text-ink-900 truncate">{e.name}</p>
                  <p className="text-micro text-ink-500">{EVENT_LABEL[e.type] || 'Event'} · {range(e)}{e.team ? ' · Team' : e.athleteId ? ` · ${athleteById.get(e.athleteId)?.name || ''}` : ''}</p>
                </li>
              ))}
              {evs.length > 2 && <li className="text-micro text-ink-500">+{evs.length - 2} more</li>}
            </ul>
          )}
        </Col>
      </div>
    </DashCard>
  );
}
