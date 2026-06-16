import { Copy, Repeat, Trash2, X } from 'lucide-react';

/**
 * BulkActionBar — TrainHeroic-style fixed bottom strip that appears
 * once one or more sessions are selected in the week view. Hosts the
 * actions that operate on a multi-selection.
 *
 * v1 actions wired:
 *   • Cancel           — exits selection mode, clears the set
 *   • Repeat next week — bulk-copies every selected session forward by
 *                        7 days (most common rescheduling use-case)
 *   • Copy…            — opens a destination picker (caller renders it)
 *   • Delete           — bulk-deletes after confirm (caller renders)
 *
 * Unpublish + Save to Library from the TrainHeroic screenshot are
 * intentionally out of scope for v1 — ProPath doesn't have a publish
 * concept (sessions are always live to the assigned athlete) and the
 * library concept here means block templates, which doesn't slice
 * cleanly across a multi-selection.
 *
 * Props:
 *   count           — number selected (rendered as "{n} Sessions selected")
 *   onCancel        — clear selection + exit mode
 *   onRepeat        — copy each selected +7 days
 *   onCopy          — open destination picker
 *   onDelete        — open confirm modal
 *   disabled        — true while a bulk op is in flight
 */
export default function BulkActionBar({
  count, onCancel, onRepeat, onCopy, onDelete, disabled = false,
}) {
  if (!count) return null;
  return (
    <div
      className="fixed left-0 right-0 bottom-0 z-40 flex items-center gap-2 px-4 py-3 shadow-2xl"
      style={{
        backgroundColor: '#1C1C1C',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <button
        onClick={onCancel}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
        style={{ color: '#fff', backgroundColor: 'rgba(255,255,255,0.08)' }}
        title="Cancel selection"
      >
        <X size={13} />
        <span className="text-[11px] font-bold">Cancel</span>
      </button>

      <div className="flex-1 text-center text-[12px] font-bold" style={{ color: '#fff' }}>
        {count} Session{count === 1 ? '' : 's'} selected
      </div>

      <button
        onClick={onRepeat}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 hover:bg-white/10"
        style={{ color: '#fff' }}
        title="Duplicate next week"
      >
        <Repeat size={13} />
        <span className="text-[11px] font-bold hidden sm:inline">Repeat</span>
      </button>

      <button
        onClick={onCopy}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 hover:bg-white/10"
        style={{ color: '#fff' }}
        title="Copy to another day"
      >
        <Copy size={13} />
        <span className="text-[11px] font-bold hidden sm:inline">Copy</span>
      </button>

      <button
        onClick={onDelete}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
        style={{ color: '#fff', backgroundColor: '#dc2626' }}
        title="Delete selected sessions"
      >
        <Trash2 size={13} />
        <span className="text-[11px] font-bold">Delete</span>
      </button>
    </div>
  );
}
