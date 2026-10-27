import { describe, it, expect } from 'vitest';
import { bestPerDay, withBaseMetrics, BASE_KEYS } from './progressBase';

describe('bestPerDay', () => {
  it('keeps the best value of each day, oldest first', () => {
    const out = bestPerDay([
      { date: '2026-10-22', value: 34.1 }, { date: '2026-10-22', value: 36.4 }, { date: '2026-02-04T09:00:00Z', value: 34.6 },
    ]);
    expect(out.map(e => [e.date, e.value])).toEqual([['2026-02-04', 34.6], ['2026-10-22', 36.4]]);
  });

  it('a tested result beats an automatic estimate the same day — even a lower one', () => {
    const out = bestPerDay([
      { date: '2026-06-01', value: 120, source: 'estimate' },
      { date: '2026-06-01', value: 110, source: 'manual' },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].value).toBe(110);
    expect(out[0].source).toBe('manual');
  });

  it('is order-independent, and an estimate alone still counts', () => {
    const a = bestPerDay([{ date: '2026-06-01', value: 110, source: 'manual' }, { date: '2026-06-01', value: 120, source: 'estimate' }]);
    expect(a[0].value).toBe(110);
    expect(bestPerDay([{ date: '2026-06-02', value: 90, source: 'estimate' }])[0].value).toBe(90);
  });

  it('ignores blanks', () => {
    expect(bestPerDay([{ date: '2026-06-01', value: null }, { date: '2026-06-02' }])).toEqual([]);
  });
});

describe('withBaseMetrics', () => {
  it('puts the six base tests first, then the athlete extras without duplicates', () => {
    const keys = withBaseMetrics(['hamstring90', 'cmjBilateral', 'sprint10m']);
    expect(keys.slice(0, 6)).toEqual(['cmjBilateral', 'imtpPeakForce', 'rsi105', 'backSquat3RM', 'benchPress3RM', 'chinUpMaxReps']);
    expect(keys.slice(6)).toEqual(['hamstring90', 'sprint10m']);
    expect([...BASE_KEYS]).toHaveLength(6);
  });
});
