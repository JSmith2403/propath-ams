import { supabase } from '../lib/supabase';
import { addDaysISO } from './blockHelpers';

/**
 * Programme template persistence.
 *
 * Save: writes a coach-built block draft into the five template tables
 *   block_templates -> block_template_sessions -> session_templates
 *   session_templates -> session_sections -> session_template_exercises
 *   session_template_exercises -> session_template_week_prescriptions
 *
 * Apply: copies a saved block_template into the athlete-attached
 *   training_blocks tree (training_blocks -> block_sessions ->
 *   session_sections + session_exercises -> exercise_week_prescriptions).
 *
 * Templates and athlete-attached programming are independent snapshots.
 * Editing a template later does NOT propagate into already-applied
 * blocks; applying a template again creates a fresh copy.
 */

// ─── helpers ──────────────────────────────────────────────────────────

function clampPositive(n, fallback = 1) {
  const v = Number(n);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

// Build a list of week_prescriptions rows for an exercise, coercing
// invalid values so the DB CHECK constraints pass.
function safeWeekRows(weekPrescriptions, parentIdField, parentId) {
  return (weekPrescriptions || []).map(wp => ({
    [parentIdField]: parentId,
    week_number: clampPositive(wp.week_number, 1),
    sets: clampPositive(wp.sets, 1),
    reps: (wp.reps == null || wp.reps === '') ? '1' : String(wp.reps),
    target_value: wp.target_value || null,
    rest_seconds: (wp.rest_seconds == null || wp.rest_seconds === '')
      ? null
      : Math.max(0, Number(wp.rest_seconds)),
  }));
}

// ─── SAVE ─────────────────────────────────────────────────────────────

/**
 * Persist a draft (the in-memory shape produced by BlockBuilderModal)
 * as a block_template + child rows. Returns { ok, blockTemplateId } or
 * { ok: false, error }. On any failure mid-write the parent
 * block_template is deleted so child cascade cleans the rest.
 */
export async function saveBlockTemplate(draft) {
  if (!draft?.block?.name?.trim()) {
    return { ok: false, error: new Error('Block name is required.') };
  }
  if (!draft.sessions?.length) {
    return { ok: false, error: new Error('At least one session is required.') };
  }

  // 1. block_templates
  const { data: bt, error: btErr } = await supabase
    .from('block_templates')
    .insert({
      name: draft.block.name.trim(),
      description: draft.block.description?.trim() || null,
      default_duration_weeks: clampPositive(draft.block.duration_weeks, 4),
    })
    .select()
    .single();
  if (btErr) {
    console.error('[Templates] block_templates insert failed', btErr);
    return { ok: false, error: btErr };
  }

  try {
    for (let si = 0; si < draft.sessions.length; si++) {
      const sess = draft.sessions[si];

      // 2. session_templates
      const { data: st, error: stErr } = await supabase
        .from('session_templates')
        .insert({
          name: (sess.name || `Session ${si + 1}`).trim(),
          description: sess.notes?.trim() || null,
        })
        .select()
        .single();
      if (stErr) throw stErr;

      // 3. block_template_sessions (link)
      const { error: linkErr } = await supabase
        .from('block_template_sessions')
        .insert({
          block_template_id: bt.id,
          session_template_id: st.id,
          session_order: si,
        });
      if (linkErr) throw linkErr;

      const sections = sess.sections || [];
      if (!sections.length) continue;

      // 4. session_sections
      const sectionRows = sections.map((sec, i) => ({
        session_template_id: st.id,
        name: (sec.name || `Section ${i + 1}`).trim(),
        display_order: i,
        is_warm_up: !!sec.is_warm_up,
      }));
      const { data: insertedSections, error: secErr } = await supabase
        .from('session_sections')
        .insert(sectionRows)
        .select();
      if (secErr) throw secErr;

      const sectionIdByTempId = {};
      sections.forEach((sec, i) => { sectionIdByTempId[sec.tempId] = insertedSections[i].id; });

      // 5. session_template_exercises + session_step_notes (interleaved)
      // Both share a single session-wide display_order space so notes
      // sit between exercises faithfully on reload.
      const exerciseRows = [];
      const noteRows     = [];
      let order = 0;
      for (const sec of sections) {
        for (const step of (sec.exercises || [])) {
          if (step.kind === 'note') {
            noteRows.push({
              session_template_id: st.id,
              section_id:          sectionIdByTempId[sec.tempId],
              display_order:       order++,
              content:             step.content || null,
            });
            continue;
          }
          if (!step.exercise_id) continue;
          exerciseRows.push({
            session_template_id: st.id,
            section_id:          sectionIdByTempId[sec.tempId],
            exercise_id:         step.exercise_id,
            display_order:       order++,
            prescription_type:   step.prescription_type || 'kg',
            notes:               step.notes || null,
            is_warm_up:          !!sec.is_warm_up,
            superset_group_id:   step.superset_group_id || null,
          });
        }
      }

      let insertedExercises = [];
      if (exerciseRows.length) {
        const { data, error: exErr } = await supabase
          .from('session_template_exercises')
          .insert(exerciseRows)
          .select();
        if (exErr) throw exErr;
        insertedExercises = data;
      }

      if (noteRows.length) {
        const { error: noteErr } = await supabase
          .from('session_step_notes')
          .insert(noteRows);
        if (noteErr) throw noteErr;
      }

      // 6. session_template_week_prescriptions (one batch per session)
      // Walk steps in the same order as the exercise insert above so we
      // can pair each inserted row with its source step.
      if (insertedExercises.length) {
        const wpRows = [];
        let cursor = 0;
        for (const sec of sections) {
          for (const step of (sec.exercises || [])) {
            if (step.kind === 'note') continue;
            if (!step.exercise_id) continue;
            const inserted = insertedExercises[cursor++];
            wpRows.push(...safeWeekRows(step.week_prescriptions, 'session_template_exercise_id', inserted.id));
          }
        }
        if (wpRows.length) {
          const { error: wpErr } = await supabase
            .from('session_template_week_prescriptions')
            .insert(wpRows);
          if (wpErr) throw wpErr;
        }
      }
    }
  } catch (e) {
    console.error('[Templates] save failed mid-write, cleaning up block_template', bt.id, e);
    await supabase.from('block_templates').delete().eq('id', bt.id);
    return { ok: false, error: e };
  }

  return { ok: true, blockTemplateId: bt.id };
}

// ─── LIST ─────────────────────────────────────────────────────────────

export async function listBlockTemplates() {
  const { data: blocks, error } = await supabase
    .from('block_templates')
    .select('id, name, description, default_duration_weeks, is_active, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) return { ok: false, error };

  // Pull per-block session counts in one go
  const ids = (blocks || []).map(b => b.id);
  let sessionCounts = {};
  if (ids.length) {
    const { data: links } = await supabase
      .from('block_template_sessions')
      .select('block_template_id')
      .in('block_template_id', ids);
    sessionCounts = (links || []).reduce((acc, r) => {
      acc[r.block_template_id] = (acc[r.block_template_id] || 0) + 1;
      return acc;
    }, {});
  }

  const enriched = (blocks || []).map(b => ({
    ...b,
    session_count: sessionCounts[b.id] || 0,
  }));
  return { ok: true, templates: enriched };
}

/**
 * Load a saved block_template back into the in-memory draft shape that
 * BlockBuilderModal consumes. Used by the Templates tab's edit pencil.
 *
 * Returns { ok, draft } where draft mirrors the structure produced by
 * BuildTab.makeDraft(): { block: {...}, sessions: [{...sections:[{...exercises:[{...week_prescriptions:[]}]}]}] }
 */
export async function loadBlockTemplate(blockTemplateId) {
  const { data: bt, error: btErr } = await supabase
    .from('block_templates')
    .select('id, name, description, default_duration_weeks')
    .eq('id', blockTemplateId)
    .single();
  if (btErr) return { ok: false, error: btErr };

  const { data: links, error: linksErr } = await supabase
    .from('block_template_sessions')
    .select('session_template_id, session_order')
    .eq('block_template_id', blockTemplateId)
    .order('session_order', { ascending: true });
  if (linksErr) return { ok: false, error: linksErr };

  const sessionIds = (links || []).map(l => l.session_template_id);
  if (!sessionIds.length) {
    return {
      ok: true,
      draft: {
        block: {
          name: bt.name,
          duration_weeks: bt.default_duration_weeks,
          description: bt.description || '',
        },
        sessions: [],
      },
    };
  }

  const [
    { data: stRows,      error: stErr },
    { data: sectionRows, error: secErr },
    { data: exRows,      error: exErr  },
    { data: noteRows,    error: noteErr },
  ] = await Promise.all([
    supabase.from('session_templates')
      .select('id, name, description')
      .in('id', sessionIds),
    supabase.from('session_sections')
      .select('id, session_template_id, name, display_order, is_warm_up')
      .in('session_template_id', sessionIds)
      .order('display_order', { ascending: true }),
    supabase.from('session_template_exercises')
      .select('id, session_template_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up, superset_group_id')
      .in('session_template_id', sessionIds)
      .order('display_order', { ascending: true }),
    supabase.from('session_step_notes')
      .select('id, session_template_id, section_id, display_order, content')
      .in('session_template_id', sessionIds)
      .order('display_order', { ascending: true }),
  ]);
  if (stErr)   return { ok: false, error: stErr };
  if (secErr)  return { ok: false, error: secErr };
  if (exErr)   return { ok: false, error: exErr };
  if (noteErr) return { ok: false, error: noteErr };

  // Week prescriptions for these exercises
  const exIds = (exRows || []).map(e => e.id);
  let wpRows = [];
  if (exIds.length) {
    const { data, error } = await supabase
      .from('session_template_week_prescriptions')
      .select('session_template_exercise_id, week_number, sets, reps, target_value, rest_seconds')
      .in('session_template_exercise_id', exIds);
    if (error) return { ok: false, error };
    wpRows = data || [];
  }

  // Library lookups (name, category, default prescription type, bilateral)
  const libIds = [...new Set((exRows || []).map(e => e.exercise_id))];
  let libById = {};
  if (libIds.length) {
    const { data: lib, error } = await supabase
      .from('exercise_library')
      .select('id, name, category, bilateral_unilateral')
      .in('id', libIds);
    if (error) return { ok: false, error };
    libById = Object.fromEntries((lib || []).map(l => [l.id, l]));
  }

  const stById = Object.fromEntries((stRows || []).map(s => [s.id, s]));

  const sessions = (links || []).map((link, idx) => {
    const stMeta     = stById[link.session_template_id] || {};
    const stSections = (sectionRows || [])
      .filter(s => s.session_template_id === link.session_template_id)
      .sort((a, b) => a.display_order - b.display_order);
    return {
      tempId: `sess-${link.session_template_id}`,
      name:   stMeta.name || `Session ${idx + 1}`,
      notes:  stMeta.description || '',
      sections: stSections.map(sec => {
        // Pull this section's exercises and notes, then interleave by
        // their session-wide display_order so the steps array reflects
        // what the coach saw at save time.
        const sectionExercises = (exRows || []).filter(e => e.section_id === sec.id);
        const sectionNotes     = (noteRows || []).filter(n => n.section_id === sec.id);
        const merged = [...sectionExercises, ...sectionNotes]
          .sort((a, b) => a.display_order - b.display_order);
        return {
          tempId:        `sec-${sec.id}`,
          name:          sec.name,
          is_warm_up:    !!sec.is_warm_up,
          display_order: sec.display_order,
          exercises:     merged.map(row => {
            // Note rows have content, no exercise_id.
            if ('content' in row && row.exercise_id === undefined) {
              return {
                kind:        'note',
                tempId:      `note-${row.id}`,
                _existingId: row.id,
                content:     row.content || '',
              };
            }
            const ex = row;
            const lib = libById[ex.exercise_id] || {};
            const wps = wpRows
              .filter(wp => wp.session_template_exercise_id === ex.id)
              .sort((a, b) => a.week_number - b.week_number)
              .map(wp => ({
                week_number:  wp.week_number,
                sets:         wp.sets,
                reps:         wp.reps,
                target_value: wp.target_value || '',
                rest_seconds: wp.rest_seconds,
              }));
            return {
              tempId:                    `ex-${ex.id}`,
              exercise_id:               ex.exercise_id,
              exercise_name:             lib.name || '(missing exercise)',
              category:                  lib.category,
              bilateral_unilateral:      lib.bilateral_unilateral,
              default_prescription_type: 'kg',
              prescription_type:         ex.prescription_type,
              notes:                     ex.notes || '',
              superset_group_id:         ex.superset_group_id,
              week_prescriptions:        wps,
            };
          }),
        };
      }),
    };
  });

  return {
    ok: true,
    draft: {
      block: {
        name: bt.name,
        duration_weeks: bt.default_duration_weeks,
        description: bt.description || '',
      },
      sessions,
    },
  };
}

// ─── ATHLETE-ATTACHED BLOCKS ──────────────────────────────────────────
// Brief 5a — clicking a block on a per-athlete timeline opens the
// session builder for THAT block's content (the athlete's snapshot,
// not the template). These helpers load and save that snapshot.

/**
 * Load an athlete-attached training_block + its full session tree into
 * the same draft shape BlockBuilderModal consumes. The returned draft
 * carries the training_blocks.id on draft.block.id so save handlers
 * can target the right row, and a `mode: 'athlete'` marker.
 */
export async function loadAthleteBlock(blockId) {
  const { data: tb, error: tbErr } = await supabase
    .from('training_blocks')
    .select('id, athlete_id, block_name, start_date, end_date, duration_weeks, notes, source_template_id')
    .eq('id', blockId)
    .single();
  if (tbErr) return { ok: false, error: tbErr };

  const { data: sessions, error: sErr } = await supabase
    .from('block_sessions')
    .select('id, session_name, session_order, coach_notes')
    .eq('block_id', blockId)
    .order('session_order', { ascending: true });
  if (sErr) return { ok: false, error: sErr };

  const sessionIds = (sessions || []).map(s => s.id);
  let sectionRows = [], exerciseRows = [], wpRows = [], noteRows = [];
  if (sessionIds.length) {
    const [{ data: secs, error: secErr },
           { data: exs,  error: exErr  },
           { data: nts,  error: noteErr }] = await Promise.all([
      supabase.from('session_sections')
        .select('id, block_session_id, name, display_order, is_warm_up')
        .in('block_session_id', sessionIds)
        .order('display_order', { ascending: true }),
      supabase.from('session_exercises')
        .select('id, block_session_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up, superset_group_id')
        .in('block_session_id', sessionIds)
        .order('display_order', { ascending: true }),
      supabase.from('session_step_notes')
        .select('id, block_session_id, section_id, display_order, content')
        .in('block_session_id', sessionIds)
        .order('display_order', { ascending: true }),
    ]);
    if (secErr)  return { ok: false, error: secErr };
    if (exErr)   return { ok: false, error: exErr };
    if (noteErr) return { ok: false, error: noteErr };
    sectionRows  = secs || [];
    exerciseRows = exs  || [];
    noteRows     = nts  || [];

    if (exerciseRows.length) {
      const { data: wps, error: wpErr } = await supabase
        .from('exercise_week_prescriptions')
        .select('session_exercise_id, week_number, sets, reps, target_value, rest_seconds')
        .in('session_exercise_id', exerciseRows.map(e => e.id));
      if (wpErr) return { ok: false, error: wpErr };
      wpRows = wps || [];
    }
  }

  // Library lookups for names/categories
  const libIds = [...new Set(exerciseRows.map(e => e.exercise_id))];
  let libById = {};
  if (libIds.length) {
    const { data: lib, error } = await supabase
      .from('exercise_library')
      .select('id, name, category, bilateral_unilateral')
      .in('id', libIds);
    if (error) return { ok: false, error };
    libById = Object.fromEntries((lib || []).map(l => [l.id, l]));
  }

  const draftSessions = (sessions || []).map((sess, idx) => {
    const sessSections = sectionRows
      .filter(s => s.block_session_id === sess.id)
      .sort((a, b) => a.display_order - b.display_order);
    return {
      tempId: `sess-${sess.id}`,
      _existingId: sess.id,
      name: sess.session_name || `Session ${idx + 1}`,
      notes: sess.coach_notes || '',
      sections: sessSections.map(sec => {
        const secExs   = exerciseRows.filter(e => e.section_id === sec.id);
        const secNotes = noteRows.filter(n => n.section_id === sec.id);
        const merged   = [...secExs, ...secNotes].sort((a, b) => a.display_order - b.display_order);
        return {
          tempId: `sec-${sec.id}`,
          _existingId: sec.id,
          name: sec.name,
          is_warm_up: !!sec.is_warm_up,
          display_order: sec.display_order,
          exercises: merged.map(row => {
            if ('content' in row && row.exercise_id === undefined) {
              return {
                kind:        'note',
                tempId:      `note-${row.id}`,
                _existingId: row.id,
                content:     row.content || '',
              };
            }
            const ex  = row;
            const lib = libById[ex.exercise_id] || {};
            const wps = wpRows
              .filter(wp => wp.session_exercise_id === ex.id)
              .sort((a, b) => a.week_number - b.week_number)
              .map(wp => ({
                week_number:  wp.week_number,
                sets:         wp.sets,
                reps:         wp.reps,
                target_value: wp.target_value || '',
                rest_seconds: wp.rest_seconds,
              }));
            return {
              tempId:                    `ex-${ex.id}`,
              _existingId:               ex.id,
              exercise_id:               ex.exercise_id,
              exercise_name:             lib.name || '(missing exercise)',
              category:                  lib.category,
              bilateral_unilateral:      lib.bilateral_unilateral,
              default_prescription_type: 'kg',
              prescription_type:         ex.prescription_type,
              notes:                     ex.notes || '',
              superset_group_id:         ex.superset_group_id,
              week_prescriptions:        wps,
            };
          }),
        };
      }),
    };
  });

  return {
    ok: true,
    draft: {
      mode: 'athlete',
      block: {
        id: tb.id,
        name: tb.block_name,
        duration_weeks: tb.duration_weeks,
        description: tb.notes || '',
      },
      sessions: draftSessions,
    },
  };
}

/**
 * Save edits made to an athlete-attached block. Strategy: delete the
 * existing block_sessions tree (cascade clears children) and insert a
 * fresh tree. The training_blocks row keeps its id, athlete_id, dates,
 * and duration_weeks — those are managed via the block-details modal.
 * Only `notes` updates from the builder.
 */
export async function saveAthleteBlock(blockId, draft) {
  if (!blockId) return { ok: false, error: new Error('Block id required.') };
  if (!draft?.sessions?.length) {
    return { ok: false, error: new Error('Block must have at least one session.') };
  }

  // 1. Update training_blocks.notes (everything else stays put)
  const { error: tbErr } = await supabase
    .from('training_blocks')
    .update({ notes: draft.block.description?.trim() || null })
    .eq('id', blockId);
  if (tbErr) return { ok: false, error: tbErr };

  // 2. Wipe existing sessions (cascade kills sections / exercises / prescriptions)
  const { error: delErr } = await supabase
    .from('block_sessions')
    .delete()
    .eq('block_id', blockId);
  if (delErr) return { ok: false, error: delErr };

  // 3. Re-insert from draft
  try {
    for (let si = 0; si < draft.sessions.length; si++) {
      const sess = draft.sessions[si];

      const { data: bs, error: bsErr } = await supabase
        .from('block_sessions')
        .insert({
          block_id: blockId,
          session_name: (sess.name || `Session ${si + 1}`).trim(),
          session_order: si,
          coach_notes: sess.notes?.trim() || null,
        })
        .select()
        .single();
      if (bsErr) throw bsErr;

      const sections = sess.sections || [];
      if (!sections.length) continue;

      const sectionRows = sections.map((sec, i) => ({
        block_session_id: bs.id,
        name: (sec.name || `Section ${i + 1}`).trim(),
        display_order: i,
        is_warm_up: !!sec.is_warm_up,
      }));
      const { data: insertedSecs, error: secErr } = await supabase
        .from('session_sections')
        .insert(sectionRows)
        .select();
      if (secErr) throw secErr;

      const sectionIdByTempId = {};
      sections.forEach((sec, i) => { sectionIdByTempId[sec.tempId] = insertedSecs[i].id; });

      const exerciseRows = [];
      const noteRows     = [];
      let order = 0;
      for (const sec of sections) {
        for (const step of (sec.exercises || [])) {
          if (step.kind === 'note') {
            noteRows.push({
              block_session_id: bs.id,
              section_id:       sectionIdByTempId[sec.tempId],
              display_order:    order++,
              content:          step.content || null,
            });
            continue;
          }
          if (!step.exercise_id) continue;
          exerciseRows.push({
            block_session_id:  bs.id,
            section_id:        sectionIdByTempId[sec.tempId],
            exercise_id:       step.exercise_id,
            display_order:     order++,
            prescription_type: step.prescription_type || 'kg',
            notes:             step.notes || null,
            is_warm_up:        !!sec.is_warm_up,
            superset_group_id: step.superset_group_id || null,
          });
        }
      }

      let insertedExs = [];
      if (exerciseRows.length) {
        const { data, error: exErr } = await supabase
          .from('session_exercises')
          .insert(exerciseRows)
          .select();
        if (exErr) throw exErr;
        insertedExs = data;
      }

      if (noteRows.length) {
        const { error: noteErr } = await supabase
          .from('session_step_notes')
          .insert(noteRows);
        if (noteErr) throw noteErr;
      }

      if (insertedExs.length) {
        const wpRows = [];
        let cursor = 0;
        for (const sec of sections) {
          for (const step of (sec.exercises || [])) {
            if (step.kind === 'note') continue;
            if (!step.exercise_id) continue;
            const inserted = insertedExs[cursor++];
            wpRows.push(...safeWeekRows(step.week_prescriptions, 'session_exercise_id', inserted.id));
          }
        }
        if (wpRows.length) {
          const { error: wpErr } = await supabase
            .from('exercise_week_prescriptions')
            .insert(wpRows);
          if (wpErr) throw wpErr;
        }
      }
    }
  } catch (e) {
    console.error('[Block] saveAthleteBlock failed mid-write', e);
    return { ok: false, error: e };
  }

  return { ok: true, blockId };
}

/**
 * Update an existing template by saving a fresh tree under a new
 * block_templates row, then deleting the old one. Save-then-delete
 * order means the user keeps their old template if the new write
 * fails. The returned blockTemplateId is the new id.
 */
export async function updateBlockTemplate(oldBlockTemplateId, draft) {
  const saveRes = await saveBlockTemplate(draft);
  if (!saveRes.ok) return saveRes;
  const delRes = await deleteBlockTemplate(oldBlockTemplateId);
  if (!delRes.ok) {
    console.warn('[Templates] update: new saved, old delete failed — leaves a duplicate', { oldBlockTemplateId, newId: saveRes.blockTemplateId, error: delRes.error });
  }
  return saveRes;
}

export async function deleteBlockTemplate(blockTemplateId) {
  // session_templates referenced by block_template_sessions are NOT
  // cascaded through block_templates → they're independent rows.
  // Soft-delete the join + the block_template itself; orphan
  // session_templates can be cleaned later if needed.
  const { error } = await supabase
    .from('block_templates')
    .delete()
    .eq('id', blockTemplateId);
  return error ? { ok: false, error } : { ok: true };
}

// ─── APPLY (template → athlete) ───────────────────────────────────────

/**
 * Copy a block_template into an athlete's training_blocks tree.
 *
 * @param {object} args
 * @param {string} args.blockTemplateId
 * @param {string} args.athleteId
 * @param {string} args.startDate    YYYY-MM-DD; end_date computed from duration_weeks
 * @param {string} [args.phaseId]    optional training_phases.id
 * @param {string} [args.blockName]  override the template's name
 * @param {string} [args.notes]
 *
 * Returns { ok, trainingBlockId } or { ok: false, error }.
 */
export async function applyBlockTemplate({
  blockTemplateId,
  athleteId,
  startDate,
  phaseId = null,
  blockName,
  notes = null,
  // Brief 5d/5e — optional. When provided, generate one
  // planned_sessions row per (week × session) using these weekday
  // numbers (1=Mon..7=Sun). Length must equal the template's session
  // count or generation is skipped.
  intendedDays = null,
}) {
  if (!blockTemplateId) return { ok: false, error: new Error('Template required.') };
  if (!athleteId)       return { ok: false, error: new Error('Athlete required.') };
  if (!startDate)       return { ok: false, error: new Error('Start date required.') };

  // 1. Fetch template tree
  const { data: tpl, error: tplErr } = await supabase
    .from('block_templates')
    .select('id, name, description, default_duration_weeks')
    .eq('id', blockTemplateId)
    .single();
  if (tplErr) return { ok: false, error: tplErr };

  const { data: links, error: linksErr } = await supabase
    .from('block_template_sessions')
    .select('session_template_id, session_order')
    .eq('block_template_id', blockTemplateId)
    .order('session_order', { ascending: true });
  if (linksErr) return { ok: false, error: linksErr };

  const sessionTemplateIds = (links || []).map(l => l.session_template_id);
  if (!sessionTemplateIds.length) {
    return { ok: false, error: new Error('Template has no sessions.') };
  }

  // Pull all sections + exercises + step notes for these sessions
  const [{ data: sections,    error: sErr },
         { data: exercises,   error: eErr },
         { data: stepNotes,   error: nErr }] = await Promise.all([
    supabase.from('session_sections')
      .select('id, session_template_id, name, display_order, is_warm_up')
      .in('session_template_id', sessionTemplateIds)
      .order('display_order', { ascending: true }),
    supabase.from('session_template_exercises')
      .select('id, session_template_id, section_id, exercise_id, display_order, prescription_type, notes, is_warm_up, superset_group_id')
      .in('session_template_id', sessionTemplateIds)
      .order('display_order', { ascending: true }),
    supabase.from('session_step_notes')
      .select('id, session_template_id, section_id, display_order, content')
      .in('session_template_id', sessionTemplateIds)
      .order('display_order', { ascending: true }),
  ]);
  if (sErr) return { ok: false, error: sErr };
  if (eErr) return { ok: false, error: eErr };
  if (nErr) return { ok: false, error: nErr };

  let weekPrescriptions = [];
  if ((exercises || []).length) {
    const exIds = exercises.map(e => e.id);
    const { data: wps, error: wpErr } = await supabase
      .from('session_template_week_prescriptions')
      .select('session_template_exercise_id, week_number, sets, reps, target_value, rest_seconds')
      .in('session_template_exercise_id', exIds);
    if (wpErr) return { ok: false, error: wpErr };
    weekPrescriptions = wps || [];
  }

  // Pull session_templates for their names
  const { data: sessionTemplates, error: stErr } = await supabase
    .from('session_templates')
    .select('id, name, description')
    .in('id', sessionTemplateIds);
  if (stErr) return { ok: false, error: stErr };
  const sessionTemplatesById = Object.fromEntries((sessionTemplates || []).map(s => [s.id, s]));

  // 2. Compute display_order for the new training_block (max+1 per athlete)
  const { data: existingBlocks } = await supabase
    .from('training_blocks')
    .select('display_order')
    .eq('athlete_id', athleteId);
  const nextOrder = ((existingBlocks || []).reduce((m, b) => Math.max(m, b.display_order || 0), 0)) + 1;

  // 3. Insert training_blocks
  const durationWeeks = clampPositive(tpl.default_duration_weeks, 4);
  const endDate = addDaysISO(startDate, durationWeeks * 7 - 1);
  const { data: tb, error: tbErr } = await supabase
    .from('training_blocks')
    .insert({
      athlete_id: athleteId,
      block_name: (blockName || tpl.name || 'Untitled block').trim(),
      start_date: startDate,
      end_date:   endDate,
      duration_weeks: durationWeeks,
      notes: notes || tpl.description || null,
      display_order: nextOrder,
      phase_id: phaseId,
    })
    .select()
    .single();
  if (tbErr) return { ok: false, error: tbErr };

  const insertedBlockSessions = []; // collected for planned_sessions generation

  try {
    for (let si = 0; si < links.length; si++) {
      const link = links[si];
      const stId = link.session_template_id;
      const stMeta = sessionTemplatesById[stId];

      // 4. block_sessions
      const { data: bs, error: bsErr } = await supabase
        .from('block_sessions')
        .insert({
          block_id: tb.id,
          session_name: stMeta?.name || `Session ${si + 1}`,
          session_order: si,
          coach_notes: stMeta?.description || null,
        })
        .select()
        .single();
      if (bsErr) throw bsErr;
      insertedBlockSessions.push(bs);

      // 5. session_sections (athlete-side, polymorphic block_session_id)
      const sessSections = sections.filter(s => s.session_template_id === stId);
      const sectionIdMap = {};
      if (sessSections.length) {
        const sectionRows = sessSections.map((sec, i) => ({
          block_session_id: bs.id,
          name: sec.name,
          display_order: i,
          is_warm_up: sec.is_warm_up,
        }));
        const { data: insertedSecs, error: secErr } = await supabase
          .from('session_sections')
          .insert(sectionRows)
          .select();
        if (secErr) throw secErr;
        sessSections.forEach((sec, i) => { sectionIdMap[sec.id] = insertedSecs[i].id; });
      }

      // 6. session_exercises + session_step_notes (interleaved)
      // Walk template steps in their original session-wide order so
      // the athlete-side display_orders preserve the layout.
      const sessExercises = exercises.filter(e => e.session_template_id === stId);
      const sessNotes     = stepNotes.filter(n => n.session_template_id === stId);
      const sessSteps     = [
        ...sessExercises.map(e => ({ kind: 'exercise', row: e })),
        ...sessNotes.map(n     => ({ kind: 'note',     row: n })),
      ].sort((a, b) => a.row.display_order - b.row.display_order);

      const newExerciseRows = [];
      const newNoteRows     = [];
      sessSteps.forEach((step, i) => {
        const mappedSectionId = step.row.section_id ? sectionIdMap[step.row.section_id] || null : null;
        if (step.kind === 'note') {
          newNoteRows.push({
            block_session_id: bs.id,
            section_id:       mappedSectionId,
            display_order:    i,
            content:          step.row.content || null,
          });
        } else {
          newExerciseRows.push({
            block_session_id:  bs.id,
            exercise_id:       step.row.exercise_id,
            display_order:     i,
            prescription_type: step.row.prescription_type,
            notes:             step.row.notes,
            is_warm_up:        step.row.is_warm_up,
            section_id:        mappedSectionId,
            superset_group_id: step.row.superset_group_id || null,
          });
        }
      });

      let insertedEx = [];
      if (newExerciseRows.length) {
        const { data, error: exErr } = await supabase
          .from('session_exercises')
          .insert(newExerciseRows)
          .select();
        if (exErr) throw exErr;
        insertedEx = data;
      }

      if (newNoteRows.length) {
        const { error: noteErr } = await supabase
          .from('session_step_notes')
          .insert(newNoteRows);
        if (noteErr) throw noteErr;
      }

      // 7. exercise_week_prescriptions — pair each inserted athlete-side
      // exercise with its template ancestor in step order.
      if (insertedEx.length) {
        const wpRows = [];
        let exCursor = 0;
        for (const step of sessSteps) {
          if (step.kind !== 'exercise') continue;
          const oldEx    = step.row;
          const inserted = insertedEx[exCursor++];
          const wps      = weekPrescriptions.filter(wp => wp.session_template_exercise_id === oldEx.id);
          wps.forEach(wp => {
            wpRows.push({
              session_exercise_id: inserted.id,
              week_number: wp.week_number,
              sets: clampPositive(wp.sets, 1),
              reps: (wp.reps == null || wp.reps === '') ? '1' : String(wp.reps),
              target_value: wp.target_value || null,
              rest_seconds: wp.rest_seconds ?? null,
            });
          });
        }
        if (wpRows.length) {
          const { error: wpErr } = await supabase
            .from('exercise_week_prescriptions')
            .insert(wpRows);
          if (wpErr) throw wpErr;
        }
      }
    }

    // 8. planned_sessions (Brief 5d/5e). Optional — only when caller
    // supplied intendedDays of the matching length. Each (week × session)
    // gets one row whose planned_date is computed by walking from the
    // Monday of the start week and offsetting by day-of-week.
    if (Array.isArray(intendedDays) && intendedDays.length === insertedBlockSessions.length) {
      const sortedDays = [...intendedDays].sort((a, b) => a - b); // 1=Mon..7=Sun
      const weekStartMonday = mondayOfWeekISO(startDate);
      const startCutoff     = startDate;
      const plannedRows = [];
      for (let weekN = 1; weekN <= durationWeeks; weekN++) {
        sortedDays.forEach((dow, sessIdx) => {
          const planned = addDaysISO(weekStartMonday, (weekN - 1) * 7 + (dow - 1));
          if (planned < startCutoff) return; // skip days before block start
          const bs = insertedBlockSessions[sessIdx];
          if (!bs) return;
          plannedRows.push({
            athlete_id:       athleteId,
            block_id:         tb.id,
            block_session_id: bs.id,
            week_number:      weekN,
            planned_date:     planned,
            status:           'planned',
          });
        });
      }
      if (plannedRows.length) {
        const { error: pErr } = await supabase
          .from('planned_sessions')
          .insert(plannedRows);
        if (pErr) throw pErr;
      }
    }
  } catch (e) {
    console.error('[Templates] apply failed mid-write, rolling back training_block', tb.id, e);
    await supabase.from('training_blocks').delete().eq('id', tb.id);
    return { ok: false, error: e };
  }

  return { ok: true, trainingBlockId: tb.id };
}

/**
 * Replace an athlete's exercise from a given week onwards. Sets
 * `override_exercise_id` on every exercise_week_prescriptions row for
 * the target session_exercise where week_number >= fromWeek. Past
 * weeks (and any weeks already overridden to a different exercise)
 * are left alone unless caller explicitly requests overwrite.
 *
 * @param {object} args
 * @param {string} args.sessionExerciseId  the original session_exercises row
 * @param {number} args.fromWeek           inclusive — apply to week >= fromWeek
 * @param {string} args.newExerciseId      exercise_library.id of the replacement
 *
 * Returns { ok, updated } or { ok: false, error }.
 */
export async function replaceExerciseFromWeek({ sessionExerciseId, fromWeek, newExerciseId }) {
  if (!sessionExerciseId) return { ok: false, error: new Error('Missing session_exercise_id.') };
  if (!newExerciseId)     return { ok: false, error: new Error('Missing replacement exercise.') };
  if (!Number.isFinite(fromWeek) || fromWeek < 1) {
    return { ok: false, error: new Error('fromWeek must be a positive integer.') };
  }
  const { data, error } = await supabase
    .from('exercise_week_prescriptions')
    .update({ override_exercise_id: newExerciseId })
    .eq('session_exercise_id', sessionExerciseId)
    .gte('week_number', fromWeek)
    .select();
  if (error) return { ok: false, error };
  return { ok: true, updated: data?.length || 0 };
}

/**
 * Clear an active replacement, restoring the original exercise from a
 * given week onwards.
 */
export async function clearExerciseOverrideFromWeek({ sessionExerciseId, fromWeek }) {
  if (!sessionExerciseId) return { ok: false, error: new Error('Missing session_exercise_id.') };
  if (!Number.isFinite(fromWeek) || fromWeek < 1) {
    return { ok: false, error: new Error('fromWeek must be a positive integer.') };
  }
  const { data, error } = await supabase
    .from('exercise_week_prescriptions')
    .update({ override_exercise_id: null })
    .eq('session_exercise_id', sessionExerciseId)
    .gte('week_number', fromWeek)
    .select();
  if (error) return { ok: false, error };
  return { ok: true, updated: data?.length || 0 };
}

// ─── Date helper ───────────────────────────────────────────────────────
// Returns the ISO date string of the Monday on/before the given ISO
// date. Operates in UTC to dodge timezone wobble.
function mondayOfWeekISO(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  const dow = d.getUTCDay();           // 0=Sun..6=Sat
  const offset = (dow + 6) % 7;        // Mon→0, Sun→6
  d.setUTCDate(d.getUTCDate() - offset);
  return d.toISOString().slice(0, 10);
}
