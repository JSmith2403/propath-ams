/**
 * Has last night's HRV dropped below the athlete's own normal?
 * "Normal" is their average over the 14 days before, and a dip is more than one standard deviation under it.
 * Needs at least 7 earlier readings, so someone new to the watch isn't asked on thin data.
 *
 * rows: [{ day: 'YYYY-MM-DD', hrv_last_night }] in any order (as returned for the athlete themselves).
 * → { dip, latest, mean, sd } (dip is false whenever there isn't enough to judge)
 */
export const HRV_BASELINE_DAYS = 14;
export const HRV_MIN_READINGS = 7;

const addDays = (iso, n) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-CA');
};

export function hrvDip(rows, today) {
  const none = { dip: false, latest: null, mean: null, sd: null };
  const withHrv = (rows || []).filter(r => r?.day && r.hrv_last_night != null && Number.isFinite(Number(r.hrv_last_night)));
  // last night's reading belongs to today (or, if the watch hasn't synced yet, yesterday)
  const latestRow = withHrv.filter(r => r.day <= today && r.day >= addDays(today, -1)).sort((a, b) => b.day.localeCompare(a.day))[0];
  if (!latestRow) return none;
  const earlier = withHrv
    .filter(r => r.day < latestRow.day && r.day >= addDays(latestRow.day, -HRV_BASELINE_DAYS))
    .map(r => Number(r.hrv_last_night));
  if (earlier.length < HRV_MIN_READINGS) return { ...none, latest: Number(latestRow.hrv_last_night) };
  const mean = earlier.reduce((a, b) => a + b, 0) / earlier.length;
  const sd = Math.sqrt(earlier.reduce((a, b) => a + (b - mean) ** 2, 0) / (earlier.length - 1));
  const latest = Number(latestRow.hrv_last_night);
  return { dip: sd > 0 && latest < mean - sd, latest, mean, sd };
}
