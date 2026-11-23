/**
 * Meals appear in the coach conversation as the athlete's own photo messages, where they were submitted, so a coach
 * reply (which quotes the meal) reads like a WhatsApp chat. These are shown, not stored: nothing is written to the
 * message record, and they never count as unread messages.
 */

/** Recent meals → chat items from the athlete's side. `mine` is true in the athlete's own app. */
export function mealMessages(meals, { mine, name }) {
  return (meals || []).map(m => ({
    id: `meal:${m.id}`,
    mealEntryId: m.id,
    mine,
    name,
    role: 'athlete',
    at: m.submittedAt,
    photo: { label: m.label, day: m.day, text: m.text, thumb: m.thumb, full: m.full },
  }));
}

/** Messages and meal photos in time order. A message sorts after a meal submitted at the same moment. */
export function mergeThread(messages, mealItems) {
  return [...messages, ...mealItems]
    .map((m, i) => ({ m, i, t: new Date(m.at).getTime() }))
    .sort((a, b) => (a.t - b.t) || (a.m.photo ? -1 : 0) - (b.m.photo ? -1 : 0) || a.i - b.i)
    .map(x => x.m);
}
