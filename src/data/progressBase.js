/**
 * The base set every athlete's Progress tab shows, in this order, whatever the coach has pinned.
 * A coach then adds athlete-specific extras on top with "Show on athlete progress" (up to MAX_EXTRA_METRICS).
 *
 *   key    the manual test metric (performance_test_results)
 *   label  the name athletes see
 *   vald   optional VALD result that is the same test — its results are merged into the same chart
 *          (best result per day), so a manual entry and a VALD session are one trend.
 *          Left off where the VALD number isn't a like-for-like match (10-5 hops: VALD reports per-hop
 *          and two different RSI formulas — needs a decision before it's wired up).
 */
export const BASE_PROGRESS = [
  { key: 'cmjBilateral',  label: 'CMJ',                        vald: { testType: 'CMJ',  name: 'Jump Height (Imp-Mom)' } },
  { key: 'imtpPeakForce', label: 'IMTP',                       vald: { testType: 'IMTP', name: 'Peak Vertical Force' } },
  { key: 'rsi105',        label: '10-5 Reactive Hops' },
  { key: 'backSquat3RM',  label: 'Back Squat 3RM Estimation' },
  { key: 'benchPress3RM', label: 'Bench Press 3RM Estimation' },
  { key: 'chinUpMaxReps', label: 'Max Chin-up' },
];

export const BASE_KEYS = new Set(BASE_PROGRESS.map(b => b.key));
export const BASE_BY_KEY = Object.fromEntries(BASE_PROGRESS.map(b => [b.key, b]));

/** Coach-chosen extras on top of the base set. */
export const MAX_EXTRA_METRICS = 8;

/** Base metrics first (always), then the athlete's own pinned extras, no duplicates. */
export const withBaseMetrics = (pinned = []) => [
  ...BASE_PROGRESS.map(b => b.key),
  ...(pinned || []).filter(k => !BASE_KEYS.has(k)),
];
