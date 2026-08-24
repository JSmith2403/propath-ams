import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Minus, MoreVertical, Plus, Sparkles } from 'lucide-react';
import SessionBlock from './SessionBlock';
import { ROW_STICKY_WIDTH, WEEK_COL_WIDTH } from './SessionExerciseRow';
import ConfirmDialog from '../../blocks/ConfirmDialog';
import { useBlockTemplates } from '../../../../hooks/useBlockTemplates';
import { loadBlockTemplate } from '../../../../utils/programmeTemplates';
import { currentWeekNumber } from '../../../../utils/blockGrid';
import ExercisePicker from './ExercisePicker';

const MIN_WEEKS    = 1;
const MAX_WEEKS    = 12;
const MIN_SESSIONS = 1;
const MAX_SESSIONS = 7;

function tempId(prefix) { return `${prefix}-${crypto.randomUUID()}`; }

function emptyWeekPrescriptions(weeks) {
  return Array.from({ length: weeks }, (_, i) => ({
    week_number: i + 1, sets: 3, reps: '8', target_value: '', rest_seconds: null,
  }));
}

function defaultSession(idx) {
  return {
    tempId: tempId('sess'),
    name: `Session ${idx + 1}`,
    notes: '',
    day: null, // 0-6 Mon-indexed weekday this session lands on each week
    sections: [
      { tempId: tempId('sec'), name: 'Warm-up', is_warm_up: true, display_order: 0, exercises: [] },
    ],
  };
}

function defaultDraft() {
  return {
    block: { name: 'Untitled block', duration_weeks: 4, description: '' },
    sessions: [defaultSession(0)],
  };
}

function reshapeWeeks(prescriptions, weeks) {
  const next = (prescriptions || []).slice(0, weeks);
  for (let i = next.length; i < weeks; i++) {
    next.push({ week_number: i + 1, sets: 3, reps: '8', target_value: '', rest_seconds: null });
  }
  return next.map((p, i) => ({ ...p, week_number: i + 1 }));
}

/**
 * BlockBuilderModal — block-scoped builder. Sessions render as a
 * vertical stack (no tabs). Each session has its own week-column
 * header and is collapsible. The whole body shares one horizontal
 * scroll context so sticky-left columns line up across sessions.
 */
export default function BlockBuilderModal({
  initialDraft,
  parentLocked = false,
  onSave,        // optional: (draft) => Promise<{ok, error?}>
  onClose,
  // Athlete-mode extensions (Brief 5a)
  athleteMode = false,
  onEditDetails,        // () => void — opens block-details modal
  onSaveAsTemplate,     // (draft) => Promise<{ok, error?}> — save current draft as a new template
  onDeleteBlock,        // () => void — confirm + delete block
  contextSubtitle,      // optional text under the block name (e.g. athlete name)
  focusSessionTempId,   // optional — collapse all other sessions on open
}) {
  const [draft, setDraft] = useState(() => initialDraft || defaultDraft());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [confirmApply, setConfirmApply] = useState(null); // { templateId, templateName }

  // Brief 5d — exercise picker side-panel target. null when picker is
  // closed; { sessionIdx, sectionId, sessionLabel } when open.
  const [pickerTarget, setPickerTarget] = useState(null);
  const openPickerForSection = (sessionIdx, sectionId) => {
    const sess = draft.sessions[sessionIdx];
    setPickerTarget({
      sessionIdx,
      sectionId,
      sessionLabel: sess?.name || `Session ${sessionIdx + 1}`,
    });
  };
  const closePicker = () => setPickerTarget(null);
  const handlePickerAdd = (libRow) => {
    if (!pickerTarget) return;
    addExerciseToSection(pickerTarget.sessionIdx, pickerTarget.sectionId, libRow);
  };
  const handlePickerAddNote = () => {
    if (!pickerTarget) return;
    addNoteToSection(pickerTarget.sessionIdx, pickerTarget.sectionId);
  };
  const initialSnapshot = useRef(JSON.stringify(draft));
  const isDirty = useMemo(
    () => JSON.stringify(draft) !== initialSnapshot.current,
    [draft],
  );

  const weeks = draft.block.duration_weeks;
  const totalWidth = ROW_STICKY_WIDTH + weeks * WEEK_COL_WIDTH;

  // Athlete-mode only — drives the "this week" labels in the
  // exercise-replace scope dialog. Null in template mode (no dates).
  const currentWk = useMemo(() => {
    if (draft.mode !== 'athlete') return null;
    return currentWeekNumber({
      start_date:     draft.block.start_date,
      duration_weeks: draft.block.duration_weeks,
    });
  }, [draft.mode, draft.block.start_date, draft.block.duration_weeks]);

  // ── Block-level setters ─────────────────────────────────────────────────
  const setBlockName = (name) =>
    setDraft(d => ({ ...d, block: { ...d.block, name } }));
  const setBlockDescription = (description) =>
    setDraft(d => ({ ...d, block: { ...d.block, description } }));

  const setBlockWeeks = (n) => {
    const w = Math.max(MIN_WEEKS, Math.min(MAX_WEEKS, n));
    setDraft(d => ({
      ...d,
      block: { ...d.block, duration_weeks: w },
      sessions: d.sessions.map(s => ({
        ...s,
        sections: s.sections.map(sec => ({
          ...sec,
          // Only exercise-kind steps carry week_prescriptions. Note
          // steps pass through unchanged.
          exercises: sec.exercises.map(step => (
            step.kind === 'note'
              ? step
              : { ...step, week_prescriptions: reshapeWeeks(step.week_prescriptions, w) }
          )),
        })),
      })),
    }));
  };

  const setSessionCount = (n) => {
    const target = Math.max(MIN_SESSIONS, Math.min(MAX_SESSIONS, n));
    setDraft(d => {
      const cur = d.sessions.length;
      if (target === cur) return d;
      if (target > cur) {
        const additions = Array.from({ length: target - cur }, (_, i) => defaultSession(cur + i));
        return { ...d, sessions: [...d.sessions, ...additions] };
      }
      return { ...d, sessions: d.sessions.slice(0, target) };
    });
  };

  // Track newly-added session so we can briefly highlight it.
  const [recentSessionId, setRecentSessionId] = useState(null);
  useEffect(() => {
    if (!recentSessionId) return;
    const t = setTimeout(() => setRecentSessionId(null), 1600);
    return () => clearTimeout(t);
  }, [recentSessionId]);

  const addSession = () => {
    const next = defaultSession(/* idx */ 0);
    next.name = `Session ${/* numeric label */ 0 + 1}`;
    setDraft(d => {
      const idx = d.sessions.length;
      const fresh = defaultSession(idx);
      setRecentSessionId(fresh.tempId);
      return { ...d, sessions: [...d.sessions, fresh] };
    });
  };

  const duplicateSession = (idx) => {
    setDraft(d => {
      const src = d.sessions[idx];
      if (!src) return d;
      // Deep-clone with fresh tempIds so React keys + DB ids stay distinct.
      const copy = {
        ...src,
        tempId: tempId('sess'),
        name: `${src.name} (copy)`,
        day: null, // coach re-picks — avoids two sessions silently sharing a day
        sections: src.sections.map(sec => ({
          ...sec,
          tempId: tempId('sec'),
          exercises: sec.exercises.map(ex => ({
            ...ex,
            tempId: tempId(ex.kind === 'note' ? 'note' : 'ex'),
            // Strip any persisted ids so the next save creates new rows.
            id: undefined,
            // Reset superset linkage — coach can re-link if they want.
            superset_group_id: null,
            week_prescriptions: (ex.week_prescriptions || []).map(wp => ({ ...wp, id: undefined })),
          })),
        })),
      };
      setRecentSessionId(copy.tempId);
      const sessions = [...d.sessions.slice(0, idx + 1), copy, ...d.sessions.slice(idx + 1)];
      return { ...d, sessions };
    });
  };

  const removeSession = (idx) => {
    setDraft(d => ({ ...d, sessions: d.sessions.filter((_, i) => i !== idx) }));
  };

  // ── Session-scoped mutators (by index) ─────────────────────────────────
  const mutateSession = (idx, fn) => {
    setDraft(d => ({
      ...d,
      sessions: d.sessions.map((s, i) => (i === idx ? fn(s) : s)),
    }));
  };

  const renameSession = (idx, name) => mutateSession(idx, s => ({ ...s, name }));
  const updateSessionNotes = (idx, notes) => mutateSession(idx, s => ({ ...s, notes }));
  const updateSessionDay = (idx, day) => mutateSession(idx, s => ({ ...s, day }));

  const renameSectionInSession = (idx, sectionId, name) => mutateSession(idx, s => ({
    ...s,
    sections: s.sections.map(sec => (sec.tempId === sectionId ? { ...sec, name } : sec)),
  }));

  const deleteSectionInSession = (idx, sectionId) => mutateSession(idx, s => ({
    ...s,
    sections: s.sections
      .filter(sec => sec.tempId !== sectionId)
      .map((sec, i) => ({ ...sec, display_order: i })),
  }));

  const addSectionToSession = (idx) => mutateSession(idx, s => ({
    ...s,
    sections: [
      ...s.sections,
      {
        tempId: tempId('sec'),
        name: `Section ${s.sections.length}`,
        is_warm_up: false,
        display_order: s.sections.length,
        exercises: [],
      },
    ],
  }));

  const addExerciseToSection = (idx, sectionId, lib) => mutateSession(idx, s => ({
    ...s,
    sections: s.sections.map(sec => {
      if (sec.tempId !== sectionId) return sec;
      return {
        ...sec,
        exercises: [
          ...sec.exercises,
          {
            tempId: tempId('ex'),
            exercise_id:               lib.id,
            exercise_name:             lib.name,
            category:                  lib.category,
            bilateral_unilateral:      lib.bilateral_unilateral,
            default_prescription_type: lib.default_prescription_type,
            prescription_type:         lib.default_prescription_type,
            notes:                     '',
            superset_group_id:         null,
            week_prescriptions:        emptyWeekPrescriptions(weeks),
          },
        ],
      };
    }),
  }));

  // Note steps share the section.exercises[] array with exercises;
  // each item carries a kind discriminator (note items have kind:'note').
  const addNoteToSection = (idx, sectionId) => mutateSession(idx, s => ({
    ...s,
    sections: s.sections.map(sec => {
      if (sec.tempId !== sectionId) return sec;
      return {
        ...sec,
        exercises: [
          ...sec.exercises,
          { kind: 'note', tempId: tempId('note'), content: '' },
        ],
      };
    }),
  }));

  const updateExercise = (idx, sectionId, exerciseId, patch) => mutateSession(idx, s => ({
    ...s,
    sections: s.sections.map(sec => {
      if (sec.tempId !== sectionId) return sec;
      return {
        ...sec,
        exercises: sec.exercises.map(ex => (ex.tempId === exerciseId ? { ...ex, ...patch } : ex)),
      };
    }),
  }));

  const toggleSuperset = (idx, sectionId, exerciseId, nextExerciseId) => mutateSession(idx, s => ({
    ...s,
    sections: s.sections.map(sec => {
      if (sec.tempId !== sectionId) return sec;
      const a = sec.exercises.find(e => e.tempId === exerciseId);
      const b = sec.exercises.find(e => e.tempId === nextExerciseId);
      if (!a || !b) return sec;
      const linked = a.superset_group_id && a.superset_group_id === b.superset_group_id;
      if (linked) {
        // Unlink: clear group on both. (If others were in the chain via
        // a, they remain together; in this minimal pass the chain is
        // just adjacent pairs anyway.)
        return {
          ...sec,
          exercises: sec.exercises.map(e => {
            if (e.tempId === exerciseId || e.tempId === nextExerciseId) {
              return { ...e, superset_group_id: null };
            }
            return e;
          }),
        };
      }
      // Link: assign a shared id. Reuse a's existing id if any, otherwise b's, else generate.
      const groupId = a.superset_group_id || b.superset_group_id || crypto.randomUUID();
      return {
        ...sec,
        exercises: sec.exercises.map(e => {
          if (e.tempId === exerciseId || e.tempId === nextExerciseId) {
            return { ...e, superset_group_id: groupId };
          }
          return e;
        }),
      };
    }),
  }));

  const removeExercise = (idx, sectionId, exerciseId) => mutateSession(idx, s => ({
    ...s,
    sections: s.sections.map(sec => {
      if (sec.tempId !== sectionId) return sec;
      return { ...sec, exercises: sec.exercises.filter(ex => ex.tempId !== exerciseId) };
    }),
  }));

  // ── DnD (within the same session only) ──────────────────────────────────
  const dragRef = useRef(null);
  const [dropTargetExerciseId, setDropTargetExerciseId] = useState(null);
  const [dropTargetSectionId,  setDropTargetSectionId]  = useState(null);

  const moveExercise = (sessionIdx, { fromSectionId, fromExerciseId, toSectionId, beforeExerciseId }) => {
    if (!fromSectionId || !fromExerciseId || !toSectionId) return;
    mutateSession(sessionIdx, s => {
      const fromSec = s.sections.find(sec => sec.tempId === fromSectionId);
      if (!fromSec) return s;
      const moving = fromSec.exercises.find(ex => ex.tempId === fromExerciseId);
      if (!moving) return s;

      const stripped = s.sections.map(sec => {
        if (sec.tempId === fromSectionId) {
          return { ...sec, exercises: sec.exercises.filter(ex => ex.tempId !== fromExerciseId) };
        }
        return sec;
      });

      return {
        ...s,
        sections: stripped.map(sec => {
          if (sec.tempId !== toSectionId) return sec;
          const list = sec.exercises.slice();
          if (beforeExerciseId) {
            const i = list.findIndex(ex => ex.tempId === beforeExerciseId);
            if (i >= 0) list.splice(i, 0, moving);
            else list.push(moving);
          } else {
            list.push(moving);
          }
          return { ...sec, exercises: list };
        }),
      };
    });
  };

  const handleExerciseDragStart = (sessionIdx, sectionId) => (e, exerciseId) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${sessionIdx}|${sectionId}|${exerciseId}`);
    dragRef.current = { sessionIdx, fromSectionId: sectionId, fromExerciseId: exerciseId };
  };

  const handleExerciseDrop = (sessionIdx, sectionId) => (e, exerciseId) => {
    e.preventDefault();
    const data = dragRef.current || parseDrag(e);
    if (data.sessionIdx !== sessionIdx) {
      // Cross-session drag not yet supported
      dragRef.current = null;
      setDropTargetExerciseId(null);
      setDropTargetSectionId(null);
      return;
    }
    moveExercise(sessionIdx, {
      fromSectionId: data.fromSectionId,
      fromExerciseId: data.fromExerciseId,
      toSectionId: sectionId,
      beforeExerciseId: exerciseId,
    });
    dragRef.current = null;
    setDropTargetExerciseId(null);
    setDropTargetSectionId(null);
  };

  const handleSectionDrop = (sessionIdx, sectionId) => (e) => {
    e.preventDefault();
    const data = dragRef.current || parseDrag(e);
    if (data.sessionIdx !== sessionIdx) {
      dragRef.current = null;
      setDropTargetExerciseId(null);
      setDropTargetSectionId(null);
      return;
    }
    moveExercise(sessionIdx, {
      fromSectionId: data.fromSectionId,
      fromExerciseId: data.fromExerciseId,
      toSectionId: sectionId,
      beforeExerciseId: null,
    });
    dragRef.current = null;
    setDropTargetExerciseId(null);
    setDropTargetSectionId(null);
  };

  function parseDrag(e) {
    const raw = e.dataTransfer.getData('text/plain') || '';
    const parts = raw.split('|');
    if (parts.length === 3) {
      const [sessionIdx, fromSectionId, fromExerciseId] = parts;
      return { sessionIdx: Number(sessionIdx), fromSectionId, fromExerciseId };
    }
    return { sessionIdx: -1, fromSectionId: null, fromExerciseId: null };
  }

  // ── Esc / Discard ───────────────────────────────────────────────────────
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (isDirty) setConfirmDiscard(true);
        else onClose(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDirty, onClose]);

  const handleDone = async () => {
    if (!onSave) { onClose(draft); return; }
    setSaving(true);
    setSaveError(null);
    const res = await onSave(draft);
    setSaving(false);
    if (res?.ok) {
      onClose(null);
    } else {
      setSaveError(res?.error?.message || 'Save failed.');
    }
  };

  // ── Apply Template (athlete mode) ───────────────────────────────────────
  // Loads the picked template's tree, then replaces the current draft's
  // sessions in-memory. Block-level metadata (name, duration, dates)
  // stays — duration is fixed by the existing training_block.
  const applyTemplateToDraft = async (templateId) => {
    setSaving(true);
    setSaveError(null);
    const res = await loadBlockTemplate(templateId);
    setSaving(false);
    if (!res.ok) {
      setSaveError(res.error?.message || 'Couldn\'t load template.');
      return;
    }
    // If template duration doesn't match the block's duration, reshape
    // its week_prescriptions to fit the block's existing weeks.
    const blockWeeks = draft.block.duration_weeks;
    const reshapedSessions = (res.draft.sessions || []).map((sess, i) => ({
      ...sess,
      tempId: tempId('sess'),
      sections: (sess.sections || []).map((sec) => ({
        ...sec,
        tempId: tempId('sec'),
        exercises: (sec.exercises || []).map((ex) => ({
          ...ex,
          tempId: tempId('ex'),
          week_prescriptions: reshapeWeeks(ex.week_prescriptions, blockWeeks),
        })),
      })),
    }));
    setDraft(d => ({ ...d, sessions: reshapedSessions }));
    setShowTemplatePicker(false);
    setConfirmApply(null);
  };

  const requestApplyTemplate = (template) => {
    const hasContent = draft.sessions.some(s => s.sections?.some(sec => (sec.exercises || []).length > 0));
    if (hasContent) {
      setConfirmApply({ templateId: template.id, templateName: template.name });
    } else {
      applyTemplateToDraft(template.id);
    }
  };
  const handleDiscard = () => {
    if (isDirty) setConfirmDiscard(true);
    else onClose(null);
  };

  // ── Render ──────────────────────────────────────────────────────────────
  const headerControl = (label, value, onMinus, onPlus) => (
    <div className="flex items-center gap-1.5 text-[11px]" style={{ color: '#6b7280' }}>
      <span className="font-semibold uppercase tracking-wider">{label}</span>
      <button
        onClick={onMinus}
        disabled={parentLocked && label === 'Duration'}
        className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Minus size={11} />
      </button>
      <span className="w-8 text-center font-bold tabular-nums" style={{ color: '#1C1C1C' }}>{value}</span>
      <button
        onClick={onPlus}
        disabled={parentLocked && label === 'Duration'}
        className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus size={11} />
      </button>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl flex flex-col"
        style={{ width: '95vw', height: '90vh', maxWidth: 1500 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — block name + duration + sessions */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex-1 min-w-0">
            {athleteMode ? (
              <>
                <div className="text-lg font-bold truncate" style={{ color: '#1C1C1C' }}>
                  {draft.block.name || 'Untitled block'}
                </div>
                {contextSubtitle && (
                  <div className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>
                    {contextSubtitle}
                  </div>
                )}
              </>
            ) : (
              <input
                value={draft.block.name}
                onChange={(e) => setBlockName(e.target.value)}
                disabled={parentLocked}
                className="text-lg font-bold w-full focus:outline-none disabled:bg-transparent disabled:text-[#1C1C1C]"
                style={{ color: '#1C1C1C' }}
                placeholder="Untitled block"
              />
            )}
            <div className="flex items-center gap-4 mt-2">
              {headerControl('Duration', `${weeks}w`, () => setBlockWeeks(weeks - 1), () => setBlockWeeks(weeks + 1))}
              {headerControl('Sessions', draft.sessions.length, () => setSessionCount(draft.sessions.length - 1), () => setSessionCount(draft.sessions.length + 1))}
              {athleteMode && (
                <button
                  onClick={() => setShowTemplatePicker(true)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors hover:opacity-90"
                  style={{ color: '#085777', backgroundColor: 'rgba(8,87,119,0.08)' }}
                  title="Replace this block's sessions with a saved template"
                >
                  <Sparkles size={11} />
                  Apply template
                </button>
              )}
            </div>
            <textarea
              value={draft.block.description}
              onChange={(e) => setBlockDescription(e.target.value)}
              rows={1}
              className="w-full mt-2 text-xs focus:outline-none resize-none placeholder:italic"
              style={{ color: '#4b5563' }}
              placeholder={athleteMode ? 'Block notes (optional)' : 'Block description (optional) — focus, intent, target outcome…'}
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {saveError ? (
              <span className="text-[11px]" style={{ color: '#dc2626' }} title={saveError}>
                {saveError.length > 40 ? `${saveError.slice(0, 40)}…` : saveError}
              </span>
            ) : (
              <span className="text-[11px]" style={{ color: isDirty ? '#A58D69' : '#9ca3af' }}>
                {saving ? 'Saving…' : isDirty ? 'Unsaved changes' : 'No changes'}
              </span>
            )}

            {athleteMode && (
              <BlockMoreMenu
                open={moreOpen}
                onToggle={() => setMoreOpen(o => !o)}
                onClose={() => setMoreOpen(false)}
                onEditDetails={onEditDetails}
                onSaveAsTemplate={onSaveAsTemplate ? () => onSaveAsTemplate(draft) : null}
                onDeleteBlock={onDeleteBlock}
              />
            )}

            <button
              onClick={handleDiscard}
              disabled={saving}
              className="p-2 rounded hover:bg-gray-100 text-gray-400 transition-colors disabled:opacity-40"
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
            <button
              onClick={handleDone}
              disabled={saving}
              className="px-4 py-1.5 text-xs font-semibold text-white rounded transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#A58D69' }}
            >
              {saving ? 'Saving…' : (athleteMode ? 'Save changes' : 'Save template')}
            </button>
          </div>
        </div>

        {/* Body — vertical stack of session cards, single shared horizontal scroll.
            Background tint makes the white session cards pop. */}
        <div className="flex-1 overflow-auto" style={{ backgroundColor: '#f4f5f7' }}>
          {athleteMode && (
            <div className="px-6 pt-5 pb-1">
              <h4 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#9ca3af' }}>
                Build the programme
              </h4>
              <p className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>
                Add sessions below, then pick the day each one lands on every week — that's what puts it on the athlete's calendar.
              </p>
            </div>
          )}
          {draft.sessions.map((sess, idx) => (
            <SessionBlock
              key={sess.tempId}
              session={sess}
              index={idx}
              totalSessions={draft.sessions.length}
              weeks={weeks}
              currentWk={currentWk}
              defaultCollapsed={!!focusSessionTempId && sess.tempId !== focusSessionTempId}
              isRecent={recentSessionId === sess.tempId}
              onRenameSession={(name) => renameSession(idx, name)}
              onUpdateNotes={(notes) => updateSessionNotes(idx, notes)}
              onRemoveSession={() => removeSession(idx)}
              onDuplicateSession={() => duplicateSession(idx)}
              day={sess.day ?? null}
              onUpdateDay={athleteMode ? (d) => updateSessionDay(idx, d) : undefined}
              onAddSection={() => addSectionToSession(idx)}
              onRenameSection={(secId, name) => renameSectionInSession(idx, secId, name)}
              onDeleteSection={(secId) => deleteSectionInSession(idx, secId)}
              onRequestAddExercise={(secId) => openPickerForSection(idx, secId)}
              onUpdateExercise={(secId, exId, patch) => updateExercise(idx, secId, exId, patch)}
              onRemoveExercise={(secId, exId) => removeExercise(idx, secId, exId)}
              onToggleSuperset={(secId, exId, nextExId) => toggleSuperset(idx, secId, exId, nextExId)}
              onExerciseDragStart={(secId) => handleExerciseDragStart(idx, secId)}
              onExerciseDrop={(secId) => handleExerciseDrop(idx, secId)}
              onExerciseDragEnter={(exId) => setDropTargetExerciseId(exId)}
              onExerciseDragLeave={(exId) =>
                setDropTargetExerciseId(prev => (prev === exId ? null : prev))}
              dropTargetExerciseId={dropTargetExerciseId}
              onSectionDrop={(secId) => handleSectionDrop(idx, secId)}
              isSectionDropTarget={(secId, exCount) =>
                dropTargetSectionId === secId && exCount === 0}
              onSectionDragEnter={(secId) => setDropTargetSectionId(secId)}
              onSectionDragLeave={(secId) =>
                setDropTargetSectionId(prev => (prev === secId ? null : prev))}
            />
          ))}

          {/* + Add session (sticky-left, bottom) */}
          <div
            className="sticky left-0 z-10 px-6 py-6"
            style={{ width: ROW_STICKY_WIDTH + 60, minWidth: ROW_STICKY_WIDTH + 60, backgroundColor: '#f4f5f7' }}
          >
            <button
              onClick={addSession}
              disabled={draft.sessions.length >= MAX_SESSIONS}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-body font-semibold rounded-lg bg-white border-2 border-dashed transition-all hover:border-gold-500 hover:text-gold-600 hover:shadow-card disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-[0.99]"
              style={{ color: '#A58D69', borderColor: '#d1d5db' }}
            >
              <Plus size={16} />
              Add session
            </button>
          </div>

          {/* Width spacer to ensure horizontal scroll matches the table */}
          <div style={{ width: totalWidth, height: 0 }} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 shrink-0">
          <button onClick={handleDiscard} className="text-[11px]" style={{ color: '#dc2626' }}>
            Discard changes
          </button>
          <p className="text-[11px]" style={{ color: '#9ca3af' }}>
            {athleteMode
              ? 'Changes save to this athlete\'s block only. Templates are independent.'
              : 'Saved templates appear in the Templates tab and can be assigned to athletes from Assign.'}
          </p>
        </div>
      </div>

      {confirmDiscard && (
        <ConfirmDialog
          title="Discard changes?"
          body="You have unsaved edits in this builder. Closing now will lose them."
          confirmLabel="Discard"
          danger
          onConfirm={() => { setConfirmDiscard(false); onClose(null); }}
          onCancel={() => setConfirmDiscard(false)}
        />
      )}

      {showTemplatePicker && (
        <TemplatePickerDialog
          onPick={requestApplyTemplate}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}

      {pickerTarget && (
        <ExercisePicker
          sessionLabel={pickerTarget.sessionLabel}
          onAdd={handlePickerAdd}
          onAddNote={handlePickerAddNote}
          onClose={closePicker}
        />
      )}

      {confirmApply && (
        <ConfirmDialog
          title="Replace this block's sessions?"
          body={`This block already has sessions. Applying "${confirmApply.templateName}" will replace them. Existing per-week prescriptions will be lost.`}
          confirmLabel="Replace"
          danger
          onConfirm={() => applyTemplateToDraft(confirmApply.templateId)}
          onCancel={() => setConfirmApply(null)}
        />
      )}
    </div>
  );
}

// ─── BlockMoreMenu ───────────────────────────────────────────────────────
// Three-dot menu shown in the modal header in athlete mode. Lists the
// secondary actions: edit block details, save as new template, delete
// block. Closes on outside click or item selection.
function BlockMoreMenu({ open, onToggle, onClose, onEditDetails, onSaveAsTemplate, onDeleteBlock }) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleDown);
    return () => document.removeEventListener('mousedown', handleDown);
  }, [open, onClose]);

  const wrap = (fn) => () => { onClose(); if (fn) fn(); };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={onToggle}
        className="p-2 rounded hover:bg-gray-100 text-gray-500 transition-colors"
        title="More options"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg py-1 z-50"
          style={{ border: '1px solid #e5e7eb', minWidth: 200 }}
        >
          {onEditDetails && (
            <button
              onClick={wrap(onEditDetails)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors"
              style={{ color: '#1C1C1C' }}
            >
              Edit block details
            </button>
          )}
          {onSaveAsTemplate && (
            <button
              onClick={wrap(onSaveAsTemplate)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors"
              style={{ color: '#1C1C1C' }}
            >
              Save as new block template
            </button>
          )}
          {onDeleteBlock && (
            <>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={wrap(onDeleteBlock)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors"
                style={{ color: '#dc2626' }}
              >
                Delete block
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TemplatePickerDialog ────────────────────────────────────────────────
// Lightweight modal-over-modal listing available block templates. Click
// a template to request apply (parent shows a confirmation if the block
// already has content). Closes on backdrop click or Esc.
function TemplatePickerDialog({ onPick, onClose }) {
  const { templates, loading, error } = useBlockTemplates();

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-[480px] max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold" style={{ color: '#1C1C1C' }}>Pick a template</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {loading && (
            <div className="text-xs text-center py-8" style={{ color: '#9ca3af' }}>Loading…</div>
          )}
          {error && (
            <div className="text-xs px-4 py-3" style={{ color: '#dc2626' }}>
              Couldn't load templates: {error.message}
            </div>
          )}
          {!loading && !error && templates.length === 0 && (
            <div className="text-xs text-center py-8" style={{ color: '#9ca3af' }}>
              No templates yet — build one in the Programme module first.
            </div>
          )}
          {templates.map(t => (
            <button
              key={t.id}
              onClick={() => onPick(t)}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center justify-between gap-3 border-b border-gray-50 last:border-b-0"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: '#1C1C1C' }}>{t.name}</div>
                <div className="text-[11px]" style={{ color: '#9ca3af' }}>
                  {t.session_count} {t.session_count === 1 ? 'session' : 'sessions'} · {t.default_duration_weeks}-week
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
