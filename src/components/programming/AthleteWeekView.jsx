import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, MoreVertical, RotateCcw, StickyNote } from 'lucide-react';
import { addDaysISO, parseDate, toISO } from '../../utils/blockHelpers';
import { usePlannedWeekDetail } from '../../hooks/usePlannedWeekDetail';
import {
  replaceExerciseFromWeek,
  clearExerciseOverrideFromWeek,
} from '../../utils/programmeTemplates';
import ExercisePicker from './programme/builder/ExercisePicker';

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

function startOfWeekMon(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay();
  const offset = (dow + 6) % 7; // Mon=0..Sun=6
  d.setDate(d.getDate() - offset);
  return d;
}

function isoEqual(a, b) { return a === b; }

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
 * AthleteWeekView — TeamBuildr-style week layout for the per-athlete
 * calendar. Seven day columns; each column lists planned-session
 * cards expanded into letter-grouped exercises with sets × reps.
 *
 * Click a card → opens the session builder for that block (existing
 * Brief 5a flow handled by the parent).
 */
export default function AthleteWeekView({
  athlete,
  viewDate,
  onChangeDate,
  onChangeView,    // (mode) → switches month/week toggle on the parent
  onClickPlanned,  // (planned) → opens session builder
  // ── Embed-mode props ────────────────────────────────────────────────
  // When `hideToolbar` is true, the prev/next/today/month-week controls
  // are not rendered. Use this when the parent already owns the week
  // selection (e.g. ProgrammeWeekList expanded tile).
  hideToolbar = false,
  // When `hideCompleted` is true, sessions whose status === 'completed'
  // are filtered out before the grid renders. Used for past weeks
  // inside the week-by-week list — completed sessions live in the
  // Logged Sessions sub-tab.
  hideCompleted = false,
  // When provided, sessions whose id appears here render with reduced
  // opacity + a "Done" tick. Used for the current week so the grid
  // shows everything but visually distinguishes the completed ones.
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
  const refresh = () => setRefreshTick(n => n + 1);
  const { planned, loading } = usePlannedWeekDetail(athlete.id, fromISO, toISO_, refreshTick);

  // Replace-from-week state
  const [replaceTarget, setReplaceTarget] = useState(null); // { exercise (item), sessionName }
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
    else        console.error('[AthleteWeekView] replace failed', res.error);
  };
  const handleClearOverride = async (exercise) => {
    const res = await clearExerciseOverrideFromWeek({
      sessionExerciseId: exercise.session_exercise_id,
      fromWeek:          exercise.week_number,
    });
    if (res.ok) refresh();
  };

  const plannedByDate = useMemo(() => {
    const m = new Map();
    for (const p of planned) {
      // Embed-mode: drop completed sessions for past weeks (they live
      // in the Logged Sessions sub-tab now).
      if (hideCompleted && p.status === 'completed') continue;
      if (!m.has(p.planned_date)) m.set(p.planned_date, []);
      m.get(p.planned_date).push(p);
    }
    // Stable order: by session_order within each day
    for (const list of m.values()) list.sort((a, b) => a.session_order - b.session_order);
    return m;
  }, [planned, hideCompleted]);

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

  return (
    <div
      className={hideToolbar ? 'bg-white' : 'rounded-xl bg-white'}
      style={hideToolbar ? undefined : { border: '1px solid #e5e7eb' }}
    >
      {/* Toolbar — hidden in embed mode (parent owns week selection) */}
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

        {/* Month / Week toggle */}
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

      {/* Picker overlay used to pick the replacement exercise */}
      {replaceTarget && (
        <ExercisePicker
          sessionLabel={`Replace ${replaceTarget.exercise.name} from Wk ${replaceTarget.exercise.week_number}`}
          onAdd={handleReplaceConfirm}
          onClose={() => setReplaceTarget(null)}
        />
      )}

      {/* 7-day grid */}
      <div className="grid grid-cols-7" style={{ minHeight: 360 }}>
        {days.map((dayISO, i) => {
          const sessions = plannedByDate.get(dayISO) || [];
          const isToday = dayISO === todayISO;
          const d = parseDate(dayISO);
          return (
            <div
              key={dayISO}
              className="flex flex-col"
              style={{
                borderRight: i < 6 ? '1px solid #f3f4f6' : 'none',
                backgroundColor: isToday ? 'rgba(67,126,141,0.03)' : '#fff',
              }}
            >
              <div
                className="px-3 py-2"
                style={{
                  borderBottom: '1px solid #f3f4f6',
                  backgroundColor: isToday ? 'rgba(67,126,141,0.06)' : 'transparent',
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

              <div className="flex-1 px-2 py-2 space-y-2">
                {loading && (
                  <div className="text-[10px] italic" style={{ color: '#9ca3af' }}>Loading…</div>
                )}
                {!loading && sessions.length === 0 && (
                  <div className="text-[10px] italic" style={{ color: '#cbd5e1' }}>No session</div>
                )}
                {!loading && sessions.map(s => {
                  const dim = (dimCompletedIds && dimCompletedIds.has(s.id))
                    || (s.status === 'completed' && !hideCompleted);
                  return (
                    <SessionCard
                      key={s.id}
                      session={s}
                      dim={dim}
                      onClick={() => onClickPlanned && onClickPlanned(s)}
                      onRequestReplace={(item) => setReplaceTarget({ exercise: item, sessionName: s.session_name })}
                      onClearOverride={(item) => handleClearOverride(item)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SessionCard ────────────────────────────────────────────────────
function SessionCard({ session, onClick, onRequestReplace, onClearOverride, dim = false }) {
  // The card itself acts as a button (click → builder), but inner
  // controls (per-exercise menus) need to stop propagation so they
  // don't also trigger the card click.
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      className="block w-full text-left rounded-lg transition-shadow hover:shadow-sm cursor-pointer"
      style={{
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        opacity: dim ? 0.55 : 1,
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
        title={is_overridden ? 'Replaced from this week' : undefined}
      >
        {letter}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold truncate flex items-center gap-1" style={{ color: '#1C1C1C' }} title={name}>
          {name}
          {is_overridden && (
            <span
              className="text-[8px] uppercase tracking-wider px-1 py-0.5 rounded shrink-0"
              style={{ backgroundColor: 'rgba(165,141,105,0.14)', color: '#A58D69' }}
            >
              swapped
            </span>
          )}
        </div>
        {setsRepsLine && (
          <div className="text-[10px] tabular-nums" style={{ color: '#6b7280' }}>
            {setsRepsLine}
          </div>
        )}
      </div>

      <div ref={menuRef} className="shrink-0 relative">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
          className="opacity-0 group-hover/exrow:opacity-100 hover:opacity-100 p-1 rounded hover:bg-gray-100 transition-opacity"
          style={{ color: '#9ca3af' }}
          title="Exercise actions"
        >
          <MoreVertical size={11} />
        </button>
        {menuOpen && (
          <div
            className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg py-1 z-30"
            style={{ border: '1px solid #e5e7eb', minWidth: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
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

// ISO week number — Mon-start, week-of-year. Approximates close enough
// for the calendar header label.
function weekNumber(d) {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  return 1 + Math.ceil((firstThursday - target) / 604800000);
}
