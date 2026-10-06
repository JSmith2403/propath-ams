// Small helpers shared by the coach timetable editor and the athlete app.

export const COHORT_OPTIONS = ['Elite', 'Gold', 'Mini'];

/** '16:00:00' | '16:00' → '4pm' / '4:30pm'. */
export function fmtTime(t) {
  const [h, m] = String(t || '').split(':').map(Number);
  if (Number.isNaN(h)) return '';
  const suffix = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, '0')}${suffix}` : `${h12}${suffix}`;
}

/** '16:00:00','17:00:00' → '4–5pm' (shares the suffix when both match). */
export function fmtRange(start, end) {
  const a = fmtTime(start);
  const b = fmtTime(end);
  if (a.slice(-2) === b.slice(-2)) return `${a.slice(0, -2)}–${b}`;
  return `${a}–${b}`;
}

export function dayLabel(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
}

export function toISO(d) { return d.toLocaleDateString('en-CA'); }
export function addDaysISO(iso, n) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return toISO(d);
}
/** Monday of the week containing `d` (local time), as YYYY-MM-DD. */
export function mondayOf(d = new Date()) {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return toISO(x);
}

/** Groups slots (already sorted by date/time) into [{ date, items }]. */
export function groupByDay(slots) {
  const out = [];
  for (const s of slots) {
    const date = s.slot_date;
    const last = out[out.length - 1];
    if (last && last.date === date) last.items.push(s);
    else out.push({ date, items: [s] });
  }
  return out;
}

/** Does this slot apply to an athlete in `cohort`? (empty cohorts = everyone) */
export function slotAppliesTo(slot, cohort) {
  return !slot.cohorts?.length || slot.cohorts.includes(cohort);
}
