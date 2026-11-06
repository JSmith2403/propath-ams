/**
 * The headline numbers across the top of the dashboard and the "key insights" in plain English.
 * Pure: they only read the athlete rows the hook has already built.
 */

const mean = (v) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : null);
const pct = (a, b) => (a != null && b ? Math.round(((a - b) / b) * 100) : null);

/** Headline tiles: total athletes, sessions today, need programming, need check-in, wellness compliance, meals. */
export function buildKpis(rows, { sessionsToday = { planned: 0, done: 0 }, meals = null } = {}) {
  const expected = rows.filter(r => r.checkIn.expected);
  const checkedIn = expected.filter(r => r.checkIn.state !== 'none');
  return {
    total: rows.length,
    sessionsToday,
    sessionsPct: sessionsToday.planned ? Math.round((sessionsToday.done / sessionsToday.planned) * 100) : null,
    needProgramming: rows.filter(r => r.programmingActive && r.runway.state === 'none').length,
    needCheckIn: expected.length - checkedIn.length,
    wellness: { done: checkedIn.length, expected: expected.length },
    wellnessPct: expected.length ? Math.round((checkedIn.length / expected.length) * 100) : null,
    meals,
  };
}

/** The squad's average for the last 7 days against the 7 before, from each athlete's 14-day series (oldest first). */
function squadWeekChange(rows, key) {
  const last = [], prev = [];
  rows.forEach(r => {
    const s = r.garmin?.series?.[key];
    if (!s) return;
    const a = s.slice(7).filter(v => v != null), b = s.slice(0, 7).filter(v => v != null);
    if (a.length) last.push(mean(a));
    if (b.length) prev.push(mean(b));
  });
  if (!last.length || !prev.length) return null;
  return pct(mean(last), mean(prev));
}

/**
 * A few lines worth reading, each { tone: 'up'|'down'|'flat'|'info', text }. Only says what the data supports:
 * no watch data means no sleep or activity lines.
 */
export function buildInsights(rows) {
  const out = [];
  const sleep = squadWeekChange(rows, 'sleep');
  if (sleep != null) out.push({ tone: sleep < 0 ? 'down' : sleep > 0 ? 'up' : 'flat', text: sleep === 0 ? 'Sleep is level with last week' : `Sleep ${sleep < 0 ? 'down' : 'up'} ${Math.abs(sleep)}% vs last week` });
  const kcal = squadWeekChange(rows, 'kcal');
  if (kcal != null) out.push({ tone: kcal < 0 ? 'down' : kcal > 0 ? 'up' : 'flat', text: kcal === 0 ? 'Activity is level with last week' : `Active calories ${kcal < 0 ? 'down' : 'up'} ${Math.abs(kcal)}% vs last week` });
  const lowHrv = rows.filter(r => r.garmin?.hrv?.dir === 'down');
  if (rows.some(r => r.garmin?.hrv)) {
    out.push(lowHrv.length
      ? { tone: 'down', text: `${lowHrv.length} athlete${lowHrv.length === 1 ? '’s' : 's’'} HRV is below their usual` }
      : { tone: 'flat', text: 'HRV is steady across the squad' });
  }
  const k = buildKpis(rows);
  if (k.wellness.expected) out.push({ tone: k.needCheckIn ? 'info' : 'up', text: `${k.wellness.done} of ${k.wellness.expected} checked in today` });
  return out;
}
