const LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', drink: 'Drink', snack_1: 'Snack', snack_2: 'Snack', snack_3: 'Snack' };
export const mealLabel = (type) => LABELS[type] || 'Meal';

/** "Today", "Yesterday" or "Tue 4 Nov" for a YYYY-MM-DD log date. */
export function mealDayLabel(logDate, now = new Date()) {
  if (!logDate) return '';
  const today = now.toLocaleDateString('en-CA');
  const y = new Date(now); y.setDate(y.getDate() - 1);
  if (logDate === today) return 'Today';
  if (logDate === y.toLocaleDateString('en-CA')) return 'Yesterday';
  return new Date(`${logDate}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
