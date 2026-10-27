/**
 * Test catalogue — HOW each test is done, so results stay comparable.
 *
 * The rule: if two tests differ in method they are different tests, each with its own key and its own
 * trend. A chin-up (underhand grip) is not a pull-up (overhand), and a wide pull-up is not a narrow one,
 * even though all of them are "max reps on the bar". Merging them would make progress look better or worse
 * than it is.
 *
 * This file adds, on top of the metric list in sessionMetrics.js:
 *   TEST_INFO      the method for a test (shown wherever it's chosen) + the names people call it
 *   TEST_FAMILIES  tests that are the same movement done differently — the sheet builder makes you pick one
 *   matchTest()    turns text from an upload ("wide pullups") into a test, saying plainly when it can't be sure
 *
 * !! The method wording below is a DRAFT written from common practice. Edit it to match how your
 * academy actually runs each test — it's the one place that decides what "the same test" means.
 */

export const TEST_INFO = {
  cmjBilateral: {
    protocol: 'Countermovement jump on the force plates, both feet, hands on hips. Jump as high as possible. Best of 3.',
    aliases: ['cmj', 'countermovement jump', 'counter movement jump', 'vertical jump', 'cmj bilateral', 'jump height'],
  },
  imtpPeakForce: {
    protocol: 'Isometric mid-thigh pull on the force plates, bar fixed at mid-thigh. Pull as hard and fast as possible. Peak force.',
    aliases: ['imtp', 'isometric mid thigh pull', 'mid thigh pull', 'imtp peak force'],
  },
  rsi105: {
    protocol: '10-5 repeated hops, hands on hips, minimal ground contact. RSI from the best 5 of 10 hops.',
    aliases: ['10 5', '10/5', '10-5', 'reactive hops', 'reactive hop', 'repeated hops', 'rsi', 'hop test'],
  },
  backSquat3RM: {
    protocol: 'Barbell back squat to thighs parallel. Heaviest successful set of 3 reps, or estimated from a heavier set of 3–8.',
    aliases: ['back squat', 'back squat 3rm', 'squat 3rm', 'squat'],
  },
  benchPress3RM: {
    protocol: 'Flat barbell bench press, bar touches chest, no bounce. Heaviest successful set of 3 reps, or estimated from a heavier set of 3–8.',
    aliases: ['bench', 'bench press', 'bench press 3rm', 'bench 3rm'],
  },
  chinUpMaxReps: {
    protocol: 'Chin-up: underhand (supinated) grip, hands shoulder-width. Start from a dead hang, chin over the bar. No kipping. Max reps.',
    aliases: ['chin up', 'chin ups', 'chinup', 'chinups', 'chins', 'chin-up', 'supinated pull up', 'underhand pull up'],
  },
  pullUpMaxReps: {
    protocol: 'Pull-up: overhand (pronated) grip, hands shoulder-width. Start from a dead hang, chin over the bar. No kipping. Max reps.',
    aliases: ['pull up', 'pull ups', 'pullup', 'pullups', 'pull-up', 'overhand pull up', 'pronated pull up'],
  },
  pullUpWideMaxReps: {
    protocol: 'Wide pull-up: overhand grip, hands clearly wider than the shoulders. Dead hang to chin over the bar. No kipping. Max reps.',
    aliases: ['wide pull up', 'wide pullup', 'wide grip pull up', 'wide pull ups'],
  },
  pullUpNarrowMaxReps: {
    protocol: 'Narrow pull-up: overhand grip, hands closer than the shoulders. Dead hang to chin over the bar. No kipping. Max reps.',
    aliases: ['narrow pull up', 'narrow pullup', 'close grip pull up', 'close pull up', 'narrow grip pull up'],
  },
  pullUpNeutralMaxReps: {
    protocol: 'Neutral-grip pull-up: palms facing each other (parallel handles). Dead hang to chin over the bar. No kipping. Max reps.',
    aliases: ['neutral grip pull up', 'neutral pull up', 'neutral pullup', 'hammer grip pull up', 'parallel grip pull up', 'neutral chin up'],
  },
  sprint10m: { protocol: '10m sprint from a standing start, timing gates at 0 and 10m. Best of 3.', aliases: ['10m', '10 m sprint', '10m sprint', '10 metre sprint'] },
  sprint20m: { protocol: '20m sprint from a standing start, timing gates at 0 and 20m. Best of 3.', aliases: ['20m', '20 m sprint', '20m sprint', '20 metre sprint'] },
  sprint40m: { protocol: '40m sprint from a standing start, timing gates at 0 and 40m. Best of 3.', aliases: ['40m', '40 m sprint', '40m sprint', '40 metre sprint'] },
};

/** Same movement, different method — pick the variant, never "pull-up" on its own. */
export const TEST_FAMILIES = [
  {
    key: 'verticalPullMaxReps',
    label: 'Vertical pull — max reps',
    note: 'Grip changes what is being measured. Pick the exact one.',
    variants: [
      { key: 'chinUpMaxReps',        short: 'Chin-up (underhand)' },
      { key: 'pullUpMaxReps',        short: 'Pull-up (overhand)' },
      { key: 'pullUpWideMaxReps',    short: 'Pull-up — wide' },
      { key: 'pullUpNarrowMaxReps',  short: 'Pull-up — narrow' },
      { key: 'pullUpNeutralMaxReps', short: 'Pull-up — neutral grip' },
    ],
  },
  {
    key: 'sprint',
    label: 'Sprint — distance',
    note: 'Timing method (gates vs hand) should stay the same for a trend to mean anything.',
    variants: [
      { key: 'sprint10m', short: '10 m' },
      { key: 'sprint20m', short: '20 m' },
      { key: 'sprint40m', short: '40 m' },
    ],
  },
];

export const familyOf = (metricKey) => TEST_FAMILIES.find(f => f.variants.some(v => v.key === metricKey)) || null;
export const protocolOf = (metricKey) => TEST_INFO[metricKey]?.protocol || null;

// ── matching free text to a test ───────────────────────────────────────────
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9/\s-]/g, ' ').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
const has = (text, words) => words.some(w => new RegExp(`(^|\\s)${w}(s|ups|up)?(\\s|$)`).test(text));

/**
 * Turn a label from a sheet / photo / pasted text into one of our tests.
 *   → { key, confidence: 'exact' | 'likely' | 'ambiguous' | 'none', candidates: [keys] }
 *
 * 'exact'     the wording points at exactly one test.
 * 'likely'    close, but worth a glance.
 * 'ambiguous' it could be several tests that differ in method (e.g. just "pull-up") — the upload screen
 *             must ask which, never guess silently. `key` holds the usual default, `candidates` the options.
 */
export function matchTest(label, metricKeys = Object.keys(TEST_INFO)) {
  const t = norm(label);
  if (!t) return { key: null, confidence: 'none', candidates: [] };

  // Vertical pull: decide on the grip words, not on fuzzy similarity.
  const pull = /(^|\s)(pull|chin)(\s|$)|pullup|chinup/.test(t.replace(/(pull|chin)\s?ups?/g, '$1 up'));
  if (pull && !/thigh|imtp|isometric/.test(t)) {
    const wide = has(t, ['wide']);
    const narrow = has(t, ['narrow', 'close']);
    const neutral = has(t, ['neutral', 'hammer', 'parallel']);
    const chin = /chin/.test(t) || has(t, ['underhand', 'supinated']);
    const isPull = /pull/.test(t) || has(t, ['overhand', 'pronated']);
    if (chin && !neutral && !wide && !narrow) return { key: 'chinUpMaxReps', confidence: 'exact', candidates: ['chinUpMaxReps'] };
    if (wide)    return { key: 'pullUpWideMaxReps',    confidence: 'exact', candidates: ['pullUpWideMaxReps'] };
    if (narrow)  return { key: 'pullUpNarrowMaxReps',  confidence: 'exact', candidates: ['pullUpNarrowMaxReps'] };
    if (neutral) return { key: 'pullUpNeutralMaxReps', confidence: 'exact', candidates: ['pullUpNeutralMaxReps'] };
    if (isPull && has(t, ['overhand', 'pronated'])) return { key: 'pullUpMaxReps', confidence: 'exact', candidates: ['pullUpMaxReps'] };
    if (isPull) {
      // "pull-up" with no grip stated — exactly the case that wrecks consistency.
      return { key: 'pullUpMaxReps', confidence: 'ambiguous', candidates: familyOf('pullUpMaxReps').variants.map(v => v.key) };
    }
  }

  // Everything else: the longest alias contained in the text wins; ties between tests = ambiguous.
  let best = []; let bestLen = 0;
  for (const key of metricKeys) {
    for (const alias of TEST_INFO[key]?.aliases || []) {
      const a = norm(alias);
      if (!a) continue;
      const hit = t === a || new RegExp(`(^|\\s)${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`).test(t);
      if (!hit) continue;
      if (a.length > bestLen) { best = [key]; bestLen = a.length; } else if (a.length === bestLen && !best.includes(key)) best.push(key);
    }
  }
  if (best.length === 1) return { key: best[0], confidence: t === norm(TEST_INFO[best[0]].aliases.find(x => norm(x) === t) || '') ? 'exact' : 'likely', candidates: best };
  if (best.length > 1) return { key: best[0], confidence: 'ambiguous', candidates: best };
  return { key: null, confidence: 'none', candidates: [] };
}
