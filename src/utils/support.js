/**
 * Support levels: how much of the platform applies to each athlete.
 * "programmed" = we write their physical programme; "tracked" = they wear a wearable we read.
 */
export const SUPPORT_LEVELS = [
  { key: 'full', label: 'Full support', programmed: true, tracked: true, blurb: 'Physical programming and a wearable.' },
  { key: 'programmed', label: 'Programmed only', programmed: true, tracked: false, blurb: 'Physical programming, no wearable.' },
  { key: 'tracked', label: 'Tracked only', programmed: false, tracked: true, blurb: 'Wears a wearable, no programme needed.' },
  { key: 'hands_off', label: 'Hands-off', programmed: false, tracked: false, blurb: 'No programming or wearable. Online work with the team and check-ins.' },
];

/** Unknown or missing values count as full support, which is how everyone was treated before levels existed. */
export function levelOf(key) {
  return SUPPORT_LEVELS.find(l => l.key === key) || SUPPORT_LEVELS[0];
}
