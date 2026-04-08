import { useState } from 'react';
import { X, Plus, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { METRIC_CATEGORIES, ALL_METRICS } from '../../data/sessionMetrics';

const GOLD = '#A58D69';

function todayStr() { return new Date().toISOString().slice(0, 10); }

// Categories available for custom metric placement (matches DataStorageTable CAT_COLORS)
const STORAGE_CATEGORIES = [
  'Biometrics', 'Power', 'Reactivity', 'Strength',
  'Capacity', 'Speed', 'Aerobic', 'Cognitive', 'Custom',
];

const FORMULA_TYPES = [
  { value: 'pct_discrepancy_lr', label: 'Percentage Discrepancy L vs R',   needsLR: true  },
  { value: 'diff_lr',             label: 'Difference L vs R',                needsLR: true  },
  { value: 'pct_change',          label: 'Percentage Change from Baseline',  needsLR: false },
  { value: 'ratio',               label: 'Ratio of two metrics',             needsLR: false, needsPair: true },
];

function CalcForm({ bilateral, allMetricKeys, onAdd, onCancel }) {
  const [name,        setName]        = useState('');
  const [formulaType, setFormulaType] = useState('pct_discrepancy_lr');
  const [sourceA,     setSourceA]     = useState(allMetricKeys[0] || '');
  const [sourceB,     setSourceB]     = useState(allMetricKeys[1] || '');

  const selected = FORMULA_TYPES.find(f => f.value === formulaType);
  const lrTypes  = FORMULA_TYPES.filter(f => !f.needsLR || bilateral);

  const canSave = name.trim() && (!selected?.needsPair || (sourceA && sourceB));

  const handleAdd = () => {
    if (!canSave) return;
    const uid = `calc_${Date.now()}`;
    onAdd({ key: uid, name: name.trim(), formulaType, sourceA, sourceB });
  };

  return (
    <div className="mt-3 p-3 rounded-lg border border-dashed border-purple-200 bg-purple-50 space-y-3">
      <p className="text-xs font-semibold text-purple-700">Dependent Calculation</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-0.5">Calculation name *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Asymmetry Index"
            className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-0.5">Formula type *</label>
          <select value={formulaType} onChange={e => setFormulaType(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none bg-white">
            {lrTypes.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {selected?.needsPair && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-0.5">Metric A (numerator)</label>
            <select value={sourceA} onChange={e => setSourceA(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none bg-white">
              {allMetricKeys.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-0.5">Metric B (denominator)</label>
            <select value={sourceB} onChange={e => setSourceB(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none bg-white">
              {allMetricKeys.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>
      )}

      {selected?.needsLR && !bilateral && (
        <p className="text-xs text-amber-600 italic">⚠ This formula requires a bilateral metric. Switch to L/R above.</p>
      )}

      <div className="flex items-center gap-2">
        <button onClick={handleAdd} disabled={!canSave}
          className="px-3 py-1.5 text-xs font-semibold text-white rounded disabled:opacity-40"
          style={{ backgroundColor: '#a21caf' }}>
          Add Calculation
        </button>
        <button onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-700">Cancel</button>
      </div>
    </div>
  );
}

export default function NewSessionForm({ athletes, onCreated, onCancel, globalCustomMetrics = {}, onAddCustomMetric }) {
  const [date,  setDate]  = useState(todayStr);
  const [label, setLabel] = useState('');

  const [selAthletes, setSelAthletes] = useState(() => new Set(athletes.map(a => a.id)));

  // Auto-select all standard + all persisted custom metrics
  const [selMetrics, setSelMetrics] = useState(() => {
    const base = new Set(ALL_METRICS.map(m => m.key));
    Object.keys(globalCustomMetrics).forEach(k => base.add(k));
    return base;
  });

  const [collapsed,        setCollapsed]        = useState({});
  const [localCustom,      setLocalCustom]      = useState({});
  const [showCustomForm,   setShowCustomForm]   = useState(false);

  // Custom metric form state
  const [customName,       setCustomName]       = useState('');
  const [customUnit,       setCustomUnit]       = useState('');
  const [customBilateral,  setCustomBilateral]  = useState(false);
  const [customCategory,   setCustomCategory]   = useState('Custom');
  const [pendingCalcs,     setPendingCalcs]     = useState([]);
  const [showCalcForm,     setShowCalcForm]     = useState(false);

  const allAthlSelected = selAthletes.size === athletes.length;
  const allMetSelected  = ALL_METRICS.every(m => selMetrics.has(m.key));

  const toggleAthlete = id => setSelAthletes(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const toggleMetric = key => setSelMetrics(prev => {
    const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n;
  });

  const toggleCat = catKey => {
    const cat = METRIC_CATEGORIES.find(c => c.key === catKey);
    if (!cat) return;
    const allOn = cat.metrics.every(m => selMetrics.has(m.key));
    setSelMetrics(prev => {
      const n = new Set(prev);
      cat.metrics.forEach(m => allOn ? n.delete(m.key) : n.add(m.key));
      return n;
    });
  };

  // All metric keys for ratio source selection
  const allMetricKeys = [...ALL_METRICS.map(m => m.key), ...Object.keys(globalCustomMetrics), ...Object.keys(localCustom)];

  const addCustomMetric = () => {
    if (!customName.trim()) return;
    const uid = `cm_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    const m = {
      key: uid,
      label: customName.trim(),
      unit: customUnit.trim(),
      bilateral: customBilateral,
      attempts: 1,
      categoryLabel: customCategory,
      custom: true,
      dependentCalcs: pendingCalcs,
    };
    // Persist globally
    onAddCustomMetric?.(m);
    // Track locally (so it appears in this form immediately)
    setLocalCustom(prev => ({ ...prev, [uid]: m }));
    setSelMetrics(prev => new Set([...prev, uid]));
    // Reset form
    setCustomName(''); setCustomUnit(''); setCustomBilateral(false);
    setCustomCategory('Custom'); setPendingCalcs([]); setShowCalcForm(false);
    setShowCustomForm(false);
  };

  const addCalc = (calc) => {
    setPendingCalcs(prev => [...prev, calc]);
    setShowCalcForm(false);
  };

  const removeCalc = (key) => {
    setPendingCalcs(prev => prev.filter(c => c.key !== key));
  };

  const handleCreate = () => {
    const athleteIds = athletes.filter(a => selAthletes.has(a.id)).map(a => a.id);
    if (athleteIds.length === 0 || selMetrics.size === 0) return;
    const allCustom = { ...globalCustomMetrics, ...localCustom };
    onCreated({ date, label, athleteIds, metricKeys: [...selMetrics], customMetrics: allCustom });
  };

  const chipStyle = (active) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
    border: `1px solid ${active ? GOLD : '#e5e7eb'}`,
    backgroundColor: active ? 'rgba(165,141,105,0.08)' : '#fff',
    color: active ? GOLD : '#6b7280',
  });

  const allCustom = { ...globalCustomMetrics, ...localCustom };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">New Testing Session</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-700"><X size={17} /></button>
      </div>

      {/* Date + Label */}
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Session Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
            Label <span className="font-normal text-gray-400 normal-case">(optional)</span>
          </label>
          <input type="text" value={label} onChange={e => setLabel(e.target.value)}
            placeholder="e.g. Q1 Testing Day"
            className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none placeholder-gray-300" />
        </div>
      </div>

      {/* Athletes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Athletes</span>
          <button onClick={() => setSelAthletes(allAthlSelected ? new Set() : new Set(athletes.map(a => a.id)))}
            className="text-xs text-gray-400 hover:text-gray-700">{allAthlSelected ? 'Deselect All' : 'Select All'}</button>
        </div>
        <div className="flex flex-wrap gap-1.5 max-w-2xl">
          {athletes.map(a => (
            <label key={a.id} style={chipStyle(selAthletes.has(a.id))}>
              <input type="checkbox" className="hidden" checked={selAthletes.has(a.id)} onChange={() => toggleAthlete(a.id)} />
              {a.name}
            </label>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Metrics</span>
          <button onClick={() => setSelMetrics(allMetSelected ? new Set() : new Set(ALL_METRICS.map(m => m.key)))}
            className="text-xs text-gray-400 hover:text-gray-700">{allMetSelected ? 'Deselect All' : 'Select All'}</button>
        </div>
        <div className="space-y-3 max-w-3xl">
          {METRIC_CATEGORIES.map(cat => {
            const catActive = cat.metrics.every(m => selMetrics.has(m.key));
            const isOpen    = !collapsed[cat.key];
            return (
              <div key={cat.key} className="border border-gray-100 rounded-lg overflow-hidden">
                <button
                  onClick={() => setCollapsed(p => ({ ...p, [cat.key]: !p[cat.key] }))}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-600 uppercase tracking-wide bg-gray-50 hover:bg-gray-100">
                  <span>{cat.label}</span>
                  <div className="flex items-center gap-2">
                    <span onClick={e => { e.stopPropagation(); toggleCat(cat.key); }}
                      className="text-xs font-normal normal-case text-gray-400 hover:text-gray-700 px-1">
                      {catActive ? 'None' : 'All'}
                    </span>
                    {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </div>
                </button>
                {isOpen && (
                  <div className="p-2.5 flex flex-wrap gap-1.5">
                    {cat.metrics.map(m => (
                      <label key={m.key} style={chipStyle(selMetrics.has(m.key))}>
                        <input type="checkbox" className="hidden" checked={selMetrics.has(m.key)} onChange={() => toggleMetric(m.key)} />
                        {m.label}{m.unit ? ` (${m.unit})` : ''}{m.bilateral ? ' L/R' : ''}{m.attempts > 1 ? ` ×${m.attempts}` : ''}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Persisted custom metrics */}
          {Object.keys(allCustom).length > 0 && (
            <div className="border border-purple-100 rounded-lg overflow-hidden">
              <div className="px-3 py-2 text-xs font-bold text-purple-700 uppercase tracking-wide bg-purple-50">
                Custom Metrics
              </div>
              <div className="p-2.5 flex flex-wrap gap-1.5">
                {Object.values(allCustom).map(m => (
                  <label key={m.key} style={chipStyle(selMetrics.has(m.key))}>
                    <input type="checkbox" className="hidden" checked={selMetrics.has(m.key)} onChange={() => toggleMetric(m.key)} />
                    {m.label}{m.unit ? ` (${m.unit})` : ''}{m.bilateral ? ' L/R' : ''}
                    {(m.dependentCalcs || []).length > 0 && (
                      <span style={{ fontSize: 9, marginLeft: 2, opacity: 0.65 }}>+ {m.dependentCalcs.length} calc</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Add custom metric form */}
          {showCustomForm ? (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50">
              <p className="text-xs font-semibold text-gray-600">New Custom Metric</p>

              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-0.5">Metric name *</label>
                  <input type="text" value={customName} onChange={e => setCustomName(e.target.value)}
                    placeholder="e.g. Triple Single Leg Broad Jump" autoFocus
                    onKeyDown={e => e.key === 'Enter' && addCustomMetric()}
                    className="text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none" style={{ width: 220 }} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-0.5">Unit</label>
                  <input type="text" value={customUnit} onChange={e => setCustomUnit(e.target.value)}
                    placeholder="e.g. cm"
                    className="text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none" style={{ width: 70 }} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-0.5">Category</label>
                  <select value={customCategory} onChange={e => setCustomCategory(e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none bg-white" style={{ width: 110 }}>
                    {STORAGE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer pb-0.5">
                  <input type="checkbox" checked={customBilateral} onChange={e => setCustomBilateral(e.target.checked)} /> L / R
                </label>
              </div>

              {/* Pending calculations list */}
              {pendingCalcs.length > 0 && (
                <div className="space-y-1">
                  {pendingCalcs.map(c => (
                    <div key={c.key} className="flex items-center justify-between text-xs bg-purple-50 rounded px-2 py-1">
                      <span className="font-medium text-purple-700">{c.name}</span>
                      <span className="text-gray-400 ml-2">{FORMULA_TYPES.find(f => f.value === c.formulaType)?.label}</span>
                      <button onClick={() => removeCalc(c.key)} className="ml-2 text-gray-300 hover:text-red-400">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Collapsible dependent calc form */}
              {showCalcForm ? (
                <CalcForm
                  bilateral={customBilateral}
                  allMetricKeys={allMetricKeys}
                  onAdd={addCalc}
                  onCancel={() => setShowCalcForm(false)}
                />
              ) : (
                <button onClick={() => setShowCalcForm(true)}
                  className="flex items-center gap-1 text-xs text-purple-500 hover:text-purple-700 w-fit">
                  <Plus size={10} /> Add dependent calculation
                </button>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button onClick={addCustomMetric} disabled={!customName.trim()}
                  className="px-3 py-1.5 text-xs font-semibold text-white rounded hover:opacity-90 disabled:opacity-40"
                  style={{ backgroundColor: GOLD }}>Add Metric</button>
                <button onClick={() => { setShowCustomForm(false); setPendingCalcs([]); setShowCalcForm(false); }}
                  className="text-xs text-gray-400 hover:text-gray-700">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowCustomForm(true)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 border border-dashed border-gray-300 rounded px-3 py-2 w-full justify-center">
              <Plus size={11} /> Add custom metric
            </button>
          )}
        </div>
      </div>

      {/* Create */}
      <div className="flex items-center gap-3 pt-1 pb-4">
        <button onClick={handleCreate}
          disabled={selAthletes.size === 0 || selMetrics.size === 0}
          className="px-5 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: GOLD }}>
          Create Session
        </button>
        <button onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-700">Cancel</button>
        <span className="text-xs text-gray-400">
          {selAthletes.size} athlete{selAthletes.size !== 1 ? 's' : ''} · {selMetrics.size} metric{selMetrics.size !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
