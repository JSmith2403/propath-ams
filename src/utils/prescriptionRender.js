/**
 * Single source of truth for rendering coach prescriptions.
 *
 * Coaches author target_value as free-form text and pick a
 * prescription_type from a small enum. Concatenating those two
 * naively produces nonsense like "BWreps_only", "RPE 7rpe",
 * "15-20% lesspercent_1rm". This module fixes that, and tells the
 * logger what kind of row UI to render per set.
 *
 * Inputs:
 *   { sets, reps, target_value, prescription_type, notes }
 *
 * Outputs:
 *   summary              clean human-readable string for headers
 *   expectedSetCount     int — how many rows to render
 *   prescribedReps       string — e.g. "6", "6-8", "3/3", "AMRAP"
 *                         used as input value default + placeholder
 *   prescribedRepsLower  number | null — lower bound for ranges
 *   prescribedWeight     string | null — display text for weight
 *                         column ("65-70% 1RM", "BW", "Blue band")
 *   mode                 'inputs_and_tick' | 'tick_only' | 'reps_bw'
 *                         drives the SetRow shape
 */

// ── Joiner / target rendering ──────────────────────────────────────────────

function formatTarget(target_value, prescription_type) {
  if (!target_value) {
    // No target text — fall back to the type label where useful.
    if (prescription_type === 'reps_only' || !prescription_type) return '';
    if (prescription_type === 'rpe')          return null; // shouldn't happen, defensive
    return null;
  }
  const t = String(target_value).trim();
  switch (prescription_type) {
    case 'rpe':
      return /^rpe/i.test(t) ? t : `RPE ${t}`;
    case 'percent_1rm':
      return /1rm/i.test(t) ? t : (t.includes('%') ? `${t} 1RM` : `${t}% 1RM`);
    case 'kg':
      return /kg$/i.test(t) ? t : `${t}kg`;
    case 'band_colour':
      return /band/i.test(t) ? t : `${t} band`;
    case 'reps_only':
    case 'time':
    default:
      return t;
  }
}

// ── Mode selection ─────────────────────────────────────────────────────────

function detectMode(prescription_type, target_value, reps) {
  // Pure time / duration prescriptions: just a tick.
  if (prescription_type === 'time') return 'tick_only';
  const repsStr = String(reps ?? '');
  if (/\b(min|sec)\b/i.test(repsStr)) return 'tick_only';

  // Distance / sprint drills (e.g. "10m build / 10m fly", "3-5 step approach"):
  // weight is meaningless — render as a tick-only row.
  const tv = String(target_value ?? '');
  if (
    prescription_type === 'reps_only'
    && tv
    && /\b\d+(?:\.\d+)?\s*m\b|\bfly\b|\bbuild\b|\bstep approach\b|\bsprint\b|\bAMRAP\b/i.test(tv)
  ) {
    return 'tick_only';
  }

  // Bodyweight reps: athlete may add load occasionally, but the
  // default is no weight input. Show "BW" badge in the weight column.
  if (prescription_type === 'reps_only' && /^BW(\b|$)/i.test(tv)) {
    return 'reps_bw';
  }

  return 'inputs_and_tick';
}

// ── Reps lower bound (for match-prescribed default fill) ───────────────────

function repsLower(reps) {
  if (reps == null) return null;
  const m = String(reps).match(/^(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
}

// ── Weight lower bound (only when prescription gives an exact kg number) ───
// Percent / RPE / band-colour prescriptions don't yield a number until
// the coach configures a 1RM, which we don't have yet. Those return null.
function weightLower(target_value, prescription_type) {
  if (!target_value) return null;
  if (prescription_type === 'kg') {
    const m = String(target_value).match(/(\d+(?:\.\d+)?)/);
    return m ? Number(m[1]) : null;
  }
  return null;
}

// ── Public API ─────────────────────────────────────────────────────────────

export function parsePrescription({ sets, reps, target_value, prescription_type, notes } = {}) {
  const target = formatTarget(target_value, prescription_type);
  const mode   = detectMode(prescription_type, target_value, reps);

  // Summary text — what shows above the set rows and on the session card.
  const left  = [sets, reps].filter(v => v != null && v !== '').join(' × ');
  const isBW  = mode === 'reps_bw' || /^BW(\b|$)/i.test(String(target_value ?? ''));
  const sep   = (target && !isBW) ? ' @ ' : (isBW ? ' ' : '');
  const summary = (left ? left : '') + (target ? sep + target : '');

  // Weight column display text (null when no weight relevant).
  let prescribedWeight = null;
  if (mode === 'inputs_and_tick') prescribedWeight = target || null;
  if (mode === 'reps_bw')         prescribedWeight = 'BW';

  return {
    summary: summary.trim(),
    expectedSetCount: Math.max(1, Number(sets) || 1),
    prescribedReps: reps != null && reps !== '' ? String(reps) : null,
    prescribedRepsLower: repsLower(reps),
    prescribedWeight,
    prescribedWeightLower: weightLower(target_value, prescription_type),
    mode,
    notes: notes || null,
  };
}
