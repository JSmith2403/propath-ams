import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { COHORTS } from '../../data/athletes';
import { colourForAthlete } from '../../utils/programmingColours';

/**
 * AthleteSidebar — collapsible left panel for the Programme calendar.
 *
 * Lists athletes that have programming_active = true, grouped by cohort
 * (Elite / Gold / Mini). Each row: colour swatch · name · checkbox.
 * Header buttons: Select all / Deselect all / Just this athlete.
 *
 * Props:
 *   athletes        full athlete array (from AthleteProfile prop)
 *   activeIds       Set<string> of athleteIds with programming_active=true
 *   currentAthleteId  the profile athlete (for "Just this athlete")
 *   selectedIds     Set<string> of currently visible athletes
 *   onChangeSelected (Set<string>) => void
 *   collapsed       boolean
 *   onToggleCollapse () => void
 */
export default function AthleteSidebar({
  athletes = [],
  activeIds,
  currentAthleteId,
  selectedIds,
  onChangeSelected,
  collapsed,
  onToggleCollapse,
}) {
  // Filter to active + group by cohort, preserving COHORTS order
  const grouped = useMemo(() => {
    const active = athletes.filter(a => activeIds.has(a.id));
    const byCohort = {};
    COHORTS.forEach(c => { byCohort[c] = []; });
    active.forEach(a => {
      const key = COHORTS.includes(a.cohort) ? a.cohort : 'Elite';
      byCohort[key].push(a);
    });
    // Sort each cohort alphabetically by name
    COHORTS.forEach(c => byCohort[c].sort((x, y) => x.name.localeCompare(y.name)));
    return byCohort;
  }, [athletes, activeIds]);

  const allActiveIds = useMemo(
    () => new Set(athletes.filter(a => activeIds.has(a.id)).map(a => a.id)),
    [athletes, activeIds],
  );

  const toggleOne = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    onChangeSelected(next);
  };
  const selectAll   = () => onChangeSelected(new Set(allActiveIds));
  const deselectAll = () => onChangeSelected(new Set());
  const justThis    = () => onChangeSelected(new Set(currentAthleteId ? [currentAthleteId] : []));

  // ─── Collapsed rail ────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <div
        className="rounded-xl bg-white flex flex-col items-center py-3 px-1"
        style={{ border: '1px solid #e5e7eb', width: 36, minWidth: 36 }}
      >
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          aria-label="Expand athletes panel"
        >
          <ChevronRight size={14} style={{ color: '#6b7280' }} />
        </button>
        <div
          className="mt-3 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            color: '#9ca3af',
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
          }}
        >
          Athletes
        </div>
      </div>
    );
  }

  // ─── Expanded panel ────────────────────────────────────────────────────
  const totalActive = allActiveIds.size;
  return (
    <div
      className="rounded-xl bg-white flex flex-col"
      style={{ border: '1px solid #e5e7eb', width: 240, minWidth: 240 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
        <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1C1C1C' }}>
          Athletes
        </h4>
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          aria-label="Collapse athletes panel"
        >
          <ChevronLeft size={14} style={{ color: '#6b7280' }} />
        </button>
      </div>

      {/* Bulk-select buttons */}
      <div className="flex flex-col gap-1 px-3 py-2 border-b border-gray-100">
        <button
          onClick={selectAll}
          className="text-[11px] font-semibold text-left hover:underline"
          style={{ color: '#437E8D' }}
        >
          Select all
        </button>
        <button
          onClick={deselectAll}
          className="text-[11px] font-semibold text-left hover:underline"
          style={{ color: '#437E8D' }}
        >
          Deselect all
        </button>
        {currentAthleteId && (
          <button
            onClick={justThis}
            className="text-[11px] font-semibold text-left hover:underline"
            style={{ color: '#437E8D' }}
          >
            Just this athlete
          </button>
        )}
      </div>

      {/* Cohort groups */}
      <div className="flex-1 overflow-y-auto">
        {totalActive === 0 ? (
          <p className="text-[11px] italic text-center px-3 py-6" style={{ color: '#9ca3af' }}>
            No athletes have programming activated yet.
          </p>
        ) : (
          COHORTS.map(cohort => {
            const list = grouped[cohort] || [];
            if (list.length === 0) return null;
            return (
              <div key={cohort}>
                <div
                  className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: '#9ca3af', backgroundColor: '#fafafa' }}
                >
                  {cohort}
                </div>
                {list.map(a => {
                  const checked = selectedIds.has(a.id);
                  const colour  = colourForAthlete(a.id);
                  return (
                    <label
                      key={a.id}
                      className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOne(a.id)}
                        className="shrink-0"
                        style={{ accentColor: colour }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: colour }}
                      />
                      <span
                        className="text-xs truncate"
                        style={{ color: checked ? '#1C1C1C' : '#6b7280' }}
                      >
                        {a.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
