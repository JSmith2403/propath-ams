import { useEffect, useMemo, useRef, useState } from 'react';
import { Cake, X } from 'lucide-react';
import { useActiveProgrammingAthletes } from '../../hooks/useActiveProgrammingAthletes';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { useTrainingBlocks } from '../../hooks/useTrainingBlocks';
import { useCalendarFilters, eventPassesFilters } from '../../hooks/useCalendarFilters';
import { usePlannedSessions, plannedSessionsAsEvents } from '../../hooks/usePlannedSessions';
import { computeBirthdayEvents, ageOnDate } from '../../utils/birthdayEvents';
import AthleteSidebar from './AthleteSidebar';
import CalendarFilterPanel from './CalendarFilterPanel';
import ProgrammeCalendar, {
  _parseDate as parseDate,
  _addDays   as addDays,
  _dayDiff   as dayDiff,
  _toISO     as toISO,
  _formatToastDate as formatToastDate,
} from './ProgrammeCalendar';
import EventModal from './EventModal';
import BlockModal from './blocks/BlockModal';
import BlockTimelineBar from './blocks/BlockTimelineBar';
import ConfirmDialog    from './blocks/ConfirmDialog';
import { colourForAthlete, tintForColour } from '../../utils/programmingColours';
import { buildBlockColourMap } from '../../utils/blockColours';

function formatError(err, fallback) {
  if (!err) return fallback;
  const detail = err.message || (typeof err === 'string' ? err : '');
  return detail ? `${fallback} ${detail}` : fallback;
}

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
export default function ProgrammeMasterView({ allAthletes = [], role = 'admin', onSelectAthlete }) {
  const canEdit = role === 'admin' || role === 'co_admin';
  // Brief 5a: only admins can create / edit / delete team events.
  const canEditTeamEvents = role === 'admin';

  // Brief 5a Part D — Calendar filters (localStorage-backed).
  const { filters, setFilter } = useCalendarFilters();

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
  } = useCalendarEvents(allActiveIdArr, { includeTeamEvents: true });

  // Training blocks for the same set; filtered visually by sidebar selection.
  const {
    blocks: allBlocks,
    updateBlockOptimistic,
    deleteBlockOptimistic,
    addWeekToBlock,
    removeLastWeekFromBlock,
  } = useTrainingBlocks(allActiveIdArr);

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

  // Filter events to selected athletes. Team events always show on the
  // Shared Calendar regardless of athlete-filter selection — they're not
  // attributable to any single athlete. Then apply the user's filter
  // toggles (Part D). Birthdays are computed below and injected after
  // filtering since they have their own visibility toggle.
  const filteredEvents = useMemo(() => {
    return allEvents
      .filter(e => e.is_team_event || selectedIds.has(e.athlete_id))
      .filter(e => eventPassesFilters(e, filters));
  }, [allEvents, selectedIds, filters]);

  // Brief 5d/5e — planned sessions across all selected athletes,
  // gated by the "Planned training sessions" toggle (default off on
  // Shared Calendar to keep the grid clean).
  const { planned: plannedRows } = usePlannedSessions(allActiveIdArr);
  const plannedEvents = useMemo(() => {
    if (!filters.planned) return [];
    return plannedSessionsAsEvents(plannedRows)
      .filter(p => selectedIds.has(p.athlete_id));
  }, [plannedRows, filters.planned, selectedIds]);

  // Filter blocks to selected athletes (matches the events pattern)
  const blocks = useMemo(
    () => allBlocks.filter(b => selectedIds.has(b.athlete_id)),
    [allBlocks, selectedIds],
  );

  // Calendar nav state
  const [viewMode, setViewMode] = useState('month');
  const [viewDate, setViewDate] = useState(() => new Date());

  // Brief 5a Part D — birthday events. Computed at render time from
  // athletes.dob; never persisted. ±2 years around the visible date so
  // the user can navigate without re-computation, throttled by the
  // filters.birthdays toggle. Planned sessions appended last.
  const events = useMemo(() => {
    const out = [...filteredEvents];
    if (filters.birthdays) {
      const centre = viewDate.getFullYear();
      const birthdays = computeBirthdayEvents(allAthletes, activeIds, centre - 2, centre + 2);
      const visible = birthdays.filter(b => selectedIds.has(b.athlete_id));
      out.push(...visible);
    }
    out.push(...plannedEvents);
    return out;
  }, [filteredEvents, viewDate, allAthletes, activeIds, selectedIds, filters.birthdays, plannedEvents]);

  // Sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Event modal state
  const [modal,          setModal]          = useState(null);
  const [eventSaveError, setEventSaveError] = useState(null);
  const openAdd       = () => { if (!canEdit) return; setEventSaveError(null); setModal({ mode: 'add',  event: null }); };
  const openAddOnDate = (iso) => { if (!canEdit) return; setEventSaveError(null); setModal({ mode: 'add', event: { start_date: iso } }); };
  const openEdit      = (event) => {
    // Birthday "events" are synthetic — open the popover, never the editor.
    if (event?.is_birthday) { setBirthdayPopover(event); return; }
    // Planned sessions on Shared Calendar — bounce to that athlete's
    // profile so the coach can drill into the block from there.
    if (event?.is_planned) {
      if (onSelectAthlete && event.athlete_id) onSelectAthlete(event.athlete_id);
      return;
    }
    if (!canEdit && !event?.is_team_event) return;
    setEventSaveError(null);
    // co_admin sees team events read-only; admin can edit.
    const readOnly = event?.is_team_event && !canEditTeamEvents;
    setModal({ mode: 'edit', event, readOnly });
  };
  const close         = () => { setModal(null); setEventSaveError(null); };

  // Birthday popover state (Part D)
  const [birthdayPopover, setBirthdayPopover] = useState(null);

  // Block modal state — Surface 2 only opens in edit mode (no Add list here)
  const [blockModal,     setBlockModal]     = useState(null);
  const [blockSaveError, setBlockSaveError] = useState(null);
  const openBlockEdit = (block) => { if (!canEdit) return; setBlockSaveError(null); setBlockModal({ mode: 'edit', block }); };
  const closeBlock    = () => { setBlockModal(null); setBlockSaveError(null); };

  // Hover range from the timeline (block bar OR week pill)
  const [highlightRange, setHighlightRange] = useState(null);

  // Pending week-removal confirmation
  const [removeWeekTarget, setRemoveWeekTarget] = useState(null);

  const handleAddWeek = async (block) => {
    const res = await addWeekToBlock(block.id);
    if (!res.ok) showToast(`Couldn't add week. ${res.error?.message || ''}`.trim(), 'error');
  };

  const handleConfirmRemoveWeek = async () => {
    const target = removeWeekTarget;
    setRemoveWeekTarget(null);
    if (!target) return;
    const res = await removeLastWeekFromBlock(target.id);
    if (!res.ok) showToast(`Couldn't remove week. ${res.error?.message || ''}`.trim(), 'error');
  };

  // Block colour map across all visible blocks (grouped by athlete inside).
  const blockColourMap = useMemo(() => buildBlockColourMap(blocks), [blocks]);

  // Per-athlete timeline rows — sorted by name, only includes selected
  // athletes that actually have programmable activation.
  // Only render a timeline row for athletes who actually have at least
  // one block — empty rows cluttered the Shared Calendar view, and the
  // sidebar already lists every selected athlete.
  const timelineRows = useMemo(() => {
    return allAthletes
      .filter(a => activeIds.has(a.id) && selectedIds.has(a.id))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(a => ({
        athlete: a,
        blocks: blocks.filter(b => b.athlete_id === a.id),
        colour: colourForAthlete(a.id),
      }))
      .filter(row => row.blocks.length > 0);
  }, [allAthletes, activeIds, selectedIds, blocks]);

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
    setEventSaveError(null);
    if (modal?.mode === 'edit' && modal.event?.id) {
      const id = modal.event.id;
      const res = await updateEventOptimistic(id, payload);
      if (res.ok) close();
      else setEventSaveError(formatError(res.error, "Couldn't save changes."));
    } else {
      const res = await addEvent(payload);
      if (res?.ok) close();
      else setEventSaveError(formatError(res?.error, "Couldn't add event."));
    }
  };

  const handleDelete = async (id) => {
    setEventSaveError(null);
    const res = await deleteEventOptimistic(id);
    if (res.ok) close();
    else setEventSaveError(formatError(res.error, "Couldn't delete event."));
  };

  // Block save / delete (edit only on Surface 2)
  const handleBlockSave = async (payload) => {
    setBlockSaveError(null);
    if (blockModal?.mode === 'edit' && blockModal.block?.id) {
      const id = blockModal.block.id;
      const res = await updateBlockOptimistic(id, payload);
      if (res.ok) closeBlock();
      else setBlockSaveError(formatError(res.error, "Couldn't save block."));
    }
  };

  const handleBlockDelete = async (block) => {
    setBlockSaveError(null);
    const res = await deleteBlockOptimistic(block.id);
    if (res.ok) closeBlock();
    else setBlockSaveError(formatError(res.error, "Couldn't delete block."));
  };

  // Per Brief 3 #5: edit mode shows ALL competition events for the block's
  // athlete (past and future).
  const blockModalEventOptions = useMemo(() => {
    if (!blockModal?.block) return [];
    const athleteId = blockModal.block.athlete_id;
    return allEvents.filter(e => e.event_type === 'competition' && e.athlete_id === athleteId);
  }, [blockModal, allEvents]);

  // Existing blocks for the same athlete (overlap validation)
  const blockModalExistingBlocks = useMemo(() => {
    if (!blockModal?.block) return [];
    return allBlocks.filter(b => b.athlete_id === blockModal.block.athlete_id);
  }, [blockModal, allBlocks]);

  const blockModalAthleteName = useMemo(() => {
    if (!blockModal?.block) return '';
    const a = allAthletes.find(x => x.id === blockModal.block.athlete_id);
    return a?.name || '';
  }, [blockModal, allAthletes]);

  const handleMoveEvent = async (event, newStartISO) => {
    if (!canEdit) return;
    // Birthdays are synthetic — can't be rescheduled.
    if (event.is_birthday) return;
    // Co_admin can move athlete events but not team events.
    if (event.is_team_event && !canEditTeamEvents) {
      showToast('Only admins can reschedule team events.', 'error');
      return;
    }
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
          {/* Left column — calendar filter panel + athlete sidebar.
              Mobile stacks them vertically via the sidebar's own
              responsive behaviour; desktop keeps both at the same
              left-column width. */}
          <div className="flex flex-col gap-3" style={{ width: sidebarCollapsed ? 'auto' : 220 }}>
            {!sidebarCollapsed && (
              <CalendarFilterPanel filters={filters} onChange={setFilter} />
            )}
            <AthleteSidebar
              athletes={allAthletes}
              activeIds={activeIds}
              currentAthleteId={null}
              selectedIds={selectedIds}
              onChangeSelected={setSelectedIds}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(c => !c)}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {/* Per-athlete timeline rows */}
            {timelineRows.length > 0 && (
              <section className="space-y-1.5">
                <h3
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: '#9ca3af' }}
                >
                  Block Timeline
                </h3>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {timelineRows.map(row => (
                    <BlockTimelineBar
                      key={row.athlete.id}
                      blocks={row.blocks}
                      canEdit={canEdit}
                      onAdd={null /* Surface 2: no add */}
                      onClickBlock={openBlockEdit}
                      onHoverRange={setHighlightRange}
                      onAddWeek={handleAddWeek}
                      onRemoveLastWeek={(block) => setRemoveWeekTarget(block)}
                      rowLabel={row.athlete.name}
                      rowBackground={tintForColour(row.colour, 0.10)}
                    />
                  ))}
                </div>
              </section>
            )}

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
                onClickEvent={openEdit}
                pillColourMode="athlete"
                highlightRange={highlightRange}
                blocks={blocks}
                blockColourMap={blockColourMap}
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
          saveError={eventSaveError}
          readOnly={!!modal.readOnly}
          allowTeamEvents={canEditTeamEvents}
        />
      )}

      {blockModal && (
        <BlockModal
          mode={blockModal.mode}
          initialBlock={blockModal.block}
          athleteId={blockModal.block?.athlete_id}
          athleteName={blockModalAthleteName}
          existingBlocks={blockModalExistingBlocks}
          targetEventOptions={blockModalEventOptions}
          onSave={handleBlockSave}
          onDelete={blockModal.mode === 'edit' ? () => handleBlockDelete(blockModal.block) : null}
          onClose={closeBlock}
          saveError={blockSaveError}
        />
      )}

      {removeWeekTarget && (
        <ConfirmDialog
          title="Remove last week"
          body={
            <>
              Remove the last week of <strong>{removeWeekTarget.block_name}</strong>?
              {'\n\n'}This shortens the block from {removeWeekTarget.duration_weeks} weeks to {removeWeekTarget.duration_weeks - 1} weeks.
              Subsequent blocks shift 7 days earlier.
            </>
          }
          confirmLabel="Remove week"
          danger
          onConfirm={handleConfirmRemoveWeek}
          onCancel={() => setRemoveWeekTarget(null)}
        />
      )}

      {birthdayPopover && (
        <BirthdayPreview
          event={birthdayPopover}
          onOpenProfile={onSelectAthlete ? () => {
            const id = birthdayPopover._athleteId;
            setBirthdayPopover(null);
            onSelectAthlete(id);
          } : null}
          onClose={() => setBirthdayPopover(null)}
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

// ─── BirthdayPreview ────────────────────────────────────────────────────
// Tiny modal-card for a birthday pill click. Shows athlete name, the
// age they will turn on this date (or just turned), and an optional
// "Open profile" affordance if the parent supplied a navigation
// callback. Read-only by design.
function BirthdayPreview({ event, onOpenProfile, onClose }) {
  const age = ageOnDate(event._dob, event.start_date);
  const turning = age != null ? age + 1 : null; // age the athlete turns ON the birthday

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Cake size={16} style={{ color: '#A58D69' }} />
            <h3 className="text-sm font-bold" style={{ color: '#1C1C1C' }}>Birthday</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-400">
            <X size={14} />
          </button>
        </div>
        <div className="px-4 py-4">
          <p className="text-base font-semibold" style={{ color: '#1C1C1C' }}>
            {event._athleteName}
          </p>
          {turning != null && (
            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
              Turning {turning} on {new Date(event.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
            </p>
          )}
        </div>
        {onOpenProfile && (
          <div className="px-4 py-3 border-t border-gray-100 flex justify-end">
            <button
              onClick={onOpenProfile}
              className="px-3 py-1.5 text-xs font-semibold text-white rounded transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#A58D69' }}
            >
              Open profile
            </button>
          </div>
        )}
      </div>
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
