import { describe, it, expect } from 'vitest';
import { matchTest, familyOf, protocolOf, TEST_INFO } from './testCatalog';
import { METRIC_MAP } from './sessionMetrics';

describe('matchTest — vertical pull (grip decides the test)', () => {
  it.each([
    ['Chin-up', 'chinUpMaxReps'],
    ['chin ups', 'chinUpMaxReps'],
    ['Chins', 'chinUpMaxReps'],
    ['underhand pull-up', 'chinUpMaxReps'],
    ['Wide grip pull-up', 'pullUpWideMaxReps'],
    ['wide pullups', 'pullUpWideMaxReps'],
    ['Narrow pull up', 'pullUpNarrowMaxReps'],
    ['close grip pull-ups', 'pullUpNarrowMaxReps'],
    ['Neutral grip pull-up', 'pullUpNeutralMaxReps'],
    ['hammer grip pullups', 'pullUpNeutralMaxReps'],
    ['neutral grip chin-up', 'pullUpNeutralMaxReps'],
    ['Overhand pull-up', 'pullUpMaxReps'],
  ])('%s → %s (exact)', (label, key) => {
    const m = matchTest(label);
    expect(m.key).toBe(key);
    expect(m.confidence).toBe('exact');
  });

  it('a bare "pull-up" is ambiguous and offers every variant — never silently one of them', () => {
    for (const label of ['Pull-up', 'pull ups', 'PullUps', 'Max pull-ups']) {
      const m = matchTest(label);
      expect(m.confidence).toBe('ambiguous');
      expect(m.candidates).toEqual(expect.arrayContaining(['chinUpMaxReps', 'pullUpMaxReps', 'pullUpWideMaxReps', 'pullUpNarrowMaxReps', 'pullUpNeutralMaxReps']));
    }
  });

  it('does not mistake an isometric mid-thigh pull for a pull-up', () => {
    expect(matchTest('Isometric mid-thigh pull').key).toBe('imtpPeakForce');
    expect(matchTest('IMTP').key).toBe('imtpPeakForce');
  });
});

describe('matchTest — everything else', () => {
  it.each([
    ['CMJ', 'cmjBilateral'],
    ['Countermovement Jump (cm)', 'cmjBilateral'],
    ['10-5 reactive hops', 'rsi105'],
    ['Bench press', 'benchPress3RM'],
    ['Back squat 3RM', 'backSquat3RM'],
    ['20m sprint', 'sprint20m'],
  ])('%s → %s', (label, key) => {
    expect(matchTest(label).key).toBe(key);
  });

  it('returns none for things it does not know, and for blanks', () => {
    expect(matchTest('Grip strength').confidence).toBe('none');
    expect(matchTest('').confidence).toBe('none');
    expect(matchTest(null).confidence).toBe('none');
  });
});

describe('catalogue integrity', () => {
  it('every test with a method is a real metric', () => {
    for (const key of Object.keys(TEST_INFO)) expect(METRIC_MAP[key], key).toBeTruthy();
  });
  it('every family variant is a real metric with a method written down', () => {
    for (const key of ['chinUpMaxReps', 'pullUpMaxReps', 'pullUpWideMaxReps', 'pullUpNarrowMaxReps', 'pullUpNeutralMaxReps']) {
      expect(METRIC_MAP[key], key).toBeTruthy();
      expect(protocolOf(key), key).toBeTruthy();
      expect(familyOf(key)?.key).toBe('verticalPullMaxReps');
    }
  });
});
