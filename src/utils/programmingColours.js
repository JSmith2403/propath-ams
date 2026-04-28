// Programming module — athlete colour palette
//
// Used to colour-code calendar events when viewing across multiple athletes.
// Each athlete gets a deterministic colour based on a hash of their id, so
// the same athlete always renders in the same colour across sessions.
//
// 12-colour palette: brand teal / gold / navy first, then nine accessible
// variants that read clearly against white backgrounds and remain
// distinguishable from one another.

export const PROGRAMMING_PALETTE = [
  '#437E8D', // brand teal
  '#A58D69', // brand gold
  '#085777', // brand navy
  '#2A9D8F', // teal-green
  '#E76F51', // coral
  '#6A4C93', // purple
  '#4A6741', // forest green
  '#B5651D', // rust
  '#5E548E', // indigo
  '#277DA1', // steel blue
  '#8E5A39', // bronze
  '#6B7B59', // sage
];

/**
 * Stable string hash used to map athlete IDs to palette indices. Returns a
 * non-negative integer. Same input always yields the same output.
 */
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0; // force int32
  }
  return Math.abs(h);
}

/**
 * Returns the deterministic palette colour for an athlete id.
 * Falls back to the first palette colour if id is missing.
 */
export function colourForAthlete(athleteId) {
  if (!athleteId) return PROGRAMMING_PALETTE[0];
  const idx = hashString(String(athleteId)) % PROGRAMMING_PALETTE.length;
  return PROGRAMMING_PALETTE[idx];
}

/**
 * Returns a soft tinted background derived from a hex colour, suitable for
 * pill backgrounds where the main colour is the accent.
 *   '#437E8D' → 'rgba(67,126,141,0.14)'
 */
export function tintForColour(hex, alpha = 0.14) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return `rgba(67,126,141,${alpha})`;
  const r = parseInt(m[1].slice(0, 2), 16);
  const g = parseInt(m[1].slice(2, 4), 16);
  const b = parseInt(m[1].slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
