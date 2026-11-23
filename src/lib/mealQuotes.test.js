import { describe, it, expect } from 'vitest';
import { mealLabel, mealDayLabel } from './mealQuotes';

describe('meal quote labels', () => {
  it('names meal types, collapsing the snack slots', () => {
    expect(['breakfast', 'snack_2', 'dinner', 'drink', 'what'].map(mealLabel)).toEqual(['Breakfast', 'Snack', 'Dinner', 'Drink', 'Meal']);
  });
  it('says Today, Yesterday or the date', () => {
    const now = new Date(2026, 10, 10, 15);
    expect(mealDayLabel('2026-11-10', now)).toBe('Today');
    expect(mealDayLabel('2026-11-09', now)).toBe('Yesterday');
    expect(mealDayLabel('2026-11-03', now)).toMatch(/Tue/);
    expect(mealDayLabel(null, now)).toBe('');
  });
});
