import { describe, it, expect } from 'vitest';
import { summariseCheckIn, SLEEP_HOURS_LABEL, MENTAL_STRESS_LABEL } from './checkIn';

const lib = [
  { id: 'sleep', label: SLEEP_HOURS_LABEL, question_type: 'number', direction: 'higher_better', rag_thresholds: { green_boundary: 7, amber_boundary: 6 } },
  { id: 'stress', label: MENTAL_STRESS_LABEL, question_type: 'slider', direction: 'lower_better', rag_thresholds: { green_boundary: 2, amber_boundary: 5 } },
  { id: 'sore', label: 'How sore do you feel today?', question_type: 'slider', direction: 'lower_better', rag_thresholds: { green_boundary: 2, amber_boundary: 5 } },
  { id: 'pain', label: 'Do you have any pain or symptoms today?', question_type: 'yes_no', direction: 'no_better', rag_thresholds: {} },
  { id: 'painscale', label: 'If yes, pain scale today', question_type: 'number', direction: 'lower_better', rag_thresholds: {} },
  { id: 'cycle', label: 'How significantly are menstrual or cycle-related symptoms affecting your training today?', question_type: 'slider', direction: 'lower_better', rag_thresholds: { green_boundary: 2, amber_boundary: 5 } },
];

describe('summariseCheckIn', () => {
  it('is grey when there is nothing to rate', () => {
    expect(summariseCheckIn(null, lib).rag).toBe('grey');
    expect(summariseCheckIn({}, lib).rag).toBe('grey');
    expect(summariseCheckIn({ painscale: 3 }, lib).rag).toBe('grey');   // no thresholds → not rated
  });

  it('takes the worst rated answer and lists what was flagged, worst first', () => {
    const s = summariseCheckIn({ sleep: 6.5, stress: 1, sore: 7 }, lib);
    expect(s.rag).toBe('red');
    expect(s.flagged.map(f => f.rag)).toEqual(['red', 'amber']);
    expect(s.rated).toBe(3);
  });

  it('is green when every rated answer is fine', () => {
    expect(summariseCheckIn({ sleep: 8, stress: 2, pain: 'no' }, lib).rag).toBe('green');
  });

  it('a "yes" to pain is red on its own', () => {
    expect(summariseCheckIn({ sleep: 9, stress: 1, pain: 'yes' }, lib).rag).toBe('red');
  });

  it('reads hours slept and mental stress, tolerating strings', () => {
    const s = summariseCheckIn({ sleep: '7.5', stress: '3' }, lib);
    expect(s.sleepHours).toBe(7.5);
    expect(s.stress).toBe(3);
  });

  it('never lets the cycle question show up or colour the result', () => {
    const s = summariseCheckIn({ cycle: 7, sleep: 8 }, lib);
    expect(s.rag).toBe('green');
    expect(s.flagged).toEqual([]);
    expect(s.rated).toBe(1);
  });

  it('ignores answers to questions that are no longer in the library', () => {
    expect(summariseCheckIn({ gone: 7 }, lib).rag).toBe('grey');
  });

  it('accepts a Map for the library', () => {
    expect(summariseCheckIn({ sleep: 5 }, new Map(lib.map(q => [q.id, q]))).rag).toBe('red');
  });
});
