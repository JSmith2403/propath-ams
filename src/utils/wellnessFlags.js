/**
 * Wellness flagging logic — Tier 1 (absolute) and Tier 2 (relative).
 *
 * Direction convention:
 *   Sleep Duration  → lower is worse
 *   All others      → higher is worse
 */

const TIER1 = {
  sleep_duration: (v) => v <= 5,
  sleep_quality:  (v) => v >= 6,
  fatigue:        (v) => v >= 6,
  muscle_soreness:(v) => v >= 6,
  stress:         (v) => v >= 6,
};

// Metrics where a HIGHER value is worse
const HIGHER_IS_WORSE = new Set([
  'sleep_quality', 'fatigue', 'muscle_soreness', 'stress',
]);

const METRIC_KEYS = [
  'sleep_duration', 'sleep_quality', 'fatigue', 'muscle_soreness', 'stress',
];

/** True when the value breaches the absolute threshold. */
export function isTier1Flagged(metric, value) {
  const check = TIER1[metric];
  return check ? check(value) : false;
}

/**
 * True when the value is > 1.5 SD worse than the personal mean.
 * Returns false if fewer than 5 data points (not enough signal).
 */
export function isTier2Flagged(metric, value, mean, sd, sampleSize) {
  if (sampleSize < 5 || sd === 0) return false;
  if (HIGHER_IS_WORSE.has(metric)) {
    return value >= mean + 1.5 * sd;
  }
  // sleep_duration — lower is worse
  return value <= mean - 1.5 * sd;
}

/** Returns 'tier1' | 'tier2' | null for a single metric value. */
export function getMetricFlag(metric, value, mean, sd, sampleSize) {
  if (isTier1Flagged(metric, value)) return 'tier1';
  if (isTier2Flagged(metric, value, mean, sd, sampleSize)) return 'tier2';
  return null;
}

/**
 * Compute rolling mean + SD for each metric over the last `windowDays` days.
 * Input: submissions sorted chronologically (oldest first).
 * Returns a Map keyed by submission_date string → { [metric]: { mean, sd, n } }.
 */
export function computeRollingStats(submissions, windowDays = 28) {
  const result = new Map();

  submissions.forEach((sub, idx) => {
    const subDate = new Date(sub.submission_date);
    const cutoff = new Date(subDate);
    cutoff.setDate(cutoff.getDate() - windowDays);

    // Gather window — all submissions before (and including) this one within windowDays
    const window = [];
    for (let i = idx; i >= 0; i--) {
      const d = new Date(submissions[i].submission_date);
      if (d < cutoff) break;
      window.push(submissions[i]);
    }

    const stats = {};
    for (const key of METRIC_KEYS) {
      const vals = window.map((s) => Number(s[key])).filter((v) => !isNaN(v));
      const n = vals.length;
      if (n === 0) {
        stats[key] = { mean: 0, sd: 0, n: 0 };
        continue;
      }
      const mean = vals.reduce((a, b) => a + b, 0) / n;
      const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
      stats[key] = { mean, sd: Math.sqrt(variance), n };
    }
    result.set(sub.submission_date, stats);
  });

  return result;
}

/**
 * Check whether ANY metric in a submission is flagged (Tier 1 or Tier 2).
 * `rollingStats` is the Map from computeRollingStats.
 */
export function isAnyFlagged(submission, rollingStats) {
  const stats = rollingStats.get(submission.submission_date);
  for (const key of METRIC_KEYS) {
    const val = Number(submission[key]);
    if (isNaN(val)) continue;
    const s = stats?.[key] || { mean: 0, sd: 0, n: 0 };
    if (getMetricFlag(key, val, s.mean, s.sd, s.n)) return true;
  }
  return false;
}

/**
 * Tier 1 absolute colour for a single metric value.
 * Returns 'red' | 'amber' | 'green'.
 *
 * Sleep Duration (hours): Green >= 7, Amber 5-6.5, Red <= 4.5
 * All others (1-7 scale, higher is worse): Green 1-3, Amber 4-5, Red 6-7
 */
export function getMetricColour(metric, value) {
  if (metric === 'sleep_duration') {
    if (value >= 7) return 'green';
    if (value >= 5) return 'amber';
    return 'red';
  }
  // sleep_quality, fatigue, muscle_soreness, stress
  if (value <= 3) return 'green';
  if (value <= 5) return 'amber';
  return 'red';
}

export { METRIC_KEYS };
