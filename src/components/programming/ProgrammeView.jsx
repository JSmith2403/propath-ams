import { useMemo, useRef, useState } from 'react';
import { useProgrammingSettings } from '../../hooks/useProgrammingSettings';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import ProgrammeCalendar, {
  _parseDate as parseDate,
  _addDays   as addDays,
  _dayDiff   as dayDiff,
  _toISO     as toISO,
  _formatToastDate as formatToastDate,
} from './ProgrammeCalendar';
import EventModal from './EventModal';

/**
 * ProgrammeView (Surface 1) — Programme sub-tab inside the athlete profile.
 *
 * Scope: shows ONLY the current athlete's events. No multi-athlete sidebar.
 * The cross-athlete master calendar lives in a separate top-level "Programme"
 * page (Surface 2 — built next).
 *
 * Includes:
 *   • programming_active toggle for the current athlete (B1)
 *   • Month / Week calendar with multi-day pills (B2 + B4)
 *   • Add / Edit / Delete event flow via modal (B5 / B6)
 *   • Empty-state hint (B7)
 */
export default function ProgrammeView({
  athlete,
  role = 'admin',
}) {
  const canEdit = role === 'admin' || role === 'co_admin';

  // ── Toggle state ────────────────────────────────────────────────────────
  const { isActive, loading: settingsLoading, setActive } = useProgrammingSettings(athlete.id);

  // ── Events state (only fetched while active) ────────────────────────────
  const athleteIds = useMemo(() => (isActive ? [athlete.id] : []), [isActive, athlete.id]);
  const { events, loading: eventsLoading, addEvent, updateEvent, deleteEvent } = useCalendarEvents(athleteIds);

  // ── Calendar nav state ──────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState('month');
  const [viewDate, setViewDate] = useState(() => new Date());

  // ── Modal state ─────────────────────────────────────────────────────────
  // event === null means a fresh add. event === { start_date, ... } may carry
  // a default start_date when adding via the cell hover affordance.
  const [modal, setModal] = useState(null);

  const openAdd       = () => canEdit && setModal({ mode: 'add',  event: null });
  const openAddOnDate = (iso) => canEdit && setModal({ mode: 'add', event: { start_date: iso } });
  const openEdit      = (event) => canEdit && setModal({ mode: 'edit', event });
  const close         = () => setModal(null);

  // ── Toast state (shown after a successful drag-and-drop reschedule) ─────
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  // ── Drag reschedule handler — preserves duration ────────────────────────
  const handleMoveEvent = async (event, newStartISO) => {
    if (!canEdit) return;
    const oldStart = parseDate(event.start_date);
    const oldEnd   = event.end_date ? parseDate(event.end_date) : null;
    const newStart = parseDate(newStartISO);
    const duration = oldEnd ? dayDiff(oldEnd, oldStart) : 0;
    const newEndISO = oldEnd ? toISO(addDays(newStart, duration)) : null;
    await updateEvent(event.id, {
      start_date: newStartISO,
      end_date: newEndISO,
    });
    showToast(`Event moved to ${formatToastDate(newStartISO)}`);
  };

  const handleSave = async (payload) => {
    if (modal?.mode === 'edit' && modal.event) {
      await updateEvent(modal.event.id, payload);
    } else {
      await addEvent(payload);
    }
    close();
  };

  const handleDelete = async (id) => {
    await deleteEvent(id);
    close();
  };

  // ── Activation toggle card ──────────────────────────────────────────────
  const ToggleCard = (
    <div
      className="rounded-xl px-5 py-4 flex items-center justify-between"
      style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
    >
      <div>
        <h3 className="text-sm font-semibold" style={{ color: '#1C1C1C' }}>
          Programming active for this athlete
        </h3>
        {!isActive && !settingsLoading && (
          <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
            Enable to start adding events and blocks for this athlete.
          </p>
        )}
      </div>
      <button
        onClick={() => canEdit && setActive(!isActive)}
        disabled={!canEdit || settingsLoading}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: isActive ? '#A58D69' : '#d1d5db' }}
        aria-label="Toggle programming active"
      >
        <span
          className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
          style={{ transform: isActive ? 'translateX(22px)' : 'translateX(4px)' }}
        />
      </button>
    </div>
  );

  // ── Inactive state ──────────────────────────────────────────────────────
  if (!settingsLoading && !isActive) {
    return (
      <div className="space-y-6">
        {ToggleCard}
        <div
          className="rounded-xl p-12 text-center"
          style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
        >
          <p className="text-sm" style={{ color: '#6b7280' }}>
            Programming is not active for this athlete.
          </p>
          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
            Enable above to start adding events and blocks.
          </p>
        </div>
      </div>
    );
  }

  // ── Loading state ───────────────────────────────────────────────────────
  if (settingsLoading) {
    return (
      <div className="space-y-6">
        {ToggleCard}
        <div className="flex items-center justify-center py-20">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: '#e5e7eb', borderTopColor: '#A58D69' }}
          />
        </div>
      </div>
    );
  }

  // ── Active state — calendar only (no sidebar on Surface 1) ──────────────
  return (
    <div className="space-y-6">
      {ToggleCard}

      {eventsLoading ? (
        <div className="flex items-center justify-center py-20">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: '#e5e7eb', borderTopColor: '#A58D69' }}
          />
        </div>
      ) : (
        <ProgrammeCalendar
          viewMode={viewMode}
          onChangeView={setViewMode}
          viewDate={viewDate}
          onChangeDate={setViewDate}
          canEdit={canEdit}
          onAddEvent={openAdd}
          onAddEventOnDate={openAddOnDate}
          onMoveEvent={handleMoveEvent}
          events={events}
          onClickEvent={canEdit ? openEdit : null}
        />
      )}

      {modal && (
        <EventModal
          mode={modal.mode}
          initialEvent={modal.event}
          defaultAthleteId={athlete.id}
          athleteOptions={[{ id: athlete.id, name: athlete.name }]}
          onSave={handleSave}
          onDelete={modal.mode === 'edit' ? handleDelete : null}
          onClose={close}
        />
      )}

      {/* Toast — bottom-right of the viewport */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 px-4 py-2.5 rounded-lg text-xs font-semibold text-white shadow-lg z-[90]"
          style={{ backgroundColor: '#1C1C1C' }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
