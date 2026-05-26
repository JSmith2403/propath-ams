import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, X, PlayCircle, Pencil, EyeOff, Eye, FileUp, FileDown, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const GOLD = '#A58D69';

// Enum-ish values mirrored from exercise_library CHECK constraints. Keep
// in alphabetical order so the picker is predictable.
const CATEGORIES = [
  'accessory','ballistic','capacity','jumps_plyos','mobility',
  'power','speed','strength','warm_up',
];

const EQUIPMENT = [
  'assault_bike','band','barbell','bench','bike_erg','bodyweight','cable',
  'dumbbell','fixed_machine','kettlebell','landmine','plyo_box','pull_up_bar',
  'pvc','rower_erg','sandbag_dball','ski_erg','suspension_trainer','trap_bar','treadmill',
];

const MOVEMENT_PATTERNS = [
  'ankle_extension','carry',
  'core_anti_extension','core_anti_lateral_flexion','core_anti_rotation',
  'core_flexion','core_lateral_flexion','core_rotation',
  'cyclical','hinge','hip_extension','horizontal_pull','horizontal_push',
  'jumps_plyos','lunge','rotational','spinal_extension','squat',
  'step_up','vertical_pull','vertical_push',
];

const BILATERAL = ['bilateral','unilateral'];

const empty = {
  name: '',
  category: 'strength',
  movement_patterns: [],
  bilateral_unilateral: 'bilateral',
  equipment: ['bodyweight'],
  primary_muscle: '',
  notes: '',
  demo_video_url: '',
  is_active: true,
};

/**
 * ExerciseLibraryAdmin — coach-only view of the global exercise_library
 * table. Search + category filter + a single edit modal that covers
 * everything coaches actually update (name, category, equipment,
 * primary muscle, demo video URL, active flag).
 *
 * Lives as a tab inside Data Management → Data Storage so it's
 * discoverable next to the manual + VALD data tools.
 */
export default function ExerciseLibraryAdmin() {
  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [query, setQuery]           = useState('');
  const [catFilter, setCatFilter]   = useState('all');
  const [showInactive, setShowInactive] = useState(false);
  // 'all' (default) | 'has' | 'missing'  — drives the "Demo:" pill toggle.
  const [demoFilter, setDemoFilter] = useState('all');
  const [modal, setModal]           = useState(null); // null | { mode, row }
  const [bulkOpen, setBulkOpen]     = useState(false);
  const [toast, setToast]           = useState(null);
  const [tick, setTick]             = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);

      // Fetch library + programme-usage in parallel so we can surface
      // "how many times is this exercise actually programmed?" as a
      // sort hint. Coaches want to fill in URLs for the most-used
      // exercises first — knocking out 100 high-usage rows beats
      // grinding through 2000 low-value ones.
      const [libRes, useRes] = await Promise.all([
        supabase
          .from('exercise_library')
          .select('id, name, category, equipment, bilateral_unilateral, primary_muscle, notes, demo_video_url, is_active, movement_patterns')
          .order('name', { ascending: true }),
        // Usage counts — every athlete-attached session_exercises row
        // plus every block_template/session_template exercise row. We
        // fetch raw and aggregate in JS so the query is RLS-friendly
        // (no GROUP BY needed server-side).
        supabase.from('session_exercises').select('exercise_id'),
      ]);

      if (cancelled) return;
      if (libRes.error) {
        console.error('[ExerciseLibraryAdmin] fetch failed', libRes.error);
        setToast({ kind: 'error', msg: libRes.error.message });
        setLoading(false);
        return;
      }

      const usage = new Map();
      for (const r of (useRes.data || [])) {
        usage.set(r.exercise_id, (usage.get(r.exercise_id) || 0) + 1);
      }

      const enriched = (libRes.data || []).map(r => ({
        ...r,
        usage_count: usage.get(r.id) || 0,
      }));

      setRows(enriched);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [tick]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = rows.filter(r => {
      if (!showInactive && !r.is_active) return false;
      if (catFilter !== 'all' && r.category !== catFilter) return false;
      if (demoFilter === 'has'     && !r.demo_video_url) return false;
      if (demoFilter === 'missing' &&  r.demo_video_url) return false;
      if (q && !r.name.toLowerCase().includes(q)
            && !(r.primary_muscle || '').toLowerCase().includes(q)) return false;
      return true;
    });
    // When the coach is hunting for missing demos, sort by usage so the
    // most-programmed exercises bubble up — that's the high-leverage
    // batch. Otherwise alphabetical (the default fetch order).
    if (demoFilter === 'missing') {
      out.sort((a, b) => (b.usage_count - a.usage_count) || a.name.localeCompare(b.name));
    }
    return out;
  }, [rows, query, catFilter, showInactive, demoFilter]);

  // Counter for the "Missing demo" pill — gives a live count of work
  // left without forcing the coach to switch filters.
  const missingDemoCount = useMemo(
    () => rows.filter(r => r.is_active && !r.demo_video_url).length,
    [rows]
  );

  const openAdd  = () => setModal({ mode: 'add',  row: { ...empty } });
  const openEdit = (row) => setModal({ mode: 'edit', row: { ...row, movement_patterns: row.movement_patterns || [], equipment: row.equipment || [] } });
  const close    = () => setModal(null);

  // Export the visible rows to a CSV the coach can open in Excel /
  // Sheets, fill in URLs in the "New Demo URL" column, then paste
  // straight back into the Bulk import modal (which auto-detects the
  // header row + URL column). Respects the active filters so a coach
  // can export "Missing demos, sorted by Used" and work that subset.
  const exportCsv = () => {
    const headers = ['Name', 'Category', 'Bilateral/Unilateral', 'Used', 'Current Demo URL', 'New Demo URL'];
    const esc = (v) => {
      const s = v == null ? '' : String(v);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [
      headers.join(','),
      ...filtered.map(r => [
        r.name,
        r.category,
        r.bilateral_unilateral,
        r.usage_count || 0,
        r.demo_video_url || '',
        '', // blank — coach fills this column
      ].map(esc).join(',')),
    ];
    const csv = lines.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    const tag = demoFilter === 'missing' ? 'missing-demos'
              : demoFilter === 'has'     ? 'has-demos'
              : 'all';
    a.href = url;
    a.download = `exercise-library-${tag}-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Bulk apply demo URLs from a paste buffer (TSV/CSV/pipe-separated,
  // one row per line: "Exercise name <separator> URL"). Used the same
  // fuzzy match the PDF importer uses so coaches can paste from a
  // spreadsheet without sweating exact name capitalisation.
  const applyBulkLinks = async (matches) => {
    const writes = matches.filter(m => m.libraryRow && m.url);
    if (!writes.length) return { ok: false, updated: 0 };

    // Sequential — keeps it predictable and lets us surface row-level
    // errors. With 2000-row scale this still finishes in seconds.
    let updated = 0;
    for (const m of writes) {
      const { error } = await supabase
        .from('exercise_library')
        .update({ demo_video_url: m.url })
        .eq('id', m.libraryRow.id);
      if (error) {
        setToast({ kind: 'error', msg: `Failed on "${m.libraryRow.name}": ${error.message}` });
        return { ok: false, updated };
      }
      updated++;
    }
    setToast({ kind: 'success', msg: `Linked ${updated} exercise${updated === 1 ? '' : 's'}.` });
    setTimeout(() => setToast(null), 2500);
    setBulkOpen(false);
    setTick(t => t + 1);
    return { ok: true, updated };
  };

  const handleSave = async (draft) => {
    const payload = {
      name: draft.name?.trim(),
      category: draft.category,
      movement_patterns: draft.movement_patterns?.length ? draft.movement_patterns : ['squat'],
      bilateral_unilateral: draft.bilateral_unilateral,
      equipment: draft.equipment?.length ? draft.equipment : ['bodyweight'],
      primary_muscle: draft.primary_muscle?.trim() || null,
      notes: draft.notes?.trim() || null,
      demo_video_url: draft.demo_video_url?.trim() || null,
      is_active: !!draft.is_active,
    };
    if (!payload.name) {
      setToast({ kind: 'error', msg: 'Name is required.' });
      return;
    }

    let res;
    if (modal.mode === 'add') {
      res = await supabase.from('exercise_library').insert(payload).select().single();
    } else {
      res = await supabase.from('exercise_library').update(payload).eq('id', modal.row.id).select().single();
    }
    if (res.error) {
      console.error('[ExerciseLibraryAdmin] save failed', res.error);
      setToast({ kind: 'error', msg: res.error.message });
      return;
    }
    setToast({ kind: 'success', msg: modal.mode === 'add' ? 'Exercise added.' : 'Exercise updated.' });
    setTimeout(() => setToast(null), 2200);
    close();
    setTick(t => t + 1);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3 flex-wrap shrink-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or primary muscle…"
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-gray-200 focus:outline-none focus:border-gold-400"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="text-xs px-2 py-1.5 rounded border border-gray-200 cursor-pointer"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
        </select>
        <button
          onClick={() => setShowInactive(s => !s)}
          className="text-xs font-semibold px-2 py-1.5 rounded border border-gray-200 hover:bg-gray-50 inline-flex items-center gap-1.5"
          style={{ color: showInactive ? GOLD : '#6b7280' }}
          title={showInactive ? 'Hide inactive' : 'Show inactive'}
        >
          {showInactive ? <Eye size={12} /> : <EyeOff size={12} />}
          {showInactive ? 'Inactive shown' : 'Active only'}
        </button>

        {/* Demo filter — three states, cycled by clicking. Counters
            sit in the missing pill so the coach sees how much work
            is left without flipping filters first. */}
        <div className="inline-flex items-center rounded border border-gray-200 overflow-hidden">
          {[
            { key: 'all',     label: 'Demo: all' },
            { key: 'has',     label: 'Has demo' },
            { key: 'missing', label: `Missing · ${missingDemoCount}` },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setDemoFilter(opt.key)}
              className="text-xs font-semibold px-2 py-1.5 transition-colors"
              style={{
                color:           demoFilter === opt.key ? '#fff' : '#6b7280',
                backgroundColor: demoFilter === opt.key ? GOLD : 'transparent',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="text-xs font-semibold px-3 py-1.5 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1.5 disabled:opacity-40"
          title={`Download ${filtered.length} row${filtered.length === 1 ? '' : 's'} as CSV`}
        >
          <FileDown size={13} /> Export CSV
        </button>
        <button
          onClick={() => setBulkOpen(true)}
          className="text-xs font-semibold px-3 py-1.5 rounded border border-gold-200 text-gold-600 hover:bg-gold-50 inline-flex items-center gap-1.5"
          title="Paste a TSV/CSV with name → URL pairs"
        >
          <FileUp size={13} /> Bulk import links
        </button>
        <button
          onClick={openAdd}
          className="text-xs font-semibold px-3 py-1.5 rounded text-white inline-flex items-center gap-1.5"
          style={{ backgroundColor: GOLD }}
        >
          <Plus size={13} /> Add exercise
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-xs text-gray-400">
            Loading exercises…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-xs text-gray-400">
            No exercises match.
          </div>
        ) : (
          <table className="w-full text-[11px]" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead className="sticky top-0 bg-white z-10">
              <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                <th className="text-left px-4 py-2 font-semibold uppercase tracking-widest text-[9px]">Name</th>
                <th className="text-left px-3 py-2 font-semibold uppercase tracking-widest text-[9px]">Category</th>
                <th className="text-left px-3 py-2 font-semibold uppercase tracking-widest text-[9px]">Equipment</th>
                <th className="text-left px-3 py-2 font-semibold uppercase tracking-widest text-[9px]">Bilat / Uni</th>
                <th className="text-right px-3 py-2 font-semibold uppercase tracking-widest text-[9px]" title="Times this exercise is programmed across blocks">Used</th>
                <th className="text-center px-3 py-2 font-semibold uppercase tracking-widest text-[9px]">Demo</th>
                <th className="text-right px-4 py-2 font-semibold uppercase tracking-widest text-[9px]">Edit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr
                  key={r.id}
                  onClick={() => openEdit(r)}
                  className="hover:bg-gray-50 cursor-pointer"
                  style={{ borderBottom: '1px solid #f3f4f6', opacity: r.is_active ? 1 : 0.5 }}
                >
                  <td className="px-4 py-2 font-semibold" style={{ color: '#1C1C1C' }}>
                    {r.name}
                    {!r.is_active && (
                      <span className="ml-2 text-[9px] uppercase tracking-widest font-bold text-gray-400">inactive</span>
                    )}
                    {r.primary_muscle && (
                      <div className="text-[10px] text-gray-400 mt-0.5">{r.primary_muscle}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-600">{r.category.replace(/_/g, ' ')}</td>
                  <td className="px-3 py-2 text-gray-500 truncate" title={(r.equipment || []).join(', ')}>
                    {(r.equipment || []).slice(0, 3).join(', ')}{(r.equipment?.length || 0) > 3 ? '…' : ''}
                  </td>
                  <td className="px-3 py-2 text-gray-500">{r.bilateral_unilateral}</td>
                  <td className="px-3 py-2 text-right tabular-nums" style={{ color: r.usage_count ? '#1C1C1C' : '#cbd5e1' }}>
                    {r.usage_count || '—'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {r.demo_video_url
                      ? <a
                          href={r.demo_video_url} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center" title="Open demo video"
                        ><PlayCircle size={14} style={{ color: GOLD }} /></a>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Pencil size={12} className="text-gray-300 inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit modal */}
      {modal && <EditModal initial={modal.row} mode={modal.mode} onCancel={close} onSave={handleSave} />}

      {/* Bulk import modal */}
      {bulkOpen && (
        <BulkImportModal
          libraryRows={rows}
          onCancel={() => setBulkOpen(false)}
          onApply={applyBulkLinks}
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

// ─── Edit modal ───────────────────────────────────────────────────────
function EditModal({ initial, mode, onCancel, onSave }) {
  const [d, setD] = useState(initial);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const toggleArr = (k, val) => setD(prev => {
    const arr = prev[k] || [];
    return { ...prev, [k]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
  });
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center"
         style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
         onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="bg-white rounded-xl w-[560px] max-w-[94vw] max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-bold" style={{ color: '#1C1C1C' }}>
            {mode === 'add' ? 'Add exercise' : 'Edit exercise'}
          </h3>
          <button onClick={onCancel} className="p-1.5 rounded hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <Field label="Name">
            <input value={d.name} onChange={(e) => set('name', e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:outline-none focus:border-gold-400" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select value={d.category} onChange={(e) => set('category', e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 cursor-pointer">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </Field>
            <Field label="Bilateral / Unilateral">
              <select value={d.bilateral_unilateral} onChange={(e) => set('bilateral_unilateral', e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 cursor-pointer">
                {BILATERAL.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Demo video URL (YouTube, Vimeo, direct link)">
            <input
              type="url" value={d.demo_video_url}
              placeholder="https://www.youtube.com/watch?v=..."
              onChange={(e) => set('demo_video_url', e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:outline-none focus:border-gold-400" />
          </Field>

          <Field label="Primary muscle (optional)">
            <input value={d.primary_muscle} onChange={(e) => set('primary_muscle', e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:outline-none focus:border-gold-400" />
          </Field>

          <Field label="Equipment">
            <ChipGrid options={EQUIPMENT} value={d.equipment || []} onToggle={(v) => toggleArr('equipment', v)} />
          </Field>

          <Field label="Movement patterns">
            <ChipGrid options={MOVEMENT_PATTERNS} value={d.movement_patterns || []} onToggle={(v) => toggleArr('movement_patterns', v)} />
          </Field>

          <Field label="Coach notes (optional)">
            <textarea value={d.notes} onChange={(e) => set('notes', e.target.value)} rows={3}
              className="w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:outline-none focus:border-gold-400 resize-y" />
          </Field>

          <label className="flex items-center gap-2 text-xs font-medium" style={{ color: '#1C1C1C' }}>
            <input type="checkbox" checked={!!d.is_active} onChange={(e) => set('is_active', e.target.checked)} />
            Active (visible in pickers & block builder)
          </label>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onCancel} className="text-xs font-semibold px-3 py-1.5" style={{ color: '#6b7280' }}>
            Cancel
          </button>
          <button onClick={() => onSave(d)}
            className="text-xs font-semibold px-4 py-1.5 rounded text-white"
            style={{ backgroundColor: GOLD }}>
            {mode === 'add' ? 'Add exercise' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#6b7280' }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function ChipGrid({ options, value, onToggle }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => {
        const on = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className="text-[11px] px-2 py-0.5 rounded-full border transition-colors"
            style={{
              borderColor: on ? GOLD : '#e5e7eb',
              backgroundColor: on ? 'rgba(165,141,105,0.15)' : '#fff',
              color: on ? GOLD : '#6b7280',
            }}
          >
            {opt.replace(/_/g, ' ')}
          </button>
        );
      })}
    </div>
  );
}

// ─── Bulk import ──────────────────────────────────────────────────────
// Paste a TSV/CSV/pipe-separated table of "Exercise name → URL" pairs,
// fuzzy-match against the library, preview the resolution, then apply.
// Lifts the same normaliser the PDF importer uses so spreadsheets and
// programme PDFs converge on a single matching contract.
const normaliseName = (s) => String(s || '')
  .toLowerCase()
  .replace(/[\-–—_/]/g, ' ')
  .replace(/[^\p{L}\p{N}\s]/gu, '')
  .replace(/\s+/g, ' ')
  .trim();

// CSV-aware row splitter — handles tab / pipe / quoted-comma fields so
// the bulk import can swallow whatever the coach pastes (a TSV from
// Sheets, a CSV from Excel, or a loose "name URL" line).
function parseRow(line, sepHint) {
  if (sepHint === '\t' || sepHint === '|') {
    return line.split(sepHint).map(s => s.trim());
  }
  // CSV with optional quoted fields containing commas.
  const out = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQuote = false;
      else cur += ch;
    } else {
      if (ch === '"') inQuote = true;
      else if (ch === ',') { out.push(cur); cur = ''; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out.map(s => s.trim());
}

// Detect the table separator from the first non-empty line. Tabs and
// pipes are strong signals; otherwise default to comma.
function detectSeparator(text) {
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    if (line.includes('\t')) return '\t';
    if (line.includes('|'))  return '|';
    return ',';
  }
  return ',';
}

// Header-aware column resolver: returns { nameIdx, urlIdx } or null
// if the first row doesn't look like headers. Prefers a "new url"
// column over a "current url" one so the round-trip CSV export
// targets the right column on re-import.
function resolveColumns(headerCells) {
  const lower = headerCells.map(c => String(c || '').toLowerCase());
  const looksLikeHeader =
    lower.some(c => c === 'name' || c === 'exercise' || c === 'exercise name')
    && lower.some(c => c.includes('url') || c.includes('link') || c.includes('demo') || c.includes('video'));
  if (!looksLikeHeader) return null;

  const nameIdx = lower.findIndex(c => c === 'name' || c === 'exercise' || c === 'exercise name');
  // Prefer a "new" URL column; fall back to anything urly.
  let urlIdx = lower.findIndex(c => /(new|updated)/.test(c) && /(url|link|demo|video)/.test(c));
  if (urlIdx === -1) urlIdx = lower.findIndex(c => /(url|link|demo|video)/.test(c) && !/current/.test(c));
  if (urlIdx === -1) urlIdx = lower.findIndex(c => /(url|link|demo|video)/.test(c));

  if (nameIdx === -1 || urlIdx === -1) return null;
  return { nameIdx, urlIdx };
}

// Top-level parser → array of { name, url } pairs (URL may be blank).
// Falls back to loose "name URL" extraction for unquoted lines without
// an obvious table structure.
function parsePastedTable(text) {
  const sep = detectSeparator(text);
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];

  const firstCells = parseRow(lines[0], sep);
  const cols = resolveColumns(firstCells);
  if (cols) {
    return lines.slice(1).map(line => {
      const cells = parseRow(line, sep);
      return { name: cells[cols.nameIdx] || '', url: cells[cols.urlIdx] || '' };
    });
  }
  // No header — first two columns of every row are name, URL.
  return lines.map(line => {
    const cells = parseRow(line, sep);
    if (cells.length >= 2) return { name: cells[0], url: cells[1] };
    // Loose "<name> <url>" with no separator
    const m = line.match(/^(.+?)\s+(https?:\/\/\S+)\s*$/i);
    if (m) return { name: m[1].trim(), url: m[2].trim() };
    return { name: line.trim(), url: '' };
  });
}

function BulkImportModal({ libraryRows, onCancel, onApply }) {
  const [text, setText]     = useState('');
  const [busy, setBusy]     = useState(false);

  // Build a normalised-name index of the library once.
  const libByNorm = useMemo(() => {
    const m = new Map();
    for (const r of libraryRows) m.set(normaliseName(r.name), r);
    return m;
  }, [libraryRows]);

  const matches = useMemo(() => {
    if (!text.trim()) return [];
    return parsePastedTable(text)
      .filter(p => p.name)
      .map(({ name, url }) => {
        const line = `${name}  →  ${url || '∅'}`;
        if (!url) return { line, name, url, error: 'No URL' };
        if (!/^https?:\/\//i.test(url)) return { line, name, url, error: 'Invalid URL' };
        const key = normaliseName(name);
        let row = libByNorm.get(key);
        if (!row) {
          // Loose fallback — name is a substring of a library row's name or vice versa.
          const cand = libraryRows
            .map(r => ({ r, n: normaliseName(r.name) }))
            .filter(({ n }) => n.includes(key) || key.includes(n))
            .sort((a, b) => a.n.length - b.n.length);
          row = cand[0]?.r || null;
        }
        return {
          line, name, url, libraryRow: row,
          error: row ? null : 'No library match',
          overwrites: row?.demo_video_url ? true : false,
        };
      });
  }, [text, libByNorm, libraryRows]);

  const matchCount  = matches.filter(m => m.libraryRow && m.url && !m.error).length;
  const errorCount  = matches.filter(m => m.error).length;
  const overwriteCount = matches.filter(m => m.libraryRow && m.overwrites).length;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}
    >
      <div className="bg-white rounded-xl w-[760px] max-w-[94vw] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-bold" style={{ color: '#1C1C1C' }}>Bulk import demo links</h3>
          <p className="text-[11px] mt-1" style={{ color: '#6b7280' }}>
            Paste a table from a spreadsheet — minimum two columns (Name + URL),
            but the full CSV exported from this view (with Category / Used / Current Demo URL / New Demo URL)
            also round-trips cleanly. Tabs, commas, pipes, or a plain space before the URL all work.
            Matching is fuzzy so "Trap-Bar Deadlift" hits "Trap Bar Deadlift".
          </p>
        </div>

        <div className="flex-1 overflow-hidden grid grid-cols-2 gap-0">
          <div className="border-r border-gray-100 p-4 flex flex-col gap-2 overflow-hidden">
            <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#6b7280' }}>
              Paste here
            </span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={'Trap Bar Deadlift\thttps://www.youtube.com/watch?v=...\nHang Clean\thttps://www.youtube.com/shorts/...'}
              className="flex-1 w-full px-3 py-2 text-[11px] font-mono rounded border border-gray-200 focus:outline-none focus:border-gold-400 resize-none"
            />
          </div>

          <div className="p-4 flex flex-col gap-2 overflow-hidden">
            <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#6b7280' }}>
              Preview · {matchCount} match{matchCount === 1 ? '' : 'es'}
              {errorCount     ? ` · ${errorCount} error${errorCount === 1 ? '' : 's'}`           : ''}
              {overwriteCount ? ` · ${overwriteCount} will overwrite`                            : ''}
            </span>
            <div className="flex-1 overflow-y-auto border border-gray-100 rounded">
              {matches.length === 0 ? (
                <p className="px-3 py-4 text-xs italic" style={{ color: '#9ca3af' }}>
                  Paste rows on the left to see matches here.
                </p>
              ) : (
                <table className="w-full text-[10px]">
                  <tbody>
                    {matches.map((m, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td className="px-2 py-1.5 align-top" style={{ width: 18 }}>
                          {m.libraryRow
                            ? <span style={{ color: m.overwrites ? '#f59e0b' : GOLD }}>●</span>
                            : <span style={{ color: '#dc2626' }}>●</span>}
                        </td>
                        <td className="px-2 py-1.5 align-top">
                          <div className="font-semibold" style={{ color: '#1C1C1C' }}>{m.name || m.line}</div>
                          {m.libraryRow && (
                            <div className="text-gray-500 truncate" title={m.libraryRow.name}>
                              → {m.libraryRow.name}
                            </div>
                          )}
                          {m.error && <div className="text-red-500">{m.error}</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onCancel} disabled={busy} className="text-xs font-semibold px-3 py-1.5" style={{ color: '#6b7280' }}>
            Cancel
          </button>
          <button
            onClick={async () => { setBusy(true); await onApply(matches); setBusy(false); }}
            disabled={busy || matchCount === 0}
            className="text-xs font-semibold px-4 py-1.5 rounded text-white disabled:opacity-50"
            style={{ backgroundColor: GOLD }}
          >
            {busy ? 'Applying…' : `Apply ${matchCount} link${matchCount === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
