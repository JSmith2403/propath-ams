/**
 * Helpers for the Block-Grid Session Editor.
 *
 * Pure functions only — no Supabase, no React. Keeps the editor
 * component focused on UI and the data shape easy to test.
 */
import { parseDate } from './blockHelpers';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfWeekMon(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay();
  const offset = (dow + 6) % 7; // Mon=0..Sun=6
  d.setDate(d.getDate() - offset);
  return d;
}

/**
 * Which week of the block "today" falls into, 1-indexed.
 *
 *   < 1            → block hasn't started yet (returns 0)
 *   1..duration    → in the block
 *   > duration     → block already finished (returns duration + 1)
 *
 * The convention "current week" used in the editor = max(1, currentWeekNumber).
 * This way a block that hasn't started yet still lets the coach edit
 * Week 1 onwards.
 */
export function currentWeekNumber(block) {
  if (!block?.start_date || !block?.duration_weeks) return null;
  const startMon = startOfWeekMon(parseDate(block.start_date));
  const todayMon = startOfWeekMon(new Date());
  const days = Math.floor((todayMon - startMon) / DAY_MS);
  const wk   = Math.floor(days / 7) + 1;
  if (wk < 1) return 0;
  if (wk > block.duration_weeks) return block.duration_weeks + 1;
  return wk;
}

// Lowest editable week — clamps the "before block starts" case so the
// editor still allows editing from Week 1 onwards even if today is
// before the block start_date.
export function firstEditableWeek(block) {
  const cw = currentWeekNumber(block);
  if (cw == null) return 1;
  return Math.max(1, cw);
}

// Build a quick lookup: wp[sessionExerciseId][weekNumber] → wp row.
export function buildWpIndex(wps) {
  const m = new Map();
  for (const w of wps) {
    let inner = m.get(w.session_exercise_id);
    if (!inner) { inner = new Map(); m.set(w.session_exercise_id, inner); }
    inner.set(w.week_number, w);
  }
  return m;
}

// Resolve the "effective" exercise id for (session_exercise, week) — the
// override if set on that week, otherwise the base exercise.
export function effectiveExerciseId(wpIndex, sessionExercise, week) {
  const wp = wpIndex.get(sessionExercise.id)?.get(week);
  return wp?.override_exercise_id || sessionExercise.exercise_id;
}

/**
 * Smart-overwrite test for prescription propagation.
 * Returns true if the downstream week's prescription still matches the
 * pre-edit baseline (i.e. it hasn't been individually customised since).
 *
 * Field semantics:
 *   - sets, rest_seconds: numeric; null === null
 *   - reps, target_value: text; '' is treated as null for the compare
 */
export function prescriptionMatches(wp, baseline) {
  if (!wp || !baseline) return false;
  const norm = (v) => (v === '' || v == null ? null : v);
  return norm(wp.sets)         === norm(baseline.sets)
      && norm(wp.reps)         === norm(baseline.reps)
      && norm(wp.target_value) === norm(baseline.target_value)
      && norm(wp.rest_seconds) === norm(baseline.rest_seconds);
}

/**
 * Smart-overwrite test for exercise swaps.
 * Returns true if the downstream week's *effective* exercise id still
 * matches the pre-edit baseline. The base exercise id (from
 * session_exercises.exercise_id) is needed because override may be null.
 */
export function exerciseMatches(wp, baselineEffectiveExId, baseExId) {
  const effective = wp?.override_exercise_id || baseExId;
  return effective === baselineEffectiveExId;
}

// A→Z letter for a row index, cycling at Z. Coaches don't typically
// have >26 exercises in one session but the modulo keeps things sane.
export function letterFor(idx) {
  return String.fromCharCode('A'.charCodeAt(0) + (idx % 26));
}

// Pretty-print a target value with its prescription type. Mirrors the
// formatter in AthleteWeekView so cells read consistently.
export function formatTarget(value, type) {
  if (value == null || value === '') return '';
  switch (type) {
    case 'kg':            return `${value}kg`;
    case 'percent_1rm':   return `${value}%`;
    case 'rpe':           return `RPE ${value}`;
    case 'rir':           return `RIR ${value}`;
    case 'velocity_zone':
    case 'time':
    case 'band_colour':
    default:              return String(value);
  }
}
