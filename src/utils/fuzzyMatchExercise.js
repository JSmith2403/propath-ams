// Matches a parsed exercise name against the coach's existing exercise
// library, tolerating naming drift ("Cat-Cow Mobilisation" / "Cat-Cow
// Mobility Flow" / "Cat-Cow" should all land on the same row instead of
// creating near-duplicate library entries every time text is imported).
//
// Deliberately dependency-free — a normalized containment/token-overlap
// heuristic, not a real string-distance algorithm. Good enough for the
// short, word-based names exercises actually have; not intended for
// prose.

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const MATCH_THRESHOLD = 0.5;

/**
 * Returns { exercise, score } for the best match with score >= threshold,
 * or null if nothing in `library` is close enough.
 */
export function findBestExerciseMatch(name, library) {
  const target = normalize(name);
  if (!target || !library?.length) return null;

  let best = null;
  let bestScore = 0;

  for (const ex of library) {
    const candidate = normalize(ex.name);
    if (!candidate) continue;

    let score;
    if (candidate === target) {
      score = 1;
    } else if (candidate.includes(target) || target.includes(candidate)) {
      const shorter = Math.min(candidate.length, target.length);
      const longer  = Math.max(candidate.length, target.length);
      score = 0.7 + 0.3 * (shorter / longer);
    } else {
      const a = new Set(target.split(' '));
      const b = new Set(candidate.split(' '));
      const intersection = [...a].filter(w => b.has(w)).length;
      const union = new Set([...a, ...b]).size;
      score = union ? intersection / union : 0;
    }

    if (score > bestScore) {
      bestScore = score;
      best = ex;
    }
  }

  return bestScore >= MATCH_THRESHOLD ? { exercise: best, score: bestScore } : null;
}
