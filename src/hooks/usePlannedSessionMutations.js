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
    .select('block_id, standalone_session_id, planned_date')
    .eq('id', plannedId)
    .single();
  if (e1) return { ok: false, error: e1 };
  if (row.planned_date === newDateISO) return { ok: true, noop: true };

  // Standalone sessions have no block window to respect — any date is
  // valid, and there's no week_number to recompute.
  if (!row.block_id) {
    const updates = { planned_date: newDateISO };
    const { error } = await supabase.from('planned_sessions').update(updates).eq('id', plannedId);
    if (error) return { ok: false, error };
    if (row.standalone_session_id) {
      await supabase.from('standalone_sessions').update({ session_date: newDateISO }).eq('id', row.standalone_session_id);
    }
    return { ok: true };
  }

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
    .select('athlete_id, block_id, block_session_id, standalone_session_id')
    .eq('id', plannedId)
    .single();
  if (e1) return { ok: false, error: e1 };

  // Standalone sessions can be copied onto any date — no block window,
  // no week_number. Copying duplicates the underlying standalone_session
  // row too, so renaming the copy never touches the original.
  if (!src.block_id) {
    const { data: srcSession, error: e2 } = await supabase
      .from('standalone_sessions')
      .select('athlete_id, session_name, coach_notes')
      .eq('id', src.standalone_session_id)
      .single();
    if (e2) return { ok: false, error: e2 };

    const { data: newSession, error: e3 } = await supabase
      .from('standalone_sessions')
      .insert({
        athlete_id:   srcSession.athlete_id,
        session_name: srcSession.session_name,
        session_date: newDateISO,
        coach_notes:  srcSession.coach_notes,
      })
      .select()
      .single();
    if (e3) return { ok: false, error: e3 };

    const { data, error } = await supabase
      .from('planned_sessions')
      .insert({
        athlete_id:             src.athlete_id,
        standalone_session_id:  newSession.id,
        planned_date:           newDateISO,
        status:                 'planned',
      })
      .select()
      .single();
    if (error) return { ok: false, error };
    return { ok: true, data };
  }

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
  // Standalone sessions: delete the parent standalone_sessions row so
  // it doesn't dangle — the FK cascade removes the planned_sessions row
  // with it. Block sessions: delete the single occurrence as before.
  const { data: row } = await supabase
    .from('planned_sessions')
    .select('standalone_session_id')
    .eq('id', plannedId)
    .single();

  if (row?.standalone_session_id) {
    const { error } = await supabase.from('standalone_sessions').delete().eq('id', row.standalone_session_id);
    if (error) return { ok: false, error };
    return { ok: true };
  }

  const { error } = await supabase
    .from('planned_sessions')
    .delete()
    .eq('id', plannedId);
  if (error) return { ok: false, error };
  return { ok: true };
}

/**
 * Create a single standalone session on a specific date — the
 * "Plan for 1 Session" calendar action. No block, no week number.
 */
export async function createStandaloneSession({ athleteId, sessionName, sessionDateISO, coachNotes = null }) {
  const { data: session, error: e1 } = await supabase
    .from('standalone_sessions')
    .insert({ athlete_id: athleteId, session_name: sessionName, session_date: sessionDateISO, coach_notes: coachNotes })
    .select()
    .single();
  if (e1) return { ok: false, error: e1 };

  const { data, error: e2 } = await supabase
    .from('planned_sessions')
    .insert({ athlete_id: athleteId, standalone_session_id: session.id, planned_date: sessionDateISO, status: 'planned' })
    .select()
    .single();
  if (e2) return { ok: false, error: e2 };
  return { ok: true, data, session };
}

/**
 * Create several standalone sessions in one go — the "Plan for a week"
 * action. `entries` is [{ dateISO, name }]. Each becomes its own
 * standalone_sessions + planned_sessions row (no shared parent — a
 * loose week of individually-named sessions, not a block).
 */
export async function createStandaloneSessions(athleteId, entries) {
  if (!entries?.length) return { ok: true, created: 0 };

  const { data: sessions, error: e1 } = await supabase
    .from('standalone_sessions')
    .insert(entries.map(e => ({ athlete_id: athleteId, session_name: e.name, session_date: e.dateISO })))
    .select();
  if (e1) return { ok: false, error: e1 };

  const { data, error: e2 } = await supabase
    .from('planned_sessions')
    .insert(sessions.map(s => ({ athlete_id: athleteId, standalone_session_id: s.id, planned_date: s.session_date, status: 'planned' })))
    .select();
  if (e2) return { ok: false, error: e2 };
  return { ok: true, created: data?.length || 0 };
}

/** Rename / update notes on an existing standalone session. */
export async function updateStandaloneSession(standaloneSessionId, patch) {
  const { error } = await supabase
    .from('standalone_sessions')
    .update(patch)
    .eq('id', standaloneSessionId);
  if (error) return { ok: false, error };
  return { ok: true };
}

export async function bulkDeletePlannedSessions(plannedIds) {
  if (!plannedIds?.length) return { ok: true, deleted: 0 };
  const { error } = await supabase
    .from('planned_sessions')
    .delete()
    .in('id', plannedIds);
  if (error) return { ok: false, error };
  return { ok: true, deleted: plannedIds.length };
}

/**
 * Bulk copy planned sessions onto new dates. Used by the multi-select
 * "Copy" / "Repeat" actions. Each source row is re-inserted with a
 * fresh id at the supplied target date, week_number recalculated.
 *
 * Pass an array of { sourceId, targetDateISO } pairs. Mixed-block
 * sources are fine — each row resolves its own block window.
 */
export async function bulkCopyPlannedSessions(pairs) {
  if (!pairs?.length) return { ok: true, copied: 0 };

  // Pull each source row's parent info in one round-trip
  const ids = pairs.map(p => p.sourceId);
  const { data: srcRows, error: e1 } = await supabase
    .from('planned_sessions')
    .select('id, athlete_id, block_id, block_session_id')
    .in('id', ids);
  if (e1) return { ok: false, error: e1 };
  const srcById = new Map(srcRows.map(r => [r.id, r]));

  // Resolve every distinct block's window in one call
  const blockIds = [...new Set(srcRows.map(r => r.block_id))];
  const { data: blocks, error: e2 } = await supabase
    .from('training_blocks')
    .select('id, start_date, end_date')
    .in('id', blockIds);
  if (e2) return { ok: false, error: e2 };
  const blockById = new Map(blocks.map(b => [b.id, b]));

  // Build the insert payload, skipping any pair whose date sits
  // outside its block window (surface this in the result so the
  // caller can show a "couldn't copy N — out of block window" hint).
  const insertRows = [];
  const skipped    = [];
  for (const { sourceId, targetDateISO } of pairs) {
    const src = srcById.get(sourceId);
    if (!src) { skipped.push({ sourceId, reason: 'source not found' }); continue; }
    const blk = blockById.get(src.block_id);
    if (!blk) { skipped.push({ sourceId, reason: 'block missing' }); continue; }
    const week = weekNumberWithin(blk.start_date, blk.end_date, targetDateISO);
    if (week == null) { skipped.push({ sourceId, reason: 'outside block window' }); continue; }
    insertRows.push({
      athlete_id:       src.athlete_id,
      block_id:         src.block_id,
      block_session_id: src.block_session_id,
      week_number:      week,
      planned_date:     targetDateISO,
      status:           'planned',
    });
  }

  if (!insertRows.length) {
    return { ok: false, error: new Error('Nothing to copy — all targets outside block windows.'), skipped };
  }

  const { data, error } = await supabase
    .from('planned_sessions')
    .insert(insertRows)
    .select();
  if (error) return { ok: false, error, skipped };
  return { ok: true, copied: data?.length || 0, skipped };
}

/**
 * Create a fresh planned_session for a block_session template on a
 * specific date. Used by the empty-day "+ Add session" popover.
 */
export async function createPlannedSession({ athleteId, blockId, blockSessionId, plannedDateISO }) {
  const win = await fetchBlockWindow(blockId);
  if (!win.ok) return win;
  const week = weekNumberWithin(win.start, win.end, plannedDateISO);
  if (week == null) {
    return { ok: false, error: new Error('That date is outside this block.') };
  }
  const { data, error } = await supabase
    .from('planned_sessions')
    .insert({
      athlete_id:       athleteId,
      block_id:         blockId,
      block_session_id: blockSessionId,
      week_number:      week,
      planned_date:     plannedDateISO,
      status:           'planned',
    })
    .select()
    .single();
  if (error) return { ok: false, error };
  return { ok: true, data };
}

/**
 * For the "+ Add session" popover — list every block_session template
 * available to this athlete on a given date. We look up which
 * training_blocks the date falls inside, then return the joined
 * session templates grouped by block.
 *
 * Returns:
 *   [{ block: { id, block_name }, sessions: [{ id, session_name, session_order }] }]
 */
export async function listAddableSessionsForDate(athleteId, plannedDateISO) {
  const { data: blocks, error: e1 } = await supabase
    .from('training_blocks')
    .select('id, block_name, start_date, end_date')
    .eq('athlete_id', athleteId)
    .lte('start_date', plannedDateISO)
    .gte('end_date',   plannedDateISO)
    .order('start_date', { ascending: false });
  if (e1) return { ok: false, error: e1 };
  if (!blocks?.length) return { ok: true, groups: [] };

  const blockIds = blocks.map(b => b.id);
  const { data: sessions, error: e2 } = await supabase
    .from('block_sessions')
    .select('id, block_id, session_name, session_order')
    .in('block_id', blockIds)
    .order('session_order', { ascending: true });
  if (e2) return { ok: false, error: e2 };

  const byBlock = new Map(blocks.map(b => [b.id, []]));
  for (const s of sessions || []) {
    if (byBlock.has(s.block_id)) byBlock.get(s.block_id).push(s);
  }
  return {
    ok: true,
    groups: blocks.map(b => ({ block: b, sessions: byBlock.get(b.id) || [] })),
  };
}
