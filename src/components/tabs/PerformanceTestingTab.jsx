import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid,
  ReferenceLine, ReferenceArea, ResponsiveContainer,
} from 'recharts';
import { Settings, RotateCcw } from 'lucide-react';
import { METRIC_CATEGORIES, METRIC_MAP, LABEL_OVERRIDES } from '../../data/sessionMetrics';
import { useCustomMetrics } from '../../hooks/useCustomMetrics';
import { useVALDMetrics } from '../../hooks/useVALDMetrics';
import { useKpiBoard } from '../../hooks/useKpiBoard';
import { usePerformanceResults } from '../../hooks/usePerformanceResults';
import { extractScalar } from '../../utils/kpiStats';
import KpiTile from '../kpi/KpiTile';
import AddMetricTile from '../kpi/AddMetricTile';

// ─── Constants ────────────────────────────────────────────────────────────────

const GOLD  = '#A58D69';

const ZONES = {
  well_developed:   { label: 'Well Developed',   bg: '#dcfce7', text: '#15803d', prescription: 'Maintain training balance. Focus on sport-specific power application.' },
  power_deficient:  { label: 'Power Deficient',  bg: '#fef9c3', text: '#854d0e', prescription: 'Prioritise rate of force development, plyometrics, and ballistic work.' },
  force_deficient:  { label: 'Force Deficient',  bg: '#e0f2fe', text: '#0369a1', prescription: 'Prioritise maximal strength development. Heavy compound lifting.' },
  needs_foundation: { label: 'Needs Foundation', bg: '#fee2e2', text: '#b91c1c', prescription: 'Build strength and power foundations. Do not prioritise power work until strength base is established.' },
};

const BRAG_OPTIONS = [
  { value: 'blue',  label: 'Exceeding expectations', bg: '#dbeafe', text: '#1d4ed8' },
  { value: 'green', label: 'On track',               bg: '#dcfce7', text: '#15803d' },
  { value: 'amber', label: 'Area to develop',        bg: '#fef3c7', text: '#92400e' },
  { value: 'red',   label: 'Priority area',          bg: '#ffe4e6', text: '#be123c' },
];
const UNRATED_STYLE = { bg: '#e5e7eb', text: '#6b7280' };

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

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export default function PerformanceTestingTab({
  athlete,
  maturationEntries = [],
  bragRatings = {},
  reportMetrics = [],
  onSaveBrag,
  onSaveReportMetrics,
}) {
  const { customMetrics } = useCustomMetrics();
  const athleteId = athlete?.id || '';

  // Normalized performance test results (performance_test_results table) —
  // replaces the old phase2.performance.entries blob as this tab's source.
  const { entries } = usePerformanceResults(athleteId);

  // VALD imports for this athlete — surfaced in the KPI metric picker
  // alongside manual + custom metrics. Lets coaches chart any imported
  // VALD metric (e.g. CMJ Concentric Peak Force, IMTP RFD 0-100ms) as
  // a Test Result without leaving the Testing tab.
  const { metrics: valdMetrics, entriesFor: valdEntriesFor, defFor: valdDefFor } =
    useVALDMetrics(athleteId);

  // KPI board — server-synced pinned metrics (span 1-4), replacing the old
  // localStorage-only fixed-10-slot KPI Dashboard + Additional Metrics.
  const { board, addMetric, removeMetric, resizeMetric, reorderBoard } = useKpiBoard(athleteId);

  // Drag-to-reorder — displayOrder holds a live preview (metric_key
  // array) while a drag is in progress; reorderBoard only persists once
  // on drag end, so hovering across several tiles mid-drag doesn't fire
  // a write per tile.
  const [dragKey, setDragKey] = useState(null);
  const [displayOrder, setDisplayOrder] = useState(null);
  const boardKeys = board.map(b => b.metric_key);
  const orderedBoard = (displayOrder || boardKeys)
    .map(k => board.find(b => b.metric_key === k))
    .filter(Boolean);

  const handleDragStart = useCallback((key) => {
    setDragKey(key);
    setDisplayOrder(boardKeys);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board]);

  const handleDragEnter = useCallback((overKey) => {
    setDragKey(currentDragKey => {
      if (!currentDragKey || currentDragKey === overKey) return currentDragKey;
      setDisplayOrder(prev => {
        const cur = prev || boardKeys;
        const from = cur.indexOf(currentDragKey);
        const to = cur.indexOf(overKey);
        if (from === -1 || to === -1) return cur;
        const next = [...cur];
        next.splice(from, 1);
        next.splice(to, 0, currentDragKey);
        return next;
      });
      return currentDragKey;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board]);

  const handleDragEnd = useCallback(() => {
    if (displayOrder) reorderBoard(displayOrder);
    setDragKey(null);
    setDisplayOrder(null);
  }, [displayOrder, reorderBoard]);

  const persisted = useMemo(() => loadPerf(athleteId), [athleteId]);
  const defaultThresh = useMemo(() => getDefaultThresholds(athlete), [athlete]);

  const [thresholds, setThresholds] = useState(() => persisted.thresholds || defaultThresh);

  const [localBrag, setLocalBrag] = useState(() => ({ ...bragRatings }));

  // Metrics pinned to the athlete's own Progress tab (max 8). Kept as a
  // Set for cheap lookups. Still passed to the parent via
  // onSaveReportMetrics/reportMetrics — that prop plumbing wasn't
  // renamed, only what it's used for (see useAthletes.js saveReportMetrics).
  const [progressSet, setProgressSet] = useState(() => new Set(reportMetrics || []));
  const [progressWarning, setProgressWarning] = useState(null);

  // Sync local set when the prop changes (e.g. after Supabase load)
  useEffect(() => {
    setProgressSet(new Set(reportMetrics || []));
  }, [reportMetrics.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleProgressMetric = useCallback((key) => {
    setProgressSet(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        if (next.size >= 8) {
          setProgressWarning('Maximum 8 metrics can be shown on the athlete\'s progress tab');
          setTimeout(() => setProgressWarning(null), 3000);
          return prev;
        }
        next.add(key);
      }
      onSaveReportMetrics?.(Array.from(next));
      return next;
    });
  }, [onSaveReportMetrics]);

  const handleSaveThresholds = useCallback(t => {
    setThresholds(t);
    savePerf(athleteId, { thresholds: t });
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

      {/* ── Section 2: KPI Board ──────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">KPI Dashboard</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch" data-board>
          {orderedBoard.map(row => (
            <KpiTile
              key={row.id}
              metricKey={row.metric_key}
              span={row.span}
              entries={entries}
              matEntries={maturationEntries}
              customMetrics={customMetrics}
              valdMetrics={valdMetrics}
              valdEntriesFor={valdEntriesFor}
              valdDefFor={valdDefFor}
              shownOnProgress={progressSet.has(row.metric_key)}
              onToggleProgress={toggleProgressMetric}
              toggleWarning={progressWarning && !progressSet.has(row.metric_key) ? progressWarning : null}
              onRemove={() => removeMetric(row.metric_key)}
              onResize={newSpan => resizeMetric(row.metric_key, newSpan)}
              onDragStart={() => handleDragStart(row.metric_key)}
              onDragEnter={() => handleDragEnter(row.metric_key)}
              onDragEnd={handleDragEnd}
              isDragging={dragKey === row.metric_key}
            />
          ))}
          <AddMetricTile
            onSelect={addMetric}
            excludeKeys={board.map(row => row.metric_key)}
            valdMetrics={valdMetrics}
            customMetrics={customMetrics}
          />
        </div>
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
                  const brag    = localBrag[key] || '';
                  const bragOpt = BRAG_OPTIONS.find(o => o.value === brag);
                  const displayStyle = bragOpt
                    ? { backgroundColor: bragOpt.bg, color: bragOpt.text }
                    : { backgroundColor: UNRATED_STYLE.bg, color: UNRATED_STYLE.text };
                  return (
                    <tr key={key} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800 text-sm">{label}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{fmtEntry(previous, mDef)}</td>
                      <td className="px-4 py-3 text-gray-700 text-sm font-medium">{fmtEntry(current, mDef)}</td>
                      <td className="px-4 py-3 text-center">
                        <select value={bragOpt ? brag : ''} onChange={e => handleBragChange(key, e.target.value)}
                          className="text-xs font-semibold px-2 py-1.5 rounded border-0 focus:outline-none cursor-pointer"
                          style={displayStyle}>
                          {!bragOpt && <option value="" disabled>Not rated</option>}
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
