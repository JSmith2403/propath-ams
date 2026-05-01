/**
 * Shared session-display logic used by both the coach-facing
 * AthleteWeekView and the athlete-facing TrainingTab.
 *
 * Walks a session's exercises + step notes in display_order and
 * assigns a letter (A, B, C…) per "group". A group is either a
 * single non-supersetted exercise OR a run of exercises that share
 * a `superset_group_id`. Notes don't get letters.
 *
 * Returns a flat list of items keyed by `kind` ('exercise' | 'note').
 */
export function buildSessionItems({ sessExs, sessNotes, sessSecs, wps, libById, weekNumber }) {
  const merged = [
    ...sessExs.map(e => ({ kind: 'exercise', row: e })),
    ...sessNotes.map(n => ({ kind: 'note',     row: n })),
  ].sort((a, b) => a.row.display_order - b.row.display_order);

  const sectionById = Object.fromEntries(sessSecs.map(s => [s.id, s]));

  const items = [];
  let letterIndex = -1;
  let lastSupersetGroup = null;

  for (const step of merged) {
    if (step.kind === 'note') {
      items.push({ kind: 'note', content: step.row.content });
      continue;
    }
    const ex = step.row;
    if (ex.superset_group_id && ex.superset_group_id === lastSupersetGroup) {
      // continue prior group, same letter
    } else {
      letterIndex++;
      lastSupersetGroup = ex.superset_group_id || null;
    }
    const letter = String.fromCharCode('A'.charCodeAt(0) + (letterIndex % 26));

    const wp = wps.find(w => w.session_exercise_id === ex.id && w.week_number === weekNumber) || null;
    const effectiveExerciseId = wp?.override_exercise_id || ex.exercise_id;
    const lib = libById[effectiveExerciseId] || {};
    const sec = sectionById[ex.section_id] || null;

    items.push({
      kind: 'exercise',
      letter,
      name: lib.name || '(missing exercise)',
      sectionName: sec?.name || null,
      sets: wp?.sets ?? null,
      reps: wp?.reps ?? null,
      target_value: wp?.target_value ?? null,
      prescription_type: ex.prescription_type || null,
      session_exercise_id: ex.id,
      is_overridden: !!wp?.override_exercise_id,
      week_number: weekNumber,
      notes: ex.notes || null,
    });
  }

  return items;
}
