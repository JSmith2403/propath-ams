/**
 * Flexible wellness flagging logic — operates on a question definition
 * plus a submitted value.
 *
 * A question looks like:
 *   { id, question_text, question_type, higher_is_worse,
 *     green_threshold, amber_threshold, scale_min, scale_max,
 *     numerical_min, numerical_max, ... }
 *
 * Colour rules:
 *   higher_is_worse = true  → green if value <= green_threshold
 *                              amber if value <= amber_threshold
 *                              else red
 *   higher_is_worse = false → green if value >= green_threshold
 *                              amber if value >= amber_threshold
 *                              else red
 *   If thresholds are null/undefined → always green (no flagging)
 */

export function getQuestionColour(question, value) {
  if (question == null || value == null || value === '') return 'green';
  const v = Number(value);
  if (isNaN(v)) return 'green';

  const green = question.green_threshold;
  const amber = question.amber_threshold;
  if (green == null || amber == null) return 'green';

  if (question.higher_is_worse) {
    if (v <= Number(green)) return 'green';
    if (v <= Number(amber)) return 'amber';
    return 'red';
  }
  // lower is worse
  if (v >= Number(green)) return 'green';
  if (v >= Number(amber)) return 'amber';
  return 'red';
}

/**
 * A question is Tier-1 flagged when its colour is red.
 */
export function isTier1Flagged(question, value) {
  return getQuestionColour(question, value) === 'red';
}

/**
 * Check whether any response in a submission is Tier-1 flagged for the given
 * set of questions.
 * submission.responses = { [question_id]: value }
 */
export function isAnyResponseFlagged(submission, questions) {
  const responses = submission?.responses || {};
  for (const q of questions) {
    if (q.question_type === 'text' || q.question_type === 'yes_no') continue;
    const val = responses[q.id];
    if (val == null || val === '') continue;
    if (isTier1Flagged(q, val)) return true;
  }
  return false;
}

/**
 * Compute rolling mean and SD per question, oldest-first.
 * Returns Map<submission_date, { [question_id]: { mean, sd, n } }>.
 */
export function computeRollingStats(submissions, questions, windowDays = 28) {
  const result = new Map();
  const quantQuestions = questions.filter(q => q.question_type === 'scale' || q.question_type === 'numerical');

  submissions.forEach((sub, idx) => {
    const subDate = new Date(sub.submission_date);
    const cutoff = new Date(subDate);
    cutoff.setDate(cutoff.getDate() - windowDays);

    const window = [];
    for (let i = idx; i >= 0; i--) {
      const d = new Date(submissions[i].submission_date);
      if (d < cutoff) break;
      window.push(submissions[i]);
    }

    const stats = {};
    for (const q of quantQuestions) {
      const vals = window
        .map(s => Number(s.responses?.[q.id]))
        .filter(v => !isNaN(v));
      const n = vals.length;
      if (n === 0) { stats[q.id] = { mean: 0, sd: 0, n: 0 }; continue; }
      const mean = vals.reduce((a, b) => a + b, 0) / n;
      const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
      stats[q.id] = { mean, sd: Math.sqrt(variance), n };
    }
    result.set(sub.submission_date, stats);
  });

  return result;
}
