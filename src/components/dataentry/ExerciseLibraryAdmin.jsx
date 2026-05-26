import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, X, PlayCircle, Pencil, EyeOff, Eye } from 'lucide-react';
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
  const [modal, setModal]           = useState(null); // null | { mode, row }
  const [toast, setToast]           = useState(null);
  const [tick, setTick]             = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('exercise_library')
        .select('id, name, category, equipment, bilateral_unilateral, primary_muscle, notes, demo_video_url, is_active, movement_patterns')
        .order('name', { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error('[ExerciseLibraryAdmin] fetch failed', error);
        setToast({ kind: 'error', msg: error.message });
      } else {
        setRows(data || []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [tick]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => {
      if (!showInactive && !r.is_active) return false;
      if (catFilter !== 'all' && r.category !== catFilter) return false;
      if (q && !r.name.toLowerCase().includes(q)
            && !(r.primary_muscle || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, query, catFilter, showInactive]);

  const openAdd  = () => setModal({ mode: 'add',  row: { ...empty } });
  const openEdit = (row) => setModal({ mode: 'edit', row: { ...row, movement_patterns: row.movement_patterns || [], equipment: row.equipment || [] } });
  const close    = () => setModal(null);

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
