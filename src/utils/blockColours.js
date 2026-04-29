// Shared training-block palette + assignment.
//
// Block colour is deterministic by display_order WITHIN AN ATHLETE so the
// timeline bar(s) and the calendar bottom-marker agree on colour for every
// block, on both Surface 1 (single athlete) and Surface 2 (many).

export const TIMELINE_PALETTE = [
  '#437E8D', // brand teal
  '#A58D69', // brand gold
  '#085777', // brand navy
  '#E76F51', // coral
  '#4A6741', // forest
  '#5E548E', // indigo
  '#277DA1', // steel blue
  '#8E5A39', // bronze
];

export function colourForBlockIndex(i) {
  return TIMELINE_PALETTE[i % TIMELINE_PALETTE.length];
}

/**
 * Returns Map<blockId, colourHex> built by grouping blocks by athlete and
 * assigning colours per-athlete in display_order ascending. So on Surface
 * 2 each athlete's blocks cycle through the palette independently — same
 * way the per-athlete BlockTimelineBar does it.
 */
export function buildBlockColourMap(blocks) {
  const map = new Map();
  if (!blocks || blocks.length === 0) return map;
  const byAthlete = new Map();
  blocks.forEach(b => {
    if (!byAthlete.has(b.athlete_id)) byAthlete.set(b.athlete_id, []);
    byAthlete.get(b.athlete_id).push(b);
  });
  byAthlete.forEach(arr => {
    arr.sort(
      (a, b) =>
        (a.display_order ?? 0) - (b.display_order ?? 0)
        || a.start_date.localeCompare(b.start_date),
    );
    arr.forEach((b, i) => map.set(b.id, colourForBlockIndex(i)));
  });
  return map;
}
