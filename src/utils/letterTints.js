/**
 * Standardised letter-badge palette for the athlete app exercise
 * cards. Replaces the off-palette green/blue/pink/amber set.
 *
 *   A → Gold       primary lift / first exercise
 *   B → Teal       secondary
 *   C → Navy       accessory
 *   D → Dark, gold border    finisher / extras
 *
 * E onwards cycles back through the same set so the visual rhythm
 * stays consistent for long sessions.
 */
const PALETTE = [
  { bg: 'rgba(165,141,105,0.18)', fg: '#A58D69', border: '#A58D69' }, // A — Gold
  { bg: 'rgba(67,126,141,0.18)',  fg: '#7DB3C2', border: '#437E8D' }, // B — Teal
  { bg: 'rgba(8,87,119,0.22)',    fg: '#5fa3c7', border: '#085777' }, // C — Navy
  { bg: '#1C1C1C',                fg: '#A58D69', border: '#A58D69' }, // D — Dark, gold border
];

export function tintForLetter(letter) {
  if (!letter) return PALETTE[0];
  const idx = (letter.toUpperCase().charCodeAt(0) - 65) % PALETTE.length;
  return PALETTE[Math.max(0, idx)];
}
