import { describe, it, expect } from 'vitest';
import { plannedStats, missedSessions, programmingRunway, dayAttendance, buildAttention, rowVerdict, CHIPS } from './weekBoard';

describe('plannedStats', () => {
  it('counts a planned session as done only when a completed log is linked to it', () => {
    const planned = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    expect(plannedStats(planned, [{ planned_session_id: 'a' }, { planned_session_id: null }, { planned_session_id: 'zzz' }])).toEqual({ planned: 3, done: 1 });
    expect(plannedStats([], [])).toEqual({ planned: 0, done: 0 });
    expect(plannedStats(null, null)).toEqual({ planned: 0, done: 0 });
  });
});

describe('missedSessions', () => {
  const today = '2026-11-04';
  it('finds planned sessions from the last 3 days with nothing logged', () => {
    const planned = [
      { id: '1', planned_date: '2026-11-03' }, { id: '2', planned_date: '2026-11-02' },
      { id: '3', planned_date: '2026-10-30' },   // too old
      { id: '4', planned_date: '2026-11-04' },   // today is not missed yet
      { id: '5', planned_date: '2026-11-03', attendance: 'not_attending' },
    ];
    expect(missedSessions(planned, [{ planned_session_id: '2' }], today).map(p => p.id)).toEqual(['1']);
  });
});

describe('programmingRunway', () => {
  const today = '2026-11-04';
  it('none when nothing is planned after today', () => {
    expect(programmingRunway(['2026-11-03', '2026-11-04'], today)).toMatchObject({ state: 'none', last: '2026-11-04' });
    expect(programmingRunway([], today)).toMatchObject({ state: 'none', last: null });
  });
  it('short when the last session is within 7 days, ok beyond', () => {
    expect(programmingRunway(['2026-11-05', '2026-11-11'], today)).toMatchObject({ state: 'short', days: 7 });
    expect(programmingRunway(['2026-11-12'], today)).toMatchObject({ state: 'ok', days: 8 });
  });
});

describe('dayAttendance', () => {
  const athletes = [{ id: 'a', cohort: 'Elite' }, { id: 'b', cohort: 'Elite' }, { id: 'c', cohort: 'Mini' }];
  const slots = [
    { id: 's1', slot_date: '2026-11-04', start_time: '16:00:00', cohorts: [] },
    { id: 's2', slot_date: '2026-11-04', start_time: '17:00:00', cohorts: ['Elite'] },
    { id: 's3', slot_date: '2026-11-05', start_time: '16:00:00', cohorts: ['Mini'] },
  ];
  const responses = [
    { slot_id: 's1', athlete_id: 'a', status: 'attending' },
    { slot_id: 's1', athlete_id: 'b', status: 'not_attending', note: '__other__' },   // chose the other session
    { slot_id: 's2', athlete_id: 'b', status: 'attending' },
  ];
  it('lists who is attending, and who has not answered', () => {
    const [d1, d2, d3] = dayAttendance(slots, responses, athletes, ['2026-11-04', '2026-11-05', '2026-11-06']);
    expect(d1.attending.sort()).toEqual(['a', 'b']);
    expect(d1.pending).toEqual(['c']);
    expect(d1.notComing).toEqual([]);
    expect(d2.pending).toEqual(['c']);      // the Thursday slot only applies to Mini
    expect(d3.hasSlots).toBe(false);
    expect(d3.pending).toEqual([]);
  });
});

const row = (over = {}) => ({
  id: 'x', name: 'Test A.', programmingActive: true,
  checkIn: { state: 'green', expected: true, pain: false, flagged: [], streak: 0 },
  runway: { state: 'ok', last: '2026-11-20', days: 16 }, missed: 0, watch: { state: 'ok' }, timetablePending: false, ...over,
});

describe('rowVerdict', () => {
  it('puts pain first, then programme, and is on track otherwise', () => {
    expect(rowVerdict(row({ checkIn: { state: 'red', pain: true, flagged: [], expected: true } }))).toEqual({ label: 'Pain reported', tone: 'act' });
    expect(rowVerdict(row({ runway: { state: 'none', last: null, days: 0 } })).label).toBe('Needs programme');
    expect(rowVerdict(row({ missed: 1 })).label).toBe('Missed a session');
    expect(rowVerdict(row({ runway: { state: 'short', last: '2026-11-05', days: 1 } })).label).toBe('Programme ends Thu');
    expect(rowVerdict(row({ checkIn: { state: 'none', expected: true, streak: 3, flagged: [] } })).label).toBe('No check-in, 3 days');
    expect(rowVerdict(row()).tone).toBe('go');
  });
});

describe('buildAttention', () => {
  it('groups chases, lists pain individually, and orders red before amber before grey', () => {
    const rows = [
      row({ id: '1', name: 'Zara B.', checkIn: { state: 'red', pain: true, flagged: [], expected: true } }),
      row({ id: '2', name: 'Yusuf A.', runway: { state: 'none', last: null, days: 0 } }),
      row({ id: '3', name: 'Jack T.', checkIn: { state: 'none', expected: true, flagged: [], streak: 2 } }),
      row({ id: '4', name: 'Lina H.', checkIn: { state: 'none', expected: true, flagged: [], streak: 1 }, timetablePending: true }),
    ];
    const items = buildAttention(rows, { hourUAE: 10 });
    expect(items.map(i => i.id)).toEqual(['flag:1', 'prog:none', 'chase', 'timetable']);
    expect(items.find(i => i.id === 'chase').ids).toEqual(['3', '4']);
    expect(items[0].what).toMatch(/pain/i);
  });
  it('does not chase check-ins before the morning cut-off', () => {
    const rows = [row({ checkIn: { state: 'none', expected: true, flagged: [], streak: 1 } })];
    expect(buildAttention(rows, { hourUAE: 7 })).toEqual([]);
  });
  it('ignores athletes who do not expect check-ins or programming', () => {
    const rows = [row({ programmingActive: false, runway: { state: 'none', last: null, days: 0 }, checkIn: { state: 'none', expected: false, flagged: [], streak: 5 } })];
    expect(buildAttention(rows, { hourUAE: 12 })).toEqual([]);
  });
});

describe('CHIPS', () => {
  it('each chip picks out the right rows', () => {
    const r = row({ missed: 2 });
    expect(CHIPS.find(c => c.key === 'missed').test(r)).toBe(true);
    expect(CHIPS.find(c => c.key === 'programme').test(r)).toBe(false);
  });
});
