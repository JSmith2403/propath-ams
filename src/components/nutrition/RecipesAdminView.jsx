import { useMemo, useRef, useState } from 'react';
import {
  Plus, Search, X, FileUp, Pencil, Trash2,
  Sparkles, Loader2, ChevronRight, Check,
} from 'lucide-react';
import { useRecipes } from '../../hooks/useRecipes';

const GOLD = '#A58D69';

const MEAL_TYPES = [
  { id: 'all',       label: 'All'        },
  { id: 'breakfast', label: 'Breakfast'  },
  { id: 'lunch',     label: 'Lunch'      },
  { id: 'dinner',    label: 'Dinner'     },
  { id: 'snack',     label: 'Snack'      },
];

const empty = {
  title: '', meal_type: 'snack', description: '',
  ingredients: [], instructions: [],
  prep_time_min: '', cook_time_min: '', servings: '',
  tags: [], image_url: '', is_active: true, source: 'manual',
};

/**
 * RecipesAdminView — coach surface for the global recipe library.
 * Lists recipes with a meal-type filter and a search box, supports
 * manual add/edit, and offers an AI-assisted "Import from PDF" flow
 * that lets the coach tick which extracted recipes to keep.
 */
export default function RecipesAdminView() {
  const [mealType, setMealType] = useState('all');
  const [search,   setSearch]   = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const { recipes, loading, create, update, remove, bulkInsert } =
    useRecipes({ mealType, activeOnly: !showInactive, search });

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
      {/* Toolbar */}
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

        <div className="inline-flex items-center rounded border border-gray-200 overflow-hidden">
          {MEAL_TYPES.map(m => (
            <button
              key={m.id}
              onClick={() => setMealType(m.id)}
              className="text-xs font-semibold px-2.5 py-1.5 transition-colors"
              style={{
                color:           mealType === m.id ? '#fff' : '#6b7280',
                backgroundColor: mealType === m.id ? GOLD : 'transparent',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowInactive(s => !s)}
          className="text-xs font-semibold px-2 py-1.5 rounded border border-gray-200"
          style={{ color: showInactive ? GOLD : '#6b7280' }}
        >
          {showInactive ? 'Inactive shown' : 'Active only'}
        </button>

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

// ─── Recipe card ─────────────────────────────────────────────────────
function RecipeCard({ recipe, onEdit, onDelete }) {
  return (
    <div
      className="rounded-xl bg-white border border-gray-100 overflow-hidden flex flex-col"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', opacity: recipe.is_active ? 1 : 0.55 }}
    >
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{recipe.title}</p>
          <p className="text-[10px] uppercase tracking-widest font-bold mt-0.5" style={{ color: GOLD }}>
            {recipe.meal_type}
          </p>
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
      // import keeps the bundle off the critical path.
      const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const arrayBuf = await file.arrayBuffer();
      const doc = await getDocument({ data: new Uint8Array(arrayBuf) }).promise;
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
