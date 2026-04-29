import { X } from 'lucide-react';

/**
 * Small modal confirmation dialog used by the timeline week strip.
 *
 * Props:
 *   title         heading
 *   body          string or node — main description
 *   confirmLabel  CTA copy (default 'Confirm')
 *   cancelLabel   default 'Cancel'
 *   danger        true → confirm button uses red, otherwise gold
 *   onConfirm     async () => void
 *   onCancel      () => void
 */
export default function ConfirmDialog({
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) {
  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="font-bold text-sm" style={{ color: '#1C1C1C' }}>
            {title}
          </h3>
          <button
            onClick={onCancel}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 transition-colors"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4 text-xs leading-relaxed whitespace-pre-line" style={{ color: '#4b5563' }}>
          {body}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-xs font-semibold text-white rounded transition-opacity hover:opacity-90"
            style={{ backgroundColor: danger ? '#dc2626' : '#A58D69' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
