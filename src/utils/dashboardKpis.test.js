import { describe, it, expect } from 'vitest';
import { buildInsights, buildKpis } from './dashboardKpis';

const row = (over = {}) => ({
  checkIn: { expected: true, state: 'green' }, programmingActive: true, runway: { state: 'ok' }, garmin: null, ...over,
});

describe('buildKpis', () => {
  it('counts athletes, programme gaps, check-ins and compliance', () => {
    const rows = [row(), row({ checkIn: { expected: true, state: 'none' } }), row({ runway: { state: 'none' } }), row({ checkIn: { expected: false, state: 'none' } })];
    const k = buildKpis(rows, { sessionsToday: { planned: 4, done: 3 } });
    expect(k).toMatchObject({ total: 4, needProgramming: 1, needCheckIn: 1, wellness: { done: 2, expected: 3 }, wellnessPct: 67, sessionsPct: 75 });
  });
  it('has no percentages when there is nothing to divide by', () => {
    expect(buildKpis([], {})).toMatchObject({ sessionsPct: null, wellnessPct: null });
  });
});

describe('buildInsights', () => {
  const garmin = (sleep, kcal, hrvDir) => ({
    series: { sleep, kcal }, hrv: hrvDir ? { dir: hrvDir } : null,
  });
  const flat = (n) => Array(7).fill(n);
  it('compares this week with last week across the squad', () => {
    const rows = [row({ garmin: garmin([...flat(8), ...flat(6.4)], [...flat(3000), ...flat(3300)], 'down') })];
    const texts = buildInsights(rows).map(i => i.text);
    expect(texts).toContain('Sleep down 20% vs last week');
    expect(texts).toContain('Active calories up 10% vs last week');
    expect(texts).toContain('1 athlete’s HRV is below their usual');
  });
  it('says nothing about the watch when there is no watch data', () => {
    const texts = buildInsights([row(), row({ checkIn: { expected: true, state: 'none' } })]).map(i => i.text);
    expect(texts).toEqual(['1 of 2 checked in today']);
  });
});
