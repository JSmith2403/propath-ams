import { useEffect, useMemo, useRef, useState } from 'react';
import { useActiveProgrammingAthletes } from '../../hooks/useActiveProgrammingAthletes';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import AthleteSidebar from './AthleteSidebar';
import ProgrammeCalendar, {
  _parseDate as parseDate,
  _addDays   as addDays,
  _dayDiff   as dayDiff,
  _toISO     as toISO,
  _formatToastDate as formatToastDate,
} from './ProgrammeCalendar';
import EventModal from './EventModal';

/**
 * ProgrammeMasterView (Surface 2) — top-level "Programme" page.
 *
 * Shows events across every programming-active athlete in a single
 * calendar. Pills are coloured by athlete (deterministic palette) so
 * coaches can spot competition clusters and overlaps. Competition pills
 * carry a small priority badge at the right end (A = Gold, B = Navy,
 * C = Teal — matches Surface 1 priority colour scheme).
 *
 * The per-athlete calendar inside the profile (Surface 1) remains the
 * primary editing surface — but add / edit / delete / reschedule all
 * work here too via the shared modal and the optimistic hook.
 */
export default function ProgrammeMasterView({ allAthletes = [], role = 'admin' }) {
  const canEdit = role === 'admin' || role === 'co_admin';

  // Programmable athlete set
  const { activeIds, loading: idsLoading } = useActiveProgrammingAthletes();

  // Fetch events for ALL programmable athletes; the sidebar then filters
  // them visually via selectedIds. Refetching only happens when the set
  // of active athletes itself changes.
  const allActiveIdArr = useMemo(() => Array.from(activeIds).sort(), [activeIds]);
  const {
    events: allEvents,
    loading: eventsLoading,
    addEvent,
    updateEventOptimistic,
    deleteEventOptimistic,
  } = useCalendarEvents(allActiveIdArr);

  // Sidebar selection — default: all programmable athletes selected on
  // first entry. Subsequent toggles are user-controlled.
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const initialisedRef = useRef(false);
  useEffect(() => {
    if (initialisedRef.current) return;
    if (activeIds.size > 0) {
      setSelectedIds(new Set(activeIds));
      initialisedRef.current = true;
    }
  }, [activeIds]);

  // Filter events to selected athletes
  const events = useMemo(
    () => allEvents.filter(e => selectedIds.has(e.athlete_id)),
    [allEvents, selectedIds],
  );

  // Calendar nav state
  const [viewMode, setViewMode] = useState('month');
  const [viewDate, setViewDate] = useState(() => new Date());

  // Sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Modal state
  const [modal, setModal] = useState(null);
  const openAdd       = () => canEdit && setModal({ mode: 'add',  event: null });
  const openAddOnDate = (iso) => canEdit && setModal({ mode: 'add', event: { start_date: iso } });
  const openEdit      = (event) => canEdit && setModal({ mode: 'edit', event });
  const close         = () => setModal(null);

  // Toast state
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (msg, kind = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, kind });
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  // ── Save / Delete / Move handlers (optimistic via useCalendarEvents) ──
  const handleSave = async (payload) => {
    if (modal?.mode === 'edit' && modal.event?.id) {
      const id = modal.event.id;
      close();
      const res = await updateEventOptimistic(id, payload);
      if (!res.ok) showToast("Couldn't save changes — please try again", 'error');
    } else {
      await addEvent(payload);
      close();
    }
  };

  const handleDelete = async (id) => {
    close();
    const res = await deleteEventOptimistic(id);
    if (!res.ok) showToast("Couldn't delete event — please try again", 'error');
  };

  const handleMoveEvent = async (event, newStartISO) => {
    if (!canEdit) return;
    const oldStart  = parseDate(event.start_date);
    const oldEnd    = event.end_date ? parseDate(event.end_date) : null;
    const newStart  = parseDate(newStartISO);
    const duration  = oldEnd ? dayDiff(oldEnd, oldStart) : 0;
    const newEndISO = oldEnd ? toISO(addDays(newStart, duration)) : null;

    const res = await updateEventOptimistic(event.id, {
      start_date: newStartISO,
      end_date: newEndISO,
    });
    if (res.ok) {
      showToast(`Event moved to ${formatToastDate(newStartISO)}`);
    } else {
      showToast("Couldn't move event — please try again", 'error');
    }
  };

  // Athlete dropdown options for the modal — full programmable roster
  const athleteOptions = useMemo(
    () => allAthletes
      .filter(a => activeIds.has(a.id))
      .map(a => ({ id: a.id, name: a.name }))
      .sort((x, y) => x.name.localeCompare(y.name)),
    [allAthletes, activeIds],
  );

  // ── Loading / empty states ────────────────────────────────────────────
  if (idsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: '#e5e7eb', borderTopColor: '#A58D69' }}
        />
      </div>
    );
  }

  if (activeIds.size === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          <Header />
          <div
            className="rounded-xl p-12 text-center"
            style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
          >
            <h3 className="text-base font-semibold mb-2" style={{ color: '#1C1C1C' }}>
              No programmable athletes yet
            </h3>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              Activate programming on an athlete's profile (Physical Development &gt; Programme) to see them here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Active state ──────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-8 py-6">
        <Header />

        <div className="flex gap-4 items-start">
          <AthleteSidebar
            athletes={allAthletes}
            activeIds={activeIds}
            currentAthleteId={null}
            selectedIds={selectedIds}
            onChangeSelected={setSelectedIds}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(c => !c)}
          />

          <div className="flex-1 min-w-0">
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
                pillColourMode="athlete"
              />
            )}
          </div>
        </div>
      </div>

      {modal && (
        <EventModal
          mode={modal.mode}
          initialEvent={modal.event}
          defaultAthleteId={null}
          athleteOptions={athleteOptions}
          onSave={handleSave}
          onDelete={modal.mode === 'edit' ? handleDelete : null}
          onClose={close}
        />
      )}

      {toast && (
        <div
          className="fixed bottom-6 right-6 px-4 py-2.5 rounded-lg text-xs font-semibold text-white shadow-lg z-[90]"
          style={{ backgroundColor: toast.kind === 'error' ? '#dc2626' : '#1C1C1C' }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function Header() {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold" style={{ color: '#1C1C1C' }}>
        Programme Calendar
      </h2>
      <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
        Cross-athlete overview. Pills are coloured by athlete; competition priority is shown as an A / B / C badge.
      </p>
    </div>
  );
}
