/**
 * Letter-badge palette for the athlete app exercise cards.
 *
 * Logic (per coach feedback):
 *   • Warm-up section — every exercise renders in a single shared
 *     "warm-up" tint, so prep/activation work reads as one block.
 *   • Other sections   — each letter gets its own tint, cycling
 *     through the brand-aligned palette below. Supersets share a
 *     letter upstream in sessionLayout.buildSessionItems, so paired
 *     exercises automatically share a tint without any extra logic.
 *
 * Wider palette (8 distinct colours) means typical 6–8-exercise main
 * sections don't visibly cycle.
 */

const WARMUP_TINT = {
  bg: 'rgba(165,141,105,0.14)',
  fg: '#A58D69',
  border: '#A58D69',
};

// 8-tint rotation for non-warm-up exercises. Brand-led but pushed
// further apart in hue/value than the previous 4-tint set so a long
// session reads as distinct steps rather than a colour drift.
const PALETTE = [
  { bg: 'rgba(67,126,141,0.18)',  fg: '#437E8D', border: '#437E8D' }, // teal
  { bg: 'rgba(8,87,119,0.18)',    fg: '#085777', border: '#085777' }, // navy
  { bg: 'rgba(165,141,105,0.20)', fg: '#8d774f', border: '#A58D69' }, // gold
  { bg: 'rgba(28,28,28,0.92)',    fg: '#fff',    border: '#1C1C1C' }, // ink
  { bg: 'rgba(34,197,94,0.16)',   fg: '#15803d', border: '#15803d' }, // green
  { bg: 'rgba(168,85,247,0.16)',  fg: '#7e22ce', border: '#7e22ce' }, // purple
  { bg: 'rgba(220,38,38,0.14)',   fg: '#b91c1c', border: '#b91c1c' }, // red
  { bg: 'rgba(245,158,11,0.18)',  fg: '#a16207', border: '#a16207' }, // amber
];

/**
 * Resolve the tint for a letter outside any section context.
 * Kept exported for legacy callers; section-aware code should call
 * `tintForExercise` instead.
 */
export function tintForLetter(letter) {
  if (!letter) return PALETTE[0];
  const idx = (letter.toUpperCase().charCodeAt(0) - 65) % PALETTE.length;
  return PALETTE[Math.max(0, idx)];
}

/**
 * Section-aware tint resolver.
 *
 *   tintForExercise({ letter: 'B', isWarmUp: true })   → WARMUP_TINT
 *   tintForExercise({ letter: 'C', isWarmUp: false })  → PALETTE[2]
 */
export function tintForExercise({ letter, isWarmUp }) {
  if (isWarmUp) return WARMUP_TINT;
  return tintForLetter(letter);
}
