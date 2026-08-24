import { useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Trash2, Copy } from 'lucide-react';
import SessionSection from './SessionSection';
import { ROW_STICKY_WIDTH, WEEK_COL_WIDTH } from './SessionExerciseRow';
import { colourForSection } from '../../../../utils/sectionColours';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_NAMES   = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Mon-Sun single-day picker — which weekday this session recurs on
// every week of the block. Only rendered when onUpdateDay is supplied
// (athlete mode; template sessions aren't tied to real dates).
function DayPicker({ day, onUpdateDay }) {
  return (
    <div className="flex items-center gap-0.5 shrink-0" title="Which day this session lands on each week">
      {DAY_LETTERS.map((letter, i) => {
        const active = day === i;
        return (
          <button
            key={i}
            onClick={() => onUpdateDay(active ? null : i)}
            className="w-5 h-5 rounded text-[9px] font-bold transition-colors"
            style={{
              backgroundColor: active ? '#A58D69' : '#fff',
              color: active ? '#fff' : '#9ca3af',
              border: `1px solid ${active ? '#A58D69' : '#e5e7eb'}`,
            }}
            title={DAY_NAMES[i]}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}

/**
 * SessionBlock — one full session in the vertical stack.
 *
 * Visually a card: white surface, subtle border + shadow, generous
 * vertical padding. The card spans the full content width (sticky-left
 * 360px + N × week_col_width) and lives inside the modal's tinted
 * scroll area so the cards "lift" off the background.
 *
 * Sticky-left header carries the session name, exercise count, and
 * the row of action buttons (collapse · duplicate · delete).
 */
export default function SessionBlock({
  session,
  index,
  totalSessions,
  weeks,
  currentWk = null,           // 1-indexed week of the block today falls into
  isRecent = false,           // Phase 2: triggers a brief gold highlight
  onRenameSession,
  onUpdateNotes,
  onRemoveSession,
  onDuplicateSession,         // Phase 2: new action
  day = null,                 // 0-6 Mon-indexed weekday this session lands on, or null
  onUpdateDay,                // (day|null) => void — omitted outside athlete mode
  // section-level
  onAddSection,
  onRenameSection,
  onDeleteSection,
  // exercise-level
  onRequestAddExercise,
  onUpdateExercise,
  onRemoveExercise,
  onToggleSuperset,
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
  defaultCollapsed = false,
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [renaming,  setRenaming]  = useState(false);
  const [draftName, setDraftName] = useState(session.name);

  const exerciseCount = session.sections.reduce(
    (n, s) => n + s.exercises.filter(e => e.kind !== 'note').length,
    0
  );
  const minWidth = ROW_STICKY_WIDTH + weeks * WEEK_COL_WIDTH;

  const commitRename = () => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== session.name) onRenameSession(trimmed);
    setRenaming(false);
  };

  return (
    <div
      className={`group/session ${isRecent ? 'animate-fade-in-up' : ''}`}
      style={{
        minWidth,
        // Card chrome
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(15,15,15,0.05)',
        // Spacing between cards
        margin: '20px 24px',
        marginTop: index === 0 ? 24 : 20,
        marginBottom: index === totalSessions - 1 ? 0 : 20,
        overflow: 'hidden',
        // Brief gold halo on newly added/duplicated sessions
        animation: isRecent ? 'sessionHighlight 1500ms ease-out' : undefined,
      }}
    >
      {/* ── Session header ────────────────────────────────────────────────
          Outer bar paints the full session-card width (matches the row
          minWidth) so the header reads as a full-width strip even on
          long sessions / many weeks. The interactive content (chevron,
          title, counter, actions) lives inside a sticky-left container
          that stays visible as the coach scrolls horizontally. */}
      <div
        className="relative"
        style={{
          minWidth,
          backgroundColor: '#fafafa',
          borderBottom: collapsed ? 'none' : '1px solid #f3f4f6',
        }}
      >
        <div
          className="sticky left-0 z-20 flex items-center gap-3 pl-4 pr-4 py-3.5"
          style={{
            // Wide enough for long session names. Anything longer
            // truncates with the title's flex-1.
            width: ROW_STICKY_WIDTH + 360,
            minWidth: ROW_STICKY_WIDTH + 360,
            backgroundColor: '#fafafa',
          }}
        >
          <button
            onClick={() => setCollapsed(c => !c)}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 shrink-0 transition-colors"
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
              className="text-h3 bg-transparent border-0 focus:outline-none flex-1 min-w-0"
              style={{ color: '#1C1C1C' }}
            />
          ) : (
            <button
              onClick={() => setRenaming(true)}
              className="group/sname flex items-center gap-2 flex-1 min-w-0 text-left"
              title="Rename session"
            >
              <span className="text-h3 truncate" style={{ color: '#1C1C1C' }}>
                {session.name}
              </span>
              <Pencil size={12} className="opacity-0 group-hover/sname:opacity-50 transition-opacity shrink-0" style={{ color: '#6b7280' }} />
            </button>
          )}

          {/* Right cluster — counter + day picker + always-visible actions */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-meta" style={{ color: '#9ca3af' }}>
              {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
            </span>
            {onUpdateDay && <DayPicker day={day} onUpdateDay={onUpdateDay} />}
            {onDuplicateSession && (
              <button
                onClick={onDuplicateSession}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                title="Duplicate session"
              >
                <Copy size={14} />
              </button>
            )}
            {totalSessions > 1 && (
              <button
                onClick={onRemoveSession}
                className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors"
                title="Remove session"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Session-level notes (sticky-left) */}
          <div
            className="sticky left-0 z-10 bg-white pl-12 pr-6 pt-3 pb-2"
            style={{ width: ROW_STICKY_WIDTH + 360, minWidth: ROW_STICKY_WIDTH + 360 }}
          >
            <textarea
              value={session.notes || ''}
              onChange={(e) => onUpdateNotes(e.target.value)}
              rows={1}
              className="w-full text-meta focus:outline-none resize-none placeholder:italic bg-transparent"
              style={{ color: '#6b7280' }}
              placeholder="Session-level notes — coach cues, focus, anything…"
            />
          </div>

          {/* Week column header */}
          <div
            className="flex items-stretch mt-2"
            style={{ minWidth, borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #e5e7eb' }}
          >
            <div
              className="sticky left-0 z-10 bg-white flex items-center pl-4 pr-3 py-2 text-micro font-bold uppercase"
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
                    className="flex items-center justify-center py-2 text-micro font-bold uppercase"
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
          <div className="pt-2 pb-4" style={{ minWidth }}>
            {session.sections.map((sec, i) => (
              <SessionSection
                key={sec.tempId}
                section={sec}
                accentColour={colourForSection(sec, session.sections)}
                weeks={weeks}
                currentWk={currentWk}
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
              className="sticky left-0 z-10 bg-white pl-3 mt-5"
              style={{ width: ROW_STICKY_WIDTH, minWidth: ROW_STICKY_WIDTH }}
            >
              <button
                onClick={onAddSection}
                className="flex items-center gap-1.5 px-3 py-1.5 text-meta font-semibold rounded-md transition-colors hover:bg-teal-50"
                style={{ color: '#437E8D', border: '1px dashed #437E8D' }}
              >
                + Add section
              </button>
            </div>
          </div>
        </>
      )}

      {/* Inline keyframe — keeps animation token co-located with the
          component that uses it; avoids polluting the global stylesheet. */}
      <style>{`
        @keyframes sessionHighlight {
          0%   { box-shadow: 0 0 0 3px rgba(165,141,105,0.45), 0 1px 3px rgba(15,15,15,0.05); }
          100% { box-shadow: 0 0 0 0   rgba(165,141,105,0),    0 1px 3px rgba(15,15,15,0.05); }
        }
      `}</style>
    </div>
  );
}
