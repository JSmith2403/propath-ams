import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  ScatterChart, Scatter,
  ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceArea, ResponsiveContainer,
} from 'recharts';
import { Settings, Plus, X, RotateCcw } from 'lucide-react';
import { METRIC_CATEGORIES, METRIC_MAP } from '../../data/sessionMetrics';
import { useCustomMetrics } from '../../hooks/useCustomMetrics';

// ─── Constants ────────────────────────────────────────────────────────────────

const GOLD  = '#A58D69';
const TEAL  = '#437E8D';

const LOWER_IS_BETTER = new Set([
  'sprint10m', 'sprint20m', 'sprint40m', 'mod505', 'reactionTime',
]);

const DEFAULT_KPI_KEYS = [
  'cmjHeight',
  'cmjRelPower',
  'imtpPeakForce',
  'rsi105',
  'hamstring30',
  'hamstring90',
  'adduction0',
  'chinUpMaxReps',
  'benchPress3RM',
  'sixMinRun',
];

// Special derived metrics that aren't in METRIC_MAP
const SPECIAL_METRICS = {
  cmjRelPower: {
    key: 'cmjRelPower', label: 'CMJ W/kg', unit: 'W/kg',
    sourceKey: 'cmjPeakPower', categoryKey: 'power',
  },
};

// Display label overrides for specific metric keys
const LABEL_OVERRIDES = {
  cmjRelPower: 'CMJ W/kg',
  adduction0:  'Adductor Squeeze',
};

const ZONES = {
  well_developed:   { label: 'Well Developed',   bg: '#dcfce7', text: '#15803d', prescription: 'Maintain training balance. Focus on sport-specific power application.' },
  power_deficient:  { label: 'Power Deficient',  bg: '#fef9c3', text: '#854d0e', prescription: 'Prioritise rate of force development, plyometrics, and ballistic work.' },
  force_deficient:  { label: 'Force Deficient',  bg: '#e0f2fe', text: '#0369a1', prescription: 'Prioritise maximal strength development. Heavy compound lifting.' },
  needs_foundation: { label: 'Needs Foundation', bg: '#fee2e2', text: '#b91c1c', prescription: 'Build strength and power foundations. Do not prioritise power work until strength base is established.' },
};

const BRAG_OPTIONS = [
  { value: 'grey',  label: 'No Assessment', bg: '#e5e7eb', text: '#374151' },
  { value: 'blue',  label: 'Exceeding',     bg: '#dbeafe', text: '#1d4ed8' },
  { value: 'green', label: 'Meeting',        bg: '#dcfce7', text: '#15803d' },
  { value: 'amber', label: 'Below',          bg: '#fef3c7', text: '#92400e' },
  { value: 'red',   label: 'Well Below',     bg: '#fee2e2', text: '#b91c1c' },
];

const MASTER_KEY_ORDER = METRIC_CATEGORIES.flatMap(c => c.metrics.map(m => m.key));

// ─── Utilities ────────────────────────────────────────────────────────────────

function getInitials(name = '') {
  const p = name.trim().split(/\s+/);
  if (p.length === 1) return (p[0][0] || '?').toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function getAgeYears(dob) {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob)) / (365.25 * 86400000));
}

function getDefaultThresholds(athlete) {
  const age = getAgeYears(athlete?.dob);
  if (age != null && age < 14) return { imtp: 1200, cmj: 900 };
  if (athlete?.gender === 'Female') return { imtp: 1800, cmj: 1400 };
  return { imtp: 2800, cmj: 2200 };
}

function extractScalar(entry) {
  if (!entry) return null;
  const l = entry.left ?? entry.bestL ?? null;
  const r = entry.right ?? entry.bestR ?? null;
  if (l != null && r != null) return (l + r) / 2;
  if (l != null) return l;
  if (r != null) return r;
  return entry.value ?? entry.best ?? null;
}

function getBodyweightAt(date, matEntries) {
  if (!matEntries?.length) return null;
  const hit = [...matEntries]
    .filter(e => e.bodyMass != null && e.date <= date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return hit[0]?.bodyMass ?? null;
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

function fmtNum(v) {
  if (v == null || !isFinite(v)) return '—';
  return v < 10 ? v.toFixed(2) : v.toFixed(1);
}

function rollingStats(values, window = 5) {
  if (!values.length) return { avg: null, sd: 0 };
  const w   = values.slice(-window);
  const avg = w.reduce((s, v) => s + v, 0) / w.length;
  const sd  = w.length > 1
    ? Math.sqrt(w.reduce((s, v) => s + (v - avg) ** 2, 0) / w.length)
    : 0;
  return { avg, sd };
}

function linearTrend(pts) {
  const n = pts.length;
  if (n < 2) return pts.map(d => ({ ...d, trend: d.v }));
  let sx = 0, sy = 0, sxy = 0, sx2 = 0;
  pts.forEach((d, i) => { sx += i; sy += d.v; sxy += i * d.v; sx2 += i * i; });
  const den = n * sx2 - sx * sx;
  if (!den) return pts.map(d => ({ ...d, trend: d.v }));
  const m = (n * sxy - sx * sy) / den;
  const b = (sy - m * sx) / n;
  return pts.map((d, i) => ({ ...d, trend: parseFloat((m * i + b).toFixed(3)) }));
}

function buildKpiData(rawEntries, metricKey, matEntries) {
  if (!rawEntries?.length) return null;
  const isRelPower = metricKey === 'cmjRelPower';
  const sorted     = [...rawEntries].sort((a, b) => new Date(a.date) - new Date(b.date));

  const pts = sorted.map(e => {
    let v;
    if (isRelPower) {
      const pw = extractScalar(e);
      const bw = getBodyweightAt(e.date, matEntries);
      v = pw != null && bw ? parseFloat((pw / bw).toFixed(2)) : null;
    } else {
      v = extractScalar(e);
    }
    return v != null ? { date: e.date, v } : null;
  }).filter(Boolean);

  if (!pts.length) return null;

  const vals       = pts.map(d => d.v);
  const lowerBetter = LOWER_IS_BETTER.has(metricKey);
  const latest     = vals[vals.length - 1];
  const allTimeBest = lowerBetter ? Math.min(...vals) : Math.max(...vals);
  const { avg: rollingAvg, sd: rollingSD } = rollingStats(vals);

  const isFlagged = rollingAvg != null && rollingSD > 0 && (
    lowerBetter ? latest > rollingAvg + rollingSD : latest < rollingAvg - rollingSD
  );

  const trended   = linearTrend(pts);
  const chartData = trended.map(d => ({
    ...d,
    label:   fmtDate(d.date),
    flagged: rollingAvg != null && rollingSD > 0 && (
      lowerBetter ? d.v > rollingAvg + rollingSD : d.v < rollingAvg - rollingSD
    ),
  }));

  return { chartData, latest, allTimeBest, rollingAvg, rollingSD, isFlagged, lowerBetter };
}

function fmtEntry(entry, metricDef) {
  if (!entry) return '—';
  const u = metricDef?.unit ? ` ${metricDef.unit}` : '';
  const l = entry.left ?? entry.bestL ?? null;
  const r = entry.right ?? entry.bestR ?? null;
  if (l != null || r != null)
    return `L:${l != null ? l + u : '—'} / R:${r != null ? r + u : '—'}`;
  const v = entry.value ?? entry.best ?? null;
  return v != null ? `${v}${u}` : '—';
}

// ─── localStorage ────────────────────────────────────────────────────────────

const STORAGE_KEY = 'propath_perf_ui';

function loadPerf(athleteId) {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')[athleteId] || {}; }
  catch { return {}; }
}

function savePerf(athleteId, patch) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    all[athleteId] = { ...all[athleteId], ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

// ─── Metric Picker ────────────────────────────────────────────────────────────

function MetricPicker({ onSelect, onClose, exclude = [] }) {
  const { customMetrics } = useCustomMetrics();
  const ref = useRef();

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const customList = Object.values(customMetrics).filter(m => !exclude.includes(m.key));

  return (
    <div ref={ref}
      className="absolute z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-y-auto"
      style={{ width: 248, maxHeight: 320, top: 0, right: 0 }}>
      {METRIC_CATEGORIES.map(cat => {
        const specials = cat.key === 'power'
          ? [SPECIAL_METRICS.cmjRelPower].filter(s => !exclude.includes(s.key)) : [];
        const items = [
          ...cat.metrics.filter(m => !exclude.includes(m.key)),
          ...specials,
        ];
        if (!items.length) return null;
        return (
          <div key={cat.key}>
            <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide bg-gray-50 sticky top-0">
              {cat.label}
            </div>
            {items.map(m => (
              <button key={m.key}
                onClick={() => { onSelect(m.key); onClose(); }}
                className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                {LABEL_OVERRIDES[m.key] || m.label}
              </button>
            ))}
          </div>
        );
      })}
      {customList.length > 0 && (
        <div>
          <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide bg-gray-50 sticky top-0">
            Custom
          </div>
          {customList.map(m => (
            <button key={m.key}
              onClick={() => { onSelect(m.key); onClose(); }}
              className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors">
              {m.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Diagnostic Quadrant ──────────────────────────────────────────────────────

function DiagnosticQuadrant({ athlete, entries, matEntries, thresholds, onSaveThresholds }) {
  const [showSettings, setShowSettings] = useState(false);
  const [draft, setDraft] = useState(thresholds);

  const latestOf = useCallback((key) => {
    const list = [...(entries[key] || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    return list.length ? extractScalar(list[0]) : null;
  }, [entries]);

  const imtpVal = latestOf('imtpPeakForce');
  const cmjVal  = latestOf('cmjPeakForce');

  if (imtpVal == null || cmjVal == null) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 flex items-center justify-center"
        style={{ minHeight: 180, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <p className="text-sm italic text-gray-400">
          Record CMJ Peak Force and IMTP Max Force to generate diagnostic.
        </p>
      </div>
    );
  }

  const highImtp = imtpVal >= thresholds.imtp;
  const highCmj  = cmjVal  >= thresholds.cmj;
  const zone = highImtp && highCmj   ? 'well_developed'
             : !highImtp && highCmj  ? 'power_deficient'
             : highImtp && !highCmj  ? 'force_deficient'
             :                         'needs_foundation';
  const zoneInfo = ZONES[zone];

  const xMax = Math.max(imtpVal * 1.35, thresholds.imtp * 1.55);
  const yMax = Math.max(cmjVal  * 1.35, thresholds.cmj  * 1.55);
  const initials = getInitials(athlete?.name);

  const zoneOpacity = (z) => zone === z ? 0.4 : 0.1;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
        <h3 className="text-sm font-bold text-gray-800">Diagnostic Quadrant</h3>
        <button
          onClick={() => { setDraft(thresholds); setShowSettings(v => !v); }}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 transition-colors"
          title="Adjust thresholds">
          <Settings size={14} />
        </button>
      </div>

      {/* Scatter chart */}
      <div className="px-2 pt-3 pb-1">
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 12, right: 24, bottom: 36, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              type="number" dataKey="x" domain={[0, xMax]} name="IMTP"
              tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false}
              label={{ value: 'IMTP Max Force (N)', position: 'insideBottom', offset: -20, fontSize: 11, fill: '#9ca3af' }}
            />
            <YAxis
              type="number" dataKey="y" domain={[0, yMax]} name="CMJ PF"
              tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={52}
              label={{ value: 'CMJ Peak Force (N)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: '#9ca3af' }}
            />

            {/* Zone tints */}
            <ReferenceArea x1={0} x2={thresholds.imtp} y1={thresholds.cmj} y2={yMax} fill={ZONES.power_deficient.bg}  fillOpacity={zoneOpacity('power_deficient')}  stroke="none" />
            <ReferenceArea x1={thresholds.imtp} x2={xMax} y1={thresholds.cmj} y2={yMax} fill={ZONES.well_developed.bg}   fillOpacity={zoneOpacity('well_developed')}   stroke="none" />
            <ReferenceArea x1={0} x2={thresholds.imtp} y1={0} y2={thresholds.cmj} fill={ZONES.needs_foundation.bg} fillOpacity={zoneOpacity('needs_foundation')} stroke="none" />
            <ReferenceArea x1={thresholds.imtp} x2={xMax} y1={0} y2={thresholds.cmj} fill={ZONES.force_deficient.bg}  fillOpacity={zoneOpacity('force_deficient')}  stroke="none" />

            {/* Threshold lines */}
            <ReferenceLine x={thresholds.imtp} stroke="#9ca3af" strokeDasharray="5 3" strokeWidth={1.5} />
            <ReferenceLine y={thresholds.cmj}  stroke="#9ca3af" strokeDasharray="5 3" strokeWidth={1.5} />

            {/* Athlete dot */}
            <Scatter
              data={[{ x: imtpVal, y: cmjVal }]}
              isAnimationActive={false}
              shape={props => {
                const { cx, cy } = props;
                if (cx == null || cy == null) return null;
                return (
                  <g>
                    <circle cx={cx} cy={cy} r={18} fill="#1C1C1C" stroke="white" strokeWidth={2.5} />
                    <text x={cx} y={cy + 4} textAnchor="middle" fill="white" fontSize={9} fontWeight="bold">{initials}</text>
                  </g>
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Zone prescription */}
      <div className="mx-4 mb-4 rounded-lg px-4 py-3" style={{ backgroundColor: zoneInfo.bg }}>
        <p className="text-xs font-bold mb-0.5" style={{ color: zoneInfo.text }}>{zoneInfo.label}</p>
        <p className="text-xs" style={{ color: zoneInfo.text }}>{zoneInfo.prescription}</p>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Threshold Settings</p>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <label className="block">
              <span className="text-xs text-gray-500 block mb-1">IMTP Threshold (N)</span>
              <input type="number" value={draft.imtp}
                onChange={e => setDraft(d => ({ ...d, imtp: Number(e.target.value) }))}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none bg-white" />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500 block mb-1">CMJ PF Threshold (N)</span>
              <input type="number" value={draft.cmj}
                onChange={e => setDraft(d => ({ ...d, cmj: Number(e.target.value) }))}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none bg-white" />
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { onSaveThresholds(draft); setShowSettings(false); }}
              className="px-3 py-1.5 text-xs font-semibold text-white rounded hover:opacity-90"
              style={{ backgroundColor: GOLD }}>
              Apply
            </button>
            <button
              onClick={() => {
                const def = getDefaultThresholds(athlete);
                setDraft(def);
                onSaveThresholds(def);
                setShowSettings(false);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded bg-white">
              <RotateCcw size={10} /> Reset defaults
            </button>
            <button onClick={() => setShowSettings(false)} className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-700">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiDot({ cx, cy, payload }) {
  if (cx == null || cy == null) return null;
  return <circle cx={cx} cy={cy} r={4} fill={payload?.flagged ? '#f59e0b' : TEAL} stroke="white" strokeWidth={1.5} />;
}

function KpiCard({ metricKey, entries, matEntries, customMetrics, onSwap, onRemove }) {
  const sourceKey  = SPECIAL_METRICS[metricKey]?.sourceKey ?? metricKey;
  const rawEntries = entries[sourceKey] || [];

  const chartData = useMemo(
    () => buildKpiData(rawEntries, metricKey, matEntries),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawEntries.length, metricKey]
  );

  const metricDef = SPECIAL_METRICS[metricKey] || METRIC_MAP[metricKey] || customMetrics?.[metricKey];
  const unit      = metricDef?.unit || '';
  const customList = Object.values(customMetrics || {});

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

      {/* Header — metric selector dropdown */}
      <div className="flex items-center gap-1 mb-2">
        <select
          value={metricKey}
          onChange={e => onSwap?.(e.target.value)}
          title="Change metric"
          className="flex-1 min-w-0 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded px-1.5 py-0.5 cursor-pointer focus:outline-none focus:border-gray-400 truncate"
        >
          {METRIC_CATEGORIES.map(cat => {
            const specials = cat.key === 'power' ? [SPECIAL_METRICS.cmjRelPower] : [];
            const items    = [...cat.metrics, ...specials];
            return (
              <optgroup key={cat.key} label={cat.label}>
                {items.map(m => (
                  <option key={m.key} value={m.key}>
                    {LABEL_OVERRIDES[m.key] || m.label}
                  </option>
                ))}
              </optgroup>
            );
          })}
          {customList.length > 0 && (
            <optgroup label="Custom">
              {customList.map(m => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </optgroup>
          )}
        </select>
        {onRemove && (
          <button onClick={onRemove}
            className="shrink-0 p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors">
            <X size={12} />
          </button>
        )}
      </div>

      {!chartData ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-xs text-gray-300 italic">No data recorded yet.</p>
        </div>
      ) : (
        <>
          {/* Chart */}
          <ResponsiveContainer width="100%" height={120}>
            <ComposedChart data={chartData.chartData} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#d1d5db' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: '#d1d5db' }} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload.find(x => x.dataKey === 'v') || payload[0];
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 shadow-md text-xs">
                      <p className="text-gray-400 mb-0.5">{p?.payload?.label}</p>
                      <p className="font-bold text-gray-900">{fmtNum(p?.value)}{unit ? ` ${unit}` : ''}</p>
                    </div>
                  );
                }}
              />
              {/* Trend dashed */}
              <Line type="linear" dataKey="trend" stroke="#e5e7eb" strokeWidth={1.5} dot={false} strokeDasharray="4 2" isAnimationActive={false} />
              {/* Data */}
              <Line type="monotone" dataKey="v" stroke={TEAL} strokeWidth={2} dot={<KpiDot />} activeDot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-1 mt-3">
            {[
              { label: 'Latest',      val: chartData.latest },
              { label: 'All-Time',    val: chartData.allTimeBest },
              { label: 'Rolling Avg', val: chartData.rollingAvg },
              { label: 'Rolling SD',  val: chartData.rollingSD },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center py-1 rounded-md bg-gray-50">
                <span className="text-gray-400 mb-0.5" style={{ fontSize: 9 }}>{s.label}</span>
                <span className="text-xs font-bold text-gray-700">{fmtNum(s.val)}</span>
              </div>
            ))}
          </div>

          {/* Amber flag */}
          {chartData.isFlagged && (
            <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: '#fef3c7' }}>
              <span style={{ fontSize: 11 }}>⚠</span>
              <p className="text-xs font-medium" style={{ color: '#92400e', fontSize: 11 }}>Below rolling average — monitor</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export default function PerformanceTestingTab({
  athlete,
  entries = {},
  maturationEntries = [],
  bragRatings = {},
  onSaveBrag,
}) {
  const { customMetrics } = useCustomMetrics();
  const athleteId = athlete?.id || '';

  const persisted = useMemo(() => loadPerf(athleteId), [athleteId]);
  const defaultThresh = useMemo(() => getDefaultThresholds(athlete), [athlete]);

  const [thresholds,  setThresholds]  = useState(() => persisted.thresholds || defaultThresh);
  const [kpiMetrics,  setKpiMetrics]  = useState(() => persisted.kpiMetrics  || DEFAULT_KPI_KEYS);
  const [addlMetrics, setAddlMetrics] = useState(() => persisted.additionalMetrics || []);
  const [addPickerOpen, setAddPickerOpen] = useState(false);
  const addPickerClose = useCallback(() => setAddPickerOpen(false), []);

  const [localBrag, setLocalBrag] = useState(() => ({ ...bragRatings }));

  const handleSaveThresholds = useCallback(t => {
    setThresholds(t);
    savePerf(athleteId, { thresholds: t });
  }, [athleteId]);

  const swapKpi = useCallback((idx, newKey) => {
    setKpiMetrics(prev => {
      const next = prev.map((k, i) => i === idx ? newKey : k);
      savePerf(athleteId, { kpiMetrics: next });
      return next;
    });
  }, [athleteId]);

  const addAdditional = useCallback(key => {
    setAddlMetrics(prev => {
      if (prev.includes(key)) return prev;
      const next = [...prev, key];
      savePerf(athleteId, { additionalMetrics: next });
      return next;
    });
    setAddPickerOpen(false);
  }, [athleteId]);

  const removeAdditional = useCallback(key => {
    setAddlMetrics(prev => {
      const next = prev.filter(k => k !== key);
      savePerf(athleteId, { additionalMetrics: next });
      return next;
    });
  }, [athleteId]);

  const swapAdditional = useCallback((oldKey, newKey) => {
    setAddlMetrics(prev => {
      const next = prev.map(k => k === oldKey ? newKey : k);
      savePerf(athleteId, { additionalMetrics: next });
      return next;
    });
  }, [athleteId]);

  const handleBragChange = useCallback((key, color) => {
    setLocalBrag(prev => ({ ...prev, [key]: color }));
    onSaveBrag?.(key, color);
  }, [onSaveBrag]);

  // Performance table sorted keys
  const customKeys   = Object.keys(customMetrics || {});
  const activeKeys   = Object.keys(entries).filter(k => (entries[k] || []).length > 0);
  const sortedKeys   = [
    ...MASTER_KEY_ORDER.filter(k => activeKeys.includes(k)),
    ...activeKeys.filter(k => !MASTER_KEY_ORDER.includes(k) && customKeys.includes(k)),
    ...activeKeys.filter(k => !MASTER_KEY_ORDER.includes(k) && !customKeys.includes(k)),
  ];

  return (
    <div className="space-y-6">

      {/* ── Section 1: Diagnostic Quadrant ───────────────────────── */}
      <DiagnosticQuadrant
        athlete={athlete}
        entries={entries}
        matEntries={maturationEntries}
        thresholds={thresholds}
        onSaveThresholds={handleSaveThresholds}
      />

      {/* ── Section 2: KPI Cards ──────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">KPI Dashboard</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {kpiMetrics.map((key, idx) => (
            <KpiCard
              key={`kpi-${idx}`}
              metricKey={key}
              entries={entries}
              matEntries={maturationEntries}
              customMetrics={customMetrics}
              onSwap={newKey => swapKpi(idx, newKey)}
            />
          ))}
        </div>
      </div>

      {/* ── Section 3: Additional Metrics ────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Additional Metrics</h3>
          <div className="relative">
            <button onClick={() => setAddPickerOpen(v => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: GOLD }}>
              <Plus size={12} /> Add Metric
            </button>
            {addPickerOpen && (
              <div className="absolute right-0" style={{ top: 32, zIndex: 50 }}>
                <MetricPicker onSelect={addAdditional} onClose={addPickerClose} exclude={addlMetrics} />
              </div>
            )}
          </div>
        </div>

        {addlMetrics.length === 0 ? (
          <p className="text-xs text-gray-300 italic">
            No additional metrics added. Use the button above to track metrics specific to this athlete.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {addlMetrics.map(key => (
              <KpiCard
                key={`addl-${key}`}
                metricKey={key}
                entries={entries}
                matEntries={maturationEntries}
                customMetrics={customMetrics}
                onSwap={newKey => swapAdditional(key, newKey)}
                onRemove={() => removeAdditional(key)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Section 4: Performance Table ─────────────────────────── */}
      {sortedKeys.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Performance Record</h3>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Metric</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Previous</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Current</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">BRAG</th>
                </tr>
              </thead>
              <tbody>
                {sortedKeys.map(key => {
                  const list    = [...(entries[key] || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
                  const current  = list[0] || null;
                  const previous = list[1] || null;
                  const mDef    = METRIC_MAP[key] || customMetrics?.[key];
                  const label   = LABEL_OVERRIDES[key] || mDef?.label || key;
                  const brag    = localBrag[key] || 'grey';
                  const bragOpt = BRAG_OPTIONS.find(o => o.value === brag) || BRAG_OPTIONS[0];
                  return (
                    <tr key={key} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800 text-sm">{label}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{fmtEntry(previous, mDef)}</td>
                      <td className="px-4 py-3 text-gray-700 text-sm font-medium">{fmtEntry(current, mDef)}</td>
                      <td className="px-4 py-3 text-center">
                        <select value={brag} onChange={e => handleBragChange(key, e.target.value)}
                          className="text-xs font-semibold px-2 py-1.5 rounded border-0 focus:outline-none cursor-pointer"
                          style={{ backgroundColor: bragOpt.bg, color: bragOpt.text }}>
                          {BRAG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
