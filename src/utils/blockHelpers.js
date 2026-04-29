// Training Block helpers — date math, status, overlap validation.
//
// Kept separate from ProgrammeCalendar so the block list can compute
// status / end-date / overlap without pulling the calendar into its
// dependency tree.

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function parseDate(iso) {
  return new Date(iso + 'T00:00:00');
}

export function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Next Monday strictly after today. If today is Monday, returns the
 * Monday seven days from now (treats "next Monday" as the upcoming
 * Monday, not today).
 */
export function nextMondayISO() {
  const d = startOfDay(new Date());
  const dow = d.getDay();           // 0 Sun ... 6 Sat
  const offset = ((1 - dow + 7) % 7) || 7;
  d.setDate(d.getDate() + offset);
  return toISO(d);
}

/**
 * End date for a block of `weeks` full Mon–Sun weeks starting at `startISO`.
 *   start + (weeks × 7) − 1 day
 * e.g. start = Mon 5 May, weeks = 4 → end = Sun 1 Jun (28 calendar days).
 */
export function endDateFromStart(startISO, weeks) {
  if (!startISO || !weeks || weeks < 1) return '';
  const d = parseDate(startISO);
  d.setDate(d.getDate() + (weeks * 7) - 1);
  return toISO(d);
}

/**
 * Compute number of full Mon-start weeks in the block (used when editing
 * an existing block where only end_date is in the DB).
 */
export function durationWeeksFromDates(startISO, endISO) {
  if (!startISO || !endISO) return 0;
  const start = parseDate(startISO);
  const end   = parseDate(endISO);
  const days  = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, Math.round(days / 7));
}

/**
 * Block status from today's date.
 *   start > today  → upcoming
 *   start ≤ today ≤ end → active
 *   end < today    → completed
 */
export function getBlockStatus(block, todayDate) {
  const today = startOfDay(todayDate || new Date());
  const start = parseDate(block.start_date);
  const end   = parseDate(block.end_date);
  if (today < start) return 'upcoming';
  if (today > end)   return 'completed';
  return 'active';
}

/**
 * Returns the existing block that overlaps the proposed range, or null
 * if none. Overlap = ranges [s1,e1] and [s2,e2] share any day.
 *
 * Pass excludeId when editing so the block being edited doesn't match
 * itself.
 */
export function findOverlappingBlock({ start_date, end_date, athlete_id }, blocks, excludeId = null) {
  if (!start_date || !end_date) return null;
  const s = parseDate(start_date);
  const e = parseDate(end_date);
  for (const b of blocks) {
    if (b.id === excludeId) continue;
    if (b.athlete_id !== athlete_id) continue;
    const bs = parseDate(b.start_date);
    const be = parseDate(b.end_date);
    // Overlap iff !(end < other.start || start > other.end)
    if (!(e < bs || s > be)) return b;
  }
  return null;
}

const DATE_OPTS  = { day: 'numeric', month: 'short' };
const DATE_OPTS_Y = { day: 'numeric', month: 'short', year: 'numeric' };

export function formatBlockRange(startISO, endISO) {
  if (!startISO || !endISO) return '';
  const s = parseDate(startISO);
  const e = parseDate(endISO);
  const sameYear = s.getFullYear() === e.getFullYear();
  const sStr = s.toLocaleDateString('en-GB', sameYear ? DATE_OPTS : DATE_OPTS_Y);
  const eStr = e.toLocaleDateString('en-GB', DATE_OPTS_Y);
  return `${sStr} – ${eStr}`;
}

export function formatShortDate(iso) {
  if (!iso) return '';
  return parseDate(iso).toLocaleDateString('en-GB', DATE_OPTS_Y);
}
