import { useEffect, useMemo, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import {
  endDateFromStart,
  durationWeeksFromDates,
  findOverlappingBlock,
  formatBlockRange,
  formatShortDate,
  defaultStartForAdd,
} from '../../../utils/blockHelpers';

const MIN_WEEKS = 1;
const MAX_WEEKS = 16;

/**
 * BlockModal — Add / Edit / Delete a training_blocks row.
 *
 * Props:
 *   mode             'add' | 'edit'
 *   initialBlock     row when editing, null when adding
 *   athleteId        athlete this block belongs to (required, fixed in modal)
 *   athleteName      shown read-only in the form
 *   existingBlocks   array of all blocks for this athlete (for overlap check)
 *   targetEventOptions  array of competition events the dropdown can offer.
 *                       Caller decides scope (filtered by start in 'add'
 *                       mode, all in 'edit' mode per Brief 3 #5).
 *   onSave           async (payload) => void
 *   onDelete         async (id) => void  — edit mode only
 *   onClose          () => void
 */
export default function BlockModal({
  mode,
  initialBlock,
  athleteId,
  athleteName,
  existingBlocks = [],
  targetEventOptions = [],
  onSave,
  onDelete,
  onClose,
}) {
  const isEdit = mode === 'edit' && initialBlock;

  const initialWeeks = isEdit
    ? (initialBlock.duration_weeks || durationWeeksFromDates(initialBlock.start_date, initialBlock.end_date))
    : 4;

  const [name,        setName]        = useState(initialBlock?.block_name || '');
  const [startDate,   setStartDate]   = useState(
    initialBlock?.start_date
      ?? defaultStartForAdd(existingBlocks, athleteId),
  );
  const [weeks,       setWeeks]       = useState(initialWeeks);
  const [targetId,    setTargetId]    = useState(initialBlock?.target_event_id || '');
  const [notes,       setNotes]       = useState(initialBlock?.notes || '');
  const [submitting,  setSubmitting]  = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(false);

  const endDate = useMemo(() => endDateFromStart(startDate, Number(weeks)), [startDate, weeks]);

  // Validation
  const validName  = name.trim().length > 0;
  const validWeeks = Number(weeks) >= MIN_WEEKS && Number(weeks) <= MAX_WEEKS;
  const validStart = !!startDate;

  const overlap = useMemo(
    () => (validStart && endDate) ? findOverlappingBlock(
      { start_date: startDate, end_date: endDate, athlete_id: athleteId },
      existingBlocks,
      isEdit ? initialBlock.id : null,
    ) : null,
    [startDate, endDate, athleteId, existingBlocks, isEdit, initialBlock],
  );

  const canSubmit = validName && validWeeks && validStart && !overlap && !submitting;

  const handleSave = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const payload = {
        athlete_id: athleteId,
        block_name: name.trim(),
        start_date: startDate,
        end_date: endDate,
        duration_weeks: Number(weeks),
        target_event_id: targetId || null,
        notes: notes.trim() || null,
      };
      await onSave(payload);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !onDelete) return;
    setSubmitting(true);
    try {
      await onDelete(initialBlock.id);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm">
            {isEdit ? 'Edit Training Block' : 'Add Training Block'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Athlete (read-only context) */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
              Athlete
            </label>
            <div
              className="px-3 py-2 text-sm rounded"
              style={{ backgroundColor: '#f9fafb', color: '#1C1C1C', border: '1px solid #e5e7eb' }}
            >
              {athleteName}
            </div>
          </div>

          {/* Block name */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
              Block Name <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. GPP, Maximal Strength, Peaking"
              className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:outline-none"
            />
          </div>

          {/* Start + Duration side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
                Start Date <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
                Duration (weeks) <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="number"
                min={MIN_WEEKS}
                max={MAX_WEEKS}
                value={weeks}
                onChange={(e) => setWeeks(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Computed end date */}
          {endDate && (
            <p className="text-[11px]" style={{ color: '#6b7280' }}>
              Ends: <span style={{ color: '#1C1C1C', fontWeight: 600 }}>{formatShortDate(endDate)}</span>
              <span style={{ color: '#9ca3af' }}> · {formatBlockRange(startDate, endDate)}</span>
            </p>
          )}

          {/* Overlap warning */}
          {overlap && (
            <p className="text-[11px] rounded px-3 py-2" style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
              This block overlaps with <strong>{overlap.block_name}</strong> ({formatBlockRange(overlap.start_date, overlap.end_date)}).
              Adjust dates or edit the existing block.
            </p>
          )}

          {/* Target event */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
              Target Event
            </label>
            <select
              value={targetId || ''}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:outline-none bg-white"
            >
              <option value="">— None —</option>
              {targetEventOptions.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.event_name} ({formatShortDate(ev.start_date)})
                </option>
              ))}
            </select>
            {targetEventOptions.length === 0 && (
              <p className="text-[11px] mt-1" style={{ color: '#9ca3af' }}>
                {isEdit
                  ? 'No competitions on this athlete to link.'
                  : 'No competitions on or after the start date. Add a competition event first to link this block.'}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional context, focus areas, key targets"
              className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
          <div>
            {isEdit && onDelete && !confirmDel && (
              <button
                onClick={() => setConfirmDel(true)}
                disabled={submitting}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded transition-colors disabled:opacity-40"
                style={{ color: '#dc2626' }}
              >
                <Trash2 size={13} />
                Delete
              </button>
            )}
            {confirmDel && (
              <div className="flex items-center gap-2">
                <span className="text-[11px]" style={{ color: '#dc2626' }}>
                  Delete '{name || initialBlock?.block_name}'? This cannot be undone.
                </span>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="px-3 py-1.5 text-[11px] font-semibold text-white rounded disabled:opacity-40"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDel(false)}
                  className="px-2 py-1.5 text-[11px] font-semibold rounded"
                  style={{ color: '#6b7280' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSubmit}
              className="px-5 py-2 text-sm font-semibold text-white rounded transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#A58D69' }}
            >
              {isEdit ? 'Save Changes' : 'Save Block'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
