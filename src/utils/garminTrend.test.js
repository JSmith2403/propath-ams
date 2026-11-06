import { describe, it, expect } from 'vitest';
import { trendOf, fmtHM, fmtDeltaHM, batteryBand } from './garminTrend';

describe('trendOf', () => {
  it('is null with no readings', () => {
    expect(trendOf([])).toBeNull();
    expect(trendOf([null, null])).toBeNull();
  });
  it('gives the value but no comparison until there are enough earlier days', () => {
    expect(trendOf([7.5, 7, 8])).toEqual({ value: 7.5, avg: null, delta: null, dir: null });
  });
  it('compares the newest reading with the earlier average, skipping missing days', () => {
    const t = trendOf([8.0, null, 7.0, 7.2, 6.8, 7.0]);
    expect(t.value).toBe(8);
    expect(t.avg).toBeCloseTo(7.0, 5);
    expect(t.delta).toBeCloseTo(1.0, 5);
    expect(t.dir).toBe('up');
  });
  it('calls a small change flat and a big drop down', () => {
    expect(trendOf([70, 60, 80, 70, 60, 80]).dir).toBe('flat');
    expect(trendOf([40, 70, 72, 69, 71, 70]).dir).toBe('down');
  });
});

describe('formatting', () => {
  it('formats hours and minute deltas', () => {
    expect(fmtHM(7.7)).toBe('7h 42m');
    expect(fmtHM(null)).toBe('–');
    expect(fmtDeltaHM(0.2)).toBe('+12m');
    expect(fmtDeltaHM(-0.3)).toBe('-18m');
    expect(fmtDeltaHM(1.1)).toBe('+1h 06m');
  });
  it('bands body battery', () => {
    expect([batteryBand(80), batteryBand(60), batteryBand(30), batteryBand(null)]).toEqual(['green', 'amber', 'red', null]);
  });
});
