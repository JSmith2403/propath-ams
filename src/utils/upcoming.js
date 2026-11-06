import { addDaysISO } from './timetable';

export const EVENT_LABEL = {
  competition: 'Competition', training_camp: 'Training camp', testing: 'Testing', technical_session: 'Technical session', other: 'Event',
};

/** Birthdays falling in the next `days` days (today included), soonest first. `athletes` carry { id, name, dob }. */
export function upcomingBirthdays(athletes, today, days = 14) {
  const end = addDaysISO(today, days);
  const [ty] = today.split('-').map(Number);
  const out = [];
  for (const a of athletes) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(a.dob || '');
    if (!m) continue;
    const [, by, bm, bd] = m;
    for (const year of [ty, ty + 1]) {
      // 29 Feb falls on 28 Feb in years without one
      const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      const day = bm === '02' && bd === '29' && !leap ? '28' : bd;
      const date = `${year}-${bm}-${day}`;
      if (date >= today && date <= end) { out.push({ kind: 'birthday', id: `bday:${a.id}`, athleteId: a.id, name: a.name, date, turning: year - Number(by) }); break; }
    }
  }
  return out.sort((x, y) => x.date.localeCompare(y.date) || x.name.localeCompare(y.name));
}

/** Calendar events that start in the window, or are already running through it. */
export function upcomingEvents(events, today, days = 14) {
  const end = addDaysISO(today, days);
  return (events || [])
    .filter(e => e.start_date <= end && (e.end_date || e.start_date) >= today)
    .map(e => ({
      kind: 'event', id: `event:${e.id}`, athleteId: e.athlete_id, team: !!e.is_team_event, name: e.event_name,
      type: e.event_type, date: e.start_date < today ? today : e.start_date, start: e.start_date, end: e.end_date || e.start_date,
    }))
    .sort((x, y) => x.date.localeCompare(y.date) || x.name.localeCompare(y.name));
}

/** Events and birthdays in one list, soonest first. */
export function mergeUpcoming(events, birthdays) {
  return [...events, ...birthdays].sort((x, y) => x.date.localeCompare(y.date) || (x.kind === y.kind ? 0 : x.kind === 'event' ? -1 : 1));
}

export const fmtUpcomingDate = (iso, today) => {
  if (iso === today) return 'Today';
  if (iso === addDaysISO(today, 1)) return 'Tomorrow';
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};
