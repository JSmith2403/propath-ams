/**
 * Small helpers for showing a Garmin number next to how it compares with the athlete's own recent average.
 * A change only counts as up or down when it's bigger than their usual day-to-day wobble (half a standard deviation),
 * the same "smallest worthwhile change" idea the readiness brief uses.
 */

const mean = (v) => v.reduce((a, b) => a + b, 0) / v.length;
const sd = (v) => {
  if (v.length < 2) return 0;
  const m = mean(v);
  return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (v.length - 1));
};

/**
 * values: newest first, numbers or null (null = no reading that day).
 * → null when there is no reading at all; otherwise { value, avg, delta, dir } where delta/dir are null
 *   until there are at least `minBaseline` earlier readings to compare with.
 */
export function trendOf(values, { minBaseline = 3 } = {}) {
  const present = (values || []).filter(v => v != null && Number.isFinite(Number(v))).map(Number);
  if (!present.length) return null;
  const [value, ...earlier] = present;
  if (earlier.length < minBaseline) return { value, avg: null, delta: null, dir: null };
  const avg = mean(earlier);
  const delta = value - avg;
  const wobble = Math.max(0.5 * sd(earlier), Math.abs(avg) * 0.01);
  return { value, avg, delta, dir: Math.abs(delta) <= wobble ? 'flat' : delta > 0 ? 'up' : 'down' };
}

/** 7.7 → "7h 42m" */
export function fmtHM(hours) {
  if (hours == null) return '–';
  const total = Math.round(hours * 60);
  return `${Math.floor(total / 60)}h ${String(total % 60).padStart(2, '0')}m`;
}

/** hours delta → "+12m" / "-18m" (or "+1h 05m" beyond an hour) */
export function fmtDeltaHM(deltaHours) {
  if (deltaHours == null) return '';
  const mins = Math.round(Math.abs(deltaHours) * 60);
  const sign = deltaHours < 0 ? '-' : '+';
  return mins >= 60 ? `${sign}${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m` : `${sign}${mins}m`;
}

/** Garmin's own Body Battery bands, used as the "Garmin perceived" readiness. */
export function batteryBand(v) {
  if (v == null) return null;
  return v >= 75 ? 'green' : v >= 50 ? 'amber' : 'red';
}
