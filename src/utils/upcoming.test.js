import { describe, it, expect } from 'vitest';
import { upcomingBirthdays, upcomingEvents, mergeUpcoming, fmtUpcomingDate } from './upcoming';

describe('upcomingBirthdays', () => {
  const today = '2026-11-06';
  const athletes = [
    { id: 'a', name: 'Ava', dob: '2010-11-10' },
    { id: 'b', name: 'Ben', dob: '2012-11-06' },        // today
    { id: 'c', name: 'Cal', dob: '2011-11-21' },        // 15 days: outside
    { id: 'd', name: 'Dee', dob: '2009-01-02' },
    { id: 'e', name: 'Eve', dob: '' },
  ];
  it('lists birthdays in the next 14 days with the age they turn', () => {
    expect(upcomingBirthdays(athletes, today).map(b => [b.name, b.date, b.turning])).toEqual([['Ben', '2026-11-06', 14], ['Ava', '2026-11-10', 16]]);
  });
  it('rolls over the new year', () => {
    expect(upcomingBirthdays(athletes, '2026-12-25').map(b => [b.name, b.date, b.turning])).toEqual([['Dee', '2027-01-02', 18]]);
  });
  it('puts a 29 Feb birthday on 28 Feb in a year without one', () => {
    expect(upcomingBirthdays([{ id: 'x', name: 'Leap', dob: '2008-02-29' }], '2027-02-20')[0].date).toBe('2027-02-28');
  });
});

describe('upcomingEvents', () => {
  const today = '2026-11-06';
  const events = [
    { id: '1', event_name: 'Cup final', event_type: 'competition', start_date: '2026-11-08', end_date: '2026-11-08', athlete_id: 'a' },
    { id: '2', event_name: 'Camp', event_type: 'training_camp', start_date: '2026-11-04', end_date: '2026-11-09', is_team_event: true },   // already running
    { id: '3', event_name: 'Too far', event_type: 'testing', start_date: '2026-12-30' },
    { id: '4', event_name: 'Over', event_type: 'testing', start_date: '2026-11-01', end_date: '2026-11-03' },
  ];
  it('keeps events starting soon or already running, soonest first', () => {
    const out = upcomingEvents(events, today);
    expect(out.map(e => e.name)).toEqual(['Camp', 'Cup final']);
    expect(out[0]).toMatchObject({ date: today, team: true });
  });
});

describe('mergeUpcoming and fmtUpcomingDate', () => {
  it('orders by date, events before birthdays on the same day', () => {
    const m = mergeUpcoming([{ kind: 'event', date: '2026-11-08', name: 'E' }], [{ kind: 'birthday', date: '2026-11-08', name: 'B' }, { kind: 'birthday', date: '2026-11-07', name: 'A' }]);
    expect(m.map(x => x.name)).toEqual(['A', 'E', 'B']);
  });
  it('says Today and Tomorrow', () => {
    expect(fmtUpcomingDate('2026-11-06', '2026-11-06')).toBe('Today');
    expect(fmtUpcomingDate('2026-11-07', '2026-11-06')).toBe('Tomorrow');
  });
});
