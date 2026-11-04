import { AUTO_NOTE, addDaysISO, slotAppliesTo } from './timetable';

/**
 * Pure logic behind the coach dashboard: who is in, how the week is going, who needs what.
 * No fetching here — useCoachDashboard gathers the rows, these functions interpret them.
 *
 * "Completed" always comes from session_logs, never planned_sessions.status (that column isn't kept in sync).
 */

export const RUNWAY_DAYS = 7;       // alert when a programme has this many days or fewer left
export const CHASE_FROM_HOUR = 9;   // UAE hour after which a missing check-in counts as "chase"
export const MISSED_WINDOW_DAYS = 3;

const dayDiff = (a, b) => Math.round((new Date(`${a}T12:00:00`) - new Date(`${b}T12:00:00`)) / 86400000);
const weekdayShort = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short' });

/** Sessions done of planned this week. Only a completed log linked to a planned session counts as done. */
export function plannedStats(plannedInWeek, logs) {
  const linked = new Set((logs || []).map(l => l.planned_session_id).filter(Boolean));
  const planned = plannedInWeek || [];
  return { planned: planned.length, done: planned.filter(p => linked.has(p.id)).length };
}

/** Planned sessions in the last few days with nothing logged against them (and no "can't make it" reply). */
export function missedSessions(planned, logs, today, windowDays = MISSED_WINDOW_DAYS) {
  const linked = new Set((logs || []).map(l => l.planned_session_id).filter(Boolean));
  const from = addDaysISO(today, -windowDays);
  return (planned || []).filter(p =>
    p.planned_date < today && p.planned_date >= from && !linked.has(p.id) && p.attendance !== 'not_attending',
  );
}

/** How far a programme runs. none = nothing planned after today; short = runs out within RUNWAY_DAYS. */
export function programmingRunway(plannedDates, today) {
  const dates = (plannedDates || []).filter(Boolean).sort();
  const future = dates.filter(d => d > today);
  if (!future.length) return { state: 'none', last: dates.length ? dates[dates.length - 1] : null, days: 0 };
  const last = future[future.length - 1];
  const days = dayDiff(last, today);
  return { state: days <= RUNWAY_DAYS ? 'short' : 'ok', last, days };
}

/**
 * Who is attending each day, from the timetable. `days` is a list of ISO dates.
 * A reply of "chose the other session" (AUTO_NOTE) is an answer but not an absence.
 * Pending = athletes a slot applies to (by cohort) who haven't answered any slot that day.
 */
export function dayAttendance(slots, responses, athletes, days) {
  return days.map(date => {
    const daySlots = (slots || []).filter(s => s.slot_date === date);
    const slotIds = new Set(daySlots.map(s => s.id));
    const dayResponses = (responses || []).filter(r => slotIds.has(r.slot_id));
    const attending = [...new Set(dayResponses.filter(r => r.status === 'attending').map(r => r.athlete_id))];
    const answered = new Set(dayResponses.map(r => r.athlete_id));
    const pending = daySlots.length
      ? athletes.filter(a => daySlots.some(s => slotAppliesTo(s, a.cohort)) && !answered.has(a.id)).map(a => a.id)
      : [];
    const notComing = [...new Set(dayResponses.filter(r => r.status === 'not_attending' && r.note !== AUTO_NOTE).map(r => r.athlete_id))]
      .filter(id => !attending.includes(id));
    return { date, hasSlots: daySlots.length > 0, attending, pending, notComing, times: daySlots.map(s => s.start_time) };
  });
}

const TONE_ORDER = { red: 0, amber: 1, grey: 2 };

/** What each athlete's row says about them, most important thing first. */
export function rowVerdict(row) {
  const c = row.checkIn;
  if (c.state === 'red') return { label: c.pain ? 'Pain reported' : 'Check-in flagged', tone: 'act' };
  if (row.runway.state === 'none') return { label: 'Needs programme', tone: 'act' };
  if (c.state === 'amber') return { label: 'Check-in: watch', tone: 'watch' };
  if (row.missed > 0) return { label: 'Missed a session', tone: 'watch' };
  if (row.runway.state === 'short') return { label: `Programme ends ${weekdayShort(row.runway.last)}`, tone: 'watch' };
  if (c.state === 'none' && c.expected) return { label: c.streak >= 2 ? `No check-in, ${c.streak} days` : 'No check-in today', tone: 'grey' };
  if (row.watch.state === 'silent') return { label: 'Watch silent', tone: 'grey' };
  return { label: 'On track', tone: 'go' };
}

const sortKey = { act: 0, watch: 1, grey: 2, go: 3 };
export const byAttention = (a, b) => (sortKey[a.verdict.tone] - sortKey[b.verdict.tone]) || a.name.localeCompare(b.name);

const names = (list) => {
  const n = list.map(r => r.name);
  return n.length <= 3 ? n.join(', ') : `${n.slice(0, 3).join(', ')} and ${n.length - 3} more`;
};

/**
 * The "needing coach attention" list. Individual items for things about one person (pain, a flagged check-in);
 * group items for chases and programme runway so twelve athletes don't make twelve rows.
 * `rows` carry { id, name, checkIn, runway, missed, watch, timetablePending, programmingActive }.
 */
export function buildAttention(rows, { hourUAE = 12 } = {}) {
  const items = [];
  const push = (it) => items.push(it);

  rows.filter(r => r.checkIn.state === 'red').forEach(r => push({
    id: `flag:${r.id}`, tone: 'red', tag: r.checkIn.pain ? 'Pain' : 'Flagged', who: r.name, ids: [r.id], action: 'open',
    what: r.checkIn.pain ? 'Reported pain in today’s check-in.' : `Check-in flagged: ${r.checkIn.flagged[0]?.label || 'see check-in'}`,
  }));

  const none = rows.filter(r => r.programmingActive && r.runway.state === 'none');
  if (none.length) push({ id: 'prog:none', tone: 'red', tag: 'Programme', who: none.length === 1 ? none[0].name : `${none.length} athletes`, ids: none.map(r => r.id), action: 'programme', what: `No sessions planned after today: ${names(none)}.` });

  const missed = rows.filter(r => r.missed > 0);
  if (missed.length) push({ id: 'missed', tone: 'amber', tag: 'Missed', who: missed.length === 1 ? missed[0].name : `${missed.length} athletes`, ids: missed.map(r => r.id), action: 'open', what: `Planned session in the last ${MISSED_WINDOW_DAYS} days with nothing logged: ${names(missed)}.` });

  const short = rows.filter(r => r.programmingActive && r.runway.state === 'short');
  if (short.length) push({ id: 'prog:short', tone: 'amber', tag: 'Programme', who: short.length === 1 ? short[0].name : `${short.length} athletes`, ids: short.map(r => r.id), action: 'programme', what: `Runs out within ${RUNWAY_DAYS} days: ${names(short)}.` });

  const chase = hourUAE >= CHASE_FROM_HOUR ? rows.filter(r => r.checkIn.state === 'none' && r.checkIn.expected) : [];
  if (chase.length) push({ id: 'chase', tone: 'amber', tag: 'Check-in', who: chase.length === 1 ? chase[0].name : `${chase.length} athletes`, ids: chase.map(r => r.id), action: 'remind-checkin', what: `No check-in today: ${names(chase)}.` });

  const tt = rows.filter(r => r.timetablePending);
  if (tt.length) push({ id: 'timetable', tone: 'grey', tag: 'Timetable', who: tt.length === 1 ? tt[0].name : `${tt.length} athletes`, ids: tt.map(r => r.id), action: 'remind-timetable', what: `Haven’t answered this week’s group sessions: ${names(tt)}.` });

  const silent = rows.filter(r => r.watch.state === 'silent');
  if (silent.length) push({ id: 'watch', tone: 'grey', tag: 'Garmin', who: silent.length === 1 ? silent[0].name : `${silent.length} athletes`, ids: silent.map(r => r.id), action: 'remind-watch', what: `Connected but no data for 2+ days: ${names(silent)}.` });

  return items.sort((a, b) => TONE_ORDER[a.tone] - TONE_ORDER[b.tone]);
}

/** The filter chips along the top: counts, and which rows each one picks out. */
export const CHIPS = [
  { key: 'programme', label: 'Needs programme', tone: 'red', test: r => r.programmingActive && r.runway.state === 'none' },
  { key: 'checkin', label: 'No check-in', tone: 'gold', test: r => r.checkIn.state === 'none' && r.checkIn.expected },
  { key: 'flagged', label: 'Check-in flagged', tone: 'red', test: r => r.checkIn.state === 'red' || r.checkIn.state === 'amber' },
  { key: 'missed', label: 'Missed', tone: 'gold', test: r => r.missed > 0 },
  { key: 'unanswered', label: 'Unanswered', tone: 'plain', test: r => r.timetablePending },
];
