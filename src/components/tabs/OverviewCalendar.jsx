import { useMemo, useState } from 'react';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { usePlannedSessions, plannedSessionsAsEvents } from '../../hooks/usePlannedSessions';
import { computeBirthdayEvents } from '../../utils/birthdayEvents';
import ProgrammeCalendar from '../programming/ProgrammeCalendar';
import EventModal from '../programming/EventModal';

/**
 * OverviewCalendar — read-only month/week calendar inside the Overview
 * tab's "Calendar" sub-tab. Visible for every athlete regardless of
 * the programming-active toggle (Brief: Overview tabs + Programme weekly
 * view, Part 2).
 *
 * Sources:
 *   • athlete_calendar_events (this athlete + team events)   — view-only
 *   • planned_sessions (this athlete)                         — gym sessions
 *   • computeBirthdayEvents (this athlete only)               — birthdays
 *
 * Event-type icons (Trophy/Tent/Gauge/Volleyball/CalendarDays) come from
 * ProgrammeCalendar's pill renderer — no extra wiring needed here.
 *
 * Click behaviour:
 *   • Gym session (is_planned)         → onNavigateToProgrammeWeek(dateISO)
 *   • Birthday                         → no-op (read-only)
 *   • Other event                      → opens EventModal in readOnly mode
 */
export default function OverviewCalendar({ athlete, onNavigateToProgrammeWeek }) {
  const athleteIds = useMemo(() => [athlete.id], [athlete.id]);

  const { events, loading: eventsLoading } = useCalendarEvents(athleteIds, {
    includeTeamEvents: true,
  });
  const { planned: plannedRows } = usePlannedSessions(athleteIds);

  const [viewMode, setViewMode] = useState('month');
  const [viewDate, setViewDate] = useState(() => new Date());
  const [readOnlyModal, setReadOnlyModal] = useState(null);

  const plannedEvents = useMemo(
    () => plannedSessionsAsEvents(plannedRows),
    [plannedRows],
  );

  // Birthdays for this athlete only, across the year visible on screen
  // (one year either side covers month-grid edges in Dec/Jan).
  const birthdayEvents = useMemo(() => {
    const y = viewDate.getFullYear();
    return computeBirthdayEvents([athlete], new Set([athlete.id]), y - 1, y + 1);
  }, [athlete, viewDate]);

  const allEvents = useMemo(
    () => [...events, ...plannedEvents, ...birthdayEvents],
    [events, plannedEvents, birthdayEvents],
  );

  const handleClickEvent = (event) => {
    if (event?.is_planned) {
      onNavigateToProgrammeWeek?.(event.start_date);
      return;
    }
    if (event?.is_birthday) return;
    // Plain stored events open as a read-only preview; coaches edit
    // these from the Physical Development → Programme tab.
    setReadOnlyModal(event);
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
        canEdit={false}
        athleteContext
        events={allEvents}
        onClickEvent={handleClickEvent}
      />

      {readOnlyModal && (
        <EventModal
          mode="edit"
          initialEvent={readOnlyModal}
          defaultAthleteId={athlete.id}
          athleteOptions={[{ id: athlete.id, name: athlete.name }]}
          onSave={() => {}}
          onDelete={null}
          onClose={() => setReadOnlyModal(null)}
          readOnly
          allowTeamEvents={false}
        />
      )}
    </div>
  );
}
