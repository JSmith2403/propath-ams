import { supabase } from '../lib/supabase';
import { parseDate } from '../utils/blockHelpers';

/**
 * usePlannedSessionMutations — per-athlete drag/drop + delete primitives
 * for planned_sessions rows. Used by AthleteWeekViewV2 to power the
 * intuitive session move / copy / delete UX inside Programme.
 *
 * All three operations affect a SINGLE planned_sessions row — squad-wide
 * shuffles are out of scope (by design, see the original product call).
 *
 * Functions return { ok, data?, error? } so callers don't have to wrap
 * each call in try/catch — keeps the optimistic-rollback pattern terse.
 *
 *   movePlannedSession(id, dateISO)   — UPDATE planned_date + week_number
 *   copyPlannedSession(id, dateISO)   — INSERT a fresh row on dateISO
 *   deletePlannedSession(id)          — DELETE the row outright
 *
 * Week number is re-derived from the new date relative to the block's
 * start_date so per-week prescriptions still resolve correctly after a
 * move. Dropping a session outside the block window is rejected — the
 * caller surfaces that as a toast.
 */

/** Days between two YYYY-MM-DD ISO dates, signed. */
function daysBetweenISO(fromISO, toISO_) {
  const a = parseDate(fromISO);
  const b = parseDate(toISO_);
  return Math.round((b - a) / 86_400_000);
}

/**
 * 1-indexed week number for `targetISO` within the block whose start +
 * end dates we already know. Returns null if outside the window.
 */
function weekNumberWithin(blockStartISO, blockEndISO, targetISO) {
  if (!blockStartISO) return null;
  if (targetISO < blockStartISO) return null;
  if (blockEndISO && targetISO > blockEndISO) return null;
  const days = daysBetweenISO(blockStartISO, targetISO);
  return Math.floor(days / 7) + 1;
}

async function fetchBlockWindow(blockId) {
  const { data, error } = await supabase
    .from('training_blocks')
    .select('start_date, end_date')
    .eq('id', blockId)
    .single();
  if (error) return { ok: false, error };
  return { ok: true, start: data.start_date, end: data.end_date };
}

export async function movePlannedSession(plannedId, newDateISO) {
  const { data: row, error: e1 } = await supabase
    .from('planned_sessions')
    .select('block_id, planned_date')
    .eq('id', plannedId)
    .single();
  if (e1) return { ok: false, error: e1 };
  if (row.planned_date === newDateISO) return { ok: true, noop: true };

  const win = await fetchBlockWindow(row.block_id);
  if (!win.ok) return win;
  const week = weekNumberWithin(win.start, win.end, newDateISO);
  if (week == null) {
    return { ok: false, error: new Error('That date is outside this block.') };
  }

  const { error } = await supabase
    .from('planned_sessions')
    .update({ planned_date: newDateISO, week_number: week })
    .eq('id', plannedId);
  if (error) return { ok: false, error };
  return { ok: true };
}

export async function copyPlannedSession(plannedId, newDateISO) {
  const { data: src, error: e1 } = await supabase
    .from('planned_sessions')
    .select('athlete_id, block_id, block_session_id')
    .eq('id', plannedId)
    .single();
  if (e1) return { ok: false, error: e1 };

  const win = await fetchBlockWindow(src.block_id);
  if (!win.ok) return win;
  const week = weekNumberWithin(win.start, win.end, newDateISO);
  if (week == null) {
    return { ok: false, error: new Error('That date is outside this block.') };
  }

  const { data, error } = await supabase
    .from('planned_sessions')
    .insert({
      athlete_id:       src.athlete_id,
      block_id:         src.block_id,
      block_session_id: src.block_session_id,
      week_number:      week,
      planned_date:     newDateISO,
      status:           'planned',
    })
    .select()
    .single();
  if (error) return { ok: false, error };
  return { ok: true, data };
}

export async function deletePlannedSession(plannedId) {
  const { error } = await supabase
    .from('planned_sessions')
    .delete()
    .eq('id', plannedId);
  if (error) return { ok: false, error };
  return { ok: true };
}
