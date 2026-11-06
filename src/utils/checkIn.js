import { getRagColour } from './wellnessRag';

/**
 * Turns one daily check-in (wellness_responses.responses: { <question_id>: value }) into what the coach
 * dashboard shows: a colour, hours slept, mental stress, and which questions were flagged.
 *
 * The colour is the worst of every answered question that has a rating (same rule as the athlete's own
 * roster card) — a "yes" to the pain question is red on its own. Questions without thresholds are ignored.
 * The cycle-symptom question is left out on purpose: it is sensitive and must not surface on a squad-wide
 * screen (see docs/dashboard-brief-v2-2026-11-04.md §8).
 */

export const SLEEP_HOURS_LABEL = 'How many hours did you sleep last night?';
export const MENTAL_STRESS_LABEL = 'How would you rate your current mental stress?';
export const READY_LABEL = 'How ready do you feel to train today?';
const SENSITIVE = /menstrual|cycle/i;
const SEVERITY = { green: 0, amber: 1, red: 2 };

export function summariseCheckIn(responses, library) {
  const byId = library instanceof Map ? library : new Map((library || []).map(q => [q.id, q]));
  const out = { rag: 'grey', sleepHours: null, stress: null, readiness: null, readinessRag: null, flagged: [], rated: 0 };
  if (!responses || typeof responses !== 'object') return out;

  let worst = null;
  for (const [qid, value] of Object.entries(responses)) {
    const q = byId.get(qid);
    if (!q || SENSITIVE.test(q.label || '')) continue;
    if (q.label === SLEEP_HOURS_LABEL && value !== '' && value != null && Number.isFinite(Number(value))) out.sleepHours = Number(value);
    if (q.label === MENTAL_STRESS_LABEL && value !== '' && value != null && Number.isFinite(Number(value))) out.stress = Number(value);
    if (q.label === READY_LABEL && value !== '' && value != null && Number.isFinite(Number(value))) { out.readiness = Number(value); out.readinessRag = getRagColour(value, q); }
    const rag = getRagColour(value, q);
    if (!rag) continue;
    out.rated += 1;
    if (rag !== 'green') out.flagged.push({ label: q.label, rag });
    if (worst == null || SEVERITY[rag] > SEVERITY[worst]) worst = rag;
  }
  out.flagged.sort((a, b) => SEVERITY[b.rag] - SEVERITY[a.rag]);
  out.rag = worst || 'grey';
  return out;
}
