import { addDaysISO, mondayOfISO, parseDate } from './blockHelpers';

/**
 * The "board" for copying whole weeks of planned sessions.
 *
 * A clipboard remembers, for each copied session, how many days after the FIRST copied Monday it sat
 * (offsetDays 0–N), so pasting at any Monday lands every session on the same weekday, the same number of
 * weeks apart. Rest days and gaps between weeks are kept.
 *
 *   clip = { sourceAthleteId, sourceAthleteName, startISO, weeks, items: [{ plannedId, offsetDays, name }] }
 */

/** Every Monday from `aISO` to `bISO` inclusive, whichever way round they were picked. */
export function weekMondays(aISO, bISO) {
  const a = mondayOfISO(aISO);
  const b = mondayOfISO(bISO);
  const [from, to] = a <= b ? [a, b] : [b, a];
  const out = [];
  for (let m = from; m <= to; m = addDaysISO(m, 7)) out.push(m);
  return out;
}

/** Build a clipboard from the calendar's planned-session pills inside the picked weeks. */
export function buildWeekClipboard(events, aISO, bISO, source = {}) {
  const mondays = weekMondays(aISO, bISO);
  const startISO = mondays[0];
  const endISO = addDaysISO(mondays[mondays.length - 1], 6);
  const items = (events || [])
    .filter(e => e.is_planned && e._planned_id && e.start_date >= startISO && e.start_date <= endISO)
    .map(e => ({
      plannedId: e._planned_id,
      offsetDays: Math.round((parseDate(e.start_date) - parseDate(startISO)) / 86_400_000),
      name: e.event_name,
    }))
    .sort((x, y) => x.offsetDays - y.offsetDays || String(x.name).localeCompare(String(y.name)));
  return {
    sourceAthleteId: source.athleteId ?? null,
    sourceAthleteName: source.athleteName ?? '',
    startISO,
    endISO,
    weeks: mondays.length,
    items,
  };
}

/** Where each copied session lands when pasted so that the clipboard's first Monday maps to `targetISO`'s Monday. */
export function planPaste(clip, targetISO) {
  const target = mondayOfISO(targetISO);
  return (clip?.items || []).map(it => ({
    plannedId: it.plannedId,
    targetDateISO: addDaysISO(target, it.offsetDays),
    name: it.name,
  }));
}

/** First and last day (Mon … Sun) the pasted weeks will cover. */
export function pasteSpan(clip, targetISO) {
  const target = mondayOfISO(targetISO);
  return { startISO: target, endISO: addDaysISO(target, clip.weeks * 7 - 1) };
}
