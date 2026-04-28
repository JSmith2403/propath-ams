import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trophy, Tent, ClipboardList, Circle } from 'lucide-react';
import { colourForAthlete, tintForColour } from '../../utils/programmingColours';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Pill geometry (px). Adjust the day-number reservation if you change this.
const PILL_HEIGHT      = 18;
const PILL_GAP         = 3;
const DAY_NUMBER_RESERVE = 22;
const MAX_LANES_MONTH  = 3;

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
  // Expect 'YYYY-MM-DD'
  return new Date(iso + 'T00:00:00');
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

// ─── Event-type icon ─────────────────────────────────────────────────────────

function eventIcon(type, size = 11) {
  const props = { size, strokeWidth: 2 };
  switch (type) {
    case 'competition':   return <Trophy        {...props} />;
    case 'training_camp': return <Tent          {...props} />;
    case 'testing':       return <ClipboardList {...props} />;
    default:              return <Circle        {...props} />;
  }
}

// ─── Per-week segment layout with lane assignment ───────────────────────────

/**
 * For a single week (7 consecutive days starting at weekStart), compute the
 * pill segments overlapping that week. Returns array of:
 *   { event, athleteColour, startCol, endCol, leftRounded, rightRounded, lane }
 *
 * Lanes are assigned greedily: longer events first, then earliest-starting.
 */
function buildWeekSegments(events, weekStart) {
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
      athleteColour: colourForAthlete(e.athlete_id),
      startCol,
      endCol,
      leftRounded:  start >= weekStart,
      rightRounded: end   <= weekEnd,
    });
  });

  // Sort longest first (more aggressive lane allocation), then by startCol
  raw.sort((a, b) =>
    (b.endCol - b.startCol) - (a.endCol - a.startCol) ||
    a.startCol - b.startCol);

  // Greedy lane assignment
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

// ─── Pill component ──────────────────────────────────────────────────────────

function EventPill({ seg, height = PILL_HEIGHT, onClick }) {
  const { event, athleteColour, leftRounded, rightRounded } = seg;
  const tint = tintForColour(athleteColour, 0.16);
  const radius = 4;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick && onClick(event); }}
      className="absolute flex items-center gap-1 px-1.5 overflow-hidden text-[10px] font-semibold cursor-pointer transition-opacity hover:opacity-80"
      style={{
        left: `calc(${(seg.startCol / 7) * 100}% + 2px)`,
        width: `calc(${((seg.endCol - seg.startCol + 1) / 7) * 100}% - 4px)`,
        top: 0,
        height,
        backgroundColor: tint,
        color: athleteColour,
        borderLeft: leftRounded ? `2px solid ${athleteColour}` : 'none',
        borderTopLeftRadius:    leftRounded  ? radius : 0,
        borderBottomLeftRadius: leftRounded  ? radius : 0,
        borderTopRightRadius:   rightRounded ? radius : 0,
        borderBottomRightRadius:rightRounded ? radius : 0,
        textAlign: 'left',
        whiteSpace: 'nowrap',
      }}
      title={event.event_name}
    >
      {leftRounded && (
        <span className="shrink-0 flex items-center" style={{ color: athleteColour }}>
          {eventIcon(event.event_type)}
        </span>
      )}
      <span className="flex-1 truncate">{event.event_name}</span>
      {leftRounded && event.event_type === 'competition' && event.priority && (
        <span
          className="shrink-0 inline-flex items-center justify-center text-[9px] font-bold rounded-sm"
          style={{
            backgroundColor: athleteColour,
            color: '#fff',
            width: 13,
            height: 13,
            lineHeight: 1,
          }}
        >
          {event.priority}
        </span>
      )}
    </button>
  );
}

// ─── Main calendar ───────────────────────────────────────────────────────────

/**
 * ProgrammeCalendar — month / week grid with multi-day event pills.
 *
 * Used by both Surface 1 (single-athlete inside profile) and Surface 2
 * (top-level master view across many athletes). Surface decides which
 * events to pass in.
 */
export default function ProgrammeCalendar({
  viewMode, onChangeView,
  viewDate, onChangeDate,
  canEdit = true,
  onAddEvent,
  events = [],
  onClickEvent,
}) {
  const today = useMemo(() => startOfDay(new Date()), []);

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

  return (
    <div className="rounded-xl bg-white" style={{ border: '1px solid #e5e7eb' }}>
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
        const segments = buildWeekSegments(events, wkStart);
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
            {/* Day cells (background) */}
            {[0,1,2,3,4,5,6].map(col => {
              const day = addDays(wkStart, col);
              const inCurrentMonth = viewMode === 'week' || day.getMonth() === viewDate.getMonth();
              const isToday        = sameDay(day, today);
              return (
                <div
                  key={col}
                  className="relative px-1.5 py-1 border-r border-gray-100 overflow-hidden"
                  style={{
                    backgroundColor: inCurrentMonth ? 'white' : '#fafafa',
                    outline: isToday ? '2px solid #437E8D' : 'none',
                    outlineOffset: '-2px',
                  }}
                >
                  <div
                    className="text-[11px] font-semibold"
                    style={{ color: inCurrentMonth ? '#1C1C1C' : '#9ca3af' }}
                  >
                    {day.getDate()}
                  </div>

                  {/* +N more indicator */}
                  {overflowByCol[col] > 0 && (
                    <div
                      className="absolute bottom-1 left-1.5 text-[9px] font-semibold"
                      style={{ color: '#6b7280' }}
                    >
                      +{overflowByCol[col]} more
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pills layer (absolute over the row, below the day numbers) */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: DAY_NUMBER_RESERVE,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              {visible.map((seg, i) => (
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
                  <EventPill seg={seg} onClick={onClickEvent} />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Empty-state hint */}
      {events.length === 0 && (
        <div className="px-4 py-3 text-[11px] text-center" style={{ color: '#9ca3af' }}>
          No events scheduled. Click 'Add Event' to add a competition, training camp, or testing day.
        </div>
      )}
    </div>
  );
}
