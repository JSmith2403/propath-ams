import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import ExerciseSearchDropdown from './ExerciseSearchDropdown';
import SessionExerciseRow, { ROW_STICKY_WIDTH } from './SessionExerciseRow';

/**
 * SessionSection — one named block (Warm-up, Power, Strength…) inside
 * the active session. Header + exercise rows + "+ Add exercise" search.
 *
 * The section header and "+ Add exercise" controls are sticky-left so
 * they stay visible while the user scrolls horizontally through weeks.
 */
export default function SessionSection({
  section,
  accentColour,
  weeks,
  isFirst,
  onRenameSection,
  onDeleteSection,
  onAddExercise,
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
}) {
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(section.name);

  const handleRename = () => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== section.name) onRenameSection(trimmed);
    setRenaming(false);
  };

  const tintBg = section.is_warm_up ? 'rgba(107,160,173,0.06)' : 'transparent';

  return (
    <section
      className="rounded-lg"
      style={{
        marginTop: isFirst ? 0 : 16,
        backgroundColor: tintBg,
        paddingTop: section.is_warm_up ? 6 : 0,
        paddingBottom: section.is_warm_up ? 6 : 0,
      }}
    >
      {/* Sticky-left section header */}
      <div
        className="sticky left-0 z-10 flex items-center gap-2 px-2 py-1.5"
        style={{
          width: ROW_STICKY_WIDTH,
          minWidth: ROW_STICKY_WIDTH,
          backgroundColor: section.is_warm_up ? 'rgba(107,160,173,0.06)' : '#fff',
        }}
      >
        <div
          className="shrink-0"
          style={{ width: 4, height: 14, borderRadius: 2, backgroundColor: accentColour }}
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
            className="text-[11px] font-bold uppercase tracking-widest px-1 py-0.5 rounded border border-gray-200 focus:outline-none focus:border-gray-300"
            style={{ color: '#1C1C1C' }}
          />
        ) : (
          <button
            onClick={() => setRenaming(true)}
            className="group/header flex items-center gap-1.5 hover:underline"
            title="Rename section"
          >
            <span
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: accentColour }}
            >
              {section.name}
            </span>
            <Pencil size={10} className="opacity-0 group-hover/header:opacity-60 transition-opacity" style={{ color: '#6b7280' }} />
          </button>
        )}

        <span className="text-[10px] truncate" style={{ color: '#9ca3af' }}>
          {section.exercises.length} {section.exercises.length === 1 ? 'exercise' : 'exercises'}
        </span>

        <div className="flex-1" />

        {!isFirst && (
          <button
            onClick={onDeleteSection}
            className="opacity-30 hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-all"
            style={{ color: '#dc2626' }}
            title="Delete section"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Exercise rows */}
      {section.exercises.length === 0 ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onSectionDrop}
          onDragEnter={onSectionDragEnter}
          onDragLeave={onSectionDragLeave}
          className="sticky left-0 z-10 mx-2 px-3 py-3 text-[11px] italic text-center rounded transition-colors"
          style={{
            width: ROW_STICKY_WIDTH - 16,
            color: '#9ca3af',
            border: isSectionDropTarget ? '2px dashed #437E8D' : '1px dashed #e5e7eb',
            backgroundColor: isSectionDropTarget
              ? 'rgba(67,126,141,0.04)'
              : (section.is_warm_up ? 'rgba(107,160,173,0.06)' : '#fff'),
          }}
        >
          No exercises yet — search below to add one, or drop another in.
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onSectionDrop}
          onDragEnter={onSectionDragEnter}
          onDragLeave={onSectionDragLeave}
        >
          {section.exercises.map(ex => (
            <SessionExerciseRow
              key={ex.tempId}
              exercise={ex}
              accentColour={accentColour}
              weeks={weeks}
              onChange={(patch) => onUpdateExercise(ex.tempId, patch)}
              onRemove={() => onRemoveExercise(ex.tempId)}
              onDragStart={(e) => onExerciseDragStart(e, ex.tempId)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onExerciseDrop(e, ex.tempId)}
              onDragEnter={() => onExerciseDragEnter(ex.tempId)}
              onDragLeave={() => onExerciseDragLeave(ex.tempId)}
              isDropTarget={dropTargetExerciseId === ex.tempId}
            />
          ))}
        </div>
      )}

      {/* + Add exercise (sticky-left) */}
      <div
        className="sticky left-0 z-10 px-2 mt-2"
        style={{
          width: ROW_STICKY_WIDTH,
          minWidth: ROW_STICKY_WIDTH,
          backgroundColor: section.is_warm_up ? 'rgba(107,160,173,0.06)' : '#fff',
        }}
      >
        <ExerciseSearchDropdown onSelect={onAddExercise} />
      </div>
    </section>
  );
}
