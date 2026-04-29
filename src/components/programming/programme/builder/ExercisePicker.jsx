import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronRight, Dumbbell, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { useExerciseLibrary } from '../../../../hooks/useExerciseLibrary';
import { useRecentExercises } from '../../../../hooks/useRecentExercises';
import {
  BILATERAL,
  COMPLEXITY,
  EQUIPMENT,
  MOVEMENT_PATTERNS,
  POSTERIOR_ANTERIOR,
} from './pickerVocab';
import CreateExerciseModal from './CreateExerciseModal';

const TABS = [
  { id: 'all',       label: 'All'        },
  { id: 'strength',  label: 'Strength'   },
  { id: 'accessory', label: 'Accessory'  },
  { id: 'capacity',  label: 'Capacity'   },
  { id: 'mobility',  label: 'Mobility'   },
  { id: 'warm_up',   label: 'Warm-up'    },
];

const CATEGORY_ORDER = ['warm_up','strength','power','ballistic','jumps_plyos','capacity','speed','mobility','accessory'];

const CATEGORY_LABEL = {
  warm_up:     'Warm-up',
  strength:    'Strength',
  power:       'Power',
  ballistic:   'Ballistic',
  jumps_plyos: 'Jumps & plyos',
  capacity:    'Capacity',
  speed:       'Speed',
  mobility:    'Mobility',
  accessory:   'Accessory',
};

function pretty(s) {
  if (!s) return '';
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const COMPLEXITY_TINT = {
  1: { bg: 'rgba(34,197,94,0.14)',  fg: '#15803d' },
  2: { bg: 'rgba(245,158,11,0.16)', fg: '#a16207' },
  3: { bg: 'rgba(220,38,38,0.14)',  fg: '#b91c1c' },
};

const EMPTY_FILTERS = () => ({
  movement:   new Set(),
  equipment:  new Set(),
  complexity: new Set(),
  bilateral:  new Set(),
  posterior:  new Set(),
});

function totalFilterCount(filters) {
  return filters.movement.size + filters.equipment.size + filters.complexity.size
       + filters.bilateral.size + filters.posterior.size;
}

/**
 * ExercisePicker — Output-style side panel.
 *
 * Slides in from the right; the session builder modal stays mounted
 * behind it. Click "+ Add exercise" anywhere in the builder to open
 * this panel for that section. Stays open after each add for batching.
 *
 * Checkpoint 5.3 adds:
 *   - Filters sub-panel (movement / equipment / complexity / bilateral / posterior)
 *   - Active count badge
 *   - + Create custom exercise modal with library refresh on save
 */
export default function ExercisePicker({
  sessionLabel,
  onAdd,
  onAddNote,
  onClose,
}) {
  const [noteAdded, setNoteAdded] = useState(false);
  const noteTimer = useRef(null);
  useEffect(() => () => { if (noteTimer.current) clearTimeout(noteTimer.current); }, []);
  const handleNoteClick = () => {
    if (!onAddNote) return;
    onAddNote();
    setNoteAdded(true);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNoteAdded(false), 1100);
  };
  const { exercises, loading, refresh } = useExerciseLibrary();
  const { recent, recordAdd } = useRecentExercises();
  const [query,    setQuery]    = useState('');
  const [category, setCategory] = useState('all');
  const [filters,  setFilters]  = useState(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createOpen,  setCreateOpen]  = useState(false);
  const [confirmAddId, setConfirmAddId] = useState(null);
  const confirmTimer = useRef(null);
  const inputRef = useRef(null);

  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    if (inputRef.current) inputRef.current.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => () => {
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
  }, []);

  const totalActive = exercises.length;
  const filterCount = totalFilterCount(filters);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let next = exercises;
    if (category !== 'all') next = next.filter(e => e.category === category);
    if (q)                  next = next.filter(e => (e.name || '').toLowerCase().includes(q));
    if (filters.movement.size > 0) {
      next = next.filter(e => (e.movement_patterns || []).some(p => filters.movement.has(p)));
    }
    if (filters.equipment.size > 0) {
      next = next.filter(e => (e.equipment || []).some(eq => filters.equipment.has(eq)));
    }
    if (filters.complexity.size > 0) {
      next = next.filter(e => filters.complexity.has(e.complexity));
    }
    if (filters.bilateral.size > 0) {
      next = next.filter(e => filters.bilateral.has(e.bilateral_unilateral));
    }
    if (filters.posterior.size > 0) {
      next = next.filter(e => filters.posterior.has(e.posterior_anterior));
    }
    return next;
  }, [exercises, query, category, filters]);

  const isFlat = !!query.trim() || category !== 'all' || filterCount > 0;
  const grouped = useMemo(() => {
    if (isFlat) return null;
    const buckets = new Map();
    for (const ex of filtered) {
      const key = ex.category || 'other';
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(ex);
    }
    const ordered = CATEGORY_ORDER
      .filter(k => buckets.has(k))
      .map(k => [k, buckets.get(k)]);
    const extras = [...buckets.keys()].filter(k => !CATEGORY_ORDER.includes(k)).sort();
    extras.forEach(k => ordered.push([k, buckets.get(k)]));
    return ordered;
  }, [filtered, isFlat]);

  const handleAdd = (ex) => {
    if (onAdd) onAdd(ex);
    recordAdd(ex.id);
    setConfirmAddId(ex.id);
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    confirmTimer.current = setTimeout(() => setConfirmAddId(null), 1100);
  };

  // Recent section visibility — only on the fresh state (no search,
  // no filters, "All" tab). Resolve recent ids back to exercise rows
  // and skip any that have since been deactivated or deleted.
  const showRecent = !query.trim() && category === 'all' && filterCount === 0 && recent.length > 0;
  const recentRows = useMemo(() => {
    if (!showRecent) return [];
    const byId = new Map(exercises.map(e => [e.id, e]));
    return recent.map(r => byId.get(r.id)).filter(Boolean);
  }, [showRecent, recent, exercises]);

  const clearAll = () => {
    setQuery('');
    setCategory('all');
    setFilters(EMPTY_FILTERS());
  };

  const toggleFilter = (dim, value) => {
    setFilters(prev => {
      const next = { ...prev, [dim]: new Set(prev[dim]) };
      if (next[dim].has(value)) next[dim].delete(value);
      else                      next[dim].add(value);
      return next;
    });
  };

  const widthPx = 460;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[95] transition-opacity"
        style={{ backgroundColor: 'rgba(0,0,0,0.18)', opacity: entered ? 1 : 0 }}
      />
      <aside
        role="dialog"
        aria-label="Exercise picker"
        className="fixed top-0 right-0 bottom-0 z-[100] bg-white shadow-2xl flex flex-col"
        style={{
          width: widthPx,
          transform: entered ? 'translateX(0)' : `translateX(${widthPx}px)`,
          transition: 'transform 250ms ease-in-out',
          borderLeft: '1px solid #e5e7eb',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold" style={{ color: '#1C1C1C' }}>Exercises</h2>
            {sessionLabel && (
              <p className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>
                Add to {sessionLabel}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 text-gray-400" aria-label="Close picker">
            <X size={16} />
          </button>
        </div>

        {/* Search + Create */}
        <div className="flex items-center gap-2 px-4 pt-3 shrink-0">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:border-gray-400"
            />
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-md transition-colors hover:opacity-90"
            style={{ color: '#A58D69', backgroundColor: 'rgba(165,141,105,0.10)' }}
          >
            <Plus size={12} />
            Create
          </button>
        </div>

        {/* Category tabs + Filters trigger */}
        <div className="flex items-center gap-1.5 flex-wrap px-4 pt-3 pb-2 shrink-0">
          {TABS.map(c => {
            const active = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors"
                style={{
                  backgroundColor: active ? '#437E8D' : '#f3f4f6',
                  color:           active ? '#fff'    : '#1C1C1C',
                }}
              >
                {c.label}
              </button>
            );
          })}
          <div className="flex-1" />
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors"
            style={{
              color:           filterCount > 0 ? '#fff' : '#1C1C1C',
              backgroundColor: filterCount > 0 ? '#437E8D' : '#f3f4f6',
            }}
          >
            <SlidersHorizontal size={11} />
            Filters{filterCount > 0 ? ` (${filterCount})` : ''}
            {filtersOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </button>
        </div>

        {/* Filters sub-panel */}
        {filtersOpen && (
          <FiltersPanel
            filters={filters}
            onToggle={toggleFilter}
            onClear={() => setFilters(EMPTY_FILTERS())}
            onDone={() => setFiltersOpen(false)}
          />
        )}

        {/* Result count */}
        <div className="px-4 py-2 border-y border-gray-100 shrink-0">
          <p className="text-[11px]" style={{ color: '#6b7280' }}>
            Showing <span className="font-semibold" style={{ color: '#1C1C1C' }}>{filtered.length}</span> of {totalActive} exercises
          </p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="text-xs text-center py-8" style={{ color: '#9ca3af' }}>Loading library…</div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 px-6">
              <p className="text-xs" style={{ color: '#6b7280' }}>
                No exercises match these filters.
              </p>
              <button
                onClick={clearAll}
                className="mt-3 text-[11px] font-semibold underline"
                style={{ color: '#A58D69' }}
              >
                Clear all
              </button>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            isFlat ? (
              <div className="py-1">
                {filtered.map(ex => (
                  <ExerciseRow
                    key={ex.id}
                    exercise={ex}
                    onAdd={() => handleAdd(ex)}
                    confirmed={confirmAddId === ex.id}
                  />
                ))}
              </div>
            ) : (
              <div>
                {recentRows.length > 0 && (
                  <section className="py-2 border-b border-gray-100" style={{ backgroundColor: '#FAFBFC' }}>
                    <div className="px-4 pb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>
                      Recent
                    </div>
                    <div className="px-4 flex flex-wrap gap-1.5">
                      {recentRows.map(ex => (
                        <button
                          key={`recent-${ex.id}`}
                          type="button"
                          onClick={() => handleAdd(ex)}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors hover:opacity-90"
                          style={{
                            backgroundColor: confirmAddId === ex.id ? 'rgba(34,197,94,0.14)' : 'rgba(67,126,141,0.10)',
                            color:           confirmAddId === ex.id ? '#15803d' : '#437E8D',
                          }}
                          title={ex.name}
                        >
                          {confirmAddId === ex.id ? '✓ Added' : ex.name}
                        </button>
                      ))}
                    </div>
                  </section>
                )}
                {grouped.map(([cat, list]) => (
                  <section key={cat}>
                    <div
                      className="sticky top-0 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: '#6b7280', backgroundColor: '#fafbfc', borderBottom: '1px solid #f3f4f6', zIndex: 1 }}
                    >
                      {CATEGORY_LABEL[cat] || pretty(cat)}
                    </div>
                    {list.map(ex => (
                      <ExerciseRow
                        key={ex.id}
                        exercise={ex}
                        onAdd={() => handleAdd(ex)}
                        confirmed={confirmAddId === ex.id}
                      />
                    ))}
                  </section>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer — other steps */}
        <div className="border-t border-gray-100 px-4 py-3 shrink-0 bg-white">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#9ca3af' }}>
            Other steps
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNoteClick}
              disabled={!onAddNote}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                color: noteAdded ? '#15803d' : '#A58D69',
                backgroundColor: noteAdded ? 'rgba(34,197,94,0.14)' : 'rgba(165,141,105,0.10)',
              }}
            >
              {noteAdded ? <Check size={12} /> : <Plus size={12} />}
              {noteAdded ? 'Added' : 'Note'}
            </button>
            <button
              disabled
              title="Video steps land in a future brief"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md cursor-not-allowed opacity-50"
              style={{ color: '#6b7280', backgroundColor: '#f3f4f6' }}
            >
              <Plus size={12} />
              Video
              <span className="text-[9px] uppercase tracking-wider px-1 py-0.5 rounded" style={{ backgroundColor: '#fff', color: '#9ca3af' }}>
                Coming soon
              </span>
            </button>
          </div>
        </div>
      </aside>

      {createOpen && (
        <CreateExerciseModal
          onCreated={() => refresh()}
          onClose={() => setCreateOpen(false)}
        />
      )}
    </>
  );
}

// ─── ExerciseRow ───────────────────────────────────────────────────────
function ExerciseRow({ exercise, onAdd, confirmed }) {
  const ex = exercise;
  const equipment = ex.equipment || [];
  const equipmentLabel = equipment.length === 0
    ? null
    : equipment.length <= 2
      ? equipment.map(pretty).join(', ')
      : `${equipment.slice(0, 2).map(pretty).join(', ')} +${equipment.length - 2}`;
  const movement = (ex.movement_patterns || [])[0] || null;
  const tint = ex.complexity ? COMPLEXITY_TINT[ex.complexity] : null;

  return (
    <button
      type="button"
      onClick={onAdd}
      className="group w-full text-left flex items-stretch gap-3 px-4 py-2.5 hover:bg-[#FAFAFA] transition-colors border-b border-gray-50"
    >
      <div
        className="shrink-0 flex items-center justify-center mt-0.5"
        style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: 'rgba(67,126,141,0.08)' }}
      >
        <Dumbbell size={13} style={{ color: '#437E8D' }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>
            {CATEGORY_LABEL[ex.category] || pretty(ex.category)}
          </span>
        </div>
        <div className="text-sm font-medium truncate" style={{ color: '#1C1C1C' }} title={ex.name}>
          {ex.name}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 text-[10px]" style={{ color: '#6b7280' }}>
          {movement && <span>{pretty(movement)}</span>}
          {movement && equipmentLabel && <span style={{ color: '#d1d5db' }}>·</span>}
          {equipmentLabel && <span>{equipmentLabel}</span>}
          {(movement || equipmentLabel) && ex.bilateral_unilateral && <span style={{ color: '#d1d5db' }}>·</span>}
          {ex.bilateral_unilateral && <span>{pretty(ex.bilateral_unilateral)}</span>}
          {tint && (
            <>
              <span style={{ color: '#d1d5db' }}>·</span>
              <span
                className="inline-flex items-center justify-center text-[9px] font-bold rounded-full"
                style={{ width: 14, height: 14, backgroundColor: tint.bg, color: tint.fg }}
                title={`Complexity ${ex.complexity}`}
              >
                {ex.complexity}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="shrink-0 self-center">
        {confirmed ? (
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold"
            style={{ backgroundColor: 'rgba(34,197,94,0.14)', color: '#15803d' }}
          >
            <Check size={11} />
            Added
          </span>
        ) : (
          <span
            className="inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-semibold transition-colors group-hover:opacity-90"
            style={{ backgroundColor: '#437E8D', color: '#fff', minWidth: 64 }}
          >
            Add
          </span>
        )}
      </div>
    </button>
  );
}

// ─── FiltersPanel ──────────────────────────────────────────────────────
// Pushes down from below the category tabs. Five collapsible sections.
function FiltersPanel({ filters, onToggle, onClear, onDone }) {
  return (
    <div
      className="border-b border-gray-100 shrink-0 overflow-y-auto"
      style={{ maxHeight: '46vh', backgroundColor: '#FAFBFC' }}
    >
      <FilterSection
        title="Movement pattern"
        options={MOVEMENT_PATTERNS}
        selected={filters.movement}
        onToggle={(v) => onToggle('movement', v)}
        defaultOpen
      />
      <FilterSection
        title="Equipment"
        options={EQUIPMENT}
        selected={filters.equipment}
        onToggle={(v) => onToggle('equipment', v)}
      />
      <FilterSection
        title="Complexity"
        options={COMPLEXITY}
        selected={filters.complexity}
        onToggle={(v) => onToggle('complexity', v)}
        defaultOpen
      />
      <FilterSection
        title="Bilateral / Unilateral"
        options={BILATERAL}
        selected={filters.bilateral}
        onToggle={(v) => onToggle('bilateral', v)}
        defaultOpen
      />
      <FilterSection
        title="Posterior / Anterior"
        options={POSTERIOR_ANTERIOR}
        selected={filters.posterior}
        onToggle={(v) => onToggle('posterior', v)}
        defaultOpen
      />

      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100">
        <button
          onClick={onClear}
          className="text-[11px] font-semibold"
          style={{ color: '#dc2626' }}
        >
          Clear filters
        </button>
        <button
          onClick={onDone}
          className="px-3 py-1.5 text-[11px] font-semibold text-white rounded transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#437E8D' }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

function FilterSection({ title, options, selected, onToggle, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const count = options.reduce((n, [v]) => n + (selected.has(v) ? 1 : 0), 0);

  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>
          {title}
          {count > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px]" style={{ backgroundColor: '#437E8D', color: '#fff' }}>
              {count}
            </span>
          )}
        </span>
        {open ? <ChevronDown size={12} style={{ color: '#9ca3af' }} /> : <ChevronRight size={12} style={{ color: '#9ca3af' }} />}
      </button>
      {open && (
        <div className="px-4 pb-2 flex items-center gap-1 flex-wrap">
          {options.map(([v, l]) => {
            const active = selected.has(v);
            return (
              <button
                key={v}
                onClick={() => onToggle(v)}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors"
                style={{
                  backgroundColor: active ? '#437E8D' : '#fff',
                  color:           active ? '#fff'    : '#1C1C1C',
                  border: '1px solid ' + (active ? '#437E8D' : '#e5e7eb'),
                }}
              >
                {l}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
