import { useState } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import {
  BILATERAL,
  CATEGORIES,
  COMPLEXITY,
  EQUIPMENT,
  MOVEMENT_PATTERNS,
  POSTERIOR_ANTERIOR,
} from './pickerVocab';

/**
 * CreateExerciseModal — quick-add a custom row into exercise_library.
 *
 * Required: name (unique CI — DB enforces via UNIQUE constraint),
 *           category, bilateral_unilateral.
 * Optional (collapsed under "+ Add more details"): movement_patterns,
 *           equipment, complexity, posterior_anterior, primary_muscle,
 *           notes.
 *
 * On save: INSERT with is_active = true, refresh callback so the
 * picker re-fetches the library.
 */
export default function CreateExerciseModal({ onCreated, onClose }) {
  const [name,            setName]       = useState('');
  const [category,        setCategory]   = useState('strength');
  const [bilateral,       setBilateral]  = useState('bilateral');
  const [advancedOpen,    setAdvancedOpen] = useState(false);
  const [movementPatterns, setMovementPatterns] = useState([]);
  const [equipment,       setEquipment]  = useState([]);
  const [complexity,      setComplexity] = useState('');
  const [posterior,       setPosterior]  = useState('');
  const [primaryMuscle,   setPrimaryMuscle] = useState('');
  const [notes,           setNotes]      = useState('');
  const [saving,          setSaving]     = useState(false);
  const [error,           setError]      = useState(null);

  const validName = name.trim().length > 0;
  const canSave = validName && category && bilateral && !saving;

  const toggleIn = (arr, val) =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);

    const payload = {
      name: name.trim(),
      category,
      bilateral_unilateral: bilateral,
      movement_patterns:    movementPatterns,
      equipment:            equipment,
      complexity:           complexity ? Number(complexity) : null,
      posterior_anterior:   posterior || null,
      primary_muscle:       primaryMuscle.trim() || null,
      notes:                notes.trim() || null,
      is_active:            true,
    };

    const { data, error: e } = await supabase
      .from('exercise_library')
      .insert(payload)
      .select()
      .single();

    setSaving(false);
    if (e) {
      // Postgres unique-violation code is 23505. Surface a friendly
      // message instead of the raw constraint name.
      if (e.code === '23505') {
        setError('An exercise with that name already exists.');
      } else {
        setError(e.message || 'Couldn\'t save exercise.');
      }
      return;
    }

    if (onCreated) onCreated(data);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h3 className="font-bold text-sm" style={{ color: '#1C1C1C' }}>Create custom exercise</h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
              Name <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Single-arm cable row"
              className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:outline-none focus:border-gray-400"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
              Category <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:outline-none focus:border-gray-400 bg-white"
            >
              {CATEGORIES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {/* Bilateral / Unilateral */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
              Bilateral / Unilateral <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div className="flex items-center gap-3">
              {BILATERAL.map(([v, l]) => (
                <label key={v} className="inline-flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: '#1C1C1C' }}>
                  <input
                    type="radio"
                    name="bilateral"
                    value={v}
                    checked={bilateral === v}
                    onChange={() => setBilateral(v)}
                    style={{ accentColor: '#A58D69' }}
                  />
                  {l}
                </label>
              ))}
            </div>
          </div>

          {/* + Add more details */}
          <button
            type="button"
            onClick={() => setAdvancedOpen(o => !o)}
            className="flex items-center gap-1 text-[11px] font-semibold"
            style={{ color: '#A58D69' }}
          >
            {advancedOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            Add more details
          </button>

          {advancedOpen && (
            <div className="space-y-4 border-l-2 border-gray-100 pl-3 ml-1">
              {/* Movement pattern */}
              <ChipGroup
                label="Movement pattern"
                options={MOVEMENT_PATTERNS}
                selected={movementPatterns}
                onToggle={(v) => setMovementPatterns(prev => toggleIn(prev, v))}
              />

              {/* Equipment */}
              <ChipGroup
                label="Equipment"
                options={EQUIPMENT}
                selected={equipment}
                onToggle={(v) => setEquipment(prev => toggleIn(prev, v))}
              />

              {/* Complexity */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
                  Complexity
                </label>
                <select
                  value={complexity}
                  onChange={(e) => setComplexity(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:outline-none focus:border-gray-400 bg-white"
                >
                  <option value="">— Not set —</option>
                  {COMPLEXITY.map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Posterior / Anterior */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
                  Posterior / Anterior
                </label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: '#1C1C1C' }}>
                    <input type="radio" name="posterior" value="" checked={posterior === ''} onChange={() => setPosterior('')} style={{ accentColor: '#A58D69' }} />
                    Not set
                  </label>
                  {POSTERIOR_ANTERIOR.map(([v, l]) => (
                    <label key={v} className="inline-flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: '#1C1C1C' }}>
                      <input type="radio" name="posterior" value={v} checked={posterior === v} onChange={() => setPosterior(v)} style={{ accentColor: '#A58D69' }} />
                      {l}
                    </label>
                  ))}
                </div>
              </div>

              {/* Primary muscle */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
                  Primary muscle
                </label>
                <input
                  type="text"
                  value={primaryMuscle}
                  onChange={(e) => setPrimaryMuscle(e.target.value)}
                  placeholder="e.g. lats"
                  className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:outline-none focus:border-gray-400"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Cueing, setup notes, anything that helps."
                  className="w-full px-3 py-2 text-sm rounded border border-gray-200 focus:outline-none focus:border-gray-400 resize-none"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-[11px] rounded px-3 py-2" style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="px-3 py-2 text-xs text-gray-600 hover:text-gray-900">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-4 py-2 text-xs font-semibold text-white rounded transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#A58D69' }}
          >
            {saving ? 'Saving…' : 'Create exercise'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ChipGroup ─────────────────────────────────────────────────────────
// Multi-select via toggleable pills. Used for both movement patterns
// and equipment in the advanced section.
function ChipGroup({ label, options, selected, onToggle }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6b7280' }}>
        {label}
      </label>
      <div className="flex items-center gap-1 flex-wrap">
        {options.map(([v, l]) => {
          const active = selected.includes(v);
          return (
            <button
              key={v}
              type="button"
              onClick={() => onToggle(v)}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors"
              style={{
                backgroundColor: active ? '#437E8D' : '#f3f4f6',
                color:           active ? '#fff'    : '#1C1C1C',
              }}
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}
