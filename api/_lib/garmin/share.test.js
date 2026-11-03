import { describe, it, expect } from 'vitest';
import { cleanShare, DEFAULT_SHARE } from './share.js';

describe('cleanShare', () => {
  it('defaults: everything on except women’s health', () => {
    expect(cleanShare(undefined)).toEqual({ sleep: true, stress: true, body_battery: true, vitals: true, fitness: true, womens_health: false });
    expect(DEFAULT_SHARE.womens_health).toBe(false);
  });
  it('takes real booleans', () => {
    expect(cleanShare({ sleep: false, stress: false, body_battery: true, vitals: false, fitness: false, womens_health: true }))
      .toEqual({ sleep: false, stress: false, body_battery: true, vitals: false, fitness: false, womens_health: true });
  });
  it('ignores junk and unknown keys — never turns women’s health on by accident', () => {
    expect(cleanShare({ womens_health: 'yes', sleep: 'no', extra: true, stress: 1, vitals: 'false' })).toEqual(DEFAULT_SHARE);
    expect(cleanShare('x')).toEqual(DEFAULT_SHARE);
    expect(cleanShare(null)).toEqual(DEFAULT_SHARE);
  });
});
