import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Cake, CalendarDays, ChevronLeft, ChevronRight, Dumbbell, Gauge, Plus, Tent,
  Trophy, Volleyball, X,
} from 'lucide-react';

// Event-type → lucide icon. Used inside event pills so users get a quick
// visual cue without having to read the label. Planned sessions, birthdays
// and team events have their own dedicated icons handled separately above.
const EVENT_TYPE_ICONS = {
  competition:       Trophy,
  training_camp:     Tent,
  testing:           Gauge,
  technical_session: Volleyball,
  other:             CalendarDays,
};
import { colourForAthlete, tintForColour } from '../../utils/programmingColours';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Pill geometry (px). Adjust the day-number reservation if you change this.
const PILL_HEIGHT        = 18;
const PILL_GAP           = 3;
const DAY_NUMBER_RESERVE = 22;
const MAX_LANES_MONTH    = 3;
const DRAG_THRESHOLD_PX  = 5;

// Priority colours.
//
// On Surface 1 (per-athlete calendar) the WHOLE pill takes the priority
// colour and there is no badge — the user only ever sees one athlete on
// this calendar so athlete colour adds no signal. The mapping below is the
// agreed Surface 1 scheme: A is the highest-priority hue (Gold).
//
// On Surface 2 (master cross-athlete calendar — not built yet) the pill
// background switches to athlete colour and a small priority badge sits at
// the right end of competition pills. The badge uses the same priority
// colour mapping below.
const PRIORITY_COLOURS = {
  A: '#A58D69', // gold
  B: '#085777', // navy
  C: '#437E8D', // teal
};

// Neutral pill colour for non-competition / no-priority events on Surface 1.
const NEUTRAL_PILL_BG = '#64748b'; // slate-500

// Brief 5a — team-event accent. Muted gold, opacity adjusted per surface.
const TEAM_EVENT_COLOUR = '#A58D69';

/**
 * Resolve the visual style for a pill given the colour mode.
 *  mode === 'priority'  (Surface 1, per-athlete)
 *  mode === 'athlete'   (Surface 2, cross-athlete)
 *
 * Team events override the mode-specific styling: muted gold background
 * across both surfaces, with stronger fade and shorter pill on the
 * per-athlete view (athleteContext = true).
 */
function getPillStyle(event, mode, athleteContext = false) {
  if (event.is_planned) {
    // Brief 5d/5e — planned training session pill: outlined teal,
    // white background, teal text. Distinct from solid event pills.
    return {
      bg: '#ffffff',
      fg: '#437E8D',
      border: '#437E8D',
      showBadge: false,
      isTeam: false,
      isBirthday: false,
      isPlanned: true,
    };
  }
  if (event.is_birthday) {
    // Always-on muted gold across surfaces. Birthdays don't render on
    // per-athlete calendars but the style is unified anyway.
    return {
      bg: 'rgba(165,141,105,0.60)',
      fg: '#ffffff',
      border: null,
      showBadge: false,
      isTeam: false,
      isBirthday: true,
    };
  }
  if (event.is_team_event) {
    // Surface 2 → 70% opacity gold, full pill height.
    // Surface 1 → 50% opacity gold, faded so it stays secondary.
    const alpha = athleteContext ? 0.50 : 0.70;
    return {
      bg: `rgba(165,141,105,${alpha})`,
      fg: '#ffffff',
      border: null,
      showBadge: false,
      isTeam: true,
    };
  }
  if (mode === 'athlete') {
    const colour = colourForAthlete(event.athlete_id);
    return {
      bg: tintForColour(colour, 0.16),
      fg: colour,
      border: colour,
      showBadge:
        event.event_type === 'competition'
        && event.priority
        && !!PRIORITY_COLOURS[event.priority],
      isTeam: false,
    };
  }
  // 'priority' — Surface 1
  if (event.event_type === 'competition' && PRIORITY_COLOURS[event.priority]) {
    return {
      bg: PRIORITY_COLOURS[event.priority],
      fg: '#ffffff',
      border: null,
      showBadge: false,
      isTeam: false,
    };
  }
  return {
    bg: NEUTRAL_PILL_BG,
    fg: '#ffffff',
    border: null,
    showBadge: false,
    isTeam: false,
  };
}

// ─── Date helpers (Mon-start week) ──────────────────────────────────────────

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeekMon(d) {
  const x = startOfDay(d);
  const dow = x.getDay();
  const offset = (dow + 6) % 7;
  x.setDate(x.getDate() - offset);
  return x;
}

function startOfMonth(d) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function addMonths(d, n) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth()    === b.getMonth()
    && a.getDate()     === b.getDate();
}

function dayDiff(a, b) {
  return Math.round((startOfDay(a) - startOfDay(b)) / (1000 * 60 * 60 * 24));
}

function parseDate(iso) {
  return new Date(iso + 'T00:00:00');
}

function toISO(d) {
  // Local-date-aware ISO (avoid UTC shift)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatMonthYear(d) {
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function formatWeekRange(start) {
  const end = addDays(start, 6);
  const sameYear = start.getFullYear() === end.getFullYear();
  const startStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const endStr   = end.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: sameYear ? undefined : 'numeric',
  });
  return `${startStr} – ${endStr}`;
}

function formatToastDate(iso) {
  return parseDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ─── Per-week segment layout with lane assignment ───────────────────────────

function buildWeekSegments(events, weekStart, pillColourMode, athleteContext) {
  const weekEnd = addDays(weekStart, 6);
  const raw = [];

  events.forEach(e => {
    const start = parseDate(e.start_date);
    const end   = parseDate(e.end_date || e.start_date);
    if (end < weekStart || start > weekEnd) return;

    const segStart = start < weekStart ? weekStart : start;
    const segEnd   = end   > weekEnd   ? weekEnd   : end;
    const startCol = dayDiff(segStart, weekStart);
    const endCol   = dayDiff(segEnd,   weekStart);

    raw.push({
      event: e,
      style: getPillStyle(e, pillColourMode, athleteContext),
      startCol,
      endCol,
      leftRounded:  start >= weekStart,
      rightRounded: end   <= weekEnd,
    });
  });

  raw.sort((a, b) =>
    (b.endCol - b.startCol) - (a.endCol - a.startCol) ||
    a.startCol - b.startCol);

  const lanes = [];
  raw.forEach(seg => {
    let laneIdx = 0;
    while (true) {
      const lane = lanes[laneIdx];
      if (!lane) {
        lanes.push([{ startCol: seg.startCol, endCol: seg.endCol }]);
        seg.lane = laneIdx;
        return;
      }
      const overlap = lane.some(x => !(seg.endCol < x.startCol || seg.startCol > x.endCol));
      if (!overlap) {
        lane.push({ startCol: seg.startCol, endCol: seg.endCol });
        seg.lane = laneIdx;
        return;
      }
      laneIdx++;
    }
  });
  return raw;
}

// ─── Pill ────────────────────────────────────────────────────────────────────
// Renders the event name with a leading icon (event-type, planned-session,
// birthday, or team) and — for competitions — a priority badge on the right.
// The badge uses a priority-driven colour, not the athlete colour.

function EventPill({ seg, height = PILL_HEIGHT, hidden, onPointerDown, onPreviewClick, athleteContext, onCopyPlanned }) {
  const { event, style, leftRounded, rightRounded } = seg;
  const radius = 4;
  const renderBadge = leftRounded && style.showBadge;
  const isTeam     = !!style.isTeam;
  const isBirthday = !!style.isBirthday;
  const isPlanned  = !!style.isPlanned;

  // Reduced pill height on the per-athlete calendar for team events
  // (subordinates to athlete-attached pills). Birthdays never appear
  // on per-athlete calendars so they always render full height.
  const effectiveHeight = (isTeam && athleteContext) ? Math.round(height * 0.75) : height;

  // Birthdays are read-only and team events on a per-athlete calendar
  // are also read-only. Planned sessions get a click handler that
  // opens the session builder for that block — so we route through
  // the preview path too rather than the drag pipeline.
  const dragDisabled = isBirthday || isPlanned || (isTeam && athleteContext);
  const cursor = dragDisabled ? 'pointer' : 'grab';

  const interactionHandlers = dragDisabled
    ? { onClick: () => onPreviewClick && onPreviewClick(event) }
    : { onPointerDown };

  return (
    <div
      role="button"
      {...interactionHandlers}
      className="group absolute flex items-center gap-1 px-1.5 overflow-hidden text-[10px] font-semibold select-none"
      style={{
        left: `calc(${(seg.startCol / 7) * 100}% + 2px)`,
        width: `calc(${((seg.endCol - seg.startCol + 1) / 7) * 100}% - 4px)`,
        top: 0,
        height: effectiveHeight,
        backgroundColor: style.bg,
        color: style.fg,
        // Planned sessions render with a full outline (all sides);
        // other events keep a left-side accent only.
        border: isPlanned && style.border
          ? `1px solid ${style.border}`
          : 'none',
        borderLeft: !isPlanned && leftRounded && style.border ? `2px solid ${style.border}` : (isPlanned && style.border ? `1px solid ${style.border}` : undefined),
        borderTopLeftRadius:    leftRounded  ? radius : 0,
        borderBottomLeftRadius: leftRounded  ? radius : 0,
        borderTopRightRadius:   rightRounded ? radius : 0,
        borderBottomRightRadius:rightRounded ? radius : 0,
        textAlign: 'left',
        whiteSpace: 'nowrap',
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? 'none' : 'auto',
        transition: 'opacity 0.08s ease',
        cursor,
      }}
      title={event.event_name + (isTeam ? ' (team event)' : isPlanned ? ' (planned session)' : '')}
    >
      {isPlanned && leftRounded && (
        <Dumbbell size={10} className="shrink-0" style={{ color: '#437E8D' }} />
      )}
      {isBirthday && leftRounded && (
        <Cake size={11} className="shrink-0" style={{ color: '#fff' }} />
      )}
      {/* Event-type icon — only on regular (non-planned, non-birthday, non-team)
          pills, and only on the leftmost segment so multi-day pills don't
          double-stamp it. */}
      {!isPlanned && !isBirthday && !isTeam && leftRounded && EVENT_TYPE_ICONS[event.event_type] && (() => {
        const Icon = EVENT_TYPE_ICONS[event.event_type];
        return <Icon size={10} className="shrink-0" style={{ color: style.fg }} />;
      })()}
      {isTeam && leftRounded && (
        <span
          className="shrink-0 text-[8px] font-bold uppercase tracking-widest px-1 rounded-sm"
          style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff' }}
        >
          Team
        </span>
      )}
      <span className="flex-1 truncate">{event.event_name}</span>
      {renderBadge && (
        <span
          className="shrink-0 inline-flex items-center justify-center text-[9px] font-bold rounded-sm"
          style={{
            backgroundColor: PRIORITY_COLOURS[event.priority],
            color: '#fff',
            width: 13,
            height: 13,
            lineHeight: 1,
          }}
        >
          {event.priority}
        </span>
      )}
      {isPlanned && onCopyPlanned && (
        <button
          onClick={(e) => { e.stopPropagation(); onCopyPlanned(event); }}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: '#437E8D', fontSize: 10, lineHeight: 1, padding: '1px 2px' }}
          title="Copy this session to another day"
        >
          ⧉
        </button>
      )}
    </div>
  );
}

// Returns events overlapping a given ISO date, sorted earliest start first.
function eventsOnDate(events, dateISO) {
  const d = parseDate(dateISO);
  return events
    .filter(e => {
      const start = parseDate(e.start_date);
      const end   = parseDate(e.end_date || e.start_date);
      return start <= d && d <= end;
    })
    .slice()
    .sort((a, b) =>
      a.start_date.localeCompare(b.start_date)
      || a.event_name.localeCompare(b.event_name));
}

// Day popover — shown when the user clicks "+N more" on a busy day.
// Lists every event for that day as a full-width pill matching the
// calendar's colour mode. Clicks routed through onClickEvent.
function DayPopover({ dateISO, anchorRect, events, pillColourMode, athleteContext, onClickEvent, onClose }) {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) onClose();
    };
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    // Defer so the trigger click doesn't immediately close us
    const t = setTimeout(() => {
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('keydown', handleKey);
    }, 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // Position: open downward by default; flip up if it would overflow the
  // viewport. Clamp horizontally inside the viewport.
  const POPOVER_W = 280;
  const POPOVER_MAXH = 320;
  const MARGIN = 6;
  const flipUp = anchorRect.bottom + POPOVER_MAXH + MARGIN > window.innerHeight;
  const top = flipUp
    ? Math.max(8, anchorRect.top - POPOVER_MAXH - MARGIN)
    : anchorRect.bottom + MARGIN;
  let left = anchorRect.left;
  if (left + POPOVER_W > window.innerWidth - 8) left = window.innerWidth - POPOVER_W - 8;
  if (left < 8) left = 8;

  const heading = parseDate(dateISO).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return createPortal(
    <div
      ref={popoverRef}
      className="rounded-lg shadow-lg bg-white flex flex-col"
      style={{
        position: 'fixed',
        top,
        left,
        width: POPOVER_W,
        maxHeight: POPOVER_MAXH,
        border: '1px solid #e5e7eb',
        zIndex: 95,
      }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#1C1C1C' }}>
          {heading}
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400"
          aria-label="Close"
        >
          <X size={13} />
        </button>
      </div>

      <div className="overflow-y-auto py-2 px-2 space-y-1">
        {events.length === 0 ? (
          <p className="text-[11px] italic text-center py-3" style={{ color: '#9ca3af' }}>
            No events on this day
          </p>
        ) : (
          events.map(e => {
            const style = getPillStyle(e, pillColourMode, athleteContext);
            const renderBadge = style.showBadge;
            return (
              <button
                key={e.id}
                onClick={() => { onClickEvent && onClickEvent(e); onClose(); }}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold transition-opacity hover:opacity-85 cursor-pointer"
                style={{
                  backgroundColor: style.bg,
                  color: style.fg,
                  borderLeft: style.border ? `2px solid ${style.border}` : 'none',
                  borderRadius: 4,
                  textAlign: 'left',
                }}
                title={e.event_name}
              >
                <span className="flex-1 truncate">{e.event_name}</span>
                {renderBadge && (
                  <span
                    className="shrink-0 inline-flex items-center justify-center text-[9px] font-bold rounded-sm"
                    style={{
                      backgroundColor: PRIORITY_COLOURS[e.priority],
                      color: '#fff',
                      width: 14,
                      height: 14,
                      lineHeight: 1,
                    }}
                  >
                    {e.priority}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>,
    document.body,
  );
}

// Ghost preview rendered at the cursor while dragging.
function DragGhost({ x, y, seg }) {
  const { event, style } = seg;
  return (
    <div
      style={{
        position: 'fixed',
        left: x + 8,
        top: y + 8,
        height: PILL_HEIGHT,
        minWidth: 120,
        maxWidth: 240,
        padding: '0 8px',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: style.bg,
        color: style.fg,
        borderLeft: style.border ? `2px solid ${style.border}` : 'none',
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
        pointerEvents: 'none',
        zIndex: 90,
      }}
    >
      {event.event_name}
    </div>
  );
}

// ─── Main calendar ───────────────────────────────────────────────────────────

/**
 * ProgrammeCalendar — month / week grid.
 *
 * Pills:
 *   • Single click   → onClickEvent(event)
 *   • Drag & drop    → onMoveEvent(event, newStartDateISO)
 * Cells:
 *   • Hover affordance "+ Event" → onAddEventOnDate(dateISO) (canEdit only)
 *   • Add Event toolbar button   → onAddEvent()
 */
export default function ProgrammeCalendar({
  viewMode, onChangeView,
  viewDate, onChangeDate,
  canEdit = true,
  onAddEvent,
  onAddEventOnDate,
  onMoveEvent,
  events = [],
  onClickEvent,
  // 'priority' (Surface 1, per-athlete) | 'athlete' (Surface 2, future)
  pillColourMode = 'priority',
  // Brief 5a — when true, this calendar lives inside an athlete profile
  // and any team events render with extra fade + shorter pill height,
  // and click bypasses the editor (read-only preview).
  athleteContext = false,
  // Optional date range to highlight on the grid (used by the block
  // timeline above the calendar — set on hover, null otherwise).
  // Shape: { start_date, end_date, colour } | null
  highlightRange = null,
  // Training blocks to render as a thin marker line at the bottom of
  // each cell so the user can see block coverage at a glance without
  // hovering. blockColourMap is { id → colour }; if omitted, no markers
  // render.
  blocks = [],
  blockColourMap = null,
  // Optional: (iso, { keepAlive, release }) => ReactNode — takes over the
  // per-day hover affordance entirely (replacing the default "+ Event"
  // button) when supplied. See DayQuickAddMenu for the intended shape.
  renderDayHover = null,
  // Optional: (event) => void — adds a small copy icon to is_planned pills.
  onCopyPlanned = null,
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const containerRef = useRef(null);

  // Build week-row Mondays
  const weekStarts = useMemo(() => {
    if (viewMode === 'week') {
      return [startOfWeekMon(viewDate)];
    }
    const first = startOfWeekMon(startOfMonth(viewDate));
    return [0, 1, 2, 3, 4, 5].map(i => addDays(first, i * 7));
  }, [viewDate, viewMode]);

  const title = viewMode === 'week'
    ? formatWeekRange(startOfWeekMon(viewDate))
    : formatMonthYear(viewDate);

  const handlePrev  = () => onChangeDate(viewMode === 'week' ? addDays(viewDate, -7) : addMonths(viewDate, -1));
  const handleNext  = () => onChangeDate(viewMode === 'week' ? addDays(viewDate,  7) : addMonths(viewDate,  1));
  const handleToday = () => onChangeDate(new Date());

  const rowHeight = viewMode === 'week' ? 320 : 110;
  const maxLanes  = viewMode === 'week' ? 12  : MAX_LANES_MONTH;

  // ─── Drag state ───────────────────────────────────────────────────────
  // null when idle. While drag-pending: { event, startX, startY, x, y, started, hoveredDate, seg }
  const [drag, setDrag] = useState(null);
  const dragRef = useRef(drag);
  useEffect(() => { dragRef.current = drag; }, [drag]);

  // Pointer capture + global listeners while a drag is in progress
  useEffect(() => {
    if (!drag) return;

    const findCellDate = (x, y) => {
      let n = document.elementFromPoint(x, y);
      while (n && n !== document.body) {
        if (n.dataset && n.dataset.date) return n.dataset.date;
        n = n.parentElement;
      }
      return null;
    };

    const handleMove = (e) => {
      const cur = dragRef.current;
      if (!cur) return;
      const dx = e.clientX - cur.startX;
      const dy = e.clientY - cur.startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const started = cur.started || dist > DRAG_THRESHOLD_PX;
      const hoveredDate = started ? findCellDate(e.clientX, e.clientY) : null;
      setDrag({ ...cur, x: e.clientX, y: e.clientY, started, hoveredDate });
    };

    const handleUp = () => {
      const cur = dragRef.current;
      if (!cur) return;
      if (cur.started && cur.hoveredDate && cur.hoveredDate !== cur.event.start_date) {
        onMoveEvent && onMoveEvent(cur.event, cur.hoveredDate);
      } else if (!cur.started) {
        onClickEvent && onClickEvent(cur.event);
      }
      setDrag(null);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup',   handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup',   handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [drag, onMoveEvent, onClickEvent]);

  const startDrag = (e, seg) => {
    if (!canEdit) {
      // External role: clicks still allowed, drag isn't.
      onClickEvent && onClickEvent(seg.event);
      return;
    }
    e.preventDefault();
    setDrag({
      event: seg.event,
      seg,
      startX: e.clientX,
      startY: e.clientY,
      x: e.clientX,
      y: e.clientY,
      started: false,
      hoveredDate: null,
    });
  };

  // ─── Hover state for the day-cell affordance ─────────────────────────
  // Clearing is delayed a beat so a `renderDayHover` menu portaled to
  // <body> (outside this cell's DOM subtree, since the cell clips
  // overflow) survives the mouse crossing the gap to reach it — the
  // menu calls `keepAlive`/`release` on its own mouseenter/mouseleave
  // to cancel or restart that grace timer.
  const [hoverDate, setHoverDate] = useState(null);
  const hoverTimerRef = useRef(null);
  const setHoverDateSticky = (iso) => {
    if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null; }
    setHoverDate(iso);
  };
  const clearHoverDateDelayed = (iso) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setHoverDate(prev => (prev === iso ? null : prev));
    }, 200);
  };
  useEffect(() => () => { if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current); }, []);
  const isDragging = !!drag?.started;

  // ─── "+N more" day popover ──────────────────────────────────────────
  // popover = { date: ISO, anchorRect: DOMRect } | null
  const [popover, setPopover] = useState(null);
  // Close the popover automatically when the calendar view changes —
  // it is anchored to a specific cell which may no longer exist.
  useEffect(() => { setPopover(null); }, [viewMode, viewDate]);

  return (
    <div ref={containerRef} className="rounded-xl bg-white" style={{ border: '1px solid #e5e7eb' }}>
      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-1">
          <button onClick={handlePrev}  className="p-1.5 rounded hover:bg-gray-100 transition-colors" aria-label="Previous">
            <ChevronLeft size={16} style={{ color: '#6b7280' }} />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1 text-xs font-semibold rounded transition-colors"
            style={{ color: '#437E8D', border: '1px solid #437E8D', backgroundColor: 'white' }}
          >
            Today
          </button>
          <button onClick={handleNext} className="p-1.5 rounded hover:bg-gray-100 transition-colors" aria-label="Next">
            <ChevronRight size={16} style={{ color: '#6b7280' }} />
          </button>
        </div>

        <h3 className="text-sm font-semibold tracking-wide" style={{ color: '#1C1C1C' }}>
          {title}
        </h3>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
            {['month', 'week'].map(m => (
              <button
                key={m}
                onClick={() => onChangeView(m)}
                className="px-3 py-1 text-xs font-semibold transition-colors capitalize"
                style={{
                  color: viewMode === m ? '#fff' : '#6b7280',
                  backgroundColor: viewMode === m ? '#437E8D' : 'white',
                }}
              >
                {m}
              </button>
            ))}
          </div>

          {canEdit && (
            <button
              onClick={onAddEvent}
              disabled={!onAddEvent}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#A58D69' }}
            >
              <Plus size={13} />
              Add Event
            </button>
          )}
        </div>
      </div>

      {/* ── Day-of-week header ────────────────────────────────────────── */}
      <div className="grid grid-cols-7 border-b border-gray-100 text-center">
        {DAY_LABELS.map(d => (
          <div
            key={d}
            className="py-2 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: '#9ca3af' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* ── Week rows ─────────────────────────────────────────────────── */}
      {weekStarts.map((wkStart, wIdx) => {
        const segments = buildWeekSegments(events, wkStart, pillColourMode, athleteContext);
        const visible  = segments.filter(s => s.lane < maxLanes);
        const overflowByCol = {};
        segments.filter(s => s.lane >= maxLanes).forEach(s => {
          for (let c = s.startCol; c <= s.endCol; c++) {
            overflowByCol[c] = (overflowByCol[c] || 0) + 1;
          }
        });

        return (
          <div
            key={wIdx}
            className="relative grid grid-cols-7 border-b border-gray-100"
            style={{ height: rowHeight }}
          >
            {[0,1,2,3,4,5,6].map(col => {
              const day = addDays(wkStart, col);
              const iso = toISO(day);
              const inCurrentMonth = viewMode === 'week' || day.getMonth() === viewDate.getMonth();
              const isToday        = sameDay(day, today);
              const isDropTarget   = isDragging && drag?.hoveredDate === iso;
              const isHovered      = !isDragging && hoverDate === iso && inCurrentMonth && canEdit;
              const inHighlight    = highlightRange
                && iso >= highlightRange.start_date
                && iso <= highlightRange.end_date;

              const cellBg = inCurrentMonth ? 'white' : '#fafafa';
              const tint   = inHighlight && highlightRange.colour
                ? tintForColour(highlightRange.colour, 0.15)
                : null;

              return (
                <div
                  key={col}
                  data-date={iso}
                  onMouseEnter={() => !isDragging && setHoverDateSticky(iso)}
                  onMouseLeave={() => clearHoverDateDelayed(iso)}
                  className="relative px-1.5 py-1 border-r border-gray-100 overflow-hidden"
                  style={{
                    backgroundColor: cellBg,
                    outline: isToday      ? '2px solid #437E8D'
                            : isDropTarget ? '2px solid #437E8D'
                            : 'none',
                    outlineOffset: '-2px',
                    transition: 'background-color 0.12s ease',
                  }}
                >
                  {/* Block range hover tint (driven by the timeline above) */}
                  {tint && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ backgroundColor: tint, zIndex: 0 }}
                    />
                  )}

                  <div
                    className="text-[11px] font-semibold relative"
                    style={{ color: inCurrentMonth ? '#1C1C1C' : '#9ca3af', zIndex: 1 }}
                  >
                    {day.getDate()}
                  </div>

                  {/* Hover-to-add affordance — renderDayHover (training
                      content quick-add) takes priority when supplied;
                      otherwise falls back to the plain "+ Event" button. */}
                  {isHovered && renderDayHover && renderDayHover(iso, {
                    keepAlive: () => setHoverDateSticky(iso),
                    release: () => clearHoverDateDelayed(iso),
                  })}
                  {isHovered && !renderDayHover && onAddEventOnDate && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onAddEventOnDate(iso); }}
                      className="absolute top-1 right-1 flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded transition-opacity"
                      style={{
                        backgroundColor: 'rgba(67,126,141,0.10)',
                        color: '#437E8D',
                        opacity: 0.95,
                      }}
                      title="Add event on this date"
                    >
                      <Plus size={10} />
                      Event
                    </button>
                  )}

                  {/* +N more — click to open the day popover */}
                  {overflowByCol[col] > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const cellEl = e.currentTarget.parentElement;
                        setPopover({
                          date: iso,
                          anchorRect: cellEl.getBoundingClientRect(),
                        });
                      }}
                      className="absolute bottom-1 left-1.5 text-[9px] font-semibold cursor-pointer hover:underline transition-colors"
                      style={{ color: '#6b7280' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#1C1C1C'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#6b7280'; }}
                    >
                      +{overflowByCol[col]} more
                    </button>
                  )}
                </div>
              );
            })}

            {/* Pills layer */}
            <div
              className="absolute pointer-events-none"
              style={{ top: DAY_NUMBER_RESERVE, left: 0, right: 0, bottom: 0 }}
            >
              {visible.map((seg, i) => {
                const isThisDragged = drag?.started && drag.event?.id === seg.event.id;
                return (
                  <div
                    key={`${seg.event.id}-${i}`}
                    className="pointer-events-auto"
                    style={{
                      position: 'absolute',
                      top: seg.lane * (PILL_HEIGHT + PILL_GAP),
                      left: 0,
                      right: 0,
                      height: PILL_HEIGHT,
                    }}
                  >
                    <EventPill
                      seg={seg}
                      hidden={isThisDragged}
                      onPointerDown={(e) => startDrag(e, seg)}
                      onPreviewClick={(ev) => onClickEvent && onClickEvent(ev)}
                      athleteContext={athleteContext}
                      onCopyPlanned={onCopyPlanned}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Drag ghost — outside grid so it isn't clipped */}
      {drag?.started && (
        <DragGhost x={drag.x} y={drag.y} seg={drag.seg} />
      )}

      {/* Day popover (rendered via portal) */}
      {popover && (
        <DayPopover
          dateISO={popover.date}
          anchorRect={popover.anchorRect}
          events={eventsOnDate(events, popover.date)}
          pillColourMode={pillColourMode}
          athleteContext={athleteContext}
          onClickEvent={onClickEvent}
          onClose={() => setPopover(null)}
        />
      )}

      {/* Empty-state hint */}
      {events.length === 0 && (
        <div className="px-4 py-3 text-[11px] text-center" style={{ color: '#9ca3af' }}>
          No events scheduled. Click 'Add Event' to add a competition, training camp, or testing day.
        </div>
      )}
    </div>
  );
}

// Re-export helpers used by ProgrammeView (toast formatter, duration math)
export { addDays as _addDays, dayDiff as _dayDiff, parseDate as _parseDate, toISO as _toISO, formatToastDate as _formatToastDate };
