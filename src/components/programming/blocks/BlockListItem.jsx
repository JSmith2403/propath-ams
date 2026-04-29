import { Pencil, Trash2, ChevronRight } from 'lucide-react';
import { getBlockStatus, formatBlockRange } from '../../../utils/blockHelpers';

const STATUS_STYLE = {
  active:    { bg: '#437E8D', fg: '#ffffff', label: 'Active' },
  upcoming:  { bg: '#E5E5E5', fg: '#1C1C1C', label: 'Upcoming' },
  completed: { bg: '#9CA3AF', fg: '#ffffff', label: 'Completed' },
};

/**
 * BlockListItem — single row in the Training Blocks list (Surface 1).
 *
 * Hover shows edit / delete icon buttons on the right.
 * Click anywhere on the row body opens the edit modal.
 * Click on the linked-event chevron jumps to the event's edit modal.
 */
export default function BlockListItem({
  block,
  linkedEvent,
  canEdit = true,
  onEdit,
  onDelete,
  onClickLinkedEvent,
}) {
  const status = getBlockStatus(block);
  const style  = STATUS_STYLE[status];
  const range  = formatBlockRange(block.start_date, block.end_date);

  const handleRowClick = () => { if (canEdit) onEdit(block); };
  const handleEditClick = (e) => { e.stopPropagation(); onEdit(block); };
  const handleDeleteClick = (e) => { e.stopPropagation(); onDelete(block); };
  const handleLinkedEventClick = (e) => {
    e.stopPropagation();
    if (linkedEvent) onClickLinkedEvent(linkedEvent);
  };

  return (
    <div
      onClick={handleRowClick}
      className="group flex items-center gap-3 px-4 py-3 border-b border-gray-100 transition-colors hover:bg-gray-50"
      style={{
        cursor: canEdit ? 'pointer' : 'default',
        opacity: status === 'completed' ? 0.8 : 1,
      }}
    >
      {/* Status pill */}
      <span
        className="shrink-0 inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded"
        style={{ backgroundColor: style.bg, color: style.fg, letterSpacing: '0.06em' }}
      >
        {style.label}
      </span>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-sm font-bold truncate" style={{ color: '#1C1C1C' }}>
            {block.block_name}
          </span>
          <span className="text-[11px]" style={{ color: '#6b7280' }}>
            {range} · {block.duration_weeks} {block.duration_weeks === 1 ? 'week' : 'weeks'}
          </span>
        </div>

        {linkedEvent && (
          <button
            onClick={handleLinkedEventClick}
            className="mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-semibold hover:underline"
            style={{ color: '#437E8D' }}
            title="Open the linked event"
          >
            <ChevronRight size={11} />
            <span className="truncate">{linkedEvent.event_name}</span>
          </button>
        )}
      </div>

      {/* Hover actions */}
      {canEdit && (
        <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEditClick}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            style={{ color: '#6b7280' }}
            aria-label="Edit block"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            style={{ color: '#dc2626' }}
            aria-label="Delete block"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
