import { supabase } from './supabase';
import { createPlannedSession, deletePlannedSession, findOrCreateFreeFormBlock } from '../hooks/usePlannedSessionMutations';
import { WEEKDAY_NAMES } from '../utils/weekProgrammeText';

const dayDiff = (a, b) => Math.round((new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / 86400000);
const weekdayName = (iso) => WEEKDAY_NAMES[(new Date(`${iso}T12:00:00`).getDay() + 6) % 7];

/**
 * Looks each exercise name up in the library, creating any that aren't there (the same thing the
 * single-session import does). Returns a Map of lower-cased name → { id }.
 */
export async function resolveExercises(names, library, findBestExerciseMatch) {
  const resolved = new Map();
  for (const name of names) {
    const key = name.toLowerCase();
    if (resolved.has(key)) continue;
    const match = findBestExerciseMatch(name, library);
    if (match) { resolved.set(key, { id: match.exercise.id, created: false }); continue; }
    const { data, error } = await supabase.from('exercise_library')
      .insert({ name, category: 'accessory', bilateral_unilateral: 'bilateral' }).select('id').single();
    if (error) throw new Error(`Could not add “${name}” to the exercise library: ${error.message}`);
    resolved.set(key, { id: data.id, created: true });
  }
  return resolved;
}

/**
 * Creates one planned session per day: a session in a block that covers that date (a one-week FreeForm block
 * is made if there isn't one), one "Main" section holding the exercises with their sets and reps, and the
 * planned session on the date. Days are written one at a time; a day that fails is cleaned up and reported,
 * and the rest still go in.
 *
 * days: [{ date, label, notes[], exercises: [{ exercise_id, sets, reps, note }] }]
 * → { created: [{ plannedId, date }], failed: [{ date, message }] }
 */
export async function importPlannedDays({ athleteId, days }) {
  const created = [];
  const failed = [];

  for (const day of days) {
    let blockSessionId = null;
    try {
      const blockRes = await findOrCreateFreeFormBlock(athleteId, day.date);
      if (!blockRes.ok) throw blockRes.error;
      const block = blockRes.block;
      const weeks = Math.max(1, Math.round((dayDiff(block.start_date, block.end_date) + 1) / 7));

      const { data: last } = await supabase.from('block_sessions').select('session_order')
        .eq('block_id', block.id).order('session_order', { ascending: false }).limit(1).maybeSingle();
      const { data: bs, error: bsErr } = await supabase.from('block_sessions').insert({
        block_id: block.id,
        session_name: day.label || `${weekdayName(day.date)} session`,
        session_order: (last?.session_order ?? -1) + 1,
        coach_notes: day.notes?.length ? day.notes.join('\n') : null,
      }).select().single();
      if (bsErr) throw bsErr;
      blockSessionId = bs.id;

      const { data: sec, error: secErr } = await supabase.from('session_sections')
        .insert({ block_session_id: bs.id, name: 'Main', display_order: 0, is_warm_up: false }).select().single();
      if (secErr) throw secErr;

      const { data: exs, error: exErr } = await supabase.from('session_exercises').insert(
        day.exercises.map((e, i) => ({
          block_session_id: bs.id, section_id: sec.id, exercise_id: e.exercise_id, display_order: i,
          prescription_type: 'reps_only', notes: e.note || null, is_warm_up: false,
        })),
      ).select();
      if (exErr) throw exErr;

      // The same sets and reps for every week the block runs, so the session reads the same wherever it is viewed.
      const rx = [];
      exs.forEach((row, i) => {
        for (let w = 1; w <= weeks; w += 1) {
          rx.push({ session_exercise_id: row.id, week_number: w, sets: day.exercises[i].sets, reps: day.exercises[i].reps, target_value: '', rest_seconds: null });
        }
      });
      const { error: rxErr } = await supabase.from('exercise_week_prescriptions').insert(rx);
      if (rxErr) throw rxErr;

      const planned = await createPlannedSession({ athleteId, blockId: block.id, blockSessionId: bs.id, plannedDateISO: day.date });
      if (!planned.ok) throw planned.error;
      created.push({ plannedId: planned.data.id, date: day.date });
    } catch (e) {
      if (blockSessionId) await supabase.from('block_sessions').delete().eq('id', blockSessionId);
      failed.push({ date: day.date, message: e?.message || 'Something went wrong.' });
    }
  }
  return { created, failed };
}

/** Takes back what importPlannedDays just added. */
export async function undoImportedDays(created) {
  for (const c of created) await deletePlannedSession(c.plannedId);
}
