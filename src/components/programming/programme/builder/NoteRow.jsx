import { GripVertical, StickyNote, Trash2 } from 'lucide-react';
import { ROW_STICKY_WIDTH } from './SessionExerciseRow';

/**
 * NoteRow — a free-text coach note inserted into the session step
 * sequence. Renders only inside the sticky-left column (no week
 * grid). Drag-reorderable like exercise rows; removable via the
 * trash on hover.
 *
 * Saves to session_step_notes via the parent draft tree — see
 * programmeTemplates.js.
 */
export default function NoteRow({
  note,
  onChange,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnter,
  onDragLeave,
  isDropTarget,
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      className="group flex items-stretch transition-colors hover:bg-[#FAFAFA]"
      style={{
        borderTop: isDropTarget ? '2px solid #437E8D' : '2px solid transparent',
      }}
    >
      <div
        className="sticky left-0 z-10 bg-white group-hover:bg-[#FAFAFA] flex items-stretch gap-2.5 pl-3 pr-3 py-2.5"
        style={{
          width: ROW_STICKY_WIDTH,
          minWidth: ROW_STICKY_WIDTH,
          borderRight: '1px solid #e5e7eb',
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <div
          className="flex items-center cursor-grab text-gray-300 hover:text-gray-500 transition-colors shrink-0"
          title="Drag to reorder"
        >
          <GripVertical size={14} />
        </div>

        <div
          className="shrink-0 self-stretch flex items-center justify-center"
          style={{
            width: 22,
            backgroundColor: 'rgba(165,141,105,0.10)',
            borderRadius: 4,
          }}
        >
          <StickyNote size={11} style={{ color: '#A58D69' }} />
        </div>

        <textarea
          value={note.content || ''}
          onChange={(e) => onChange({ content: e.target.value })}
          rows={1}
          placeholder="Note for this section…"
          className="flex-1 text-[12px] italic focus:outline-none placeholder:italic bg-transparent resize-none"
          style={{ color: '#6b7280' }}
          onInput={(e) => {
            // Auto-grow textarea height with content.
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
        />

        <button
          onClick={onRemove}
          className="self-start mt-0.5 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 transition-opacity shrink-0"
          style={{ color: '#9ca3af' }}
          title="Remove note"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
