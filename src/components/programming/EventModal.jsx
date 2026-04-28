import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';

const EVENT_TYPES = [
  { value: 'competition',    label: 'Competition'    },
  { value: 'training_camp',  label: 'Training Camp'  },
  { value: 'testing',        label: 'Testing'        },
  { value: 'other',          label: 'Other'          },
];

const PRIORITIES = [
  { value: '',  label: '— None —' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * EventModal — Add / Edit / Delete an athlete_calendar_events row.
 *
 * Props:
 *   mode             'add' | 'edit'
 *   initialEvent     row object when editing, otherwise null
 *   defaultAthleteId string — pre-selects the athlete (Surface 1 single-athlete)
 *   athleteOptions   array of { id, name } for the athlete dropdown.
 *                    If length === 1 the dropdown renders read-only label
 *                    (Surface 1). If length > 1, full dropdown (Surface 2).
 *   onSave           async (data) => void   data is the row payload
 *   onDelete         async (id) => void     edit mode only
 *   onClose          () => void
 */
export default function EventModal({
  mode,
  initialEvent,
  defaultAthleteId,
  athleteOptions = [],
  onSave,
  onDelete,
  onClose,
}) {
  const [name,       setName]       = useState(initialEvent?.event_name || '');
  const [eventType,  setEventType]  = useState(initialEvent?.event_type || 'competition');
  const [priority,   setPriority]   = useState(initialEvent?.priority || '');
  const [startDate,  setStartDate]  = useState(initialEvent?.start_date || todayISO());
  const [endDate,    setEndDate]    = useState(initialEvent?.end_date || '');
  const [athleteId,  setAthleteId]  = useState(initialEvent?.athlete_id || defaultAthleteId || '');
  const [notes,      setNotes]      = useState(initialEvent?.notes || '');
  const [submitting, setSubmitting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  // If event type changes away from competition, clear priority
  useEffect(() => {
    if (eventType !== 'competition' && priority) setPriority('');
  }, [eventType, priority]);

  // Validation
  const validName = name.trim().length > 0;
  const validRange = !endDate || endDate >= startDate;
  const validAthlete = !!athleteId;
  const canSubmit = validName && validRange && validAthlete && !submitting;

  const handleSave = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const payload = {
        athlete_id: athleteId,
        event_name: name.trim(),
        event_type: eventType,
        priority: eventType === 'competition' ? (priority || null) : null,
        start_date: startDate,
        end_date: endDate || null,
        notes: notes.trim() || null,
      };
      await onSave(payload);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialEvent || !onDelete) return;
    setSubmitting(true);
    try {
      await onDelete(initialEvent.id);
    } finally {
      setSubmitting(false);
    }
  };

  const showAthleteDropdown = athleteOptions.length > 1;
  const singleAthleteName = athleteOptions[0]?.name || '';

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
            {mode === 'edit' ? 'Edit Event' : 'Add Event'}
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
          {/* Event name */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
              Event Name <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. National Championships"
              className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:outline-none"
              style={{ borderColor: '#e5e7eb' }}
            />
          </div>

          {/* Type + priority side-by-side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:outline-none bg-white"
              >
                {EVENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {eventType === 'competition' && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
                  Priority
                </label>
                <select
                  value={priority || ''}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:outline-none bg-white"
                >
                  {PRIORITIES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Dates */}
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
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:outline-none"
              />
            </div>
          </div>
          {!validRange && (
            <p className="text-[11px]" style={{ color: '#dc2626' }}>
              End date must be the same as or after the start date.
            </p>
          )}

          {/* Athlete */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
              Athlete <span style={{ color: '#dc2626' }}>*</span>
            </label>
            {showAthleteDropdown ? (
              <select
                value={athleteId}
                onChange={(e) => setAthleteId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:outline-none bg-white"
              >
                <option value="">— Select athlete —</option>
                {athleteOptions.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            ) : (
              <div
                className="px-3 py-2 text-sm rounded"
                style={{ backgroundColor: '#f9fafb', color: '#1C1C1C', border: '1px solid #e5e7eb' }}
              >
                {singleAthleteName || athleteId}
              </div>
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
              placeholder="Optional details, location, or context"
              className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
          <div>
            {mode === 'edit' && onDelete && !confirmDel && (
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
                  Delete '{name || initialEvent?.event_name}'?
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
              {mode === 'edit' ? 'Save Changes' : 'Save Event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
