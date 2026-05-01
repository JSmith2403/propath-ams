/**
 * Pure RAG colour resolution for any wellness response value.
 *
 * Takes a question (with question_type, direction, rag_thresholds,
 * config) plus the athlete's submitted value, and returns one of:
 *
 *   'green' | 'amber' | 'red' | null
 *
 * null means "no rating defined for this combination" — render the
 * value but don't colour-code it. Callers fall back to neutral.
 *
 * Threshold shape (uniform across rated types):
 *   { green_boundary: number, amber_boundary: number }
 *
 * higher_better:  v >= green_boundary → green
 *                 v >= amber_boundary → amber
 *                 else                  red
 * lower_better:   v <= green_boundary → green
 *                 v <= amber_boundary → amber
 *                 else                  red
 */

export const DEFAULT_THRESHOLDS = {
  // 1-7 sliders
  slider_lower_better:  { green_boundary: 2, amber_boundary: 5 },
  slider_higher_better: { green_boundary: 6, amber_boundary: 3 },
  // hours_sleep convention
  hours_sleep:          { green_boundary: 7, amber_boundary: 6 },
};

export function getRagColour(value, question) {
  if (value == null || value === '') return null;
  if (!question) return null;

  const { question_type: type, direction, rag_thresholds: th } = question;

  // ── yes / no ────────────────────────────────────────────────────────────
  if (type === 'yes_no') {
    const v = String(value).toLowerCase();
    if (v !== 'yes' && v !== 'no') return null;
    if (direction === 'no_better')  return v === 'no'  ? 'green' : 'red';
    if (direction === 'yes_better') return v === 'yes' ? 'green' : 'red';
    return null;
  }

  // ── multi_choice / text — no RAG ────────────────────────────────────────
  if (type === 'multi_choice' || type === 'text') return null;

  // ── slider / number — use thresholds + direction ────────────────────────
  if (type !== 'slider' && type !== 'slider_1_7' && type !== 'number') return null;
  if (!th || (th.green_boundary == null && th.amber_boundary == null)) return null;

  const v = Number(value);
  if (!isFinite(v)) return null;

  const g = Number(th.green_boundary);
  const a = Number(th.amber_boundary);

  if (direction === 'higher_better') {
    if (v >= g) return 'green';
    if (v >= a) return 'amber';
    return 'red';
  }
  if (direction === 'lower_better') {
    if (v <= g) return 'green';
    if (v <= a) return 'amber';
    return 'red';
  }
  return null;
}

/**
 * Validate a proposed { green_boundary, amber_boundary } pair given
 * direction + the question's allowed value range. Returns { ok, error }.
 *
 *   higher_better:  amber_boundary < green_boundary
 *                   amber_boundary >= min  (else "all green")
 *                   green_boundary <= max
 *   lower_better:   amber_boundary > green_boundary
 *                   amber_boundary <= max  (else "all green")
 *                   green_boundary >= min
 */
export function validateThresholds({ green_boundary, amber_boundary }, { direction, min, max }) {
  const g = Number(green_boundary);
  const a = Number(amber_boundary);
  if (!isFinite(g) || !isFinite(a)) return { ok: false, error: 'Both boundaries are required.' };
  if (g < min || g > max) return { ok: false, error: `Green boundary must be between ${min} and ${max}.` };
  if (a < min || a > max) return { ok: false, error: `Amber boundary must be between ${min} and ${max}.` };

  if (direction === 'higher_better') {
    if (a >= g) return { ok: false, error: 'Amber must be lower than green for higher-is-better questions.' };
  } else if (direction === 'lower_better') {
    if (a <= g) return { ok: false, error: 'Amber must be higher than green for lower-is-better questions.' };
  }
  return { ok: true };
}

/**
 * Default thresholds for a given question shape — used when seeding,
 * when "Reset to default" is tapped, or when sliders flip direction.
 */
export function defaultThresholds(question) {
  const { question_type: type, direction, label } = question;
  if (type === 'slider' || type === 'slider_1_7') {
    return direction === 'higher_better'
      ? { ...DEFAULT_THRESHOLDS.slider_higher_better }
      : { ...DEFAULT_THRESHOLDS.slider_lower_better };
  }
  if (type === 'number' && label === 'How many hours did you sleep last night?') {
    return { ...DEFAULT_THRESHOLDS.hours_sleep };
  }
  // Pain numerics and other arbitrary numbers — empty by default,
  // coach fills in manually.
  return {};
}
