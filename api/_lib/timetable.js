// Shared helpers for the weekly timetable endpoints (publish + Sunday reminder).
// Slots are tied to athletes by cohort: cohorts = [] means everyone.

/** Does a slot apply to an athlete in `cohort`? */
export function slotAppliesTo(slot, cohort) {
  return !slot.cohorts?.length || slot.cohorts.includes(cohort);
}

/**
 * For every athlete with a push-subscribed device, how many of `slots` apply to
 * them and how many of those they haven't answered yet.
 * Returns Map(athleteId → { eligible, unanswered }) — only athletes with ≥1
 * applicable slot are included.
 */
export async function eligibilityForSubscribers(admin, slots) {
  const result = new Map();
  if (!slots.length) return result;

  const { data: subs } = await admin.from('push_subscriptions').select('athlete_id').not('athlete_id', 'is', null);
  const athleteIds = [...new Set((subs || []).map(s => s.athlete_id))];
  if (!athleteIds.length) return result;

  const [{ data: athletes }, { data: responses }] = await Promise.all([
    admin.from('athletes').select('id, data').in('id', athleteIds),
    admin.from('timetable_responses').select('slot_id, athlete_id').in('slot_id', slots.map(s => s.id)),
  ]);

  const cohortById = new Map((athletes || []).map(a => [a.id, a.data?.cohort || null]));
  const answered = new Set((responses || []).map(r => `${r.athlete_id}:${r.slot_id}`));

  for (const athleteId of athleteIds) {
    const cohort = cohortById.get(athleteId);
    const mine = slots.filter(s => slotAppliesTo(s, cohort));
    if (!mine.length) continue;
    result.set(athleteId, {
      eligible: mine.length,
      unanswered: mine.filter(s => !answered.has(`${athleteId}:${s.id}`)).length,
    });
  }
  return result;
}
