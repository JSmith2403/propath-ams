import { useState } from 'react';
import { METRIC_CATEGORIES, METRIC_MAP } from '../../data/sessionMetrics';
import { useCustomMetrics } from '../../hooks/useCustomMetrics';

// Master metric key order derived from METRIC_CATEGORIES
const MASTER_KEY_ORDER = METRIC_CATEGORIES.flatMap(c => c.metrics.map(m => m.key));

// ── BRAG config ────────────────────────────────────────────────────────────────
const BRAG_OPTIONS = [
  { value: 'grey',  label: 'No Assessment', bg: '#e5e7eb', text: '#374151' },
  { value: 'blue',  label: 'Exceeding',     bg: '#dbeafe', text: '#1d4ed8' },
  { value: 'green', label: 'Meeting',        bg: '#dcfce7', text: '#15803d' },
  { value: 'amber', label: 'Below',          bg: '#fef3c7', text: '#92400e' },
  { value: 'red',   label: 'Well Below',     bg: '#fee2e2', text: '#b91c1c' },
];

// ── Value formatter ────────────────────────────────────────────────────────────
function fmtVal(entry, metricDef) {
  if (!entry) return '—';
  const unit = metricDef?.unit ? ` ${metricDef.unit}` : '';
  // Bilateral: stored as left/right or bestL/bestR
  const l = entry.left  ?? entry.bestL ?? null;
  const r = entry.right ?? entry.bestR ?? null;
  if (l != null || r != null) {
    return `L: ${l != null ? l + unit : '—'} / R: ${r != null ? r + unit : '—'}`;
  }
  // Single value: stored as value or best
  const v = entry.value ?? entry.best ?? null;
  return v != null ? `${v}${unit}` : '—';
}

// ── Main tab ──────────────────────────────────────────────────────────────────
export default function PerformanceTestingTab({
  entries = {},
  bragRatings = {},
  onSaveBrag,
}) {
  const { customMetrics } = useCustomMetrics();
  const [localBrag, setLocalBrag] = useState(() => ({ ...bragRatings }));

  const handleBragChange = (key, color) => {
    setLocalBrag(prev => ({ ...prev, [key]: color }));
    onSaveBrag?.(key, color);
  };

  // Metric keys that have at least one entry, ordered by master list then custom
  const activeKeys = Object.keys(entries).filter(k => (entries[k] || []).length > 0);
  const customKeys = Object.keys(customMetrics || {});

  const sortedKeys = [
    ...MASTER_KEY_ORDER.filter(k => activeKeys.includes(k)),
    ...activeKeys.filter(k => !MASTER_KEY_ORDER.includes(k) && customKeys.includes(k)),
    // Any remaining keys not in master list or custom (e.g. legacy)
    ...activeKeys.filter(k => !MASTER_KEY_ORDER.includes(k) && !customKeys.includes(k)),
  ];

  if (sortedKeys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm font-medium text-gray-400">No performance data recorded yet.</p>
        <p className="text-xs text-gray-300 mt-1">Data will appear here once testing sessions are saved.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Metric</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Previous</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Current</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">BRAG Rating</th>
            </tr>
          </thead>
          <tbody>
            {sortedKeys.map(key => {
              const list     = [...(entries[key] || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
              const current  = list[0] || null;
              const previous = list[1] || null;
              const metricDef = METRIC_MAP[key] || customMetrics?.[key];
              const label    = metricDef?.label || key;
              const brag     = localBrag[key] || 'grey';
              const bragOpt  = BRAG_OPTIONS.find(o => o.value === brag) || BRAG_OPTIONS[0];

              return (
                <tr key={key} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800 text-sm">{label}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{fmtVal(previous, metricDef)}</td>
                  <td className="px-4 py-3 text-gray-700 text-sm font-medium">{fmtVal(current, metricDef)}</td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={brag}
                      onChange={e => handleBragChange(key, e.target.value)}
                      className="text-xs font-semibold px-2 py-1.5 rounded border-0 focus:outline-none cursor-pointer"
                      style={{ backgroundColor: bragOpt.bg, color: bragOpt.text }}
                    >
                      {BRAG_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
