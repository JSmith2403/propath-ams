import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Dumbbell } from 'lucide-react';
import { addDaysISO, parseDate, toISO } from '../../utils/blockHelpers';
import AthleteWeekView from './AthleteWeekView';

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
  athlete,
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

  // Split weeks into three groups so the layout puts current first,
  // upcoming next, then a "Completed weeks" divider with past weeks
  // collapsed in reverse-chronological order at the bottom.
  const currentWeeks  = weeks.filter(w => w === todayMonISO);
  const upcomingWeeks = weeks.filter(w => w >  todayMonISO); // already asc
  const pastWeeks     = weeks.filter(w => w <  todayMonISO).slice().reverse();

  const renderWeek = (weekISO) => {
    const state =
      weekISO < todayMonISO ? 'past'
      : weekISO === todayMonISO ? 'current'
      : 'future';

    // Within-7-days = next week's Monday at most.
    const within7 = state === 'future'
      && parseDate(weekISO) <= parseDate(addDaysISO(todayMonISO, 7));

    // Past weeks default collapsed; current always expanded; upcoming
    // weeks default collapsed unless they fall within the next 7 days.
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
        athlete={athlete}
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
  };

  return (
    <div className="space-y-3">
      {currentWeeks.map(renderWeek)}
      {upcomingWeeks.map(renderWeek)}

      {pastWeeks.length > 0 && (
        <div className="flex items-center gap-3 pt-3 pb-1">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">
            Completed weeks
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>
      )}

      {pastWeeks.map(renderWeek)}
    </div>
  );
}

// React.forwardRef so the parent can scroll a week into view on deep link.
const WeekTile = forwardRef(function WeekTile({
  athlete, weekISO, state, isOpen, onToggle, visible, allCount,
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
        // Past weeks get a subtle wash so the eye reads "history"
        // without losing legibility on the date range.
        backgroundColor: state === 'past' ? '#fafafa' : '#fff',
        border: '1px solid #e5e7eb',
        borderLeft: `3px solid ${stateAccent}`,
        opacity: state === 'past' ? 0.92 : 1,
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

      {isOpen && (
        <div className="border-t border-gray-100">
          {athlete ? (
            <AthleteWeekView
              athlete={athlete}
              viewDate={parseDate(weekISO)}
              onChangeDate={() => {}}
              onClickPlanned={onClickPlanned}
              hideToolbar
              hideCompleted={state === 'past'}
            />
          ) : (
            <div className="px-4 py-6 text-xs italic text-gray-400">
              Loading week…
            </div>
          )}
        </div>
      )}
    </div>
  );
});
