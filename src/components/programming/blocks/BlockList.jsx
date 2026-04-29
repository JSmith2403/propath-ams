import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import BlockListItem from './BlockListItem';

/**
 * BlockList — Training Blocks section under the calendar on Surface 1.
 *
 * Sorted by start_date desc (most recent / upcoming first to land at the
 * top of the list).
 */
export default function BlockList({
  blocks = [],
  events = [],
  loading = false,
  canEdit = true,
  onAdd,
  onEdit,
  onDelete,
  onClickLinkedEvent,
}) {
  const eventsById = useMemo(() => {
    const m = new Map();
    events.forEach(e => m.set(e.id, e));
    return m;
  }, [events]);

  // Sort by start_date descending (most recent first per Brief 3 A1)
  const sorted = useMemo(
    () => blocks.slice().sort((a, b) => b.start_date.localeCompare(a.start_date)),
    [blocks],
  );

  return (
    <section className="rounded-xl bg-white" style={{ border: '1px solid #e5e7eb' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1C1C1C' }}>
          Training Blocks
        </h3>
        {canEdit && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#A58D69' }}
          >
            <Plus size={13} />
            Add Block
          </button>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div
            className="w-6 h-6 border-2 rounded-full animate-spin"
            style={{ borderColor: '#e5e7eb', borderTopColor: '#A58D69' }}
          />
        </div>
      ) : sorted.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <p className="text-sm" style={{ color: '#6b7280' }}>
            No training blocks yet.
          </p>
          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
            Add a block to start structuring training periods leading up to events.
          </p>
          {canEdit && (
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 text-xs font-semibold text-white rounded transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#A58D69' }}
            >
              <Plus size={13} />
              Add Block
            </button>
          )}
        </div>
      ) : (
        <div>
          {sorted.map(b => (
            <BlockListItem
              key={b.id}
              block={b}
              linkedEvent={b.target_event_id ? eventsById.get(b.target_event_id) || null : null}
              canEdit={canEdit}
              onEdit={onEdit}
              onDelete={onDelete}
              onClickLinkedEvent={onClickLinkedEvent}
            />
          ))}
        </div>
      )}
    </section>
  );
}
