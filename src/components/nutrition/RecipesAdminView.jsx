import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus, Search, X, FileUp, Pencil, Trash2,
  Sparkles, Loader2, ChevronRight, Check, Image as ImageIcon, SlidersHorizontal,
} from 'lucide-react';
import { useRecipes } from '../../hooks/useRecipes';
import { supabase } from '../../lib/supabase';
import { compressImage } from '../../utils/imageCompress';

const GOLD = '#A58D69';

const MEAL_TYPES = [
  { id: 'all',       label: 'All'        },
  { id: 'breakfast', label: 'Breakfast'  },
  { id: 'lunch',     label: 'Lunch'      },
  { id: 'dinner',    label: 'Dinner'     },
  { id: 'snack',     label: 'Snack'      },
];

// Snack-only timing sub-filter. Only relevant when the meal-type
// filter is 'snack' or 'all' — the pill row hides otherwise.
const SNACK_TIMINGS = [
  { id: 'all',           label: 'Any timing'  },
  { id: 'pre_training',  label: 'Pre-Training'  },
  { id: 'post_training', label: 'Post-Training' },
  { id: 'anytime',       label: 'Anytime'       },
];

// Lookup so cards / dropdowns render the human label.
export const SNACK_TIMING_LABEL = {
  pre_training:  'Pre-Training',
  post_training: 'Post-Training',
  anytime:       'Anytime',
};

// Dietary classifications (mutually exclusive). Vegan is the strictest;
// vegetarian / pescatarian / poultry expand outward from there.
const DIET_TYPES = [
  { id: 'all',         label: 'Any diet'    },
  { id: 'poultry',     label: 'Poultry'     },
  { id: 'pescatarian', label: 'Pescatarian' },
  { id: 'vegetarian',  label: 'Vegetarian'  },
  { id: 'vegan',       label: 'Vegan'       },
];

export const DIET_TYPE_LABEL = {
  poultry:     'Poultry',
  pescatarian: 'Pescatarian',
  vegetarian:  'Vegetarian',
  vegan:       'Vegan',
};

const empty = {
  title: '', meal_type: 'snack', description: '',
  ingredients: [], instructions: [],
  prep_time_min: '', cook_time_min: '', servings: '',
  tags: [], image_url: '', is_active: true, source: 'manual',
  snack_timing: null, diet_type: null,
};

/**
 * RecipesAdminView — coach surface for the global recipe library.
 * Lists recipes with a meal-type filter and a search box, supports
 * manual add/edit, and offers an AI-assisted "Import from PDF" flow
 * that lets the coach tick which extracted recipes to keep.
 */
export default function RecipesAdminView() {
  const [mealType,    setMealType]    = useState('all');
  const [snackTiming, setSnackTiming] = useState('all');
  const [dietType,    setDietType]    = useState('all');
  const [search,      setSearch]      = useState('');
  const [showInactive,setShowInactive]= useState(false);

  const { recipes, loading, create, update, remove, bulkInsert } =
    useRecipes({ mealType, snackTiming, dietType, activeOnly: !showInactive, search });

  // Reset snack-timing when the meal-type leaves 'snack' / 'all' so the
  // filter doesn't carry an irrelevant constraint into the next view.
  const showSnackTiming = mealType === 'snack' || mealType === 'all';
  useEffect(() => {
    if (!showSnackTiming) setSnackTiming('all');
  }, [showSnackTiming]);

  // Count of active (non-default) filters — shown as a badge on the
  // Filter button so the coach knows when they have an open filter set.
  const activeFilterCount =
    (mealType    !== 'all' ? 1 : 0) +
    (snackTiming !== 'all' && showSnackTiming ? 1 : 0) +
    (dietType    !== 'all' ? 1 : 0) +
    (showInactive ? 1 : 0);

  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);
  useEffect(() => {
    if (!filterOpen) return;
    const onDown = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [filterOpen]);

  const resetFilters = () => {
    setMealType('all');
    setSnackTiming('all');
    setDietType('all');
    setShowInactive(false);
  };

  const [editor, setEditor] = useState(null); // null | { mode, row }
  const [importOpen, setImportOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const onCreate = () => setEditor({ mode: 'add', row: { ...empty } });
  const onEdit   = (row) => setEditor({ mode: 'edit', row: { ...row } });
  const onCancel = () => setEditor(null);

  const onSave = async (draft) => {
    const fn = editor.mode === 'add' ? create : (row) => update(editor.row.id, row);
    const res = await fn(draft);
    if (res.ok) {
      setToast({ kind: 'success', msg: editor.mode === 'add' ? 'Recipe added.' : 'Saved.' });
      setEditor(null);
      setTimeout(() => setToast(null), 2200);
    } else {
      setToast({ kind: 'error', msg: res.error?.message || 'Save failed.' });
    }
  };

  const onDelete = async (row) => {
    if (!window.confirm(`Delete "${row.title}"?`)) return;
    const res = await remove(row.id);
    if (res.ok) setToast({ kind: 'success', msg: 'Deleted.' });
    else        setToast({ kind: 'error', msg: res.error?.message || 'Delete failed.' });
    setTimeout(() => setToast(null), 2000);
  };

  const onImported = async (chosen) => {
    const res = await bulkInsert(
      chosen.map(r => ({ ...r, source: 'pdf_import', is_active: true }))
    );
    if (res.ok) {
      setToast({ kind: 'success', msg: `Imported ${res.inserted} recipe${res.inserted === 1 ? '' : 's'}.` });
      setImportOpen(false);
    } else {
      setToast({ kind: 'error', msg: res.error?.message || 'Import failed.' });
    }
    setTimeout(() => setToast(null), 2400);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar — search + single Filter button + actions.
          All filters (meal type, snack timing, dietary, active/inactive)
          consolidate into the Filter popover; the toolbar only carries
          the persistent search box and the primary actions. */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes…"
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-gray-200 focus:outline-none focus:border-gold-400"
          />
        </div>

        <div ref={filterRef} className="relative">
          <button
            onClick={() => setFilterOpen(o => !o)}
            className="text-xs font-semibold px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 inline-flex items-center gap-1.5"
            style={{ color: activeFilterCount > 0 ? GOLD : '#6b7280' }}
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

          {filterOpen && (
            <FilterPanel
              mealType={mealType}        setMealType={setMealType}
              snackTiming={snackTiming}  setSnackTiming={setSnackTiming}
              dietType={dietType}        setDietType={setDietType}
              showInactive={showInactive} setShowInactive={setShowInactive}
              showSnackTiming={showSnackTiming}
              onReset={resetFilters}
              onDone={() => setFilterOpen(false)}
            />
          )}
        </div>

        <button
          onClick={() => setImportOpen(true)}
          className="text-xs font-semibold px-3 py-1.5 rounded border inline-flex items-center gap-1.5"
          style={{ borderColor: GOLD, color: GOLD }}
          title="Drop a PDF — AI extracts recipes you can tick to import"
        >
          <Sparkles size={13} /> Import from PDF
        </button>
        <button
          onClick={onCreate}
          className="text-xs font-semibold px-3 py-1.5 rounded text-white inline-flex items-center gap-1.5"
          style={{ backgroundColor: GOLD }}
        >
          <Plus size={13} /> New recipe
        </button>
      </div>

      {/* Grid of cards */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {loading ? (
          <div className="col-span-full flex items-center gap-2 px-3 py-6 text-xs text-gray-400">
            <Loader2 size={12} className="animate-spin" /> Loading recipes…
          </div>
        ) : recipes.length === 0 ? (
          <div className="col-span-full rounded-xl bg-white border border-gray-100 p-8 text-center text-xs italic text-gray-400"
               style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            No recipes yet. Click <strong>Import from PDF</strong> or <strong>New recipe</strong> to start the library.
          </div>
        ) : recipes.map(r => (
          <RecipeCard key={r.id} recipe={r} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>

      {editor && (
        <RecipeEditor
          mode={editor.mode}
          initial={editor.row}
          onCancel={onCancel}
          onSave={onSave}
        />
      )}

      {importOpen && (
        <PdfImportModal
          onCancel={() => setImportOpen(false)}
          onImported={onImported}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 px-4 py-2.5 rounded-lg text-xs font-semibold text-white shadow-lg z-[120]"
             style={{ backgroundColor: toast.kind === 'error' ? '#dc2626' : '#1C1C1C' }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── Filter popover ──────────────────────────────────────────────────
// Single dropdown surface for every non-search filter. Sits in a small
// shadowed card anchored under the Filter button.
function FilterPanel({
  mealType, setMealType, snackTiming, setSnackTiming,
  dietType, setDietType, showInactive, setShowInactive,
  showSnackTiming, onReset, onDone,
}) {
  return (
    <div
      className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg z-30 w-[300px] max-w-[92vw]"
      style={{ border: '1px solid #e5e7eb' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <p className="text-xs font-bold text-gray-900">Filters</p>
        <button onClick={onReset}
                className="text-[11px] font-semibold text-gray-500 hover:text-gray-700">
          Reset
        </button>
      </div>

      <div className="px-4 py-3 space-y-3">
        <FilterGroup label="Meal type">
          <Segments options={MEAL_TYPES} value={mealType} onChange={setMealType} />
        </FilterGroup>

        {showSnackTiming && (
          <FilterGroup label="Snack timing">
            <Segments options={SNACK_TIMINGS} value={snackTiming} onChange={setSnackTiming} />
          </FilterGroup>
        )}

        <FilterGroup label="Dietary">
          <Segments options={DIET_TYPES} value={dietType} onChange={setDietType} />
        </FilterGroup>

        <label className="flex items-center gap-2 text-xs font-medium pt-1 border-t border-gray-100 mt-2"
               style={{ color: '#1C1C1C' }}>
          <input type="checkbox" checked={showInactive}
                 onChange={(e) => setShowInactive(e.target.checked)} />
          Show inactive recipes
        </label>
      </div>

      <div className="px-4 py-3 border-t border-gray-100 flex justify-end">
        <button onClick={onDone}
                className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded text-white"
                style={{ backgroundColor: GOLD }}>
          Done
        </button>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1.5">
        {label}
      </p>
      {children}
    </div>
  );
}

// Compact wrap-friendly chip set for option groups — uses pill buttons
// instead of a segmented control so longer label sets wrap cleanly.
function Segments({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map(o => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className="text-[11px] font-semibold px-2 py-1 rounded-full border transition-colors"
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

// ─── Recipe card ─────────────────────────────────────────────────────
function RecipeCard({ recipe, onEdit, onDelete }) {
  return (
    <div
      className="rounded-xl bg-white border border-gray-100 overflow-hidden flex flex-col"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', opacity: recipe.is_active ? 1 : 0.55 }}
    >
      {recipe.image_url && (
        <div className="aspect-[16/9] bg-gray-50 overflow-hidden">
          <img src={recipe.image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{recipe.title}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: GOLD }}>
              {recipe.meal_type}
            </p>
            {recipe.meal_type === 'snack' && recipe.snack_timing && (
              <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded"
                    style={{ color: GOLD, backgroundColor: 'rgba(165,141,105,0.12)' }}>
                {SNACK_TIMING_LABEL[recipe.snack_timing]}
              </span>
            )}
            {recipe.diet_type && (
              <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded"
                    style={{ color: '#0f766e', backgroundColor: 'rgba(15,118,110,0.12)' }}>
                {DIET_TYPE_LABEL[recipe.diet_type]}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(recipe)}
                  className="p-1.5 rounded hover:bg-gray-50" title="Edit">
            <Pencil size={12} className="text-gray-400" />
          </button>
          <button onClick={() => onDelete(recipe)}
                  className="p-1.5 rounded hover:bg-red-50" title="Delete">
            <Trash2 size={12} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>
      <div className="px-4 py-3 flex-1 space-y-2">
        {recipe.description && (
          <p className="text-xs text-gray-600 line-clamp-3">{recipe.description}</p>
        )}
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          {recipe.prep_time_min  != null && <span>{recipe.prep_time_min} min prep</span>}
          {recipe.cook_time_min  != null && <span>· {recipe.cook_time_min} min cook</span>}
          {recipe.servings       != null && <span>· serves {recipe.servings}</span>}
        </div>
        <p className="text-[11px] text-gray-400">
          {recipe.ingredients?.length || 0} ingredients · {recipe.instructions?.length || 0} steps
        </p>
        {(recipe.tags?.length || 0) > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 4).map((t, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-100">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Manual editor ───────────────────────────────────────────────────
function RecipeEditor({ mode, initial, onCancel, onSave }) {
  const [d, setD] = useState(initial);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));

  // Image upload — compress client-side, push to the public recipe-images
  // bucket, store the public URL in image_url. Coaches can swap photos
  // without leaving the editor.
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const onPickImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const blob = await compressImage(file, { maxEdge: 1400, quality: 0.82 });
      const ext  = 'jpg';
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('recipe-images')
        .upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: false });
      if (upErr) {
        console.error('[RecipeEditor] upload failed', upErr);
        setUploading(false);
        return;
      }
      const { data } = supabase.storage.from('recipe-images').getPublicUrl(path);
      set('image_url', data.publicUrl);
    } catch (e) {
      console.error('[RecipeEditor] compress/upload threw', e);
    }
    setUploading(false);
  };

  const setLine = (key, idx, val) =>
    setD(prev => ({ ...prev, [key]: prev[key].map((s, i) => i === idx ? val : s) }));
  const addLine = (key) =>
    setD(prev => ({ ...prev, [key]: [...prev[key], ''] }));
  const rmLine  = (key, idx) =>
    setD(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }));

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center"
         style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
         onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="bg-white rounded-xl w-[560px] max-w-[94vw] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">
            {mode === 'add' ? 'New recipe' : 'Edit recipe'}
          </h3>
          <button onClick={onCancel} className="p-1 rounded hover:bg-gray-100">
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Hero image — drives the athlete card thumbnail. */}
          <div>
            <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-500 block mb-1.5">
              Photo
            </span>
            <div
              className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer"
              style={{ aspectRatio: '16 / 9' }}
              onClick={() => !uploading && fileRef.current?.click()}
            >
              {d.image_url ? (
                <img src={d.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon size={28} />
                  <span className="text-[11px] mt-1.5">Click to upload a photo</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <Loader2 size={20} className="animate-spin" style={{ color: GOLD }} />
                </div>
              )}
              {d.image_url && !uploading && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); set('image_url', ''); }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white"
                  title="Remove image"
                >
                  <X size={11} />
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPickImage(e.target.files?.[0])}
              />
            </div>
          </div>

          <Field label="Title">
            <input value={d.title} onChange={(e) => set('title', e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded border border-gray-200 focus:outline-none focus:border-gold-400" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Meal type">
              <select value={d.meal_type} onChange={(e) => set('meal_type', e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 cursor-pointer">
                {['breakfast','lunch','dinner','snack'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Servings">
              <input type="number" value={d.servings} onChange={(e) => set('servings', e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded border border-gray-200" />
            </Field>
            <Field label="Prep (min)">
              <input type="number" value={d.prep_time_min} onChange={(e) => set('prep_time_min', e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded border border-gray-200" />
            </Field>
            <Field label="Cook (min)">
              <input type="number" value={d.cook_time_min} onChange={(e) => set('cook_time_min', e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded border border-gray-200" />
            </Field>
          </div>

          {/* Snack timing — only relevant when meal_type is 'snack'.
              For other meal types the field is hidden AND cleared on
              save (sanitise() ignores it when not applicable). */}
          {d.meal_type === 'snack' && (
            <Field label="Snack timing">
              <select
                value={d.snack_timing || ''}
                onChange={(e) => set('snack_timing', e.target.value || null)}
                className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 cursor-pointer"
              >
                <option value="">— No timing set —</option>
                <option value="pre_training">Pre-Training</option>
                <option value="post_training">Post-Training</option>
                <option value="anytime">Anytime</option>
              </select>
            </Field>
          )}

          {/* Dietary classification — applies to any meal type. */}
          <Field label="Dietary">
            <select
              value={d.diet_type || ''}
              onChange={(e) => set('diet_type', e.target.value || null)}
              className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 cursor-pointer"
            >
              <option value="">— No dietary classification —</option>
              <option value="poultry">Poultry</option>
              <option value="pescatarian">Pescatarian</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
            </select>
          </Field>

          <Field label="Description (optional)">
            <textarea value={d.description || ''} onChange={(e) => set('description', e.target.value)} rows={2}
              className="w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:outline-none focus:border-gold-400 resize-y" />
          </Field>

          <LineList
            label="Ingredients"
            items={d.ingredients}
            placeholder="e.g. 1 cup rolled oats"
            onChange={(idx, val) => setLine('ingredients', idx, val)}
            onAdd={() => addLine('ingredients')}
            onRemove={(idx) => rmLine('ingredients', idx)}
          />

          <LineList
            label="Steps"
            items={d.instructions}
            placeholder="e.g. Combine oats and milk; chill overnight"
            onChange={(idx, val) => setLine('instructions', idx, val)}
            onAdd={() => addLine('instructions')}
            onRemove={(idx) => rmLine('instructions', idx)}
            numbered
          />

          <Field label="Tags (comma-separated)">
            <input
              value={d.tags?.join(', ') || ''}
              onChange={(e) => set('tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="high-protein, quick, vegetarian"
              className="w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:outline-none focus:border-gold-400" />
          </Field>

          <label className="flex items-center gap-2 text-xs font-medium" style={{ color: '#1C1C1C' }}>
            <input type="checkbox" checked={!!d.is_active} onChange={(e) => set('is_active', e.target.checked)} />
            Active (visible to athletes)
          </label>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onCancel} className="text-xs font-semibold px-3 py-1.5" style={{ color: '#6b7280' }}>
            Cancel
          </button>
          <button onClick={() => onSave(d)}
            className="text-xs font-semibold px-4 py-1.5 rounded text-white"
            style={{ backgroundColor: GOLD }}>
            {mode === 'add' ? 'Add recipe' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function LineList({ label, items, onChange, onAdd, onRemove, placeholder, numbered = false }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-500">{label}</span>
        <button type="button" onClick={onAdd}
          className="text-[10px] font-semibold uppercase tracking-widest inline-flex items-center gap-1"
          style={{ color: GOLD }}>
          <Plus size={10} /> Add
        </button>
      </div>
      <ul className="space-y-1.5">
        {items.length === 0 && (
          <li className="text-[11px] italic text-gray-400">None yet — click Add.</li>
        )}
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            {numbered && (
              <span className="text-[10px] font-bold w-4 text-right text-gray-400 mt-1.5">{i + 1}.</span>
            )}
            <input
              value={item}
              onChange={(e) => onChange(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-2 py-1.5 text-xs rounded border border-gray-200 focus:outline-none focus:border-gold-400"
            />
            <button type="button" onClick={() => onRemove(i)}
              className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500">
              <X size={11} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-500">{label}</span>
      {children}
    </label>
  );
}

// ─── AI PDF import modal ────────────────────────────────────────────
function PdfImportModal({ onCancel, onImported }) {
  const [phase,    setPhase]    = useState('drop'); // drop | extracting | review | saving | done
  const [error,    setError]    = useState(null);
  const [fileName, setFileName] = useState(null);
  const [draft,    setDraft]    = useState([]);   // [{ ...recipe, _checked }]
  const inputRef = useRef(null);

  const onPdf = async (file) => {
    setError(null);
    setFileName(file.name);
    setPhase('extracting');
    try {
      // Extract text client-side with pdfjs (already a dep). Lazy
      // import keeps the bundle off the critical path; we also point
      // GlobalWorkerOptions.workerSrc at the bundled worker so PDF.js
      // doesn't throw "No 'GlobalWorkerOptions.workerSrc' specified".
      // Matches the pattern already used by ResourcesAdminView.
      const pdfjs    = await import('pdfjs-dist');
      const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

      const arrayBuf = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: new Uint8Array(arrayBuf) }).promise;
      const pages = [];
      for (let p = 1; p <= doc.numPages; p++) {
        const page = await doc.getPage(p);
        const tc   = await page.getTextContent();
        pages.push(tc.items.map(it => it.str).join(' '));
      }
      const text = pages.join('\n\n');
      if (!text.trim()) {
        setError('Could not read any text from that PDF. Image-only PDFs (no embedded text) aren\'t supported yet.');
        setPhase('drop');
        return;
      }

      // Send to the AI extractor.
      const res = await fetch('/api/recipes/extract', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, max_recipes: 40 }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error || 'AI extraction failed.');
        setPhase('drop');
        return;
      }
      if (!json.recipes?.length) {
        setError('AI did not find any recipes in this PDF.');
        setPhase('drop');
        return;
      }
      setDraft(json.recipes.map(r => ({ ...r, _checked: true })));
      setPhase('review');
    } catch (e) {
      console.error('[PdfImportModal] failed', e);
      setError(e?.message || 'PDF parsing failed.');
      setPhase('drop');
    }
  };

  const toggle = (i) => setDraft(d => d.map((r, k) => k === i ? { ...r, _checked: !r._checked } : r));
  const setAll  = (v) => setDraft(d => d.map(r => ({ ...r, _checked: v })));
  const chosen = draft.filter(r => r._checked).map(r => { const { _checked, ...rest } = r; return rest; });

  const apply = async () => {
    setPhase('saving');
    await onImported(chosen);
    setPhase('done');
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget && phase !== 'extracting' && phase !== 'saving') onCancel(); }}
    >
      <div className="bg-white rounded-xl w-[760px] max-w-[94vw] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Sparkles size={15} style={{ color: GOLD }} />
            <h3 className="text-sm font-bold text-gray-900">Import recipes from PDF</h3>
          </div>
          <p className="text-[11px] mt-1 text-gray-500">
            Drop a recipe PDF. The AI reads it, pulls each recipe into the same shape
            this admin uses, and you tick which ones to keep.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {phase === 'drop' && (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) onPdf(f); }}
              className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-12 cursor-pointer transition-colors hover:bg-gold-50/40"
              style={{ borderColor: '#e5e7eb' }}
            >
              <FileUp size={28} style={{ color: GOLD }} />
              <p className="text-sm font-semibold text-gray-700 mt-2">Drop a PDF or click to pick</p>
              <p className="text-[11px] text-gray-400 mt-1">Up to ~150,000 chars. Image-only PDFs aren't supported yet.</p>
              <input ref={inputRef} type="file" accept="application/pdf" className="hidden"
                     onChange={(e) => { const f = e.target.files?.[0]; if (f) onPdf(f); }} />
            </div>
          )}

          {phase === 'extracting' && (
            <div className="flex flex-col items-center gap-3 py-12 text-xs text-gray-500">
              <Loader2 size={24} className="animate-spin" style={{ color: GOLD }} />
              <p>Reading <strong>{fileName}</strong>…</p>
              <p className="italic text-gray-400">AI extraction can take 10-30 seconds for a longer document.</p>
            </div>
          )}

          {phase === 'review' && (
            <ReviewTable
              draft={draft}
              fileName={fileName}
              onToggle={toggle}
              onAllOn={() => setAll(true)}
              onAllOff={() => setAll(false)}
            />
          )}

          {phase === 'saving' && (
            <div className="flex flex-col items-center gap-3 py-12 text-xs text-gray-500">
              <Loader2 size={24} className="animate-spin" style={{ color: GOLD }} />
              <p>Saving {chosen.length} recipes…</p>
            </div>
          )}

          {error && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-[12px] font-semibold text-red-600">
              {error}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={phase === 'extracting' || phase === 'saving'}
            className="text-xs font-semibold px-3 py-1.5"
            style={{ color: '#6b7280' }}
          >
            Cancel
          </button>
          {phase === 'review' && (
            <button
              onClick={apply}
              disabled={chosen.length === 0}
              className="text-xs font-semibold px-4 py-1.5 rounded text-white disabled:opacity-50"
              style={{ backgroundColor: GOLD }}
            >
              Import {chosen.length} recipe{chosen.length === 1 ? '' : 's'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewTable({ draft, fileName, onToggle, onAllOn, onAllOff }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-700">
            Found {draft.length} recipe{draft.length === 1 ? '' : 's'} in <strong>{fileName}</strong>
          </p>
          <p className="text-[11px] text-gray-400">Tick the ones to import — uncheck anything that isn't really a recipe.</p>
        </div>
        <div className="inline-flex items-center gap-1">
          <button onClick={onAllOn}  className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-gray-200" style={{ color: GOLD }}>All</button>
          <button onClick={onAllOff} className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-gray-200" style={{ color: '#6b7280' }}>None</button>
        </div>
      </div>
      <ul className="space-y-2">
        {draft.map((r, i) => (
          <li key={i} className="rounded-lg border border-gray-100 bg-white overflow-hidden">
            <button
              onClick={() => onToggle(i)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
              style={{ backgroundColor: r._checked ? 'rgba(165,141,105,0.06)' : '#fff' }}
            >
              <div
                className="shrink-0 w-5 h-5 rounded flex items-center justify-center"
                style={{
                  backgroundColor: r._checked ? GOLD : '#fff',
                  border: `1.5px solid ${r._checked ? GOLD : '#d1d5db'}`,
                }}
              >
                {r._checked && <Check size={12} className="text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900 truncate">{r.title}</p>
                  <span className="text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded shrink-0"
                        style={{ color: GOLD, backgroundColor: 'rgba(165,141,105,0.10)' }}>
                    {r.meal_type}
                  </span>
                </div>
                {r.description && (
                  <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{r.description}</p>
                )}
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {r.ingredients?.length || 0} ingredients · {r.instructions?.length || 0} steps
                  {r.servings ? ` · serves ${r.servings}` : ''}
                </p>
              </div>
              <ChevronRight size={12} className="text-gray-300" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
