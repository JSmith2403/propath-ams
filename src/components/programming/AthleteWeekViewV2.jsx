import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext, DragOverlay, PointerSensor, TouchSensor,
  useDraggable, useDroppable, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  ArrowLeftRight, CheckSquare, ChevronLeft, ChevronRight, Copy,
  MoreVertical, Plus, RotateCcw, Square, StickyNote, Trash2, X,
} from 'lucide-react';
import { addDaysISO, parseDate, toISO } from '../../utils/blockHelpers';
import { usePlannedWeekDetail } from '../../hooks/usePlannedWeekDetail';
import {
  replaceExerciseFromWeek,
  clearExerciseOverrideFromWeek,
} from '../../utils/programmeTemplates';
import {
  movePlannedSession,
  copyPlannedSession,
  deletePlannedSession,
  bulkDeletePlannedSessions,
  bulkCopyPlannedSessions,
} from '../../hooks/usePlannedSessionMutations';
import ExercisePicker from './programme/builder/ExercisePicker';
import AddSessionPopover from './AddSessionPopover';
import BulkActionBar     from './BulkActionBar';

// Letter accents for grouped exercises. Soft pastel tints so the
// letter chip reads as metadata not a primary control. Cycles for >5.
const LETTER_TINTS = [
  { bg: 'rgba(34,197,94,0.12)',  fg: '#15803d' }, // A — green
  { bg: 'rgba(59,130,246,0.12)', fg: '#1d4ed8' }, // B — blue
  { bg: 'rgba(236,72,153,0.12)', fg: '#a21670' }, // C — pink
  { bg: 'rgba(245,158,11,0.16)', fg: '#a16207' }, // D — amber
  { bg: 'rgba(239,68,68,0.12)',  fg: '#b91c1c' }, // E — red
  { bg: 'rgba(20,184,166,0.12)', fg: '#0f766e' }, // F — teal
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Long-press threshold (ms) after which a held card arms COPY mode.
// Tuned to feel intentional without being annoying — comfortably longer
// than a mistap, short enough that you don't second-guess yourself.
const COPY_HOLD_MS = 550;

function startOfWeekMon(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay();
  const offset = (dow + 6) % 7; // Mon=0..Sun=6
  d.setDate(d.getDate() - offset);
  return d;
}

function formatTarget(value, type) {
  if (value == null || value === '') return '';
  switch (type) {
    case 'kg':            return `${value}kg`;
    case 'percent_1rm':   return `${value}%`;
    case 'rpe':           return `RPE ${value}`;
    case 'rir':           return `RIR ${value}`;
    case 'velocity_zone': return value;
    case 'time':          return value;
    case 'band_colour':   return value;
    default:              return String(value);
  }
}

/**
 * AthleteWeekViewV2 — variant behind the
 * `calendar_deemphasised_empty_days` feature flag (on by default).
 *
 * Adds intuitive drag-and-drop session rearrangement on top of the
 * V2 day-fade behaviour:
 *
 *   - Drag a session card to another day      → MOVES it.
 *   - Hold a card ~0.5s (gold glow) then drag → COPIES (reuses)
 *     the same session template on the new day. Original stays put.
 *   - Trash icon on each card                 → confirm-then-delete.
 *
 * Click-to-open still works because the drag sensor requires 8px of
 * movement (or 200ms hold on touch) before activating. Quick taps
 * fall through to the existing builder open flow.
 *
 * All mutations hit planned_sessions for the SINGLE athlete being
 * viewed — squad-wide moves are intentionally out of scope.
 */
export default function AthleteWeekViewV2({
  athlete,
  viewDate,
  onChangeDate,
  onChangeView,
  onClickPlanned,
  hideToolbar = false,
  hideCompleted = false,
  dimCompletedIds = null,
}) {
  const weekStart = useMemo(() => startOfWeekMon(viewDate), [viewDate]);
  const days = useMemo(() => {
    const first = toISO(weekStart);
    return Array.from({ length: 7 }, (_, i) => addDaysISO(first, i));
  }, [weekStart]);

  const fromISO = days[0];
  const toISO_  = days[6];

  const [refreshTick, setRefreshTick] = useState(0);
  const refresh = useCallback(() => setRefreshTick(n => n + 1), []);
  const { planned, loading } = usePlannedWeekDetail(athlete.id, fromISO, toISO_, refreshTick);

  // ── Replace-from-week state (unchanged) ─────────────────────────
  const [replaceTarget, setReplaceTarget] = useState(null);
  const handleReplaceConfirm = async (libRow) => {
    if (!replaceTarget) return;
    const { exercise } = replaceTarget;
    const res = await replaceExerciseFromWeek({
      sessionExerciseId: exercise.session_exercise_id,
      fromWeek:          exercise.week_number,
      newExerciseId:     libRow.id,
    });
    setReplaceTarget(null);
    if (res.ok) refresh();
    else        console.error('[AthleteWeekViewV2] replace failed', res.error);
  };
  const handleClearOverride = async (exercise) => {
    const res = await clearExerciseOverrideFromWeek({
      sessionExerciseId: exercise.session_exercise_id,
      fromWeek:          exercise.week_number,
    });
    if (res.ok) refresh();
  };

  // ── DnD + delete state ──────────────────────────────────────────
  // Sensor activation constraints serve two jobs:
  //   - PointerSensor distance:8 keeps click-to-open intact (the card
  //     only starts dragging once the cursor has actually travelled).
  //   - TouchSensor delay:200 leaves the page scrollable on phones —
  //     flick-scroll doesn't accidentally pick up a card.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  // armedCopyId — the session.id whose long-press timer has fired.
  // On drop, if active.id matches, we copy instead of move. Stored as
  // both ref + state so the drag-end handler reads fresh data while
  // the SessionCard re-renders the gold glow.
  const [armedCopyId, setArmedCopyId] = useState(null);
  const armedCopyRef = useRef(null);
  const armCopy = useCallback((id) => {
    armedCopyRef.current = id;
    setArmedCopyId(id);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(15); } catch { /* ignore */ }
    }
  }, []);
  const disarmCopy = useCallback(() => {
    armedCopyRef.current = null;
    setArmedCopyId(null);
  }, []);

  // activeDrag — kept so the DragOverlay can render a card-shaped
  // preview that follows the pointer / finger.
  const [activeDrag, setActiveDrag] = useState(null);

  // Confirm-delete modal payload + busy/toast state.
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null); // { kind: 'error'|'info', text }
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Selection / bulk-action state ──────────────────────────────
  // selectionMode toggles all drag/long-press wiring off and swaps the
  // card click handler for "toggle selection". The bottom action bar
  // renders whenever `selected.size > 0` regardless of mode flag so
  // exiting the mode also clears the bar.
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  // copyDestPicker !== null → coach is choosing the destination day
  // for a bulk Copy. Click a day → bulk-copies every selected session
  // to that day.
  const [copyDestPicker, setCopyDestPicker] = useState(false);

  const toggleSelected = useCallback((id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);
  const clearSelection = useCallback(() => {
    setSelected(new Set());
    setSelectionMode(false);
    setCopyDestPicker(false);
  }, []);

  // ── Add Session popover state ──────────────────────────────────
  // addPopover = { dayISO, anchorRect } — fixed-position, follows the
  // viewport coordinates of the clicked empty-day hint.
  const [addPopover, setAddPopover] = useState(null);
  const openAddPopover = useCallback((dayISO, anchorEl) => {
    if (!anchorEl) return;
    const r = anchorEl.getBoundingClientRect();
    setAddPopover({
      dayISO,
      anchorRect: { left: r.left, top: r.top, right: r.right, bottom: r.bottom },
    });
  }, []);

  const plannedByDate = useMemo(() => {
    const m = new Map();
    for (const p of planned) {
      if (hideCompleted && p.status === 'completed') continue;
      if (!m.has(p.planned_date)) m.set(p.planned_date, []);
      m.get(p.planned_date).push(p);
    }
    for (const list of m.values()) list.sort((a, b) => a.session_order - b.session_order);
    return m;
  }, [planned, hideCompleted]);

  // Flat lookup by session id for the DragOverlay.
  const sessionById = useMemo(() => {
    const m = new Map();
    for (const p of planned) m.set(p.id, p);
    return m;
  }, [planned]);

  const todayISO = toISO(new Date());

  const weekLabel = useMemo(() => {
    const start = parseDate(days[0]);
    const end   = parseDate(days[6]);
    const sameMonth = start.getMonth() === end.getMonth();
    const monthStart = start.toLocaleDateString('en-GB', { month: 'short' });
    const monthEnd   = end.toLocaleDateString('en-GB', { month: 'short' });
    if (sameMonth) {
      return `${monthStart} ${start.getFullYear()} · W${weekNumber(start)}`;
    }
    return `${monthStart}–${monthEnd} ${end.getFullYear()} · W${weekNumber(start)}`;
  }, [days]);

  const handlePrev  = () => onChangeDate(addDaysISOAsDate(days[0], -7));
  const handleNext  = () => onChangeDate(addDaysISOAsDate(days[0], +7));
  const handleToday = () => onChangeDate(new Date());

  // ── Bulk action handlers ───────────────────────────────────────
  const runBulkDelete = async () => {
    if (!selected.size) return;
    setBusy(true);
    const res = await bulkDeletePlannedSessions([...selected]);
    setBusy(false);
    setConfirmBulkDelete(false);
    if (!res.ok) {
      setToast({ kind: 'error', text: res.error?.message || 'Could not delete.' });
      return;
    }
    clearSelection();
    refresh();
  };

  // Repeat = bulk-copy every selected session +7 days. Skipped sources
  // (e.g. dates that would fall outside the block window) are surfaced
  // in the toast so the coach knows what didn't copy.
  const runBulkRepeat = async () => {
    if (!selected.size) return;
    setBusy(true);
    const pairs = [];
    for (const id of selected) {
      const src = sessionById.get(id);
      if (!src?.planned_date) continue;
      pairs.push({ sourceId: id, targetDateISO: addDaysISO(src.planned_date, 7) });
    }
    const res = await bulkCopyPlannedSessions(pairs);
    setBusy(false);
    if (!res.ok) {
      setToast({ kind: 'error', text: res.error?.message || 'Could not repeat.' });
      return;
    }
    const skipped = res.skipped?.length || 0;
    if (skipped) {
      setToast({
        kind: 'info',
        text: `Repeated ${res.copied}, skipped ${skipped} (outside block window).`,
      });
    }
    clearSelection();
    refresh();
  };

  // Copy = arm destination-pick mode. Next day click bulk-copies
  // every selected session onto the picked date.
  const runBulkCopyTo = async (dayISO) => {
    if (!selected.size) return;
    setBusy(true);
    const pairs = [...selected].map(id => ({ sourceId: id, targetDateISO: dayISO }));
    const res = await bulkCopyPlannedSessions(pairs);
    setBusy(false);
    if (!res.ok) {
      setToast({ kind: 'error', text: res.error?.message || 'Could not copy.' });
      return;
    }
    const skipped = res.skipped?.length || 0;
    if (skipped) {
      setToast({
        kind: 'info',
        text: `Copied ${res.copied}, skipped ${skipped} (outside block window).`,
      });
    }
    clearSelection();
    refresh();
  };

  // ── Drag handlers ───────────────────────────────────────────────
  const handleDragStart = (event) => {
    const id = event.active?.data?.current?.sessionId;
    if (id) setActiveDrag(id);
  };

  const handleDragCancel = () => {
    setActiveDrag(null);
    disarmCopy();
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    const sessionId = active?.data?.current?.sessionId;
    const fromDate  = active?.data?.current?.plannedDate;
    const toDate    = over?.data?.current?.dayISO;
    const wasCopy   = armedCopyRef.current === sessionId;

    setActiveDrag(null);
    disarmCopy();

    if (!sessionId || !toDate) return;
    // No-op move (dropped on the same day, no copy intent).
    if (!wasCopy && fromDate === toDate) return;

    setBusy(true);
    const res = wasCopy
      ? await copyPlannedSession(sessionId, toDate)
      : await movePlannedSession(sessionId, toDate);
    setBusy(false);
    if (!res.ok) {
      setToast({ kind: 'error', text: res.error?.message || 'Could not save change.' });
      return;
    }
    refresh();
  };

  // ── Delete handler ──────────────────────────────────────────────
  const confirmDeleteRun = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    const res = await deletePlannedSession(confirmDelete.id);
    setBusy(false);
    setConfirmDelete(null);
    if (!res.ok) {
      setToast({ kind: 'error', text: res.error?.message || 'Could not delete.' });
      return;
    }
    refresh();
  };

  const activeSession = activeDrag ? sessionById.get(activeDrag) : null;

  return (
    <div
      className={hideToolbar ? 'bg-white relative' : 'rounded-xl bg-white relative'}
      style={hideToolbar ? undefined : { border: '1px solid #e5e7eb' }}
    >
      {/* Toolbar — hidden in embed mode */}
      {!hideToolbar && (
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-1">
          <button onClick={handlePrev}  className="p-1.5 rounded hover:bg-gray-100 transition-colors" aria-label="Previous week">
            <ChevronLeft size={16} style={{ color: '#6b7280' }} />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1 text-xs font-semibold rounded transition-colors"
            style={{ color: '#437E8D', border: '1px solid #437E8D', backgroundColor: 'white' }}
          >
            Today
          </button>
          <button onClick={handleNext} className="p-1.5 rounded hover:bg-gray-100 transition-colors" aria-label="Next week">
            <ChevronRight size={16} style={{ color: '#6b7280' }} />
          </button>
          <span className="ml-3 text-sm font-semibold" style={{ color: '#1C1C1C' }}>
            {weekLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 rounded-md p-0.5" style={{ backgroundColor: '#f3f4f6' }}>
          <button
            onClick={() => onChangeView && onChangeView('month')}
            className="px-3 py-1 text-xs font-semibold rounded transition-colors"
            style={{ color: '#6b7280', backgroundColor: 'transparent' }}
          >
            Month
          </button>
          <button
            className="px-3 py-1 text-xs font-semibold rounded"
            style={{ color: '#1C1C1C', backgroundColor: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}
          >
            Week
          </button>
        </div>
      </div>
      )}

      {replaceTarget && (
        <ExercisePicker
          sessionLabel={`Replace ${replaceTarget.exercise.name} from Wk ${replaceTarget.exercise.week_number}`}
          onAdd={handleReplaceConfirm}
          onClose={() => setReplaceTarget(null)}
        />
      )}

      {/* Compact action strip — always visible above the grid even
          in embed mode (hideToolbar=true) because that's where the
          coach lives most of the time. Hosts the Select / Cancel
          toggle for bulk multi-select mode. */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 border-b text-[11px]"
        style={{ backgroundColor: '#fafafa', borderColor: '#f3f4f6' }}
      >
        {selectionMode ? (
          <>
            <button
              onClick={clearSelection}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded transition-colors"
              style={{ color: '#6b7280', backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
            >
              <X size={11} /> Cancel
            </button>
            <span className="text-[10px] font-semibold" style={{ color: '#A58D69' }}>
              Tap sessions to select · {selected.size} chosen
            </span>
          </>
        ) : (
          <button
            onClick={() => setSelectionMode(true)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded transition-colors hover:bg-white"
            style={{ color: '#6b7280', backgroundColor: 'transparent', border: '1px solid #e5e7eb' }}
            title="Multi-select sessions"
          >
            <CheckSquare size={11} /> Select
          </button>
        )}
        {copyDestPicker && (
          <span className="ml-auto text-[10px] font-semibold" style={{ color: '#A58D69' }}>
            ← Tap a day to copy {selected.size} session{selected.size === 1 ? '' : 's'} there
          </span>
        )}
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {/* Hint strip — only when a card is armed for copy, so we
            don't crowd the UI in steady state. */}
        {armedCopyId && (
          <div
            className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest border-b flex items-center gap-1.5"
            style={{
              color: '#A58D69',
              backgroundColor: 'rgba(165,141,105,0.08)',
              borderColor: 'rgba(165,141,105,0.25)',
            }}
          >
            <Copy size={11} />
            Copy mode — drop on a day to duplicate this session
          </div>
        )}

        <div
          className="grid items-start"
          style={{
            gridTemplateColumns: days
              .map(dayISO => {
                const isEmpty = !loading && (plannedByDate.get(dayISO) || []).length === 0;
                // While dragging, give empty days a bit more width so
                // they're an easier drop target on touch.
                if (activeDrag) return isEmpty ? '0.75fr' : '1fr';
                return isEmpty ? '0.5fr' : '1fr';
              })
              .join(' '),
            minHeight: 120,
          }}
        >
          {days.map((dayISO, i) => {
            const sessions = plannedByDate.get(dayISO) || [];
            const isToday = dayISO === todayISO;
            const d = parseDate(dayISO);
            const isEmpty = !loading && sessions.length === 0;

            return (
              <DroppableDay
                key={dayISO}
                dayISO={dayISO}
                isEmpty={isEmpty}
                isToday={isToday}
                isLast={i === 6}
                dragInProgress={!!activeDrag}
              >
                <div
                  className="px-3 py-2"
                  style={{
                    borderBottom: isEmpty ? 'none' : '1px solid #f3f4f6',
                    backgroundColor: !isEmpty && isToday
                      ? 'rgba(67,126,141,0.06)'
                      : 'transparent',
                    opacity: isEmpty ? 0.65 : 1,
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>
                      {DAY_LABELS[i]}
                    </span>
                    <span className="text-[13px] font-bold tabular-nums" style={{ color: isToday ? '#437E8D' : '#1C1C1C' }}>
                      {d.getDate()}
                    </span>
                  </div>
                </div>

                {/* If we're in copy-destination pick mode, the whole
                    day column acts as a button that bulk-copies the
                    selection here. We render an overlay so the click
                    target covers the entire column area. */}
                {copyDestPicker && (
                  <button
                    onClick={() => runBulkCopyTo(dayISO)}
                    className="absolute inset-0 z-10 cursor-copy"
                    style={{
                      backgroundColor: 'rgba(165,141,105,0.04)',
                      border: '2px dashed rgba(165,141,105,0.3)',
                      borderRadius: 4,
                    }}
                    aria-label={`Copy ${selected.size} sessions to ${dayISO}`}
                  />
                )}

                {!isEmpty && (
                  <div className="flex-1 px-2 py-2 space-y-2 relative">
                    {loading && (
                      <div className="text-[10px] italic" style={{ color: '#9ca3af' }}>Loading…</div>
                    )}
                    {!loading && sessions.map(s => {
                      const dim = (dimCompletedIds && dimCompletedIds.has(s.id))
                        || (s.status === 'completed' && !hideCompleted);
                      // In selection mode, render a plain selectable
                      // card (no drag, no long-press) so taps toggle
                      // the checkbox cleanly.
                      if (selectionMode) {
                        return (
                          <SelectableSessionCard
                            key={s.id}
                            session={s}
                            dim={dim}
                            checked={selected.has(s.id)}
                            onToggle={() => toggleSelected(s.id)}
                          />
                        );
                      }
                      return (
                        <DraggableSessionCard
                          key={s.id}
                          session={s}
                          dim={dim}
                          armed={armedCopyId === s.id}
                          isDraggingThis={activeDrag === s.id}
                          onArmCopy={() => armCopy(s.id)}
                          onClick={() => onClickPlanned && onClickPlanned(s)}
                          onRequestReplace={(item) => setReplaceTarget({ exercise: item, sessionName: s.session_name })}
                          onClearOverride={(item) => handleClearOverride(item)}
                          onRequestDelete={() => setConfirmDelete(s)}
                        />
                      );
                    })}
                    {/* + button under the existing sessions so the coach
                        can stack a second session on a day that already
                        has one. Hidden in selection mode. */}
                    {!selectionMode && !copyDestPicker && (
                      <button
                        onClick={(e) => openAddPopover(dayISO, e.currentTarget)}
                        className="w-full mt-1 flex items-center justify-center gap-1 px-2 py-1 rounded border text-[10px] italic transition-colors hover:border-gold-300 hover:bg-gold-50/40"
                        style={{ borderColor: '#e5e7eb', borderStyle: 'dashed', color: '#9ca3af' }}
                      >
                        <Plus size={10} /> Add session
                      </button>
                    )}
                  </div>
                )}

                {isEmpty && (
                  <div className="px-3 pb-2">
                    {activeDrag ? (
                      <div
                        className="text-[10px] italic select-none"
                        style={{ color: '#A58D69' }}
                      >
                        Drop here →
                      </div>
                    ) : !selectionMode && !copyDestPicker ? (
                      <button
                        onClick={(e) => openAddPopover(dayISO, e.currentTarget)}
                        className="text-[10px] italic select-none transition-opacity opacity-40 hover:opacity-100"
                        style={{ color: '#A58D69' }}
                      >
                        + Add session
                      </button>
                    ) : null}
                  </div>
                )}
              </DroppableDay>
            );
          })}
        </div>

        {/* Drag preview — a low-fi card silhouette that follows the
            pointer. Keeping it minimal so the underlying grid stays
            visible. Tilt + gold ring during copy mode. */}
        <DragOverlay dropAnimation={null}>
          {activeSession ? (
            <div
              className="rounded-lg shadow-xl"
              style={{
                width: 200,
                backgroundColor: '#fff',
                border: armedCopyId === activeSession.id
                  ? '2px solid #A58D69'
                  : '1px solid #437E8D',
                transform: 'rotate(-2deg)',
              }}
            >
              <div
                className="px-2.5 py-1.5 border-b border-gray-100 text-[11px] font-bold truncate"
                style={{ color: '#1C1C1C' }}
              >
                {activeSession.session_name}
              </div>
              <div className="px-2 py-1.5 text-[10px]" style={{ color: '#6b7280' }}>
                {armedCopyId === activeSession.id ? 'Copy →' : 'Move →'}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add Session popover — opens from the empty-day "+ Add session"
          hint, or from the small dashed button under existing sessions. */}
      {addPopover && (
        <AddSessionPopover
          athleteId={athlete.id}
          targetDateISO={addPopover.dayISO}
          anchorRect={addPopover.anchorRect}
          onClose={() => setAddPopover(null)}
          onAdded={() => { setAddPopover(null); refresh(); }}
        />
      )}

      {/* Bulk action bar — appears whenever something's selected. */}
      <BulkActionBar
        count={selected.size}
        disabled={busy}
        onCancel={clearSelection}
        onRepeat={runBulkRepeat}
        onCopy={() => setCopyDestPicker(true)}
        onDelete={() => setConfirmBulkDelete(true)}
      />

      {/* Bulk delete confirm modal */}
      {confirmBulkDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={() => !busy && setConfirmBulkDelete(false)}
        >
          <div
            className="rounded-xl bg-white w-full max-w-sm p-5"
            style={{ border: '1px solid #e5e7eb', boxShadow: '0 24px 48px rgba(0,0,0,0.18)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-3">
              <span
                className="shrink-0 inline-flex items-center justify-center rounded-full"
                style={{ width: 36, height: 36, backgroundColor: 'rgba(220,38,38,0.10)' }}
              >
                <Trash2 size={16} style={{ color: '#dc2626' }} />
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold" style={{ color: '#1C1C1C' }}>
                  Delete {selected.size} session{selected.size === 1 ? '' : 's'}?
                </h3>
                <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                  Removes the selected planned sessions from{' '}
                  <span className="font-semibold">{athlete.first_name || athlete.name || 'this athlete'}</span>'s
                  plan. Session templates stay available to re-add later.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setConfirmBulkDelete(false)}
                disabled={busy}
                className="px-3 py-1.5 text-xs font-semibold rounded transition-colors disabled:opacity-50"
                style={{ color: '#6b7280', border: '1px solid #e5e7eb', backgroundColor: '#fff' }}
              >
                Cancel
              </button>
              <button
                onClick={runBulkDelete}
                disabled={busy}
                className="px-3 py-1.5 text-xs font-semibold rounded transition-colors disabled:opacity-50"
                style={{ color: '#fff', backgroundColor: '#dc2626' }}
              >
                {busy ? 'Deleting…' : `Delete ${selected.size}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm-delete modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={() => !busy && setConfirmDelete(null)}
        >
          <div
            className="rounded-xl bg-white w-full max-w-sm p-5"
            style={{ border: '1px solid #e5e7eb', boxShadow: '0 24px 48px rgba(0,0,0,0.18)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-3">
              <span
                className="shrink-0 inline-flex items-center justify-center rounded-full"
                style={{ width: 36, height: 36, backgroundColor: 'rgba(220,38,38,0.10)' }}
              >
                <Trash2 size={16} style={{ color: '#dc2626' }} />
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold" style={{ color: '#1C1C1C' }}>
                  Delete this session?
                </h3>
                <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                  Removes <span className="font-semibold">{confirmDelete.session_name}</span>{' '}
                  from {athlete.first_name || athlete.name || 'this athlete'}'s plan on{' '}
                  <span className="font-semibold">
                    {parseDate(confirmDelete.planned_date).toLocaleDateString('en-GB', {
                      weekday: 'short', day: 'numeric', month: 'short',
                    })}
                  </span>. The session template stays available to re-add later.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={busy}
                className="px-3 py-1.5 text-xs font-semibold rounded transition-colors disabled:opacity-50"
                style={{ color: '#6b7280', border: '1px solid #e5e7eb', backgroundColor: '#fff' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteRun}
                disabled={busy}
                className="px-3 py-1.5 text-xs font-semibold rounded transition-colors disabled:opacity-50"
                style={{ color: '#fff', backgroundColor: '#dc2626' }}
              >
                {busy ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast — bottom-right, auto-dismiss */}
      {toast && (
        <div
          className="absolute right-3 bottom-3 z-40 px-3 py-2 rounded-md shadow-lg text-[11px] font-semibold flex items-center gap-2 max-w-xs"
          style={{
            backgroundColor: toast.kind === 'error' ? '#fee2e2' : '#ecfeff',
            color:           toast.kind === 'error' ? '#991b1b' : '#155e75',
            border: `1px solid ${toast.kind === 'error' ? '#fecaca' : '#a5f3fc'}`,
          }}
        >
          <span className="flex-1">{toast.text}</span>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100">
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── DroppableDay ───────────────────────────────────────────────────
function DroppableDay({ dayISO, isEmpty, isToday, isLast, dragInProgress, children }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `day-${dayISO}`,
    data: { dayISO },
  });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col relative ${isEmpty ? 'group/emptyday' : ''}`}
      style={{
        borderRight: !isEmpty && !isLast ? '1px solid #f3f4f6' : 'none',
        backgroundColor: isOver
          ? 'rgba(165,141,105,0.12)'
          : isEmpty
            ? 'transparent'
            : isToday ? 'rgba(67,126,141,0.03)' : '#fff',
        outline: isOver ? '2px dashed #A58D69' : 'none',
        outlineOffset: -2,
        transition: 'background-color 120ms ease, outline 120ms ease',
        minHeight: dragInProgress ? 90 : undefined,
      }}
    >
      {children}
    </div>
  );
}

// ─── SelectableSessionCard ───────────────────────────────────────────
// Plain (no drag, no long-press) variant used when the week view is in
// selection mode. Tap toggles the checkbox; nothing else fires so the
// coach can't accidentally open the editor while picking multiple.
function SelectableSessionCard({ session, dim, checked, onToggle }) {
  return (
    <div
      onClick={onToggle}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
      className="block w-full text-left rounded-lg transition-shadow cursor-pointer relative"
      style={{
        backgroundColor: checked ? 'rgba(165,141,105,0.08)' : '#fff',
        border: checked ? '2px solid #A58D69' : '1px solid #e5e7eb',
        opacity: dim ? 0.55 : 1,
      }}
    >
      <div className="absolute top-1.5 right-1.5">
        {checked
          ? <CheckSquare size={14} style={{ color: '#A58D69' }} fill="rgba(165,141,105,0.18)" />
          : <Square      size={14} style={{ color: '#9ca3af' }} />}
      </div>
      <div className="px-2.5 py-1.5 border-b border-gray-100">
        <div className="text-[11px] font-bold truncate pr-5" style={{ color: '#1C1C1C' }}>
          {session.session_name}
        </div>
      </div>
      <div className="px-2 py-1.5">
        <div className="text-[10px]" style={{ color: '#6b7280' }}>
          {session.items?.length || 0} item{(session.items?.length || 0) === 1 ? '' : 's'}
        </div>
      </div>
    </div>
  );
}

// ─── DraggableSessionCard ───────────────────────────────────────────
// Wraps SessionCard with dnd-kit drag wiring + a long-press timer that
// arms COPY mode. The card itself stays a plain presentational
// component so the click-to-open path is unchanged.
function DraggableSessionCard({
  session, dim, armed, isDraggingThis,
  onArmCopy, onClick, onRequestReplace, onClearOverride, onRequestDelete,
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `planned-${session.id}`,
    data: { sessionId: session.id, plannedDate: session.planned_date },
  });

  // ── Long-press detector ─────────────────────────────────────────
  // Runs in PARALLEL with dnd-kit's own pointer listeners (events
  // bubble fine to both). Timer fires after COPY_HOLD_MS of a still
  // pointer; movement >8px before then cancels.
  const timerRef = useRef(null);
  const startRef = useRef(null);

  const startHoldTimer = useCallback((e) => {
    startRef.current = { x: e.clientX, y: e.clientY };
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onArmCopy();
      timerRef.current = null;
    }, COPY_HOLD_MS);
  }, [onArmCopy]);

  const cancelHoldTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startRef.current = null;
  }, []);

  const trackHoldMove = useCallback((e) => {
    if (!startRef.current || !timerRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (Math.hypot(dx, dy) > 8) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const dragStyle = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    // While the real card is being dragged, hide it — the DragOverlay
    // renders the preview that actually follows the pointer.
    opacity: isDraggingThis ? 0.35 : 1,
    touchAction: 'none',
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      {...attributes}
      {...listeners}
      onPointerDown={(e) => {
        startHoldTimer(e);
        // Let dnd-kit's own pointer-down listener also fire — its handler
        // is included in {...listeners} above and receives the event
        // before this one in the DOM event chain.
      }}
      onPointerMove={trackHoldMove}
      onPointerUp={cancelHoldTimer}
      onPointerCancel={cancelHoldTimer}
      onPointerLeave={cancelHoldTimer}
    >
      <SessionCard
        session={session}
        dim={dim}
        armed={armed}
        onClick={onClick}
        onRequestReplace={onRequestReplace}
        onClearOverride={onClearOverride}
        onRequestDelete={onRequestDelete}
      />
    </div>
  );
}

// ─── SessionCard ────────────────────────────────────────────────────
function SessionCard({
  session, onClick, onRequestReplace, onClearOverride, onRequestDelete,
  dim = false, armed = false,
}) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      className="block w-full text-left rounded-lg transition-shadow hover:shadow-sm cursor-pointer"
      style={{
        backgroundColor: '#fff',
        border: armed ? '2px solid #A58D69' : '1px solid #e5e7eb',
        boxShadow: armed ? '0 0 0 3px rgba(165,141,105,0.18)' : undefined,
        opacity: dim ? 0.55 : 1,
        transition: 'box-shadow 160ms ease, border-color 160ms ease',
      }}
    >
      <div className="px-2.5 py-1.5 border-b border-gray-100 flex items-center gap-1.5">
        <div className="flex-1 text-[11px] font-bold truncate" style={{ color: '#1C1C1C' }}>
          {session.session_name}
        </div>
        {dim && (
          <span
            className="shrink-0 inline-flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded"
            style={{ color: '#16a34a', backgroundColor: 'rgba(22,163,74,0.1)' }}
          >
            ✓ Done
          </span>
        )}
        {/* Trash icon — hover-only on desktop (group/sesscard), always
            visible on touch. stopPropagation so it doesn't open the
            session editor, and pointerdown stops drag activation. */}
        <button
          onPointerDown={(e) => { e.stopPropagation(); }}
          onClick={(e) => {
            e.stopPropagation();
            onRequestDelete && onRequestDelete();
          }}
          className="shrink-0 p-1 rounded hover:bg-red-50 transition-colors"
          style={{ color: '#9ca3af' }}
          title="Delete this session"
          aria-label="Delete session"
        >
          <Trash2 size={11} />
        </button>
      </div>
      <div className="px-2 py-1.5 space-y-1">
        {session.items.length === 0 && (
          <div className="text-[10px] italic" style={{ color: '#9ca3af' }}>Empty session</div>
        )}
        {session.items.map((item, i) => (
          item.kind === 'note'
            ? <NoteItem key={i} content={item.content} />
            : <ExerciseItem
                key={i}
                {...item}
                onRequestReplace={() => onRequestReplace && onRequestReplace(item)}
                onClearOverride={() => onClearOverride && onClearOverride(item)}
              />
        ))}
      </div>
    </div>
  );
}

// ─── ExerciseItem ───────────────────────────────────────────────────
function ExerciseItem({
  letter,
  name,
  sets,
  reps,
  target_value,
  prescription_type,
  is_overridden,
  swapped_from,
  onRequestReplace,
  onClearOverride,
}) {
  const idx = letter ? letter.charCodeAt(0) - 'A'.charCodeAt(0) : 0;
  const tint = LETTER_TINTS[idx % LETTER_TINTS.length];
  const targetLabel = formatTarget(target_value, prescription_type);

  const setsRepsLine = sets != null && reps != null
    ? `${sets} × ${reps}${targetLabel ? ` · ${targetLabel}` : ''}`
    : null;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  return (
    <div className="group/exrow flex items-start gap-2 relative">
      <span
        className="shrink-0 inline-flex items-center justify-center text-[9px] font-bold rounded mt-0.5"
        style={{
          width: 16, height: 16,
          backgroundColor: tint.bg,
          color: tint.fg,
        }}
      >
        {letter}
      </span>
      <div className="flex-1 min-w-0">
        <div
          className="text-[11px] font-semibold leading-snug"
          style={{
            color: '#1C1C1C',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
          title={swapped_from ? `${name} (swapped from ${swapped_from})` : name}
        >
          {name}
        </div>
        {setsRepsLine && (
          <div className="text-[10px] tabular-nums mt-0.5" style={{ color: '#6b7280' }}>
            {setsRepsLine}
          </div>
        )}
      </div>

      <div
        ref={menuRef}
        className="shrink-0 relative mt-0.5"
        style={{ width: 18, height: 18 }}
      >
        {is_overridden && (
          <span
            className="absolute inset-0 inline-flex items-center justify-center rounded-md transition-opacity pointer-events-none group-hover/exrow:opacity-0"
            style={{ backgroundColor: '#A58D69' }}
            title={swapped_from
              ? `Swapped from ${swapped_from} — click ⋮ to restore`
              : 'Swapped from this week'}
          >
            <ArrowLeftRight size={11} style={{ color: '#fff' }} strokeWidth={2.5} />
          </span>
        )}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
          className={`absolute inset-0 flex items-center justify-center rounded hover:bg-gray-100 transition-opacity ${
            menuOpen
              ? 'opacity-100'
              : 'opacity-0 group-hover/exrow:opacity-100'
          }`}
          style={{ color: '#9ca3af' }}
          title="Exercise actions"
        >
          <MoreVertical size={12} />
        </button>
        {menuOpen && (
          <div
            className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg py-1 z-30"
            style={{ border: '1px solid #e5e7eb', minWidth: 220 }}
            onClick={(e) => e.stopPropagation()}
          >
            {is_overridden && swapped_from && (
              <div
                className="px-3 py-1.5 text-[10px] italic border-b border-gray-100"
                style={{ color: '#9ca3af' }}
              >
                Swapped from {swapped_from}
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onRequestReplace && onRequestReplace(); }}
              className="w-full text-left px-3 py-1.5 text-[11px] font-medium hover:bg-gray-50 transition-colors"
              style={{ color: '#1C1C1C' }}
            >
              Replace from this week…
            </button>
            {is_overridden && (
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onClearOverride && onClearOverride(); }}
                className="w-full text-left px-3 py-1.5 text-[11px] font-medium hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                style={{ color: '#dc2626' }}
              >
                <RotateCcw size={11} />
                Restore original from this week
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NoteItem ───────────────────────────────────────────────────────
function NoteItem({ content }) {
  return (
    <div className="flex items-start gap-2 pl-0.5">
      <span
        className="shrink-0 inline-flex items-center justify-center rounded mt-0.5"
        style={{ width: 16, height: 16, backgroundColor: 'rgba(165,141,105,0.12)' }}
      >
        <StickyNote size={9} style={{ color: '#A58D69' }} />
      </span>
      <div className="text-[10px] italic truncate" style={{ color: '#6b7280' }} title={content || 'Note'}>
        {content || 'Note'}
      </div>
    </div>
  );
}

// ─── helpers ────────────────────────────────────────────────────────
function addDaysISOAsDate(iso, days) {
  return parseDate(addDaysISO(iso, days));
}

function weekNumber(d) {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  return 1 + Math.ceil((firstThursday - target) / 604800000);
}
