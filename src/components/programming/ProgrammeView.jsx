import { useMemo, useRef, useState } from 'react';
import { useProgrammingSettings } from '../../hooks/useProgrammingSettings';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { useTrainingBlocks } from '../../hooks/useTrainingBlocks';
import { usePlannedSessions, plannedSessionsAsEvents } from '../../hooks/usePlannedSessions';
import { copyPlannedSession } from '../../hooks/usePlannedSessionMutations';
import EventModal from './EventModal';
import BlockList        from './blocks/BlockList';
import BlockModal       from './blocks/BlockModal';
import BlockTimelineBar from './blocks/BlockTimelineBar';
import ConfirmDialog    from './blocks/ConfirmDialog';
import ProgrammeCalendar, {
  _addDays   as addDays,
  _dayDiff   as dayDiff,
  _parseDate as parseDate,
  _toISO     as toISO,
} from './ProgrammeCalendar';
import DayQuickAddMenu from './DayQuickAddMenu';
import PlanSessionModal from './standalone/PlanSessionModal';
import BlockBuilderModal from './programme/builder/BlockBuilderModal';
import { buildBlockColourMap } from '../../utils/blockColours';
import { addDaysISO } from '../../utils/blockHelpers';
import {
  loadAthleteBlock,
  saveAthleteBlock,
  saveBlockTemplate,
} from '../../utils/programmeTemplates';

function mondayOfISO(iso) {
  const d = new Date(iso + 'T00:00:00');
  const offset = (d.getDay() + 6) % 7; // days since Monday
  return addDaysISO(iso, -offset);
}

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

  // Planned training sessions (both block-based and standalone) — fed
  // into the calendar as pills via plannedSessionsAsEvents. `refreshPlanned`
  // is invoked after any mutation that resizes/relocates/adds sessions so
  // the calendar pills don't lag behind the schema.
  const { planned: plannedRows, refresh: refreshPlanned } = usePlannedSessions(athleteIds);
  const plannedEvents = useMemo(() => plannedSessionsAsEvents(plannedRows), [plannedRows]);

  // ── Calendar view state ──────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState(initialFocus?.viewMode || 'month');
  const [viewDate, setViewDate] = useState(() => initialFocus?.viewDate ? new Date(initialFocus.viewDate) : new Date());
  // Re-apply the deep-link every time nonce changes (repeat clicks on the
  // same date from Overview should still jump the calendar back to it).
  const lastFocusNonce = useRef(initialFocus?.nonce);
  if (initialFocus?.nonce !== undefined && initialFocus.nonce !== lastFocusNonce.current) {
    lastFocusNonce.current = initialFocus.nonce;
    if (initialFocus.viewMode) setViewMode(initialFocus.viewMode);
    if (initialFocus.viewDate) setViewDate(new Date(initialFocus.viewDate));
  }

  // ── Copy/paste clipboard for planned sessions ────────────────────────────
  const [clipboard, setClipboard] = useState(null); // { plannedId, name } | null

  // ── Plan-a-session modal (standalone sessions) ───────────────────────────
  // { mode: 'single', dateISO } | { mode: 'week', weekStartISO } | { mode: 'edit', existing }
  const [planModal, setPlanModal] = useState(null);
  const closePlanModal = () => setPlanModal(null);
  const handlePlanSaved = () => { closePlanModal(); refreshPlanned(); };
  const handlePlanDeleted = () => { closePlanModal(); refreshPlanned(); };

  const handlePaste = async (targetISO) => {
    if (!clipboard) return;
    const res = await copyPlannedSession(clipboard.plannedId, targetISO);
    if (!res.ok) {
      showToast(`Couldn't paste. ${res.error?.message || ''}`.trim(), 'error');
      return;
    }
    refreshPlanned();
    showToast(`Pasted '${clipboard.name}'`);
  };

  // ── Modal state ─────────────────────────────────────────────────────────
  // event === null means a fresh add. event === { start_date, ... } may carry
  // a default start_date when adding via the cell hover affordance.
  const [modal, setModal] = useState(null);

  const openAdd       = () => { if (!canEdit) return; setEventSaveError(null); setModal({ mode: 'add',  event: null }); };
  const openEdit      = (event) => {
    setEventSaveError(null);
    // A standalone planned session — open the lightweight edit/delete
    // modal rather than the full block builder (there's no block).
    if (event?.is_planned && event?.is_standalone) {
      if (!canEdit) return;
      setPlanModal({
        mode: 'edit',
        existing: {
          plannedId: event._planned_id,
          standaloneSessionId: event._standalone_session_id,
          name: event.event_name,
          notes: event.notes,
          dateISO: event.start_date,
        },
      });
      return;
    }
    // Block-based planned session pill: open the session builder for
    // that block instead of the event editor.
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

  const handleMoveEvent = async (event, newStartISO) => {
    if (!canEdit || event.is_planned || event.is_team_event) return;
    const oldStart  = parseDate(event.start_date);
    const oldEnd    = event.end_date ? parseDate(event.end_date) : null;
    const newStart  = parseDate(newStartISO);
    const duration  = oldEnd ? dayDiff(oldEnd, oldStart) : 0;
    const newEndISO = oldEnd ? toISO(addDays(newStart, duration)) : null;
    const res = await updateEventOptimistic(event.id, { start_date: newStartISO, end_date: newEndISO });
    if (!res.ok) showToast(`Couldn't reschedule. ${res.error?.message || ''}`.trim(), 'error');
  };

  // ── Block modal state ────────────────────────────────────────────────────
  const [blockModal,     setBlockModal]     = useState(null); // { mode, block }
  const [blockSaveError, setBlockSaveError] = useState(null);
  const [eventSaveError, setEventSaveError] = useState(null);
  const openBlockAdd  = (presetStartDate) => { if (!canEdit) return; setBlockSaveError(null); setBlockModal({ mode: 'add', block: presetStartDate ? { start_date: presetStartDate } : null }); };
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
      refreshPlanned();
      showToast('Block deleted');
    } else {
      showToast(`Couldn't delete block. ${res.error?.message || ''}`.trim(), 'error');
    }
  };

  // Pending week-removal confirmation
  const [removeWeekTarget, setRemoveWeekTarget] = useState(null);

  const handleAddWeek = async (block) => {
    const res = await addWeekToBlock(block.id);
    if (!res.ok) {
      showToast(`Couldn't add week. ${res.error?.message || ''}`.trim(), 'error');
      return;
    }
    // The shift cascade in useTrainingBlocks moves later blocks' planned
    // sessions on the DB side — refetch so the calendar reflects it.
    refreshPlanned();
  };

  const handleConfirmRemoveWeek = async () => {
    const target = removeWeekTarget;
    setRemoveWeekTarget(null);
    if (!target) return;
    const res = await removeLastWeekFromBlock(target.id);
    if (!res.ok) {
      showToast(`Couldn't remove week. ${res.error?.message || ''}`.trim(), 'error');
      return;
    }
    // Dropped-week planned_sessions have been deleted server-side; later
    // blocks shifted. Refetch so the calendar pills disappear immediately.
    refreshPlanned();
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
    if (res.ok) { closeBlock(); refreshPlanned(); }
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
  // Brief Part 3: programming is always-on. The toggle UI has been
  // removed from the rendered tree below; the variable is retained as
  // dead code in case the toggle is ever re-introduced.
  const ToggleCard = null;

  // ── Inactive state ──────────────────────────────────────────────────────
  // Dead branch under the always-on contract — useProgrammingSettings now
  // hard-returns isActive: true. Left in place so a future revert is a
  // one-line hook change rather than a re-add.
  if (!settingsLoading && !isActive) {
    return (
      <div className="space-y-6">
        <div
          className="rounded-xl p-12 text-center"
          style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
        >
          <p className="text-sm" style={{ color: '#6b7280' }}>
            Programming is not active for this athlete.
          </p>
        </div>
      </div>
    );
  }

  // ── Loading state ───────────────────────────────────────────────────────
  if (settingsLoading) {
    return (
      <div className="space-y-6">
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
      {/* Block timeline above the calendar.
          Click block → session builder for that athlete's snapshot.
          Pencil hover-icon on block → block-details modal (name/dates). */}
      <BlockTimelineBar
        blocks={blocks}
        canEdit={canEdit}
        onAdd={() => openBlockAdd()}
        onClickBlock={openBlockBuilder}
        onEditBlockDetails={openBlockEdit}
        onAddWeek={handleAddWeek}
        onRemoveLastWeek={(block) => setRemoveWeekTarget(block)}
        onBlankWeekClick={(weekStartISO) => setPlanModal({ mode: 'week', weekStartISO })}
        showHeading
      />

      {/* Month calendar — sessions (block-based and standalone) plus
          competitions/camps/testing days, all on one grid. Hovering a
          blank day surfaces the quick-add menu (session / week / block);
          hovering an existing session pill surfaces a copy icon so it
          can be pasted onto another day via that same menu. */}
      <ProgrammeCalendar
        viewMode={viewMode}
        onChangeView={setViewMode}
        viewDate={viewDate}
        onChangeDate={setViewDate}
        canEdit={canEdit}
        onAddEvent={openAdd}
        onMoveEvent={handleMoveEvent}
        events={[...events, ...plannedEvents]}
        onClickEvent={openEdit}
        pillColourMode="priority"
        athleteContext
        blocks={blocks}
        blockColourMap={blockColourMap}
        renderDayHover={canEdit ? (iso, helpers) => (
          <DayQuickAddMenu
            dateISO={iso}
            clipboard={clipboard}
            onPlanSession={(d) => setPlanModal({ mode: 'single', dateISO: d })}
            onPlanWeek={(d) => setPlanModal({ mode: 'week', weekStartISO: mondayOfISO(d) })}
            onPlanBlock={(d) => openBlockAdd(d)}
            onPaste={handlePaste}
            keepAlive={helpers.keepAlive}
            release={helpers.release}
          />
        ) : null}
        onCopyPlanned={canEdit ? (event) => setClipboard({ plannedId: event._planned_id, name: event.event_name }) : null}
      />

      {/* Manage Blocks — collapsible secondary list */}
      <BlockList
        blocks={blocks}
        events={events}
        loading={blocksLoading}
        canEdit={canEdit}
        onAdd={() => openBlockAdd()}
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

      {planModal && (
        <PlanSessionModal
          mode={planModal.mode}
          athleteId={athlete.id}
          dateISO={planModal.dateISO}
          weekStartISO={planModal.weekStartISO}
          existing={planModal.existing}
          onSaved={handlePlanSaved}
          onDeleted={handlePlanDeleted}
          onClose={closePlanModal}
        />
      )}

      {/* Copy/paste clipboard indicator — bottom-left so it never
          collides with the toast (bottom-right). Stays active across
          multiple pastes; only clears on Cancel. */}
      {clipboard && (
        <div
          className="fixed bottom-6 left-6 flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-white shadow-lg z-[90]"
          style={{ backgroundColor: '#1C1C1C' }}
        >
          <span>Copied &lsquo;{clipboard.name}&rsquo; — hover a day and choose Paste</span>
          <button onClick={() => setClipboard(null)} className="underline opacity-80 hover:opacity-100">
            Cancel
          </button>
        </div>
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
