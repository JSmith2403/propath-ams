import { supabase } from '../lib/supabase';
import { parseDate, addDaysISO, mondayOfISO } from '../utils/blockHelpers';

/** Reserved block_name used for the lightweight, auto-created 1-week
 *  blocks behind "Plan for a week" / "Plan for 1 Session", and for
 *  cross-week paste targets that don't land in an existing block. Never
 *  applied to a coach-named block, so cleanup logic keyed on this name
 *  can never touch real programming. */
const FREEFORM_NAME = 'FreeForm';

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

/**
 * Find a training_block covering `dateISO`, or create a lightweight
 * 1-week "FreeForm" one if none exists — the paste target for a
 * session copied onto a week with no programme of its own yet.
 */
async function findOrCreateFreeFormBlock(athleteId, dateISO) {
  const { data: existing, error: e1 } = await supabase
    .from('training_blocks')
    .select('id, start_date, end_date')
    .eq('athlete_id', athleteId)
    .lte('start_date', dateISO)
    .gte('end_date', dateISO)
    .limit(1)
    .maybeSingle();
  if (e1) return { ok: false, error: e1 };
  if (existing) return { ok: true, block: existing };

  const { data: maxRow } = await supabase
    .from('training_blocks')
    .select('display_order')
    .eq('athlete_id', athleteId)
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const startDate = mondayOfISO(dateISO);
  const { data: created, error: e2 } = await supabase
    .from('training_blocks')
    .insert({
      athlete_id: athleteId,
      block_name: FREEFORM_NAME,
      start_date: startDate,
      end_date: addDaysISO(startDate, 6),
      duration_weeks: 1,
      display_order: (maxRow?.display_order || 0) + 1,
    })
    .select()
    .single();
  if (e2) return { ok: false, error: e2 };
  return { ok: true, block: created, created: true };
}

/**
 * Duplicate a block_session (+ its exercises + week-1 prescriptions —
 * the only week that exists in a 1-week FreeForm target) into another
 * block, returning the new block_session's id.
 */
async function cloneBlockSessionInto(sourceBlockSessionId, targetBlockId) {
  const { data: srcSession, error: e1 } = await supabase
    .from('block_sessions')
    .select('session_name, coach_notes')
    .eq('id', sourceBlockSessionId)
    .single();
  if (e1) return { ok: false, error: e1 };

  const { data: lastOrderRow } = await supabase
    .from('block_sessions')
    .select('session_order')
    .eq('block_id', targetBlockId)
    .order('session_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: newSession, error: e2 } = await supabase
    .from('block_sessions')
    .insert({
      block_id: targetBlockId,
      session_name: srcSession.session_name,
      session_order: (lastOrderRow?.session_order ?? -1) + 1,
      coach_notes: srcSession.coach_notes,
    })
    .select()
    .single();
  if (e2) return { ok: false, error: e2 };

  const { data: srcExercises, error: e3 } = await supabase
    .from('session_exercises')
    .select('id, exercise_id, display_order, group_label, group_colour, prescription_type, notes, is_warm_up')
    .eq('block_session_id', sourceBlockSessionId)
    .order('display_order', { ascending: true });
  if (e3) return { ok: false, error: e3 };

  if (srcExercises?.length) {
    const { data: newExercises, error: e4 } = await supabase
      .from('session_exercises')
      .insert(srcExercises.map(({ id: _id, ...rest }) => ({ ...rest, block_session_id: newSession.id })))
      .select();
    if (e4) return { ok: false, error: e4 };

    const oldToNewId = new Map(srcExercises.map((ex, i) => [ex.id, newExercises[i].id]));
    const { data: srcPrescriptions } = await supabase
      .from('exercise_week_prescriptions')
      .select('session_exercise_id, sets, reps, target_value, rest_seconds')
      .in('session_exercise_id', srcExercises.map(ex => ex.id))
      .eq('week_number', 1);

    const prescriptionRows = (srcPrescriptions || [])
      .filter(p => oldToNewId.has(p.session_exercise_id))
      .map(p => ({
        session_exercise_id: oldToNewId.get(p.session_exercise_id),
        week_number: 1,
        sets: p.sets,
        reps: p.reps,
        target_value: p.target_value,
        rest_seconds: p.rest_seconds,
      }));
    if (prescriptionRows.length) {
      await supabase.from('exercise_week_prescriptions').insert(prescriptionRows);
    }
  }

  return { ok: true, blockSessionId: newSession.id };
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
  let week = weekNumberWithin(win.start, win.end, newDateISO);

  let targetBlockId = src.block_id;
  let targetBlockSessionId = src.block_session_id;

  // Target date falls outside the source block's window — paste it
  // into whatever block already covers that week, or spin up a
  // lightweight FreeForm one, cloning the session's content across.
  if (week == null) {
    const target = await findOrCreateFreeFormBlock(src.athlete_id, newDateISO);
    if (!target.ok) return target;
    week = weekNumberWithin(target.block.start_date, target.block.end_date, newDateISO);
    const cloned = await cloneBlockSessionInto(src.block_session_id, target.block.id);
    if (!cloned.ok) return cloned;
    targetBlockId = target.block.id;
    targetBlockSessionId = cloned.blockSessionId;
  }

  const { data, error } = await supabase
    .from('planned_sessions')
    .insert({
      athlete_id:       src.athlete_id,
      block_id:         targetBlockId,
      block_session_id: targetBlockSessionId,
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
  const { data: row } = await supabase
    .from('planned_sessions')
    .select('block_id, block_session_id')
    .eq('id', plannedId)
    .single();

  const { error } = await supabase
    .from('planned_sessions')
    .delete()
    .eq('id', plannedId);
  if (error) return { ok: false, error };

  // Housekeeping: an auto-created FreeForm block whose last session
  // occurrence was just removed shouldn't linger as an empty chip on
  // the timeline. Keyed strictly on the reserved FreeForm name, so a
  // coach-named structured block is never touched by this cleanup.
  if (row?.block_id) {
    const { data: block } = await supabase
      .from('training_blocks')
      .select('block_name')
      .eq('id', row.block_id)
      .single();
    if (block?.block_name === FREEFORM_NAME) {
      const { count: remainingOccurrences } = await supabase
        .from('planned_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('block_session_id', row.block_session_id);
      if (!remainingOccurrences) {
        await supabase.from('block_sessions').delete().eq('id', row.block_session_id);
        const { count: remainingSessions } = await supabase
          .from('block_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('block_id', row.block_id);
        if (!remainingSessions) {
          await supabase.from('training_blocks').delete().eq('id', row.block_id);
        }
      }
    }
  }
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

// ─── Paste a copied run of weeks ─────────────────────────────────────────────

/** Next free session_order in a block, remembered per block so several clones in one paste don't collide. */
async function nextSessionOrder(blockId, counters) {
  if (!counters.has(blockId)) {
    const { data } = await supabase
      .from('block_sessions').select('session_order')
      .eq('block_id', blockId).order('session_order', { ascending: false }).limit(1).maybeSingle();
    counters.set(blockId, (data?.session_order ?? -1) + 1);
  }
  const n = counters.get(blockId);
  counters.set(blockId, n + 1);
  return n;
}

/**
 * Full copy of a block_session into another block: name, notes, sections, every exercise (with its section,
 * superset grouping, warm-up flag, notes). Prescriptions are copied separately, per week, so the same clone
 * can serve several pasted weeks. Returns the new id and a map of old exercise id → new exercise id.
 */
async function cloneBlockSessionFull(sourceBlockSessionId, targetBlockId, counters) {
  const { data: src, error: e1 } = await supabase
    .from('block_sessions').select('session_name, coach_notes').eq('id', sourceBlockSessionId).single();
  if (e1) return { ok: false, error: e1 };

  const { data: ns, error: e2 } = await supabase
    .from('block_sessions')
    .insert({
      block_id: targetBlockId,
      session_name: src.session_name,
      session_order: await nextSessionOrder(targetBlockId, counters),
      coach_notes: src.coach_notes,
    })
    .select().single();
  if (e2) return { ok: false, error: e2 };

  const { data: srcSections, error: e3 } = await supabase
    .from('session_sections').select('id, name, display_order, is_warm_up')
    .eq('block_session_id', sourceBlockSessionId).order('display_order', { ascending: true });
  if (e3) return { ok: false, error: e3, blockSessionId: ns.id };
  const sectionMap = new Map();
  if (srcSections?.length) {
    const { data: newSections, error: e4 } = await supabase
      .from('session_sections')
      .insert(srcSections.map(({ id: _id, ...rest }) => ({ ...rest, block_session_id: ns.id })))
      .select();
    if (e4) return { ok: false, error: e4, blockSessionId: ns.id };
    srcSections.forEach((sec, i) => sectionMap.set(sec.id, newSections[i].id));
  }

  const { data: srcEx, error: e5 } = await supabase
    .from('session_exercises')
    .select('id, exercise_id, display_order, group_label, group_colour, prescription_type, notes, is_warm_up, section_id, superset_group_id')
    .eq('block_session_id', sourceBlockSessionId).order('display_order', { ascending: true });
  if (e5) return { ok: false, error: e5, blockSessionId: ns.id };

  const exMap = new Map();
  if (srcEx?.length) {
    const supersetMap = new Map();
    const rows = srcEx.map(({ id: _id, section_id, superset_group_id, ...rest }) => {
      if (superset_group_id && !supersetMap.has(superset_group_id)) supersetMap.set(superset_group_id, crypto.randomUUID());
      return {
        ...rest,
        block_session_id: ns.id,
        section_id: section_id ? (sectionMap.get(section_id) ?? null) : null,
        superset_group_id: superset_group_id ? supersetMap.get(superset_group_id) : null,
      };
    });
    const { data: newEx, error: e6 } = await supabase.from('session_exercises').insert(rows).select();
    if (e6) return { ok: false, error: e6, blockSessionId: ns.id };
    srcEx.forEach((ex, i) => exMap.set(ex.id, newEx[i].id));
  }
  return { ok: true, blockSessionId: ns.id, exMap };
}

/** Copy the loads for one source week onto a clone, as the target week. Exact week, else the nearest earlier one, else the first. */
async function copyWeekPrescriptions(exMap, sourceWeek, targetWeek) {
  const oldIds = [...exMap.keys()];
  if (!oldIds.length) return { ok: true };
  const { data, error } = await supabase
    .from('exercise_week_prescriptions')
    .select('session_exercise_id, week_number, sets, reps, target_value, rest_seconds, override_exercise_id')
    .in('session_exercise_id', oldIds);
  if (error) return { ok: false, error };

  const byEx = new Map();
  for (const p of data || []) {
    if (!byEx.has(p.session_exercise_id)) byEx.set(p.session_exercise_id, []);
    byEx.get(p.session_exercise_id).push(p);
  }
  const rows = [];
  for (const [oldId, list] of byEx) {
    list.sort((a, b) => a.week_number - b.week_number);
    const pick = list.find(p => p.week_number === sourceWeek)
      || [...list].reverse().find(p => p.week_number < sourceWeek)
      || list[0];
    rows.push({
      session_exercise_id: exMap.get(oldId),
      week_number: targetWeek,
      sets: pick.sets,
      reps: pick.reps,
      target_value: pick.target_value,
      rest_seconds: pick.rest_seconds,
      override_exercise_id: pick.override_exercise_id,
    });
  }
  if (!rows.length) return { ok: true };
  const { error: insErr } = await supabase.from('exercise_week_prescriptions').insert(rows);
  return insErr ? { ok: false, error: insErr } : { ok: true };
}

/**
 * Paste planned sessions onto an athlete (the same one or another).
 *
 * pairs = [{ plannedId, targetDateISO }] — see planPaste() in utils/weekClipboard.
 *
 *   • Same athlete, target date inside the source session's own block → the session is simply re-planned on
 *     the new date and follows that block's programme for the new week (how copy/repeat already behaves).
 *   • Anywhere else (a different block, no block yet, another athlete) → the session is copied in full, with
 *     the loads it had in its source week, into the block covering that date — or a new FreeForm week.
 *
 * Returns { ok, copied, reused, cloned, missing, created } where `created` is what undoPastedSessions() needs.
 */
export async function pastePlannedSessions({ pairs, targetAthleteId }) {
  const created = { plannedIds: [], blockSessionIds: [], blockIds: [] };
  if (!pairs?.length) return { ok: true, copied: 0, reused: 0, cloned: 0, missing: 0, created };

  const { data: srcRows, error: e1 } = await supabase
    .from('planned_sessions').select('id, athlete_id, block_id, block_session_id, week_number')
    .in('id', pairs.map(p => p.plannedId));
  if (e1) return { ok: false, error: e1, created };
  const srcById = new Map(srcRows.map(r => [r.id, r]));

  const { data: blocks, error: e2 } = await supabase
    .from('training_blocks').select('id, start_date, end_date')
    .in('id', [...new Set(srcRows.map(r => r.block_id))]);
  if (e2) return { ok: false, error: e2, created };
  const blockById = new Map(blocks.map(b => [b.id, b]));

  const clones = new Map();        // "srcBlockSession|targetBlock" → { blockSessionId, exMap }
  const weeksDone = new Set();     // "cloneId|targetWeek" — loads already copied
  const counters = new Map();      // session_order counters per target block
  const blockForDate = new Map();  // dateISO → target block
  const rows = [];
  let reused = 0, cloned = 0, missing = 0;

  for (const { plannedId, targetDateISO } of pairs) {
    const src = srcById.get(plannedId);
    if (!src) { missing++; continue; }
    const srcBlock = blockById.get(src.block_id);
    const reuseWeek = src.athlete_id === targetAthleteId && srcBlock
      ? weekNumberWithin(srcBlock.start_date, srcBlock.end_date, targetDateISO) : null;

    if (reuseWeek != null) {
      rows.push({ athlete_id: targetAthleteId, block_id: src.block_id, block_session_id: src.block_session_id,
        week_number: reuseWeek, planned_date: targetDateISO, status: 'planned' });
      reused++;
      continue;
    }

    let target = blockForDate.get(targetDateISO);
    if (!target) {
      const found = await findOrCreateFreeFormBlock(targetAthleteId, targetDateISO);
      if (!found.ok) return { ok: false, error: found.error, created };
      target = found.block;
      if (found.created) created.blockIds.push(target.id);
      blockForDate.set(targetDateISO, target);
    }
    const targetWeek = weekNumberWithin(target.start_date, target.end_date, targetDateISO);

    const key = `${src.block_session_id}|${target.id}`;
    let clone = clones.get(key);
    if (!clone) {
      const c = await cloneBlockSessionFull(src.block_session_id, target.id, counters);
      if (c.blockSessionId) created.blockSessionIds.push(c.blockSessionId);
      if (!c.ok) return { ok: false, error: c.error, created };
      clone = c;
      clones.set(key, clone);
    }
    const wk = `${clone.blockSessionId}|${targetWeek}`;
    if (!weeksDone.has(wk)) {
      weeksDone.add(wk);
      const p = await copyWeekPrescriptions(clone.exMap, src.week_number, targetWeek);
      if (!p.ok) return { ok: false, error: p.error, created };
    }
    rows.push({ athlete_id: targetAthleteId, block_id: target.id, block_session_id: clone.blockSessionId,
      week_number: targetWeek, planned_date: targetDateISO, status: 'planned' });
    cloned++;
  }

  if (!rows.length) {
    return { ok: false, error: new Error('Nothing to paste — the copied sessions no longer exist.'), created };
  }
  const { data, error } = await supabase.from('planned_sessions').insert(rows).select('id');
  if (error) return { ok: false, error, created };
  created.plannedIds = (data || []).map(r => r.id);
  return { ok: true, copied: rows.length, reused, cloned, missing, created };
}

/** Take back a paste: remove the sessions it added, the copies it made, and any FreeForm weeks it created. */
export async function undoPastedSessions(created) {
  if (created?.plannedIds?.length) {
    const { error } = await supabase.from('planned_sessions').delete().in('id', created.plannedIds);
    if (error) return { ok: false, error };
  }
  if (created?.blockSessionIds?.length) {
    const { error } = await supabase.from('block_sessions').delete().in('id', created.blockSessionIds);
    if (error) return { ok: false, error };
  }
  if (created?.blockIds?.length) {
    // Only the empty FreeForm weeks this paste created.
    const { error } = await supabase.from('training_blocks').delete().in('id', created.blockIds).eq('block_name', FREEFORM_NAME);
    if (error) return { ok: false, error };
  }
  return { ok: true };
}

/** Clear 'planned' (not completed / missed) sessions from a date range — the "Replace" choice when pasting over a busy week. */
export async function clearPlannedInRange(athleteId, startISO, endISO) {
  const { data, error } = await supabase
    .from('planned_sessions').select('id')
    .eq('athlete_id', athleteId).eq('status', 'planned')
    .gte('planned_date', startISO).lte('planned_date', endISO);
  if (error) return { ok: false, error };
  for (const { id } of data || []) {
    const res = await deletePlannedSession(id);
    if (!res.ok) return res;
  }
  return { ok: true, deleted: (data || []).length };
}
