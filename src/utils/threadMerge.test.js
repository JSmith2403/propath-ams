import { describe, it, expect } from 'vitest';
import { mealMessages, mergeThread } from './threadMerge';

const meal = (id, at) => ({ id, submittedAt: at, label: 'Lunch', day: 'Today', text: 'Chicken', thumb: 't', full: 'f' });

describe('mealMessages', () => {
  it('turns meals into photo messages from the athlete', () => {
    const [m] = mealMessages([meal('a1', '2026-11-23T12:00:00Z')], { mine: true, name: 'Maha' });
    expect(m).toMatchObject({ id: 'meal:a1', mealEntryId: 'a1', mine: true, name: 'Maha', at: '2026-11-23T12:00:00Z' });
    expect(m.photo).toMatchObject({ label: 'Lunch', text: 'Chicken', thumb: 't', full: 'f' });
  });
  it('copes with none', () => { expect(mealMessages(null, { mine: false })).toEqual([]); });
});

describe('mergeThread', () => {
  it('puts messages and meal photos in time order', () => {
    const messages = [{ id: 'r1', at: '2026-11-23T13:00:00Z', body: 'Nice' }, { id: 'r0', at: '2026-11-23T09:00:00Z', body: 'Morning' }];
    const meals = mealMessages([meal('a1', '2026-11-23T12:00:00Z'), meal('a2', '2026-11-23T08:00:00Z')], { mine: true });
    expect(mergeThread(messages, meals).map(x => x.id)).toEqual(['meal:a2', 'r0', 'meal:a1', 'r1']);
  });
  it('shows the photo before a reply made at the same moment', () => {
    const t = '2026-11-23T12:00:00Z';
    expect(mergeThread([{ id: 'r', at: t }], mealMessages([meal('a', t)], { mine: false })).map(x => x.id)).toEqual(['meal:a', 'r']);
  });
});
