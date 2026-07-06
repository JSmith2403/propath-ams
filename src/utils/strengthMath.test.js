import { describe, it, expect } from 'vitest';
import { mayhew1RM, bestE1RM, roundKg } from './strengthMath';

describe('mayhew1RM', () => {
  it('returns the weight itself for a single rep', () => {
    expect(mayhew1RM(100, 1)).toBe(100);
  });

  it('estimates above the lifted weight for multi-rep sets', () => {
    const e = mayhew1RM(100, 5);
    expect(e).toBeGreaterThan(100);
    expect(e).toBeLessThan(130); // sane ceiling for 5 reps
  });

  it('estimates increase with rep count at the same weight', () => {
    expect(mayhew1RM(80, 8)).toBeGreaterThan(mayhew1RM(80, 3));
  });

  it('rejects reps outside the reliable 1-12 range', () => {
    expect(mayhew1RM(100, 13)).toBeNull();
    expect(mayhew1RM(100, 0)).toBeNull();
  });

  it('rejects junk input', () => {
    expect(mayhew1RM('abc', 5)).toBeNull();
    expect(mayhew1RM(-50, 5)).toBeNull();
    expect(mayhew1RM(null, 5)).toBeNull();
  });
});

describe('bestE1RM', () => {
  it('picks the highest estimate across sets', () => {
    const sets = [
      { weight_kg: 100, reps: 1 },  // e1RM = 100
      { weight_kg: 95,  reps: 5 },  // e1RM > 100
    ];
    expect(bestE1RM(sets)).toBeGreaterThan(100);
  });

  it('returns null when no set is usable', () => {
    expect(bestE1RM([{ weight_kg: null, reps: 5 }])).toBeNull();
    expect(bestE1RM([])).toBeNull();
  });
});

describe('roundKg', () => {
  it('rounds to one decimal', () => {
    expect(roundKg(102.34)).toBe(102.3);
    expect(roundKg(102.35)).toBe(102.4);
  });

  it('passes null / non-finite through as null', () => {
    expect(roundKg(null)).toBeNull();
    expect(roundKg(Infinity)).toBeNull();
  });
});
