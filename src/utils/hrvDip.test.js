import { describe, it, expect } from 'vitest';
import { hrvDip } from './hrvDip';

const today = '2026-11-10';
const day = (n) => { const d = new Date('2026-11-10T12:00:00'); d.setDate(d.getDate() - n); return d.toLocaleDateString('en-CA'); };
// 14 earlier nights hovering around 70
const baseline = (n = 14) => Array.from({ length: n }, (_, i) => ({ day: day(i + 1), hrv_last_night: 70 + (i % 2 ? 4 : -4) }));

describe('hrvDip', () => {
  it('flags last night when it is more than one SD below their 14-day average', () => {
    const r = hrvDip([{ day: today, hrv_last_night: 55 }, ...baseline()], today);
    expect(r.dip).toBe(true);
    expect(Math.round(r.mean)).toBe(70);
  });
  it('does not flag a normal or high night', () => {
    expect(hrvDip([{ day: today, hrv_last_night: 68 }, ...baseline()], today).dip).toBe(false);
    expect(hrvDip([{ day: today, hrv_last_night: 90 }, ...baseline()], today).dip).toBe(false);
  });
  it('needs at least 7 earlier readings', () => {
    expect(hrvDip([{ day: today, hrv_last_night: 40 }, ...baseline(6)], today).dip).toBe(false);
    expect(hrvDip([{ day: today, hrv_last_night: 40 }, ...baseline(7)], today).dip).toBe(true);
  });
  it('uses yesterday\'s reading if the watch has not synced today, but nothing older', () => {
    expect(hrvDip([{ day: day(1), hrv_last_night: 50 }, ...baseline(14).slice(1)], today).dip).toBe(true);
    expect(hrvDip([{ day: day(3), hrv_last_night: 50 }, ...baseline(14).slice(2)], today).dip).toBe(false);
  });
  it('copes with nothing, gaps and identical readings', () => {
    expect(hrvDip([], today).dip).toBe(false);
    expect(hrvDip(null, today).dip).toBe(false);
    const flat = Array.from({ length: 10 }, (_, i) => ({ day: day(i + 1), hrv_last_night: 70 }));
    expect(hrvDip([{ day: today, hrv_last_night: 60 }, ...flat], today).dip).toBe(false);   // no spread to measure against
  });
});
