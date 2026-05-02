import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronRight, Dumbbell } from 'lucide-react';
import { addDaysISO, parseDate, toISO } from '../../utils/blockHelpers';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeekMonISO(d) {
  const x = startOfDay(d);
  const dow = x.getDay();
  const offset = (dow + 6) % 7; // Mon=0..Sun=6
  x.setDate(x.getDate() - offset);
  return toISO(x);
}

function fmtRange(startISO) {
  const s = parseDate(startISO);
  const e = parseDate(addDaysISO(startISO, 6));
  const sameYear = s.getFullYear() === e.getFullYear();
  const sStr = s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const eStr = e.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: sameYear ? undefined : 'numeric',
  });
  return `${sStr} – ${eStr}`;
}

function sessionDisplayName(p) {
  const sess = p.block_sessions || {};
  return sess.session_name
    || (sess.session_order != null ? `Session ${sess.session_order + 1}` : 'Session');
}

/**
 * ProgrammeWeekList — replaces the calendar surface inside the
 * Physical Development → Programme tab. Sessions for each block are
 * grouped into Mon-anchored weeks. Visibility rules per Brief Part 4:
 *
 *   • Past weeks       — only sessions whose status ≠ completed are
 *                        shown (completed sessions live in the
 *                        Logged Sessions sub-tab).
 *   • Current week     — all sessions; completed ones are greyed +
 *                        marked with a tick.
 *   • Future weeks     — all sessions.
 *
 * Expansion defaults:
 *   • Current week     — expanded.
 *   • Future weeks within 7 days of today — expanded.
 *   • Everything else  — collapsed.
 *
 * Clicking a session row calls onClickPlanned(planned) — same handler
 * the calendar used, so the existing block-builder flow keeps working.
 *
 * If `focusDate` changes (deep link from Overview Calendar), the matching
 * week is forced expanded and scrolled into view.
 */
export default function ProgrammeWeekList({
  blocks = [],
  plannedRows = [],
  loading = false,
  onClickPlanned,
  focusDate = null,
  blockColourMap = null,
}) {
  const todayMonISO = useMemo(() => startOfWeekMonISO(new Date()), []);

  // Build the set of week-Mondays we need to render. Source = every
  // block's date span. Planned-session rows that fall outside any block
  // (rare, but possible) are also folded in so nothing disappears.
  const weeks = useMemo(() => {
    const set = new Set();
    for (const b of blocks) {
      if (!b.start_date || !b.end_date) continue;
      let cur = startOfWeekMonISO(parseDate(b.start_date));
      const last = parseDate(b.end_date);
      while (parseDate(cur) <= last) {
        set.add(cur);
        cur = addDaysISO(cur, 7);
      }
    }
    for (const p of plannedRows) {
      if (!p.planned_date) continue;
      set.add(startOfWeekMonISO(parseDate(p.planned_date)));
    }
    return Array.from(set).sort();
  }, [blocks, plannedRows]);

  // Group planned rows by their week-Monday.
  const plannedByWeek = useMemo(() => {
    const map = new Map();
    for (const p of plannedRows) {
      if (!p.planned_date) continue;
      const wk = startOfWeekMonISO(parseDate(p.planned_date));
      (map.get(wk) || map.set(wk, []).get(wk)).push(p);
    }
    return map;
  }, [plannedRows]);

  // Block lookup for the small block-name chip on each session row.
  const blockById = useMemo(() => {
    const m = {};
    for (const b of blocks) m[b.id] = b;
    return m;
  }, [blocks]);

  // Manual expand/collapse overrides keyed by week-Monday ISO.
  const [overrides, setOverrides] = useState({}); // { [weekISO]: boolean }
  const focusWeekRef = useRef({}); // weekISO -> DOM node

  // When a deep link drops a focusDate, force-expand the matching week
  // and scroll it into view.
  useEffect(() => {
    if (!focusDate) return;
    const wk = startOfWeekMonISO(focusDate);
    setOverrides(o => ({ ...o, [wk]: true }));
    // Defer one frame so the open-state has rendered before we scroll.
    const t = setTimeout(() => {
      const node = focusWeekRef.current[wk];
      if (node && typeof node.scrollIntoView === 'function') {
        node.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
    return () => clearTimeout(t);
  }, [focusDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: '#e5e7eb', borderTopColor: '#A58D69' }}
        />
      </div>
    );
  }

  if (weeks.length === 0) {
    return (
      <div className="rounded-xl p-12 text-center"
        style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}>
        <Dumbbell size={28} className="mx-auto mb-3 text-gray-300" />
        <p className="text-sm font-semibold text-gray-700 mb-1">No programme yet</p>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          Add a training block above to start building this athlete's programme.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {weeks.map(weekISO => {
        const state =
          weekISO < todayMonISO ? 'past'
          : weekISO === todayMonISO ? 'current'
          : 'future';

        // Within-7-days = next week's Monday at most.
        const within7 = state === 'future'
          && parseDate(weekISO) <= parseDate(addDaysISO(todayMonISO, 7));

        const defaultOpen = state === 'current' || within7;
        const isOpen = overrides[weekISO] ?? defaultOpen;

        const all = plannedByWeek.get(weekISO) || [];
        const visible = state === 'past'
          ? all.filter(p => p.status !== 'completed')
          : all;

        // Sort by planned_date then session_order within the day
        visible.sort((a, b) => {
          if (a.planned_date !== b.planned_date) return a.planned_date.localeCompare(b.planned_date);
          const ao = a.block_sessions?.session_order ?? 0;
          const bo = b.block_sessions?.session_order ?? 0;
          return ao - bo;
        });

        return (
          <WeekTile
            key={weekISO}
            ref={(node) => { focusWeekRef.current[weekISO] = node; }}
            weekISO={weekISO}
            state={state}
            isOpen={isOpen}
            onToggle={() => setOverrides(o => ({ ...o, [weekISO]: !isOpen }))}
            visible={visible}
            allCount={all.length}
            blockById={blockById}
            blockColourMap={blockColourMap}
            onClickPlanned={onClickPlanned}
          />
        );
      })}
    </div>
  );
}

// React.forwardRef so the parent can scroll a week into view on deep link.
const WeekTile = forwardRef(function WeekTile({
  weekISO, state, isOpen, onToggle, visible, allCount,
  blockById, blockColourMap, onClickPlanned,
}, ref) {
  const stateAccent = {
    past:    '#9ca3af',
    current: '#A58D69',
    future:  '#437E8D',
  }[state];

  const stateLabel = {
    past:    'Past',
    current: 'Current week',
    future:  'Upcoming',
  }[state];

  const hidden = allCount - visible.length;

  return (
    <div
      ref={ref}
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderLeft: `3px solid ${stateAccent}`,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        {isOpen
          ? <ChevronDown size={14} className="text-gray-400 shrink-0" />
          : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">
              Week of {fmtRange(weekISO)}
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
              style={{ color: stateAccent, backgroundColor: `${stateAccent}1A` }}
            >
              {stateLabel}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {visible.length === 0
              ? (state === 'past' && hidden > 0
                  ? `${hidden} completed — see Logged Sessions`
                  : 'No sessions')
              : `${visible.length} session${visible.length === 1 ? '' : 's'}`
                + (hidden > 0 ? ` · ${hidden} completed in Logged Sessions` : '')}
          </p>
        </div>
      </button>

      {isOpen && visible.length > 0 && (
        <ul className="border-t border-gray-100 divide-y divide-gray-100">
          {visible.map(p => {
            const isCompleted = p.status === 'completed';
            const isInProgress = p.status === 'in_progress';
            const blk = blockById[p.block_id];
            const blkColour = blockColourMap?.[p.block_id] || '#9ca3af';
            const dow = (parseDate(p.planned_date).getDay() + 6) % 7; // Mon=0
            const dayLabel = DAY_LABELS[dow];

            return (
              <li key={p.id}>
                <button
                  onClick={() => onClickPlanned && onClickPlanned(p)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                  style={isCompleted ? { opacity: 0.55 } : undefined}
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest text-gray-400 w-8 shrink-0"
                  >
                    {dayLabel}
                  </span>
                  <span
                    className="w-1.5 h-6 rounded-sm shrink-0"
                    style={{ backgroundColor: blkColour }}
                    title={blk?.block_name || ''}
                  />
                  <Dumbbell size={13} className="shrink-0" style={{ color: '#437E8D' }} />
                  <span
                    className={`flex-1 text-sm truncate ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800 font-medium'}`}
                  >
                    {sessionDisplayName(p)}
                  </span>
                  {blk?.block_name && (
                    <span className="text-[10px] text-gray-400 truncate max-w-[140px]">
                      {blk.block_name}
                    </span>
                  )}
                  {isCompleted && (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ color: '#16a34a', backgroundColor: 'rgba(22,163,74,0.1)' }}
                    >
                      <Check size={10} /> Done
                    </span>
                  )}
                  {isInProgress && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ color: '#A58D69', backgroundColor: 'rgba(165,141,105,0.12)' }}
                    >
                      In progress
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});
