// Birthday events are NOT stored in athlete_calendar_events. We
// compute them at render time from athletes.dob. One synthetic row per
// athlete per visible year, with a stable id so React reconciles
// correctly across navigation.

const YYYY_MM_DD = /^(\d{4})-(\d{2})-(\d{2})/;

function parseDob(dob) {
  const m = YYYY_MM_DD.exec(dob || '');
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
}

/**
 * Build synthetic birthday "events" for a set of athletes across a
 * range of years. Each row carries is_birthday = true so the calendar
 * can style and route clicks differently.
 *
 * @param {Array} athletes  rows with { id, name, dob }
 * @param {Set}   activeIds athlete ids whose programming is currently active
 * @param {number} fromYear inclusive
 * @param {number} toYear   inclusive
 */
export function computeBirthdayEvents(athletes, activeIds, fromYear, toYear) {
  if (toYear < fromYear) return [];
  const out = [];
  for (const a of athletes) {
    if (!activeIds.has(a.id)) continue;
    const parsed = parseDob(a.dob);
    if (!parsed) continue;
    const mm = String(parsed.month).padStart(2, '0');
    const dd = String(parsed.day).padStart(2, '0');
    for (let y = fromYear; y <= toYear; y++) {
      out.push({
        id: `birthday-${a.id}-${y}`,
        athlete_id: a.id,
        event_name: `${a.name}'s birthday`,
        event_type: 'other',
        priority: null,
        start_date: `${y}-${mm}-${dd}`,
        end_date: null,
        notes: null,
        is_team_event: false,
        is_birthday: true,
        // Carried for the popover only — never sent to DB.
        _athleteName: a.name,
        _athleteId:   a.id,
        _dob:         a.dob,
      });
    }
  }
  return out;
}

/**
 * Whole-year age on a given calendar day. Returns null if dob is
 * unparseable.
 */
export function ageOnDate(dob, onISO) {
  const parsed = parseDob(dob);
  if (!parsed) return null;
  const onMatch = YYYY_MM_DD.exec(onISO || '');
  if (!onMatch) return null;
  const onYear  = Number(onMatch[1]);
  const onMonth = Number(onMatch[2]);
  const onDay   = Number(onMatch[3]);
  let age = onYear - parsed.year;
  if (onMonth < parsed.month || (onMonth === parsed.month && onDay < parsed.day)) age -= 1;
  return age;
}
