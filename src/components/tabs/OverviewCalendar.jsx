import { useMemo, useState } from 'react';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { usePlannedSessions, plannedSessionsAsEvents } from '../../hooks/usePlannedSessions';
import { computeBirthdayEvents } from '../../utils/birthdayEvents';
import ProgrammeCalendar, {
  _parseDate as parseDate,
  _addDays   as addDays,
  _dayDiff   as dayDiff,
  _toISO     as toISO,
} from '../programming/ProgrammeCalendar';
import EventModal from '../programming/EventModal';

/**
 * OverviewCalendar — month/week calendar inside the Overview tab's
 * "Calendar" sub-tab. Visible for every athlete (Brief Part 2).
 *
 * After Brief Part 4 the Physical Development → Programme tab no longer
 * contains a calendar surface, so this is now the canonical place a
 * coach adds, edits, and reschedules an athlete's calendar events
 * (competitions, training camps, testing days, technical sessions, etc.).
 *
 * Sources:
 *   • athlete_calendar_events (this athlete + team events)
 *   • planned_sessions (this athlete) — gym sessions
 *   • computeBirthdayEvents (this athlete only)
 *
 * Click behaviour:
 *   • Gym session (is_planned)  → onNavigateToProgrammeWeek(dateISO)
 *   • Birthday                  → no-op
 *   • Team event                → opens EventModal in read-only mode
 *   • Other event               → opens editable EventModal
 */
export default function OverviewCalendar({
  athlete,
  role = 'admin',
  onNavigateToProgrammeWeek,
}) {
  const canEdit = role === 'admin' || role === 'co_admin';
  const athleteIds = useMemo(() => [athlete.id], [athlete.id]);

  const {
    events,
    loading: eventsLoading,
    addEvent,
    updateEventOptimistic,
    deleteEventOptimistic,
  } = useCalendarEvents(athleteIds, { includeTeamEvents: true });

  const { planned: plannedRows } = usePlannedSessions(athleteIds);

  const [viewMode, setViewMode] = useState('month');
  const [viewDate, setViewDate] = useState(() => new Date());

  // modal: { mode: 'add' | 'edit', event, readOnly? } | null
  const [modal,    setModal]    = useState(null);
  const [saveErr,  setSaveErr]  = useState(null);
  const [toast,    setToast]    = useState(null);

  const showToast = (msg, kind = 'success') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2200);
  };

  const plannedEvents = useMemo(
    () => plannedSessionsAsEvents(plannedRows),
    [plannedRows],
  );

  // Birthdays for this athlete only.
  const birthdayEvents = useMemo(() => {
    const y = viewDate.getFullYear();
    return computeBirthdayEvents([athlete], new Set([athlete.id]), y - 1, y + 1);
  }, [athlete, viewDate]);

  const allEvents = useMemo(
    () => [...events, ...plannedEvents, ...birthdayEvents],
    [events, plannedEvents, birthdayEvents],
  );

  // ── Click / open handlers ───────────────────────────────────────────────
  const openAdd       = () => { if (!canEdit) return; setSaveErr(null); setModal({ mode: 'add',  event: null }); };
  const openAddOnDate = (iso) => { if (!canEdit) return; setSaveErr(null); setModal({ mode: 'add', event: { start_date: iso } }); };
  const close         = () => { setModal(null); setSaveErr(null); };

  const handleClickEvent = (event) => {
    if (event?.is_planned) {
      onNavigateToProgrammeWeek?.(event.start_date);
      return;
    }
    if (event?.is_birthday) return;
    setSaveErr(null);
    if (event?.is_team_event) {
      // Team events are managed from the Shared Calendar — preview only here.
      setModal({ mode: 'edit', event, readOnly: true });
      return;
    }
    if (!canEdit) {
      setModal({ mode: 'edit', event, readOnly: true });
      return;
    }
    setModal({ mode: 'edit', event });
  };

  // ── Save / delete via EventModal ────────────────────────────────────────
  const handleSave = async (payload) => {
    setSaveErr(null);
    if (modal?.mode === 'edit' && modal.event?.id) {
      const res = await updateEventOptimistic(modal.event.id, payload);
      if (res.ok) close();
      else setSaveErr(res.error?.message || 'Could not save changes.');
    } else {
      const res = await addEvent(payload);
      if (res?.ok) close();
      else setSaveErr(res?.error?.message || 'Could not add event.');
    }
  };

  const handleDelete = async (id) => {
    setSaveErr(null);
    const res = await deleteEventOptimistic(id);
    if (res.ok) close();
    else setSaveErr(res.error?.message || 'Could not delete event.');
  };

  // ── Drag-to-reschedule (preserve duration) ──────────────────────────────
  const handleMoveEvent = async (event, newStartISO) => {
    if (!canEdit) return;
    if (event.is_team_event) {
      showToast('Team events are managed from the Shared Calendar.', 'error');
      return;
    }
    const oldStart = parseDate(event.start_date);
    const oldEnd   = event.end_date ? parseDate(event.end_date) : null;
    const newStart = parseDate(newStartISO);
    const duration = oldEnd ? dayDiff(oldEnd, oldStart) : 0;
    const newEndISO = oldEnd ? toISO(addDays(newStart, duration)) : null;
    const res = await updateEventOptimistic(event.id, {
      start_date: newStartISO,
      end_date: newEndISO,
    });
    if (!res.ok) showToast("Couldn't move event — please try again", 'error');
  };

  if (eventsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: '#e5e7eb', borderTopColor: '#A58D69' }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ProgrammeCalendar
        viewMode={viewMode}
        onChangeView={setViewMode}
        viewDate={viewDate}
        onChangeDate={setViewDate}
        canEdit={canEdit}
        athleteContext
        onAddEvent={openAdd}
        onAddEventOnDate={openAddOnDate}
        onMoveEvent={handleMoveEvent}
        events={allEvents}
        onClickEvent={handleClickEvent}
      />

      {modal && (
        <EventModal
          mode={modal.mode}
          initialEvent={modal.event}
          defaultAthleteId={athlete.id}
          athleteOptions={[{ id: athlete.id, name: athlete.name }]}
          onSave={handleSave}
          onDelete={modal.mode === 'edit' && !modal.readOnly ? handleDelete : null}
          onClose={close}
          saveError={saveErr}
          readOnly={!!modal.readOnly}
          allowTeamEvents={false}
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
