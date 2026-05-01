/**
 * Strength prediction utilities.
 *
 * Mayhew (1995): the most accurate single-set predictor for 1-10 rep
 * ranges. Falls off above 12 reps — we cap there to avoid noise.
 *
 *   1RM = (100 * w) / (52.2 + 41.9 * e^(-0.055 * r))
 */
export function mayhew1RM(weight, reps) {
  const w = Number(weight);
  const r = Number(reps);
  if (!isFinite(w) || w <= 0 || !isFinite(r) || r < 1) return null;
  if (r === 1) return w;
  if (r > 12) return null; // outside Mayhew's reliable range
  return (100 * w) / (52.2 + 41.9 * Math.exp(-0.055 * r));
}

/** Best estimated 1RM across an array of { weight, reps } sets. */
export function bestE1RM(sets) {
  let best = null;
  for (const s of sets) {
    const e = mayhew1RM(s.weight_kg, s.reps);
    if (e != null && (best == null || e > best)) best = e;
  }
  return best;
}

/** Round to one decimal — kg precision is 0.5kg in practice. */
export function roundKg(v) {
  if (v == null || !isFinite(v)) return null;
  return Math.round(v * 10) / 10;
}
