import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import ValdLineChart from '../charts/ValdLineChart';
import SprintChart from '../charts/SprintChart';
import { PERFORMANCE_METRICS } from '../../data/referenceData';

const METRIC_ORDER = [
  'cmjHeight','cmjPeakPower','dsi','rsi105','isometricStrength',
  'hamstringStrength','gripStrength','agility505','bleepTest','sprintSplits','imtpPeakForce',
];

// ── Value display helpers ─────────────────────────────────────────────────────
function displayResult(metricKey, entry) {
  if (metricKey === 'gripStrength' || metricKey === 'agility505')
    return `L: ${entry.left ?? '—'} / R: ${entry.right ?? '—'}`;
  if (metricKey === 'hamstringStrength' && (entry.left != null || entry.right != null))
    return `L: ${entry.left ?? '—'} / R: ${entry.right ?? '—'}`;
  if (metricKey === 'sprintSplits')
    return [entry.split5m, entry.split10m, entry.split20m, entry.split30m]
      .map((v, i) => `${['5','10','20','30'][i]}m:${v ?? '—'}`)
      .join(' / ');
  if (metricKey === 'bleepTest')
    return `L${entry.level ?? '—'}.${entry.shuttle ?? '—'} (VO₂: ${entry.vo2max ?? '—'})`;
  return entry.value != null ? String(entry.value) : '—';
}

// ── OK / Flag badge ───────────────────────────────────────────────────────────
function OKBadge({ inBand }) {
  if (inBand === null) return null;
  if (inBand) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
        style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <circle cx="6" cy="6" r="6" fill="#22c55e" />
          <path d="M3.5 6.2l1.8 1.8 3.2-3.8" stroke="white" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        OK
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <circle cx="6" cy="6" r="6" fill="#f59e0b" />
        <path d="M6 3.5v3.2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="6" cy="8.8" r="0.8" fill="white" />
      </svg>
      Flag
    </div>
  );
}

// ── History side panel ────────────────────────────────────────────────────────
function HistoryPanel({ metricKey, entries, onClose }) {
  const meta   = PERFORMANCE_METRICS[metricKey];
  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  const getVal = e => {
    if (metricKey === 'gripStrength') return ((e.left || 0) + (e.right || 0)) / 2;
    if (metricKey === 'agility505')  return Math.min(e.left || 99, e.right || 99);
    if (metricKey === 'bleepTest')   return e.vo2max;
    if (metricKey === 'sprintSplits') return e.split10m;
    return e.value;
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{meta?.label}</h3>
          <p className="text-xs text-gray-400">{sorted.length} entries</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 text-gray-400">
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0" style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-500">Date</th>
              <th className="px-3 py-2 text-right font-semibold text-gray-500">Result</th>
              <th className="px-3 py-2 text-right font-semibold text-gray-500">Δ</th>
              <th className="px-3 py-2 text-right font-semibold text-gray-500">Δ%</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-500">Staff</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e, i) => {
              const v     = getVal(e);
              const prevV = i < sorted.length - 1 ? getVal(sorted[i + 1]) : null;
              const delta  = prevV !== null ? v - prevV : null;
              const deltaP = prevV !== null && prevV !== 0 ? ((v - prevV) / prevV) * 100 : null;
              const isGood = delta !== null ? (meta?.higherIsBetter ? delta > 0 : delta < 0) : null;
              return (
                <tr key={e.id || i} className="border-t border-gray-50">
                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                    {new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-xs">
                    {displayResult(metricKey, e)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {delta !== null ? (
                      <span style={{ color: isGood ? '#15803d' : '#b91c1c' }}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(2)}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {deltaP !== null ? (
                      <span style={{ color: isGood ? '#15803d' : '#b91c1c' }}>
                        {deltaP > 0 ? '+' : ''}{deltaP.toFixed(1)}%
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-500">{e.staff || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Metric card (visualisation only) ─────────────────────────────────────────
function MetricCard({ initialMetricKey, allEntries = {}, onClickChart }) {
  const [displayKey, setDisplayKey] = useState(initialMetricKey);
  const meta    = PERFORMANCE_METRICS[displayKey];
  const entries = allEntries[displayKey] || [];

  let latest = null, inBand = null;
  if (displayKey === 'gripStrength' && entries.length) {
    const e = entries[0];
    latest = ((e.left || 0) + (e.right || 0)) / 2;
    inBand = latest >= meta.low && latest <= meta.high;
  } else if (displayKey === 'agility505' && entries.length) {
    const e = entries[0];
    latest = Math.min(e.left || 99, e.right || 99);
    inBand = latest >= meta.low && latest <= meta.high;
  } else if (displayKey === 'bleepTest' && entries.length) {
    latest = entries[0].vo2max;
    inBand = latest >= meta.low && latest <= meta.high;
  } else if (displayKey === 'sprintSplits') {
    inBand = null;
  } else if (entries.length) {
    latest = entries[0].value;
    inBand = latest >= meta.low && latest <= meta.high;
  }
  if (entries.length === 0) inBand = null;

  const getChartData = () => {
    if (displayKey === 'gripStrength') return entries.map(e => ({ date: e.date, value: ((e.left || 0) + (e.right || 0)) / 2 }));
    if (displayKey === 'agility505')  return entries.map(e => ({ date: e.date, value: Math.min(e.left || 99, e.right || 99) }));
    if (displayKey === 'bleepTest')   return entries.map(e => ({ date: e.date, value: e.vo2max }));
    return entries.map(e => ({ date: e.date, value: e.value }));
  };

  if (!meta) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="mb-3">
        <select value={displayKey} onChange={e => setDisplayKey(e.target.value)}
          className="w-full text-xs font-semibold border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none cursor-pointer"
          style={{ color: '#374151' }}>
          {METRIC_ORDER.map(k => (
            <option key={k} value={k}>{PERFORMANCE_METRICS[k]?.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400">{meta.unit}</p>
        <OKBadge inBand={inBand} />
      </div>

      <div className="cursor-pointer" onClick={() => entries.length > 0 && onClickChart(displayKey)}>
        {displayKey === 'sprintSplits' ? (
          <SprintChart entries={entries} />
        ) : (
          <ValdLineChart
            data={getChartData()}
            unit={meta.unit}
            refLow={meta.low}
            refHigh={meta.high}
            cohortAvg={meta.cohortAvg}
            acuteLimit={meta.acuteLimit}
            higherIsBetter={meta.higherIsBetter}
            height={165}
          />
        )}

        {displayKey === 'gripStrength' && entries.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            Latest — L: <span className="font-medium text-gray-600">{entries[0].left} kg</span>&nbsp;
            R: <span className="font-medium text-gray-600">{entries[0].right} kg</span>
          </p>
        )}
        {displayKey === 'agility505' && entries.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            Latest — L: <span className="font-medium text-gray-600">{entries[0].left} s</span>&nbsp;
            R: <span className="font-medium text-gray-600">{entries[0].right} s</span>
          </p>
        )}
        {displayKey === 'bleepTest' && entries.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            Latest level reached: <span className="font-medium text-gray-600">{entries[0].level}.{entries[0].shuttle}</span>
          </p>
        )}
      </div>

      {entries.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <button onClick={() => onClickChart(displayKey)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
            View all data <ChevronRight size={11} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────
export default function PerformanceTestingTab({ athlete, entries = {} }) {
  const [historyMetric, setHistoryMetric] = useState(null);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {METRIC_ORDER.map((key, idx) => (
          <MetricCard
            key={`card-${idx}`}
            initialMetricKey={key}
            allEntries={entries}
            onClickChart={k => setHistoryMetric(k)}
          />
        ))}
      </div>

      {historyMetric && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setHistoryMetric(null)} />
          <HistoryPanel
            metricKey={historyMetric}
            entries={entries[historyMetric] || []}
            onClose={() => setHistoryMetric(null)}
          />
        </>
      )}
    </div>
  );
}
