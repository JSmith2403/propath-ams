import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { addDaysISO } from '../../../utils/blockHelpers';
import {
  createStandaloneSession,
  createStandaloneSessions,
  updateStandaloneSession,
  deletePlannedSession,
} from '../../../hooks/usePlannedSessionMutations';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

/**
 * PlanSessionModal — create or edit a standalone (non-block) session.
 *
 * mode 'single'  — one session on `dateISO`.
 * mode 'week'    — pick any days in the Mon-Sun week starting `weekStartISO`,
 *                  each becomes its own independent standalone session.
 * mode 'edit'    — rename / add notes / delete an existing standalone
 *                  session, passed as `existing`.
 */
export default function PlanSessionModal({
  mode,
  athleteId,
  dateISO,
  weekStartISO,
  existing,
  onSaved,
  onDeleted,
  onClose,
}) {
  const isEdit = mode === 'edit';
  const isWeek = mode === 'week';

  const [name, setName] = useState(existing?.name || 'Session');
  const [notes, setNotes] = useState(existing?.notes || '');
  const [submitting, setSubmitting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [error, setError] = useState(null);

  // Week mode: one row per day, each independently toggled + named.
  const weekDays = isWeek
    ? Array.from({ length: 7 }, (_, i) => addDaysISO(weekStartISO, i))
    : [];
  const [weekChecked, setWeekChecked] = useState(() => new Set());
  const [weekNames, setWeekNames] = useState(() => Object.fromEntries(weekDays.map(d => [d, 'Session'])));

  const toggleDay = (iso) => {
    setWeekChecked(prev => {
      const next = new Set(prev);
      if (next.has(iso)) next.delete(iso); else next.add(iso);
      return next;
    });
  };

  const handleSave = async () => {
    setError(null);
    setSubmitting(true);
    try {
      if (isEdit) {
        const res = await updateStandaloneSession(existing.standaloneSessionId, {
          session_name: name.trim() || 'Session',
          coach_notes: notes.trim() || null,
        });
        if (!res.ok) { setError(res.error?.message || "Couldn't save."); return; }
        onSaved && onSaved();
        return;
      }
      if (isWeek) {
        const entries = weekDays
          .filter(d => weekChecked.has(d))
          .map(d => ({ dateISO: d, name: (weekNames[d] || 'Session').trim() || 'Session' }));
        if (!entries.length) { setError('Pick at least one day.'); return; }
        const res = await createStandaloneSessions(athleteId, entries);
        if (!res.ok) { setError(res.error?.message || "Couldn't save."); return; }
        onSaved && onSaved();
        return;
      }
      // single
      const res = await createStandaloneSession({
        athleteId,
        sessionName: name.trim() || 'Session',
        sessionDateISO: dateISO,
        coachNotes: notes.trim() || null,
      });
      if (!res.ok) { setError(res.error?.message || "Couldn't save."); return; }
      onSaved && onSaved();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await deletePlannedSession(existing.plannedId);
      if (!res.ok) { setError(res.error?.message || "Couldn't delete."); return; }
      onDeleted && onDeleted();
    } finally {
      setSubmitting(false);
    }
  };

  const title = isEdit ? 'Edit Session' : isWeek ? 'Plan a Week' : 'Plan a Session';
  const canSubmit = !submitting && (isWeek ? weekChecked.size > 0 : true);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {!isWeek && (
            <>
              <p className="text-[11px] font-semibold" style={{ color: '#6b7280' }}>
                {formatDate(isEdit ? existing.dateISO : dateISO)}
              </p>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
                  Session Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rehab Check-in, Mobility"
                  className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Optional"
                  className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:outline-none resize-none"
                />
              </div>
            </>
          )}

          {isWeek && (
            <div className="space-y-2">
              <p className="text-[11px]" style={{ color: '#6b7280' }}>
                Pick the days you want to plan individually — no fixed block, just this week.
              </p>
              {weekDays.map((iso, i) => {
                const checked = weekChecked.has(iso);
                return (
                  <div key={iso} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDay(iso)}
                      className="w-4 h-4 shrink-0"
                    />
                    <span className="text-[11px] font-semibold w-9 shrink-0" style={{ color: '#1C1C1C' }}>
                      {DAY_LABELS[i]}
                    </span>
                    <input
                      type="text"
                      value={weekNames[iso] || ''}
                      onChange={(e) => setWeekNames(prev => ({ ...prev, [iso]: e.target.value }))}
                      disabled={!checked}
                      placeholder="Session name"
                      className="flex-1 px-2.5 py-1.5 text-xs rounded border border-gray-200 focus:outline-none disabled:opacity-40 disabled:bg-gray-50"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <p className="text-[11px] rounded px-3 py-2" style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
          <div>
            {isEdit && !confirmDel && (
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
                <span className="text-[11px]" style={{ color: '#dc2626' }}>Delete this session?</span>
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
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSubmit}
              className="px-5 py-2 text-sm font-semibold text-white rounded transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#A58D69' }}
            >
              {isEdit ? 'Save Changes' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
