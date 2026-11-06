import { addDaysISO } from './blockHelpers';

/**
 * Reads a written programme that is laid out by day, e.g.
 *
 *   Monday
 *   * Hang Clean – 4 x 3
 *   * Chin-up – 3 x 6-8
 *   Wednesday – Upper
 *   * Bench Press – 3 x 6
 *
 * and says which day each exercise belongs to, so a whole week (or several, with "Week 2" headings)
 * can be placed on the calendar in one go. Plain rules, no AI: fast, free and predictable.
 * Anything it doesn't recognise under a day is kept as a note for that day rather than dropped.
 */

const DAY_INDEX = {
  monday: 0, mon: 0, tuesday: 1, tues: 1, tue: 1, wednesday: 2, weds: 2, wed: 2,
  thursday: 3, thurs: 3, thur: 3, thu: 3, friday: 4, fri: 4, saturday: 5, sat: 5, sunday: 6, sun: 6,
};
const DAY_RE = new RegExp(`^(${Object.keys(DAY_INDEX).sort((a, b) => b.length - a.length).join('|')})\\b\\s*[:\\-–—]?\\s*(.*)$`, 'i');
const WEEK_RE = /^week\s*(\d+)\b\s*[:\-–—]?\s*(.*)$/i;
const BULLET_RE = /^\s*(?:[*•·●▪◦]|-(?=\s)|\d+[.)](?=\s))\s*/;
const SETS_REPS = /(\d+)\s*[x×]\s*(\d+(?:\s*[-–]\s*\d+)?)/i;
// "Name – 3 x 8 each side"  |  "Name: 3 x 8"  |  "Name 3x8"
const EXERCISE_RE = /^(.*?)\s*(?:\s[–—-]\s|[–—:]\s*|\s)\s*(\d+)\s*[x×]\s*(\d+(?:\s*[-–]\s*\d+)?)\s*(.*)$/i;

export const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function cleanName(s) {
  return s.replace(/\s+/g, ' ').replace(/[\s:–—-]+$/, '').trim();
}

/** One line → { name, sets, reps, note } or null if it isn't an exercise with sets and reps. */
export function parseExerciseLine(line) {
  const m = EXERCISE_RE.exec(line.trim());
  if (!m) return null;
  const name = cleanName(m[1]);
  if (!name || /^\d+$/.test(name)) return null;
  return {
    name,
    sets: Number(m[2]),
    reps: m[3].replace(/\s*[-–]\s*/, '-'),
    note: m[4].replace(/^[\s,;(–—-]+|[\s)]+$/g, '').trim(),
  };
}

/**
 * Text → { weeks: [{ number, days: [{ weekday|null, label, exercises, notes }] }], unreadLines }.
 * `weekday` is 0 (Monday) to 6 (Sunday), or null when the text gave no day (a single day to place yourself).
 */
export function parseWeekText(text) {
  const weeks = [];
  let week = null;
  let day = null;
  let unreadLines = 0;

  const startWeek = (number) => {
    week = { number, days: [] };
    weeks.push(week);
    day = null;
  };
  const startDay = (weekday, label) => {
    if (!week) startWeek(weeks.length + 1);
    day = { weekday, label: label || null, exercises: [], notes: [] };
    week.days.push(day);
  };

  for (const raw of String(text || '').split(/\r?\n/)) {
    const line = raw.replace(BULLET_RE, '').trim();
    if (!line) continue;

    const looksLikeExercise = SETS_REPS.test(line);
    const w = !looksLikeExercise && WEEK_RE.exec(line);
    if (w) { startWeek(Number(w[1])); continue; }

    const d = !looksLikeExercise && DAY_RE.exec(line);
    if (d) {
      const weekday = DAY_INDEX[d[1].toLowerCase()];
      // A second "Monday" inside the same week starts the next week.
      if (week && week.days.some(x => x.weekday === weekday) && !weeks.some(x => x.explicit)) startWeek(weeks.length + 1);
      startDay(weekday, cleanName(d[2]));
      continue;
    }

    if (!day) startDay(null, null);
    const ex = parseExerciseLine(line);
    if (ex) day.exercises.push(ex);
    else { day.notes.push(line); unreadLines += 1; }
  }

  // Drop empty shells (a heading with nothing under it)
  weeks.forEach(wk => { wk.days = wk.days.filter(x => x.exercises.length || x.notes.length); });
  return { weeks: weeks.filter(wk => wk.days.length), unreadLines };
}

/**
 * Puts each day on a date. `mondayISO` is the Monday of the first week. Days with no weekday in the text
 * land on `fallbackISO` (the single date the coach picked).
 */
export function placeOnDates(parsed, mondayISO, fallbackISO) {
  const out = [];
  parsed.weeks.forEach((wk, wi) => {
    wk.days.forEach(d => {
      const date = d.weekday == null ? fallbackISO : addDaysISO(mondayISO, wi * 7 + d.weekday);
      out.push({ week: wi + 1, weekday: d.weekday, date, label: d.label, exercises: d.exercises, notes: d.notes });
    });
  });
  return out;
}
