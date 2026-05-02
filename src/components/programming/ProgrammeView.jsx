import { useEffect, useMemo, useRef, useState } from 'react';
import { useProgrammingSettings } from '../../hooks/useProgrammingSettings';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { useTrainingBlocks } from '../../hooks/useTrainingBlocks';
import { usePlannedSessions, plannedSessionsAsEvents } from '../../hooks/usePlannedSessions';
import ProgrammeCalendar, {
  _parseDate as parseDate,
  _addDays   as addDays,
  _dayDiff   as dayDiff,
  _toISO     as toISO,
  _formatToastDate as formatToastDate,
} from './ProgrammeCalendar';
import EventModal from './EventModal';
import BlockList        from './blocks/BlockList';
import BlockModal       from './blocks/BlockModal';
import BlockTimelineBar from './blocks/BlockTimelineBar';
import ConfirmDialog    from './blocks/ConfirmDialog';
import AthleteWeekView  from './AthleteWeekView';
import BlockBuilderModal from './programme/builder/BlockBuilderModal';
import { buildBlockColourMap } from '../../utils/blockColours';
import {
  loadAthleteBlock,
  saveAthleteBlock,
  saveBlockTemplate,
} from '../../utils/programmeTemplates';

// Combine a fallback message with the supabase error so the user gets
// real diagnostic info inline in the modal.
function formatError(err, fallback) {
  if (!err) return fallback;
  const detail = err.message || (typeof err === 'string' ? err : '');
  return detail ? `${fallback} ${detail}` : fallback;
}

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
  // Optional one-shot deep-link from Overview → Calendar (gym session click).
  // Shape: { viewMode, viewDate, nonce } | null. Re-applied whenever `nonce`
  // changes so successive clicks on the same session still re-focus.
  initialFocus = null,
}) {
  const canEdit = role === 'admin' || role === 'co_admin';

  // ── Toggle state ────────────────────────────────────────────────────────
  const { isActive, loading: settingsLoading, setActive } = useProgrammingSettings(athlete.id);

  // ── Events state (only fetched while active) ────────────────────────────
  const athleteIds = useMemo(() => (isActive ? [athlete.id] : []), [isActive, athlete.id]);
  const {
    events,
    loading: eventsLoading,
    addEvent,
    updateEvent,
    updateEventOptimistic,
    deleteEventOptimistic,
  } = useCalendarEvents(athleteIds, { includeTeamEvents: true });

  // Training blocks for this athlete (Surface 1 only fetches its own
  // athlete's blocks). Same dependency on `isActive` as events so the
  // hook idles while programming is off.
  const {
    blocks,
    loading: blocksLoading,
    addBlock,
    updateBlockOptimistic,
    deleteBlockOptimistic,
    addWeekToBlock,
    removeLastWeekFromBlock,
  } = useTrainingBlocks(athleteIds);

  // Brief 5d/5e — planned training sessions, surfaced as outlined teal
  // pills on the calendar. Always shown on the per-athlete view (no
  // filter panel here; coach explicitly opted into this athlete).
  const { planned: plannedRows } = usePlannedSessions(athleteIds);
  const plannedEvents = useMemo(() => plannedSessionsAsEvents(plannedRows), [plannedRows]);

  // ── Calendar nav state ──────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState(initialFocus?.viewMode || 'month');
  const [viewDate, setViewDate] = useState(() => initialFocus?.viewDate || new Date());

  // Re-apply deep-link focus on every nonce bump. Without the nonce a
  // second click on the same date wouldn't re-trigger the effect.
  useEffect(() => {
    if (!initialFocus?.nonce) return;
    if (initialFocus.viewMode) setViewMode(initialFocus.viewMode);
    if (initialFocus.viewDate) setViewDate(initialFocus.viewDate);
  }, [initialFocus?.nonce]);  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Modal state ─────────────────────────────────────────────────────────
  // event === null means a fresh add. event === { start_date, ... } may carry
  // a default start_date when adding via the cell hover affordance.
  const [modal, setModal] = useState(null);

  const openAdd       = () => { if (!canEdit) return; setEventSaveError(null); setModal({ mode: 'add',  event: null }); };
  const openAddOnDate = (iso) => { if (!canEdit) return; setEventSaveError(null); setModal({ mode: 'add', event: { start_date: iso } }); };
  const openEdit      = (event) => {
    setEventSaveError(null);
    // Brief 5d/5e — planned session pill: open the session builder
    // for that block instead of the event editor.
    if (event?.is_planned) {
      const target = blocks.find(b => b.id === event._block_id);
      if (target) openBlockBuilder(target);
      return;
    }
    // Brief 5a — team events on a per-athlete calendar are always
    // read-only here. Edits happen on the Shared Calendar surface.
    if (event?.is_team_event) {
      setModal({ mode: 'edit', event, readOnly: true });
      return;
    }
    if (!canEdit) return;
    setModal({ mode: 'edit', event });
  };
  const close         = () => { setModal(null); setEventSaveError(null); };

  // ── Block modal state ────────────────────────────────────────────────────
  const [blockModal,     setBlockModal]     = useState(null); // { mode, block }
  const [blockSaveError, setBlockSaveError] = useState(null);
  const [eventSaveError, setEventSaveError] = useState(null);
  const openBlockAdd  = () => { if (!canEdit) return; setBlockSaveError(null); setBlockModal({ mode: 'add', block: null }); };
  const openBlockEdit = (block) => { if (!canEdit) return; setBlockSaveError(null); setBlockModal({ mode: 'edit', block }); };
  const closeBlock    = () => { setBlockModal(null); setBlockSaveError(null); };

  // ── Athlete block builder state (Brief 5a) ──────────────────────────────
  // builderState = null | { loading: true, blockId, focusSessionTempId? }
  //              | { draft, blockId, focusSessionTempId? }
  const [builderState,   setBuilderState]   = useState(null);
  const [builderError,   setBuilderError]   = useState(null);
  const [confirmDelete,  setConfirmDelete]  = useState(null); // block from builder

  const openBlockBuilder = async (block, opts = {}) => {
    setBuilderError(null);
    setBuilderState({ loading: true, blockId: block.id, focusSessionTempId: opts.focusSessionTempId });
    const res = await loadAthleteBlock(block.id);
    if (res.ok) {
      setBuilderState({ loading: false, blockId: block.id, draft: res.draft, focusSessionTempId: opts.focusSessionTempId });
    } else {
      setBuilderState(null);
      showToast(`Couldn't open block. ${res.error?.message || ''}`.trim(), 'error');
    }
  };
  const closeBuilder = () => setBuilderState(null);

  const handleBuilderSave = async (draft) => {
    if (!builderState?.blockId) return { ok: false, error: new Error('Missing block id') };
    const res = await saveAthleteBlock(builderState.blockId, draft);
    if (res.ok) showToast('Block saved');
    return res;
  };

  const handleSaveAsTemplate = async (draft) => {
    const name = window.prompt('Save as new template — name?', draft.block.name || '');
    if (!name || !name.trim()) return { ok: false, error: new Error('Cancelled') };
    const res = await saveBlockTemplate({ ...draft, block: { ...draft.block, name: name.trim() } });
    if (res.ok) showToast('Saved as template');
    else        showToast(`Couldn't save template. ${res.error?.message || ''}`.trim(), 'error');
    return res;
  };

  const handleBuilderEditDetails = () => {
    if (!builderState?.blockId) return;
    const block = blocks.find(b => b.id === builderState.blockId);
    if (block) openBlockEdit(block);
  };

  const handleBuilderDeleteRequest = () => {
    if (!builderState?.blockId) return;
    const block = blocks.find(b => b.id === builderState.blockId);
    if (block) setConfirmDelete(block);
  };

  const handleBuilderDeleteConfirm = async () => {
    const target = confirmDelete;
    setConfirmDelete(null);
    if (!target) return;
    const res = await deleteBlockOptimistic(target.id);
    if (res.ok) {
      closeBuilder();
      showToast('Block deleted');
    } else {
      showToast(`Couldn't delete block. ${res.error?.message || ''}`.trim(), 'error');
    }
  };

  // Hovered range from the timeline (block-bar hover OR week-pill hover)
  // both pipe through here so the calendar paints the right tint.
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

  // Block colour map — shared between the timeline bar and the calendar
  // bottom-marker so colours always agree.
  const blockColourMap = useMemo(() => buildBlockColourMap(blocks), [blocks]);

  // ── Toast state (shown after a successful drag-and-drop reschedule) ─────
  const [toast, setToast] = useState(null); // { msg, kind }
  const toastTimer = useRef(null);
  const showToast = (msg, kind = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, kind });
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  // ── Drag reschedule handler — optimistic, preserves duration ────────────
  // The pill repositions instantly; the network update fires silently.
  // On failure we revert and show an error toast.
  // ── Block save / delete ─────────────────────────────────────────────────
  const handleBlockSave = async (payload) => {
    setBlockSaveError(null);
    if (blockModal?.mode === 'edit' && blockModal.block?.id) {
      const id = blockModal.block.id;
      const res = await updateBlockOptimistic(id, payload);
      if (res.ok) closeBlock();
      else setBlockSaveError(formatError(res.error, "Couldn't save block."));
    } else {
      const res = await addBlock(payload);
      if (res?.ok) closeBlock();
      else setBlockSaveError(formatError(res?.error, "Couldn't add block."));
    }
  };

  const handleBlockDelete = async (block) => {
    setBlockSaveError(null);
    const res = await deleteBlockOptimistic(block.id);
    if (res.ok) closeBlock();
    else setBlockSaveError(formatError(res.error, "Couldn't delete block."));
  };

  // Build target-event options for the block modal. Per Brief 3 #5:
  // - new block: competitions only, on/after the proposed start
  // - edit mode: all competitions for this athlete (past included)
  const blockModalEventOptions = useMemo(() => {
    if (!blockModal) return [];
    const competitions = events.filter(e => e.event_type === 'competition');
    if (blockModal.mode === 'edit') return competitions;
    const startCutoff = blockModal.block?.start_date;
    if (!startCutoff) return competitions;
    return competitions.filter(e => e.start_date >= startCutoff);
  }, [blockModal, events]);

  const handleMoveEvent = async (event, newStartISO) => {
    if (!canEdit) return;
    // Team events can't be rescheduled from a per-athlete calendar.
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
    if (res.ok) {
      showToast(`Event moved to ${formatToastDate(newStartISO)}`);
    } else {
      showToast("Couldn't move event — please try again", 'error');
    }
  };

  const handleSave = async (payload) => {
    setEventSaveError(null);
    if (modal?.mode === 'edit' && modal.event?.id) {
      // Optimistic edit — apply locally, fire network. Modal stays open
      // until we know the result; on success it closes, on failure the
      // local state reverts and an inline error appears.
      const id = modal.event.id;
      const res = await updateEventOptimistic(id, payload);
      if (res.ok) close();
      else setEventSaveError(formatError(res.error, "Couldn't save changes."));
    } else {
      // New event — pessimistic (needs DB-assigned id).
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

      {/* Block timeline above the calendar.
          Click block → session builder for that athlete's snapshot.
          Pencil hover-icon on block → block-details modal (name/dates). */}
      <BlockTimelineBar
        blocks={blocks}
        canEdit={canEdit}
        onAdd={openBlockAdd}
        onClickBlock={openBlockBuilder}
        onEditBlockDetails={openBlockEdit}
        onHoverRange={setHighlightRange}
        onAddWeek={handleAddWeek}
        onRemoveLastWeek={(block) => setRemoveWeekTarget(block)}
        showHeading
      />

      {eventsLoading ? (
        <div className="flex items-center justify-center py-20">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: '#e5e7eb', borderTopColor: '#A58D69' }}
          />
        </div>
      ) : viewMode === 'week' ? (
        <AthleteWeekView
          athlete={athlete}
          viewDate={viewDate}
          onChangeDate={setViewDate}
          onChangeView={setViewMode}
          onClickPlanned={(planned) => {
            const target = blocks.find(b => b.id === planned.block_id);
            if (!target) return;
            // Open the builder focused on this specific session — all
            // other sessions in the block start collapsed so the coach
            // lands on what they clicked.
            openBlockBuilder(target, { focusSessionTempId: `sess-${planned.block_session_id}` });
          }}
        />
      ) : (
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
          events={[...events, ...plannedEvents]}
          onClickEvent={openEdit}
          highlightRange={highlightRange}
          blocks={blocks}
          blockColourMap={blockColourMap}
        />
      )}

      {/* Manage Blocks — collapsible secondary list */}
      <BlockList
        blocks={blocks}
        events={events}
        loading={blocksLoading}
        canEdit={canEdit}
        onAdd={openBlockAdd}
        onEdit={openBlockEdit}
        onDelete={handleBlockDelete}
        onClickLinkedEvent={openEdit}
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
          saveError={eventSaveError}
          readOnly={!!modal.readOnly}
          allowTeamEvents={false}
        />
      )}

      {blockModal && (
        <BlockModal
          mode={blockModal.mode}
          initialBlock={blockModal.block}
          athleteId={athlete.id}
          athleteName={athlete.name}
          existingBlocks={blocks}
          targetEventOptions={blockModalEventOptions}
          onSave={handleBlockSave}
          onDelete={blockModal.mode === 'edit' ? () => handleBlockDelete(blockModal.block) : null}
          onClose={closeBlock}
          saveError={blockSaveError}
        />
      )}

      {builderState?.draft && (
        <BlockBuilderModal
          initialDraft={builderState.draft}
          parentLocked
          athleteMode
          contextSubtitle={athlete.name}
          focusSessionTempId={builderState.focusSessionTempId}
          onSave={handleBuilderSave}
          onClose={closeBuilder}
          onEditDetails={canEdit ? handleBuilderEditDetails : null}
          onSaveAsTemplate={canEdit ? handleSaveAsTemplate : null}
          onDeleteBlock={canEdit ? handleBuilderDeleteRequest : null}
        />
      )}
      {builderState?.loading && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="bg-white rounded-lg px-5 py-3 text-xs" style={{ color: '#6b7280' }}>
            Loading block…
          </div>
        </div>
      )}
      {builderError && (
        <div className="fixed bottom-6 right-6 px-4 py-2.5 rounded-lg text-xs font-semibold text-white shadow-lg z-[90]" style={{ backgroundColor: '#dc2626' }}>
          {builderError}
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete block?"
          body={`"${confirmDelete.block_name}" and all of its sessions will be permanently removed for ${athlete.name}.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleBuilderDeleteConfirm}
          onCancel={() => setConfirmDelete(null)}
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

      {/* Toast — bottom-right of the viewport */}
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
