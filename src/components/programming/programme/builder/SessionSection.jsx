import { useState } from 'react';
import { Link2, Link2Off, Pencil, Plus, Trash2 } from 'lucide-react';
import SessionExerciseRow, { ROW_STICKY_WIDTH } from './SessionExerciseRow';
import NoteRow from './NoteRow';

/**
 * SessionSection — one named block (Warm-up, Strength, Accessory…).
 * Sticky-left header with a 4px accent stripe to the left and an
 * uppercase muted label. Coach can rename via pencil hover.
 */
export default function SessionSection({
  section,
  accentColour,
  weeks,
  isFirst,
  onRenameSection,
  onDeleteSection,
  onRequestAddExercise, // () => void — opens the side picker for this section
  onUpdateExercise,
  onRemoveExercise,
  onExerciseDragStart,
  onExerciseDrop,
  onExerciseDragEnter,
  onExerciseDragLeave,
  dropTargetExerciseId,
  onSectionDrop,
  isSectionDropTarget,
  onSectionDragEnter,
  onSectionDragLeave,
  onToggleSuperset, // (exId, nextExId) → toggle shared superset_group_id
}) {
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(section.name);

  const handleRename = () => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== section.name) onRenameSection(trimmed);
    setRenaming(false);
  };

  return (
    <section style={{ marginTop: isFirst ? 0 : 32 }}>
      {/* Sticky-left section header */}
      <div
        className="sticky left-0 z-10 bg-white flex items-center gap-2 pl-3 pr-3 py-2"
        style={{ width: ROW_STICKY_WIDTH, minWidth: ROW_STICKY_WIDTH }}
      >
        <div
          className="shrink-0"
          style={{ width: 4, height: 12, borderRadius: 2, backgroundColor: accentColour }}
        />
        {renaming ? (
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              else if (e.key === 'Escape') { setDraftName(section.name); setRenaming(false); }
            }}
            className="text-[11px] font-bold uppercase tracking-widest px-1 py-0.5 rounded border border-gray-200 focus:outline-none focus:border-gray-300 bg-white"
            style={{ color: accentColour }}
          />
        ) : (
          <button
            onClick={() => setRenaming(true)}
            className="group/header flex items-center gap-1.5"
            title="Rename section"
          >
            <span
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: accentColour }}
            >
              {section.name}
            </span>
            <Pencil size={10} className="opacity-0 group-hover/header:opacity-50 transition-opacity" style={{ color: '#6b7280' }} />
          </button>
        )}

        <span className="text-[10px]" style={{ color: '#9ca3af' }}>
          {section.exercises.length} {section.exercises.length === 1 ? 'exercise' : 'exercises'}
        </span>

        <div className="flex-1" />

        {!isFirst && (
          <button
            onClick={onDeleteSection}
            className="opacity-0 group-hover/header:opacity-100 hover:opacity-100 p-1 rounded hover:bg-gray-100 transition-all"
            style={{ color: '#9ca3af' }}
            title="Delete section"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Exercise rows / empty drop-zone */}
      {section.exercises.length === 0 ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onSectionDrop}
          onDragEnter={onSectionDragEnter}
          onDragLeave={onSectionDragLeave}
          className="sticky left-0 z-10 mx-3 px-3 py-3 text-[11px] italic text-center rounded transition-colors bg-white"
          style={{
            width: ROW_STICKY_WIDTH - 24,
            color: '#9ca3af',
            border: isSectionDropTarget ? '2px dashed #437E8D' : '1px dashed #e5e7eb',
            backgroundColor: isSectionDropTarget ? 'rgba(67,126,141,0.04)' : '#fff',
          }}
        >
          No exercises yet — search below to add one.
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onSectionDrop}
          onDragEnter={onSectionDragEnter}
          onDragLeave={onSectionDragLeave}
        >
          {section.exercises.map((step, i) => {
            // Note steps render a single-line NoteRow; no superset
            // affordance, no week grid.
            if (step.kind === 'note') {
              return (
                <NoteRow
                  key={step.tempId}
                  note={step}
                  onChange={(patch) => onUpdateExercise(step.tempId, patch)}
                  onRemove={() => onRemoveExercise(step.tempId)}
                  onDragStart={(e) => onExerciseDragStart(e, step.tempId)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onExerciseDrop(e, step.tempId)}
                  onDragEnter={() => onExerciseDragEnter(step.tempId)}
                  onDragLeave={() => onExerciseDragLeave(step.tempId)}
                  isDropTarget={dropTargetExerciseId === step.tempId}
                />
              );
            }
            // Exercise step. Superset detection only considers
            // adjacent exercise-kind neighbours so a note breaks the
            // visual chain.
            const prev = section.exercises[i - 1];
            const next = section.exercises[i + 1];
            const prevIsExercise = prev && prev.kind !== 'note';
            const nextIsExercise = next && next.kind !== 'note';
            const linkedToNext = !!(nextIsExercise && step.superset_group_id && step.superset_group_id === next.superset_group_id);
            const linkedToPrev = i > 0 && prevIsExercise && !!(step.superset_group_id && prev.superset_group_id === step.superset_group_id);
            const startsGroup  = step.superset_group_id && (!prevIsExercise || prev.superset_group_id !== step.superset_group_id) && linkedToNext;
            return (
              <div key={step.tempId}>
                {startsGroup && (
                  <div
                    className="sticky left-0 z-10 bg-white flex items-center gap-1.5 pl-3 py-1 mt-1"
                    style={{ width: ROW_STICKY_WIDTH, minWidth: ROW_STICKY_WIDTH, color: accentColour }}
                  >
                    <Link2 size={11} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Superset</span>
                  </div>
                )}
                <SessionExerciseRow
                  exercise={step}
                  accentColour={accentColour}
                  weeks={weeks}
                  linkedToPrev={linkedToPrev}
                  linkedToNext={linkedToNext}
                  onChange={(patch) => onUpdateExercise(step.tempId, patch)}
                  onRemove={() => onRemoveExercise(step.tempId)}
                  onDragStart={(e) => onExerciseDragStart(e, step.tempId)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onExerciseDrop(e, step.tempId)}
                  onDragEnter={() => onExerciseDragEnter(step.tempId)}
                  onDragLeave={() => onExerciseDragLeave(step.tempId)}
                  isDropTarget={dropTargetExerciseId === step.tempId}
                />
                {nextIsExercise && (
                  <SupersetLinkButton
                    linked={linkedToNext}
                    accentColour={accentColour}
                    onClick={() => onToggleSuperset(step.tempId, next.tempId)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* + Add exercise (sticky-left) — opens the side panel picker. */}
      <div
        className="sticky left-0 z-10 bg-white pl-3 pr-3 mt-2"
        style={{ width: ROW_STICKY_WIDTH, minWidth: ROW_STICKY_WIDTH }}
      >
        <button
          onClick={() => onRequestAddExercise && onRequestAddExercise()}
          className="flex items-center gap-1 text-[11px] font-semibold transition-colors hover:underline"
          style={{ color: '#A58D69' }}
        >
          <Plus size={12} />
          Add exercise
        </button>
      </div>
    </section>
  );
}

/**
 * Tiny chain-link control between two adjacent rows. When the rows
 * already share a superset_group_id, the icon is solid + tinted; when
 * not linked, it stays faint and only fully reveals on hover of the
 * gap between rows.
 */
function SupersetLinkButton({ linked, accentColour, onClick }) {
  return (
    <div
      className="sticky left-0 z-10 group/link flex items-center"
      style={{ width: ROW_STICKY_WIDTH, minWidth: ROW_STICKY_WIDTH, height: 14 }}
    >
      <div className="pl-[18px] flex items-center" style={{ width: 30 }}>
        {linked ? (
          <div
            className="w-[3px] self-stretch"
            style={{ height: 14, backgroundColor: accentColour, borderRadius: 2 }}
          />
        ) : null}
      </div>
      <button
        onClick={onClick}
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider transition-all ${
          linked ? 'opacity-100' : 'opacity-60 hover:opacity-100'
        }`}
        style={{
          color: linked ? '#fff' : accentColour,
          backgroundColor: linked ? accentColour : 'rgba(67,126,141,0.10)',
        }}
        title={linked ? 'Unlink superset' : 'Link as superset with next exercise'}
      >
        {linked ? <Link2 size={10} /> : <Link2Off size={10} />}
        {linked ? 'Linked' : 'Link'}
      </button>
    </div>
  );
}
