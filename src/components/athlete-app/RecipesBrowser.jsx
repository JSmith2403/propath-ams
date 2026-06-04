import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Clock, SlidersHorizontal, Users, X } from 'lucide-react';
import { useRecipes } from '../../hooks/useRecipes';

const GOLD = '#A58D69';

const FILTERS = [
  { id: 'all',       label: 'All'       },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch',     label: 'Lunch'     },
  { id: 'snack',     label: 'Snack'     },
  { id: 'dinner',    label: 'Dinner'    },
];

const SNACK_TIMINGS = [
  { id: 'all',           label: 'Any time'     },
  { id: 'pre_training',  label: 'Pre-Training'  },
  { id: 'post_training', label: 'Post-Training' },
  { id: 'anytime',       label: 'Anytime'       },
];

const DIET_TYPES = [
  { id: 'all',         label: 'Any diet'    },
  { id: 'poultry',     label: 'Poultry'     },
  { id: 'pescatarian', label: 'Pescatarian' },
  { id: 'vegetarian',  label: 'Vegetarian'  },
  { id: 'vegan',       label: 'Vegan'       },
];

const SNACK_TIMING_LABEL = {
  pre_training:  'Pre-Training',
  post_training: 'Post-Training',
  anytime:       'Anytime',
};

const DIET_TYPE_LABEL = {
  poultry:     'Poultry',
  pescatarian: 'Pescatarian',
  vegetarian:  'Vegetarian',
  vegan:       'Vegan',
};

/**
 * RecipesBrowser — full-screen athlete-facing recipe list. Filter
 * pills along the top, grid of cards, click a card to open the
 * detail sheet (ingredients + steps + times). Driven by the same
 * useRecipes hook the coach admin uses, activeOnly=true.
 */
export default function RecipesBrowser({ onClose }) {
  const [filter,      setFilter]      = useState('all');
  const [snackTiming, setSnackTiming] = useState('all');
  const [dietType,    setDietType]    = useState('all');
  const [filterOpen,  setFilterOpen]  = useState(false);
  const { recipes, loading } = useRecipes({
    mealType: filter, snackTiming, dietType, activeOnly: true,
  });
  const [open, setOpen] = useState(null); // open recipe

  // Snack-timing is only meaningful when the meal filter is "Snack"
  // or "All" — otherwise it resets so it doesn't carry a stale value
  // into the next view.
  const showSnackTiming = filter === 'snack' || filter === 'all';
  useEffect(() => {
    if (!showSnackTiming) setSnackTiming('all');
  }, [showSnackTiming]);

  const activeFilterCount =
    (filter      !== 'all' ? 1 : 0) +
    (snackTiming !== 'all' && showSnackTiming ? 1 : 0) +
    (dietType    !== 'all' ? 1 : 0);

  const resetFilters = () => {
    setFilter('all');
    setSnackTiming('all');
    setDietType('all');
  };

  const grouped = useMemo(() => recipes, [recipes]);

  return (
    <div className="fixed inset-0 z-[60] bg-ink-50 overflow-y-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-[480px] mx-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-ink-100 px-4 py-3 flex items-center gap-3">
          <button onClick={onClose} className="p-1.5 rounded hover:bg-ink-50" aria-label="Back">
            <ArrowLeft size={18} className="text-ink-500" />
          </button>
          <h2 className="text-base font-bold text-ink-900 flex-1">Recipes</h2>
          <button
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
            style={{
              color:           activeFilterCount ? GOLD : '#6b7280',
              backgroundColor: activeFilterCount ? 'rgba(165,141,105,0.10)' : '#fff',
              borderColor:     activeFilterCount ? GOLD : '#e5e7eb',
            }}
          >
            <SlidersHorizontal size={12} />
            Filter
            {activeFilterCount > 0 && (
              <span
                className="inline-flex items-center justify-center text-[10px] font-bold text-white rounded-full"
                style={{ backgroundColor: GOLD, width: 16, height: 16 }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Grid */}
        <div className="px-4 py-4 grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {loading ? (
            <div className="col-span-2 py-12 text-center text-xs text-ink-400 italic">Loading recipes…</div>
          ) : grouped.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-xs italic text-ink-400">
              No recipes yet — your coach hasn't added any in this category.
            </div>
          ) : grouped.map(r => (
            <button
              key={r.id}
              onClick={() => setOpen(r)}
              className="rounded-xl bg-white border border-ink-100 overflow-hidden text-left active:scale-[0.99] transition-all"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <div className="aspect-[4/3] flex items-center justify-center" style={{ backgroundColor: 'rgba(165,141,105,0.08)' }}>
                {r.image_url
                  ? <img src={r.image_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: GOLD }}>{r.meal_type}</span>}
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-ink-900 line-clamp-2 leading-snug">{r.title}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {r.meal_type === 'snack' && r.snack_timing && (
                    <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded"
                          style={{ color: GOLD, backgroundColor: 'rgba(165,141,105,0.12)' }}>
                      {SNACK_TIMING_LABEL[r.snack_timing]}
                    </span>
                  )}
                  {r.diet_type && (
                    <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded"
                          style={{ color: '#0f766e', backgroundColor: 'rgba(15,118,110,0.12)' }}>
                      {DIET_TYPE_LABEL[r.diet_type]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-ink-500">
                  {r.prep_time_min != null && <span className="inline-flex items-center gap-0.5"><Clock size={9} /> {r.prep_time_min + (r.cook_time_min || 0)}m</span>}
                  {r.servings != null && <span className="inline-flex items-center gap-0.5"><Users size={9} /> {r.servings}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {open && <RecipeSheet recipe={open} onClose={() => setOpen(null)} />}

      {filterOpen && (
        <FilterSheet
          filter={filter}             setFilter={setFilter}
          snackTiming={snackTiming}   setSnackTiming={setSnackTiming}
          dietType={dietType}         setDietType={setDietType}
          showSnackTiming={showSnackTiming}
          onReset={resetFilters}
          onClose={() => setFilterOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Filter sheet (bottom-anchored on mobile) ───────────────────────
function FilterSheet({
  filter, setFilter, snackTiming, setSnackTiming,
  dietType, setDietType, showSnackTiming, onReset, onClose,
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center"
         style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white w-full shadow-2xl"
           style={{
             maxWidth: 480,
             borderTopLeftRadius: 24, borderTopRightRadius: 24,
             paddingBottom: 'env(safe-area-inset-bottom)',
           }}>
        <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
          <p className="text-base font-bold text-ink-900">Filters</p>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-ink-50"><X size={18} className="text-ink-500" /></button>
        </div>

        <div className="px-5 py-4 space-y-5 max-h-[70dvh] overflow-y-auto">
          <SheetGroup label="Meal type">
            <Chips options={FILTERS} value={filter} onChange={setFilter} />
          </SheetGroup>

          {showSnackTiming && (
            <SheetGroup label="Snack timing">
              <Chips options={SNACK_TIMINGS} value={snackTiming} onChange={setSnackTiming} />
            </SheetGroup>
          )}

          <SheetGroup label="Dietary">
            <Chips options={DIET_TYPES} value={dietType} onChange={setDietType} />
          </SheetGroup>
        </div>

        <div className="px-5 py-3 border-t border-ink-100 flex items-center justify-between gap-2">
          <button onClick={onReset}
                  className="text-xs font-semibold text-ink-500 px-3 py-2">
            Reset all
          </button>
          <button onClick={onClose}
                  className="flex-1 text-sm font-bold text-white py-3 rounded-lg"
                  style={{ backgroundColor: GOLD }}>
            Show recipes
          </button>
        </div>
      </div>
    </div>
  );
}

function SheetGroup({ label, children }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest font-bold text-ink-400 mb-2">{label}</p>
      {children}
    </div>
  );
}

function Chips({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors"
            style={{
              color:           on ? '#fff' : '#6b7280',
              backgroundColor: on ? GOLD : '#fff',
              borderColor:     on ? GOLD : '#e5e7eb',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Recipe detail sheet ────────────────────────────────────────────
function RecipeSheet({ recipe, onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center"
         style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white w-full sm:max-w-md shadow-2xl overflow-y-auto"
           style={{
             maxWidth: 480, maxHeight: '92dvh',
             borderTopLeftRadius: 24, borderTopRightRadius: 24,
             paddingBottom: 'env(safe-area-inset-bottom)',
           }}>
        <div className="sticky top-0 bg-white border-b border-ink-100 px-5 py-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-ink-900 truncate pr-2">{recipe.title}</h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-ink-50 shrink-0">
            <X size={18} className="text-ink-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full"
                  style={{ color: GOLD, backgroundColor: 'rgba(165,141,105,0.10)' }}>
              {recipe.meal_type}
            </span>
            {recipe.meal_type === 'snack' && recipe.snack_timing && (
              <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full"
                    style={{ color: GOLD, backgroundColor: 'rgba(165,141,105,0.18)' }}>
                {SNACK_TIMING_LABEL[recipe.snack_timing]}
              </span>
            )}
            {recipe.diet_type && (
              <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full"
                    style={{ color: '#0f766e', backgroundColor: 'rgba(15,118,110,0.12)' }}>
                {DIET_TYPE_LABEL[recipe.diet_type]}
              </span>
            )}
            {recipe.prep_time_min != null && (
              <span className="inline-flex items-center gap-1 text-[11px] text-ink-500">
                <Clock size={10} /> {recipe.prep_time_min}m prep
              </span>
            )}
            {recipe.cook_time_min != null && (
              <span className="text-[11px] text-ink-500">{recipe.cook_time_min}m cook</span>
            )}
            {recipe.servings != null && (
              <span className="inline-flex items-center gap-1 text-[11px] text-ink-500">
                <Users size={10} /> serves {recipe.servings}
              </span>
            )}
          </div>

          {recipe.description && (
            <p className="text-sm text-ink-700 leading-relaxed">{recipe.description}</p>
          )}

          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-ink-400 mb-2">Ingredients</p>
            <ul className="space-y-1.5">
              {recipe.ingredients.map((it, i) => (
                <li key={i} className="text-sm text-ink-800 flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: GOLD }} />
                  <span className="flex-1">{it}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-ink-400 mb-2">Steps</p>
            <ol className="space-y-2">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="text-sm text-ink-800 flex items-start gap-2">
                  <span
                    className="shrink-0 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                    style={{ backgroundColor: GOLD }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {recipe.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2 border-t border-ink-100">
              {recipe.tags.map((t, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-ink-50 text-ink-600 border border-ink-100">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
