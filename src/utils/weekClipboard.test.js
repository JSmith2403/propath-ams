import { describe, it, expect } from 'vitest';
import { weekMondays, buildWeekClipboard, planPaste, pasteSpan } from './weekClipboard';

const ev = (id, date, name = 'S') => ({ is_planned: true, _planned_id: id, start_date: date, event_name: name });

describe('weekMondays', () => {
  it('lists every Monday between two picked weeks, either way round', () => {
    expect(weekMondays('2026-11-04', '2026-11-18')).toEqual(['2026-11-02', '2026-11-09', '2026-11-16']);
    expect(weekMondays('2026-11-18', '2026-11-04')).toEqual(['2026-11-02', '2026-11-09', '2026-11-16']);
  });
  it('is one week when both picks are in the same week', () => {
    expect(weekMondays('2026-11-03', '2026-11-08')).toEqual(['2026-11-02']);
  });
});

describe('buildWeekClipboard', () => {
  const events = [
    ev('a', '2026-11-02', 'Lower'),   // Mon wk1
    ev('b', '2026-11-05', 'Upper'),   // Thu wk1
    ev('c', '2026-11-10', 'Lower'),   // Tue wk2
    ev('d', '2026-11-16', 'Outside'), // wk3 — not picked
    ev('e', '2026-11-01', 'Before'),  // Sun before — not picked
    { is_planned: false, start_date: '2026-11-03', event_name: 'Competition' },
  ];
  it('keeps only planned sessions inside the picked weeks, with their offset from the first Monday', () => {
    const clip = buildWeekClipboard(events, '2026-11-02', '2026-11-09', { athleteId: 'x', athleteName: 'Maggie' });
    expect(clip.weeks).toBe(2);
    expect(clip.startISO).toBe('2026-11-02');
    expect(clip.sourceAthleteName).toBe('Maggie');
    expect(clip.items.map(i => [i.plannedId, i.offsetDays])).toEqual([['a', 0], ['b', 3], ['c', 8]]);
  });
  it('is empty (not an error) when the weeks have no sessions', () => {
    expect(buildWeekClipboard([], '2026-11-02', '2026-11-02').items).toEqual([]);
  });
});

describe('planPaste', () => {
  const clip = buildWeekClipboard([ev('a', '2026-11-02'), ev('b', '2026-11-05'), ev('c', '2026-11-10')], '2026-11-02', '2026-11-09');
  it('lands each session on the same weekday, same gap apart, from any day in the target week', () => {
    expect(planPaste(clip, '2026-12-16').map(p => [p.plannedId, p.targetDateISO]))
      .toEqual([['a', '2026-12-14'], ['b', '2026-12-17'], ['c', '2026-12-22']]);
  });
  it('reports the span of the pasted weeks', () => {
    expect(pasteSpan(clip, '2026-12-16')).toEqual({ startISO: '2026-12-14', endISO: '2026-12-27' });
  });
  it('crosses month and year boundaries', () => {
    expect(planPaste(clip, '2026-12-28').map(p => p.targetDateISO)).toEqual(['2026-12-28', '2026-12-31', '2027-01-05']);
  });
});
