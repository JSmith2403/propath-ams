import { useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import SessionSection from './SessionSection';
import { ROW_STICKY_WIDTH, WEEK_COL_WIDTH } from './SessionExerciseRow';
import { colourForSection } from '../../../../utils/sectionColours';

/**
 * SessionBlock — one full session in the vertical stack.
 *
 * Shows:
 *  - Sticky-left collapsible header (Session N · count · weeks)
 *  - Sticky-left session-level notes
 *  - Week column header row
 *  - All sections (with their exercise rows + add-exercise)
 *  - Sticky-left "+ Add section" button
 *
 * Sessions are separated by a thick top border + generous spacing
 * (handled by the parent BlockBuilderModal).
 */
export default function SessionBlock({
  session,
  index,
  totalSessions,
  weeks,
  // session-level
  onRenameSession,
  onUpdateNotes,
  onRemoveSession,
  // section-level
  onAddSection,
  onRenameSection,
  onDeleteSection,
  // exercise-level
  onRequestAddExercise, // (sectionId) => void — opens side-panel picker
  onUpdateExercise,
  onRemoveExercise,
  onToggleSuperset, // (sectionId, exId, nextExId) → from parent
  // dnd
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
  const [collapsed, setCollapsed] = useState(false);
  const [renaming,  setRenaming]  = useState(false);
  const [draftName, setDraftName] = useState(session.name);

  const exerciseCount = session.sections.reduce((n, s) => n + s.exercises.length, 0);
  const minWidth = ROW_STICKY_WIDTH + weeks * WEEK_COL_WIDTH;

  const commitRename = () => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== session.name) onRenameSession(trimmed);
    setRenaming(false);
  };

  return (
    <div
      className="group/session"
      style={{
        minWidth,
        borderTop: index === 0 ? 'none' : '1px solid #e5e7eb',
        paddingTop: index === 0 ? 24 : 48,
        paddingBottom: collapsed ? 24 : 32,
      }}
    >
      {/* Session header (sticky-left) */}
      <div
        className="sticky left-0 z-20 bg-white flex items-center gap-3 pl-4 pr-6 py-1"
        style={{ width: ROW_STICKY_WIDTH + 60, minWidth: ROW_STICKY_WIDTH + 60 }}
      >
        <button
          onClick={() => setCollapsed(c => !c)}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 shrink-0"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
        {renaming ? (
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              else if (e.key === 'Escape') { setDraftName(session.name); setRenaming(false); }
            }}
            className="text-[18px] font-bold bg-transparent border-0 focus:outline-none"
            style={{ color: '#1C1C1C' }}
          />
        ) : (
          <button
            onClick={() => setRenaming(true)}
            className="group/sname flex items-center gap-2"
            title="Rename session"
          >
            <span className="text-[18px] font-bold" style={{ color: '#1C1C1C' }}>
              {session.name}
            </span>
            <Pencil size={12} className="opacity-0 group-hover/sname:opacity-50 transition-opacity" style={{ color: '#6b7280' }} />
          </button>
        )}
        <span className="text-[12px] shrink-0" style={{ color: '#9ca3af' }}>
          · {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
        </span>

        <div className="flex-1" />

        {totalSessions > 1 && (
          <button
            onClick={onRemoveSession}
            className="opacity-0 group-hover/session:opacity-60 hover:opacity-100 p-1 rounded hover:bg-gray-100 transition-all shrink-0"
            style={{ color: '#9ca3af' }}
            title="Remove session"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {!collapsed && (
        <>
          {/* Session-level notes (sticky-left) */}
          <div
            className="sticky left-0 z-10 bg-white pl-12 pr-6 mt-1"
            style={{ width: ROW_STICKY_WIDTH + 60, minWidth: ROW_STICKY_WIDTH + 60 }}
          >
            <textarea
              value={session.notes || ''}
              onChange={(e) => onUpdateNotes(e.target.value)}
              rows={1}
              className="w-full text-[12px] focus:outline-none resize-none placeholder:italic bg-transparent"
              style={{ color: '#6b7280' }}
              placeholder="Session-level notes — coach cues, focus, anything…"
            />
          </div>

          {/* Week column header — matches WeekCell border weights so the
              grid lines run continuously from header through values. */}
          <div
            className="flex items-stretch mt-3"
            style={{ minWidth, borderBottom: '1px solid #e5e7eb' }}
          >
            <div
              className="sticky left-0 z-10 bg-white flex items-center pl-4 pr-3 py-2 text-[10px] font-bold uppercase tracking-widest"
              style={{
                width: ROW_STICKY_WIDTH,
                minWidth: ROW_STICKY_WIDTH,
                color: '#6b7280',
                borderRight: '1px solid #e5e7eb',
              }}
            >
              Exercise
            </div>
            <div className="flex">
              {Array.from({ length: weeks }, (_, i) => {
                const wk = i + 1;
                const isEven = wk % 2 === 0;
                return (
                  <div
                    key={wk}
                    className="flex items-center justify-center py-2 text-[10px] font-bold uppercase tracking-widest"
                    style={{
                      width: WEEK_COL_WIDTH,
                      color: '#6b7280',
                      borderLeft: '1px solid #e5e7eb',
                      backgroundColor: isEven ? '#FCFCFD' : '#fff',
                    }}
                  >
                    Wk {wk}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sections */}
          <div className="pt-2" style={{ minWidth }}>
            {session.sections.map((sec, i) => (
              <SessionSection
                key={sec.tempId}
                section={sec}
                accentColour={colourForSection(sec, session.sections)}
                weeks={weeks}
                isFirst={i === 0}
                onRenameSection={(name) => onRenameSection(sec.tempId, name)}
                onDeleteSection={() => onDeleteSection(sec.tempId)}
                onRequestAddExercise={() => onRequestAddExercise && onRequestAddExercise(sec.tempId)}
                onUpdateExercise={(exId, patch) => onUpdateExercise(sec.tempId, exId, patch)}
                onRemoveExercise={(exId) => onRemoveExercise(sec.tempId, exId)}
                onExerciseDragStart={onExerciseDragStart(sec.tempId)}
                onExerciseDrop={onExerciseDrop(sec.tempId)}
                onExerciseDragEnter={onExerciseDragEnter}
                onExerciseDragLeave={onExerciseDragLeave}
                dropTargetExerciseId={dropTargetExerciseId}
                onSectionDrop={onSectionDrop(sec.tempId)}
                isSectionDropTarget={isSectionDropTarget(sec.tempId, sec.exercises.length)}
                onSectionDragEnter={() => onSectionDragEnter(sec.tempId)}
                onSectionDragLeave={() => onSectionDragLeave(sec.tempId)}
                onToggleSuperset={(exId, nextExId) => onToggleSuperset(sec.tempId, exId, nextExId)}
              />
            ))}

            {/* + Add section (sticky-left) */}
            <div
              className="sticky left-0 z-10 bg-white pl-3 mt-6"
              style={{ width: ROW_STICKY_WIDTH, minWidth: ROW_STICKY_WIDTH }}
            >
              <button
                onClick={onAddSection}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded transition-colors hover:bg-gray-50"
                style={{ color: '#437E8D', border: '1px dashed #437E8D' }}
              >
                + Add section
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
