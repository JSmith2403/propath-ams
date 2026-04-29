// Section accent colours for the session builder.
//
// Warm-up has its own special colour. Subsequent (non-warmup) sections
// cycle through the brand-derived palette in declaration order.

export const WARMUP_COLOUR = '#6BA0AD';
export const SECTION_PALETTE = [
  '#437E8D', // teal
  '#A58D69', // gold
  '#085777', // navy
  '#7C7368', // warm grey
  '#5A8590', // muted teal
];

/**
 * Returns the accent colour for a given section based on its position
 * among siblings. `sections` is the full ordered array.
 */
export function colourForSection(section, sections) {
  if (section.is_warm_up) return WARMUP_COLOUR;
  const nonWarmups = sections.filter(s => !s.is_warm_up);
  const idx = nonWarmups.findIndex(s => s.tempId === section.tempId);
  if (idx < 0) return SECTION_PALETTE[0];
  return SECTION_PALETTE[idx % SECTION_PALETTE.length];
}
