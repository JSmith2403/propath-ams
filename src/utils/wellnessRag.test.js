import { describe, it, expect } from 'vitest';
import { getRagColour, validateThresholds, defaultThresholds } from './wellnessRag';

const slider = (direction, th) => ({
  question_type: 'slider_1_7',
  direction,
  rag_thresholds: th,
});

describe('getRagColour', () => {
  it('higher_better: green at/above green boundary, amber between, red below', () => {
    const q = slider('higher_better', { green_boundary: 6, amber_boundary: 3 });
    expect(getRagColour(7, q)).toBe('green');
    expect(getRagColour(6, q)).toBe('green');
    expect(getRagColour(4, q)).toBe('amber');
    expect(getRagColour(2, q)).toBe('red');
  });

  it('lower_better: green at/below green boundary, amber between, red above', () => {
    const q = slider('lower_better', { green_boundary: 2, amber_boundary: 5 });
    expect(getRagColour(1, q)).toBe('green');
    expect(getRagColour(2, q)).toBe('green');
    expect(getRagColour(4, q)).toBe('amber');
    expect(getRagColour(6, q)).toBe('red');
  });

  it('yes/no maps by direction', () => {
    const q = { question_type: 'yes_no', direction: 'no_better' };
    expect(getRagColour('no', q)).toBe('green');
    expect(getRagColour('yes', q)).toBe('red');
    expect(getRagColour('maybe', q)).toBeNull();
  });

  it('returns null for unrateable input', () => {
    expect(getRagColour(null, slider('higher_better', { green_boundary: 6, amber_boundary: 3 }))).toBeNull();
    expect(getRagColour(5, { question_type: 'text' })).toBeNull();
    expect(getRagColour('not-a-number', slider('higher_better', { green_boundary: 6, amber_boundary: 3 }))).toBeNull();
    expect(getRagColour(5, slider('higher_better', null))).toBeNull();
  });
});

describe('validateThresholds', () => {
  const range = { direction: 'higher_better', min: 1, max: 7 };

  it('accepts a valid higher_better pair', () => {
    expect(validateThresholds({ green_boundary: 6, amber_boundary: 3 }, range).ok).toBe(true);
  });

  it('rejects amber >= green for higher_better', () => {
    expect(validateThresholds({ green_boundary: 3, amber_boundary: 6 }, range).ok).toBe(false);
  });

  it('rejects out-of-range boundaries', () => {
    expect(validateThresholds({ green_boundary: 9, amber_boundary: 3 }, range).ok).toBe(false);
  });

  it('rejects missing values', () => {
    expect(validateThresholds({ green_boundary: null, amber_boundary: 3 }, range).ok).toBe(false);
  });
});

describe('defaultThresholds', () => {
  it('gives slider defaults matching direction', () => {
    expect(defaultThresholds({ question_type: 'slider_1_7', direction: 'higher_better' }))
      .toEqual({ green_boundary: 6, amber_boundary: 3 });
    expect(defaultThresholds({ question_type: 'slider_1_7', direction: 'lower_better' }))
      .toEqual({ green_boundary: 2, amber_boundary: 5 });
  });

  it('returns empty for arbitrary numeric questions', () => {
    expect(defaultThresholds({ question_type: 'number', label: 'Pain (0-10)' })).toEqual({});
  });
});
