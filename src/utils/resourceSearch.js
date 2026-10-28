/**
 * Turn what an athlete types ("pre-game snacks") into the idea-groups the search_resources() database function takes.
 * One group per idea: the word they typed plus near-synonyms, e.g. "snacks" → "snacks snack fuel food bite".
 * The database stems words (snack = snacks) and first requires every idea to appear, then relaxes to any idea.
 *
 * The synonym list is deliberately small and sports-flavoured — it exists so a search finds the guide a coach would
 * point to even when the athlete uses different words. Add to it freely.
 */

const STOP = new Set([
  'a', 'an', 'the', 'of', 'for', 'to', 'and', 'or', 'in', 'on', 'at', 'is', 'are', 'my', 'me', 'i', 'we', 'you',
  'what', 'how', 'do', 'does', 'can', 'with', 'about', 'some', 'any', 'get', 'need', 'want', 'help', 'tips', 'guide',
]);

const SYNONYMS = {
  game: ['match', 'competition', 'event', 'race', 'tournament', 'fixture', 'training', 'session'],
  match: ['game', 'competition', 'fixture', 'event'],
  competition: ['game', 'match', 'event', 'tournament'],
  pre: ['before'],
  post: ['after', 'recovery'],
  snack: ['snacks', 'fuel', 'food', 'bite'],
  eat: ['food', 'nutrition', 'fuel', 'meal'],
  eating: ['food', 'nutrition', 'fuel', 'meal'],
  food: ['nutrition', 'eat', 'meal', 'fuel'],
  meal: ['food', 'nutrition', 'plate', 'eat'],
  breakfast: ['meal', 'food', 'morning'],
  drink: ['hydration', 'fluid', 'water'],
  hydrate: ['hydration', 'fluid', 'water', 'drink'],
  water: ['hydration', 'fluid', 'drink'],
  protein: ['nutrition', 'food', 'muscle'],
  weight: ['bodyweight', 'mass', 'nutrition'],
  sleep: ['rest', 'recovery', 'bedtime'],
  rest: ['recovery', 'sleep'],
  recover: ['recovery', 'rest', 'sleep'],
  tired: ['fatigue', 'rest', 'sleep', 'recovery'],
  stress: ['anxiety', 'pressure', 'nerves', 'mental'],
  nerves: ['anxiety', 'pressure', 'stress', 'mental'],
  nervous: ['anxiety', 'pressure', 'stress', 'nerves'],
  anxiety: ['stress', 'pressure', 'nerves', 'worry'],
  confidence: ['mindset', 'belief', 'mental'],
  mindset: ['mental', 'psychology', 'confidence'],
  focus: ['concentration', 'attention', 'mindset'],
  motivation: ['mindset', 'goals', 'drive'],
  goals: ['goal', 'targets', 'planning'],
  uni: ['university', 'college', 'education'],
  university: ['college', 'education'],
  scholarship: ['college', 'university', 'recruitment', 'pathway'],
  career: ['future', 'pathway', 'planning'],
  school: ['education', 'study', 'exams'],
  exam: ['exams', 'study', 'school'],
  injury: ['injured', 'rehab', 'physio', 'recovery'],
};

const clean = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

/** "Pre-game snacks" → ['pre before', 'game match competition …', 'snacks snack fuel food bite'] */
export function buildGroups(query) {
  const seen = new Set();
  const groups = [];
  for (const raw of clean(query).split(' ')) {
    if (raw.length < 2 || STOP.has(raw) || seen.has(raw)) continue;
    seen.add(raw);
    const base = raw.endsWith('s') && raw.length > 3 ? raw.slice(0, -1) : raw;     // snacks → snack, for the lookup only
    const syn = SYNONYMS[raw] || SYNONYMS[base] || [];
    groups.push([...new Set([raw, base, ...syn])].join(' '));
  }
  return groups;
}

/** A snippet from the database marks matches with << >> — split it so the screen can bold them safely (no HTML injection). */
export function snippetParts(snippet) {
  if (!snippet) return [];
  const out = [];
  let rest = String(snippet).replace(/\s+/g, ' ').trim();
  while (rest.length) {
    const open = rest.indexOf('<<');
    if (open === -1) { out.push({ text: rest, hit: false }); break; }
    if (open > 0) out.push({ text: rest.slice(0, open), hit: false });
    const close = rest.indexOf('>>', open + 2);
    if (close === -1) { out.push({ text: rest.slice(open + 2), hit: true }); break; }
    out.push({ text: rest.slice(open + 2, close), hit: true });
    rest = rest.slice(close + 2);
  }
  return out;
}
