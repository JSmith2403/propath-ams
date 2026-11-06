import { describe, it, expect } from 'vitest';
import { parseExerciseLine, parseWeekText, placeOnDates } from './weekProgrammeText';

const WEEK = `Monday
   * Hang Clean – 4 x 3
   * Back Squat – 3 x 5
   * Chin-up – 3 x 6-8
   * Nordic Hamstring (assisted) – 2 x 4-5
   * Standing Calf Raise – 3 x 12
   * Deadbug – 2 x 10 each side
Wednesday
   * Hang Snatch – 4 x 3
   * Bulgarian Split Squat – 3 x 6 each leg
   * Bench Press – 3 x 6
Friday
   * Box Jump – 4 x 3
   * Romanian Deadlift – 3 x 6
   * Hanging Knee Raise – 2 x 10`;

describe('parseExerciseLine', () => {
  it('reads name, sets, reps and a trailing note', () => {
    expect(parseExerciseLine('Hang Clean – 4 x 3')).toEqual({ name: 'Hang Clean', sets: 4, reps: '3', note: '' });
    expect(parseExerciseLine('Chin-up – 3 x 6-8')).toEqual({ name: 'Chin-up', sets: 3, reps: '6-8', note: '' });
    expect(parseExerciseLine('Nordic Hamstring (assisted) – 2 x 4–5')).toEqual({ name: 'Nordic Hamstring (assisted)', sets: 2, reps: '4-5', note: '' });
    expect(parseExerciseLine('Deadbug – 2 x 10 each side')).toEqual({ name: 'Deadbug', sets: 2, reps: '10', note: 'each side' });
    expect(parseExerciseLine('Bulgarian Split Squat – 3 x 6 each leg').note).toBe('each leg');
  });
  it('accepts other separators and no separator', () => {
    expect(parseExerciseLine('Bench Press: 3x6')).toMatchObject({ name: 'Bench Press', sets: 3, reps: '6' });
    expect(parseExerciseLine('Box Jump 4 x 3')).toMatchObject({ name: 'Box Jump', sets: 4, reps: '3' });
    expect(parseExerciseLine('Push Press - 3 × 5')).toMatchObject({ name: 'Push Press', sets: 3, reps: '5' });
  });
  it('returns null for lines without sets and reps', () => {
    expect(parseExerciseLine('Warm up as normal')).toBeNull();
    expect(parseExerciseLine('')).toBeNull();
  });
});

describe('parseWeekText', () => {
  const parsed = parseWeekText(WEEK);
  it('splits a week into days and exercises', () => {
    expect(parsed.weeks).toHaveLength(1);
    expect(parsed.weeks[0].days.map(d => [d.weekday, d.exercises.length])).toEqual([[0, 6], [2, 3], [4, 3]]);
    expect(parsed.unreadLines).toBe(0);
    expect(parsed.weeks[0].days[0].exercises[2]).toMatchObject({ name: 'Chin-up', reps: '6-8' });
  });
  it('takes a session name after the day', () => {
    const p = parseWeekText('Tuesday – Lower body\nSquat 3 x 5');
    expect(p.weeks[0].days[0]).toMatchObject({ weekday: 1, label: 'Lower body' });
  });
  it('keeps unreadable lines as notes and counts them', () => {
    const p = parseWeekText('Monday\nWarm up 10 min\nSquat 3 x 5');
    expect(p.weeks[0].days[0].notes).toEqual(['Warm up 10 min']);
    expect(p.unreadLines).toBe(1);
  });
  it('handles several weeks with Week headings', () => {
    const p = parseWeekText('Week 1\nMonday\nSquat 3 x 5\nWeek 2\nMonday\nSquat 3 x 6');
    expect(p.weeks.map(w => w.number)).toEqual([1, 2]);
    expect(p.weeks[1].days[0].exercises[0].reps).toBe('6');
  });
  it('treats text with no day as one undated day', () => {
    const p = parseWeekText('Squat 3 x 5\nBench 3 x 5');
    expect(p.weeks[0].days).toHaveLength(1);
    expect(p.weeks[0].days[0].weekday).toBeNull();
  });
  it('does not mistake an exercise that starts with a day name for a heading', () => {
    expect(parseWeekText('Monday\nSun Salutation 2 x 5').weeks[0].days[0].exercises[0].name).toBe('Sun Salutation');
  });
  it('is empty for empty text', () => {
    expect(parseWeekText('').weeks).toEqual([]);
  });
});

describe('placeOnDates', () => {
  it('puts each day on its date from the Monday of the week', () => {
    const placed = placeOnDates(parseWeekText(WEEK), '2026-11-09', '2026-11-09');
    expect(placed.map(p => p.date)).toEqual(['2026-11-09', '2026-11-11', '2026-11-13']);
  });
  it('moves later weeks on by seven days, and uses the picked date for an undated day', () => {
    const multi = placeOnDates(parseWeekText('Week 1\nMonday\nSquat 3 x 5\nWeek 2\nMonday\nSquat 3 x 6'), '2026-11-09', null);
    expect(multi.map(p => p.date)).toEqual(['2026-11-09', '2026-11-16']);
    expect(placeOnDates(parseWeekText('Squat 3 x 5'), '2026-11-09', '2026-11-12')[0].date).toBe('2026-11-12');
  });
});
