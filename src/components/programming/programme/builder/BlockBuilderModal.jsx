import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import SessionTabStrip from './SessionTabStrip';
import SessionSection from './SessionSection';
import { ROW_STICKY_WIDTH, WEEK_COL_WIDTH } from './SessionExerciseRow';
import ConfirmDialog from '../../blocks/ConfirmDialog';
import { colourForSection } from '../../../../utils/sectionColours';

const MIN_WEEKS = 1;
const MAX_WEEKS = 12;
const MIN_SESSIONS = 1;
const MAX_SESSIONS = 7;

function tempId(prefix) { return `${prefix}-${Math.random().toString(36).slice(2, 10)}`; }

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

// Pad / truncate the week_prescriptions array to match `weeks`.
function reshapeWeeks(prescriptions, weeks) {
  const next = (prescriptions || []).slice(0, weeks);
  for (let i = next.length; i < weeks; i++) {
    next.push({ week_number: i + 1, sets: 3, reps: '8', target_value: '', rest_seconds: null });
  }
  // Re-number defensively
  return next.map((p, i) => ({ ...p, week_number: i + 1 }));
}

/**
 * BlockBuilderModal — block-scoped builder.
 *
 * Header: block name + duration_weeks + sessions count + description.
 * Tab strip: one tab per session, renamable, removable.
 * Active session content: section list, each section has exercise rows
 * with the horizontal week grid.
 *
 * Sticky-left columns (drag, accent, name+note, prescription type)
 * stay visible while the week grid scrolls horizontally.
 *
 * Save-to-DB is Checkpoint 5; for now state is purely in-memory and
 * onClose receives the final draft.
 */
export default function BlockBuilderModal({
  initialDraft,
  parentLocked = false, // athlete-attached mode → block name + weeks read-only
  onClose,
}) {
  const [draft, setDraft] = useState(() => initialDraft || defaultDraft());
  const [activeIdx, setActiveIdx] = useState(0);
  const initialSnapshot = useRef(JSON.stringify(draft));
  const isDirty = useMemo(
    () => JSON.stringify(draft) !== initialSnapshot.current,
    [draft],
  );

  const weeks = draft.block.duration_weeks;
  const session = draft.sessions[activeIdx] || draft.sessions[0];

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
          exercises: sec.exercises.map(ex => ({
            ...ex,
            week_prescriptions: reshapeWeeks(ex.week_prescriptions, w),
          })),
        })),
      })),
    }));
  };

  // ── Session count via numeric input ─────────────────────────────────────
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
    if (activeIdx >= target) setActiveIdx(target - 1);
  };

  const addSession = () => {
    setDraft(d => ({ ...d, sessions: [...d.sessions, defaultSession(d.sessions.length)] }));
    setActiveIdx(draft.sessions.length); // will be the new tab's index
  };

  const renameSession = (idx, name) => {
    setDraft(d => ({
      ...d,
      sessions: d.sessions.map((s, i) => (i === idx ? { ...s, name } : s)),
    }));
  };

  const removeSession = (idx) => {
    setDraft(d => ({ ...d, sessions: d.sessions.filter((_, i) => i !== idx) }));
    if (activeIdx >= idx) setActiveIdx(Math.max(0, activeIdx - 1));
  };

  // ── Section / exercise mutators on the ACTIVE session ───────────────────
  const mutateActiveSession = (fn) => {
    setDraft(d => ({
      ...d,
      sessions: d.sessions.map((s, i) => (i === activeIdx ? fn(s) : s)),
    }));
  };

  const renameSection = (sectionId, name) => mutateActiveSession(s => ({
    ...s,
    sections: s.sections.map(sec => (sec.tempId === sectionId ? { ...sec, name } : sec)),
  }));

  const deleteSection = (sectionId) => mutateActiveSession(s => ({
    ...s,
    sections: s.sections
      .filter(sec => sec.tempId !== sectionId)
      .map((sec, i) => ({ ...sec, display_order: i })),
  }));

  const addSection = () => mutateActiveSession(s => ({
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

  const addExerciseToSection = (sectionId, lib) => mutateActiveSession(s => ({
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

  const updateExercise = (sectionId, exerciseId, patch) => mutateActiveSession(s => ({
    ...s,
    sections: s.sections.map(sec => {
      if (sec.tempId !== sectionId) return sec;
      return {
        ...sec,
        exercises: sec.exercises.map(ex => (ex.tempId === exerciseId ? { ...ex, ...patch } : ex)),
      };
    }),
  }));

  const removeExercise = (sectionId, exerciseId) => mutateActiveSession(s => ({
    ...s,
    sections: s.sections.map(sec => {
      if (sec.tempId !== sectionId) return sec;
      return { ...sec, exercises: sec.exercises.filter(ex => ex.tempId !== exerciseId) };
    }),
  }));

  // ── DnD ─────────────────────────────────────────────────────────────────
  const dragRef = useRef(null);
  const [dropTargetExerciseId, setDropTargetExerciseId] = useState(null);
  const [dropTargetSectionId,  setDropTargetSectionId]  = useState(null);

  const moveExercise = ({ fromSectionId, fromExerciseId, toSectionId, beforeExerciseId }) => {
    if (!fromSectionId || !fromExerciseId || !toSectionId) return;
    mutateActiveSession(s => {
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
            const idx = list.findIndex(ex => ex.tempId === beforeExerciseId);
            if (idx >= 0) list.splice(idx, 0, moving);
            else list.push(moving);
          } else {
            list.push(moving);
          }
          return { ...sec, exercises: list };
        }),
      };
    });
  };

  const handleExerciseDragStart = (sectionId) => (e, exerciseId) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${sectionId}|${exerciseId}`);
    dragRef.current = { fromSectionId: sectionId, fromExerciseId: exerciseId };
  };

  const handleExerciseDrop = (sectionId) => (e, exerciseId) => {
    e.preventDefault();
    const data = dragRef.current || parseDrag(e);
    moveExercise({
      fromSectionId: data.fromSectionId,
      fromExerciseId: data.fromExerciseId,
      toSectionId: sectionId,
      beforeExerciseId: exerciseId,
    });
    dragRef.current = null;
    setDropTargetExerciseId(null);
    setDropTargetSectionId(null);
  };

  const handleSectionDrop = (sectionId) => (e) => {
    e.preventDefault();
    const data = dragRef.current || parseDrag(e);
    moveExercise({
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
    const [fromSectionId, fromExerciseId] = raw.split('|');
    return { fromSectionId, fromExerciseId };
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

  const handleDone = () => onClose(draft);
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
      <span className="w-8 text-center font-bold" style={{ color: '#1C1C1C' }}>{value}</span>
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
        {/* Header — block name + dur + sessions */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex-1 min-w-0">
            <input
              value={draft.block.name}
              onChange={(e) => setBlockName(e.target.value)}
              disabled={parentLocked}
              className="text-lg font-bold w-full focus:outline-none disabled:bg-transparent disabled:text-[#1C1C1C]"
              style={{ color: '#1C1C1C' }}
              placeholder="Untitled block"
            />
            <div className="flex items-center gap-4 mt-2">
              {headerControl('Duration', `${weeks}w`, () => setBlockWeeks(weeks - 1), () => setBlockWeeks(weeks + 1))}
              {headerControl('Sessions', draft.sessions.length, () => setSessionCount(draft.sessions.length - 1), () => setSessionCount(draft.sessions.length + 1))}
            </div>
            <textarea
              value={draft.block.description}
              onChange={(e) => setBlockDescription(e.target.value)}
              rows={1}
              className="w-full mt-2 text-xs focus:outline-none resize-none placeholder:italic"
              style={{ color: '#4b5563' }}
              placeholder="Block description (optional) — focus, intent, target outcome…"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px]" style={{ color: isDirty ? '#A58D69' : '#9ca3af' }}>
              {isDirty ? 'Unsaved changes' : 'No changes'}
            </span>
            <button
              onClick={handleDiscard}
              className="p-2 rounded hover:bg-gray-100 text-gray-400 transition-colors"
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
            <button
              onClick={handleDone}
              className="px-4 py-1.5 text-xs font-semibold text-white rounded transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#A58D69' }}
            >
              Done
            </button>
          </div>
        </div>

        {/* Session tab strip */}
        <SessionTabStrip
          sessions={draft.sessions}
          activeIdx={activeIdx}
          onActivate={setActiveIdx}
          onRename={renameSession}
          onAdd={addSession}
          onRemove={removeSession}
          canAdd={draft.sessions.length < MAX_SESSIONS}
        />

        {/* Active session — scrollable horizontally for the week grid */}
        <div className="flex-1 overflow-auto">
          {/* Per-session notes (sticky-left, full width row) */}
          <div
            className="sticky left-0 z-10 px-6 pt-4 pb-2 bg-white"
            style={{ minWidth: ROW_STICKY_WIDTH + weeks * WEEK_COL_WIDTH }}
          >
            <textarea
              value={session.notes || ''}
              onChange={(e) => setDraft(d => ({
                ...d,
                sessions: d.sessions.map((s, i) => (i === activeIdx ? { ...s, notes: e.target.value } : s)),
              }))}
              rows={1}
              className="w-full text-xs focus:outline-none resize-none placeholder:italic"
              style={{ color: '#4b5563' }}
              placeholder="Session-level notes — coach cues, focus, anything…"
            />
          </div>

          {/* Week column header */}
          <div
            className="flex items-stretch border-b border-gray-100"
            style={{ minWidth: ROW_STICKY_WIDTH + weeks * WEEK_COL_WIDTH }}
          >
            <div
              className="sticky left-0 z-10 bg-white flex items-center px-6 py-2 text-[10px] font-bold uppercase tracking-widest"
              style={{ width: ROW_STICKY_WIDTH, minWidth: ROW_STICKY_WIDTH, color: '#9ca3af', borderRight: '1px solid #f3f4f6' }}
            >
              Exercise
            </div>
            <div className="flex">
              {Array.from({ length: weeks }, (_, i) => (
                <div
                  key={i + 1}
                  className="flex items-center justify-center text-[10px] font-bold uppercase tracking-widest"
                  style={{ width: WEEK_COL_WIDTH, color: '#9ca3af' }}
                >
                  Wk {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Section list */}
          <div
            className="px-6 py-3"
            style={{ minWidth: ROW_STICKY_WIDTH + weeks * WEEK_COL_WIDTH }}
          >
            {session.sections.map((sec, i) => (
              <SessionSection
                key={sec.tempId}
                section={sec}
                accentColour={colourForSection(sec, session.sections)}
                weeks={weeks}
                isFirst={i === 0}
                onRenameSection={(name) => renameSection(sec.tempId, name)}
                onDeleteSection={() => deleteSection(sec.tempId)}
                onAddExercise={(lib) => addExerciseToSection(sec.tempId, lib)}
                onUpdateExercise={(exId, patch) => updateExercise(sec.tempId, exId, patch)}
                onRemoveExercise={(exId) => removeExercise(sec.tempId, exId)}
                onExerciseDragStart={handleExerciseDragStart(sec.tempId)}
                onExerciseDrop={handleExerciseDrop(sec.tempId)}
                onExerciseDragEnter={(exId) => setDropTargetExerciseId(exId)}
                onExerciseDragLeave={(exId) =>
                  setDropTargetExerciseId(prev => (prev === exId ? null : prev))}
                dropTargetExerciseId={dropTargetExerciseId}
                onSectionDrop={handleSectionDrop(sec.tempId)}
                isSectionDropTarget={dropTargetSectionId === sec.tempId && sec.exercises.length === 0}
                onSectionDragEnter={() => setDropTargetSectionId(sec.tempId)}
                onSectionDragLeave={() =>
                  setDropTargetSectionId(prev => (prev === sec.tempId ? null : prev))}
              />
            ))}

            {/* + Add section (sticky-left) */}
            <div
              className="sticky left-0 z-10 bg-white mt-6"
              style={{ width: ROW_STICKY_WIDTH }}
            >
              <button
                onClick={addSection}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded transition-colors hover:bg-gray-100"
                style={{ color: '#437E8D', border: '1px dashed #437E8D' }}
              >
                <Plus size={13} />
                Add section
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 shrink-0">
          <button onClick={handleDiscard} className="text-[11px]" style={{ color: '#dc2626' }}>
            Discard changes
          </button>
          <p className="text-[11px]" style={{ color: '#9ca3af' }}>
            Save-as-template lands in Checkpoint 5 — all changes are in-memory for now.
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
    </div>
  );
}
