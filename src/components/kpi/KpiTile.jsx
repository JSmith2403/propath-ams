import { useMemo, useEffect, useRef } from 'react';
import {
  ComposedChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { X } from 'lucide-react';
import { METRIC_MAP, SPECIAL_METRICS, LABEL_OVERRIDES, DUAL_LINE_METRICS, LOWER_IS_BETTER } from '../../data/sessionMetrics';
import { buildKpiData, buildDualKpiData, fmtNum, lsiColour } from '../../utils/kpiStats';

const GOLD   = '#A58D69';
const TEAL   = '#437E8D';
const AMBER  = '#f59e0b';
const FADE   = '#e5e7eb';

// Small radial gauge for a single-column tile. Ring fill is only drawn once
// there's enough history to make a "typical range" meaningful (N >= 3) — at
// N=1/2 it's a bare grey ring rather than a fabricated position.
function Ring({ pct, color, figure, unit }) {
  const r = 30, c = 2 * Math.PI * r;
  const off = pct == null ? c * 0.985 : c * (1 - Math.min(1, Math.max(0, pct)));
  return (
    <div style={{ position: 'relative', width: 68, height: 68, flexShrink: 0 }}>
      <svg viewBox="0 0 76 76" width={68} height={68}>
        <circle cx="38" cy="38" r={r} stroke="#f3f4f6" strokeWidth="7" fill="none" />
        <circle cx="38" cy="38" r={r} stroke={color} strokeWidth="7" fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          transform="rotate(-90 38 38)" />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', lineHeight: 1 }}>{figure}</span>
        {unit && <span style={{ fontSize: 8, color: '#9ca3af', marginTop: 2 }}>{unit}</span>}
      </div>
    </div>
  );
}

function StatCell({ label, value }) {
  return (
    <div className="flex flex-col items-center py-1 rounded-md bg-gray-50">
      <span className="text-gray-400 mb-0.5" style={{ fontSize: 9 }}>{label}</span>
      <span className="text-xs font-bold text-gray-700">{value}</span>
    </div>
  );
}

function ResizeHandle({ onPointerDown }) {
  return (
    <div
      onPointerDown={onPointerDown}
      title="Drag to resize"
      className="absolute opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity"
      style={{ right: 6, bottom: 6, width: 16, height: 16, cursor: 'ew-resize', touchAction: 'none' }}
    >
      <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="#9ca3af" strokeWidth="2.4" strokeLinecap="round">
        <path d="M18 9v6M22 6v12M14 6v12" />
      </svg>
    </div>
  );
}

export default function KpiTile({
  metricKey, span = 1, entries, matEntries, customMetrics,
  valdEntriesFor, valdDefFor,
  includedInReport, onToggleReport, toggleWarning,
  onRemove, onResize,
}) {
  const isVALD = metricKey?.startsWith?.('vald:');
  const sourceKey  = SPECIAL_METRICS[metricKey]?.sourceKey ?? metricKey;
  const rawEntries = isVALD
    ? (valdEntriesFor ? valdEntriesFor(metricKey) : [])
    : (entries?.[sourceKey] || []);

  const isDualLine = !isVALD && DUAL_LINE_METRICS.has(metricKey);

  const chartData = useMemo(
    () => isDualLine
      ? buildDualKpiData(rawEntries)
      : buildKpiData(rawEntries, metricKey, matEntries, LOWER_IS_BETTER),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawEntries.length, metricKey, isDualLine]
  );

  const metricDef = isVALD
    ? (valdDefFor ? valdDefFor(metricKey) : null)
    : (SPECIAL_METRICS[metricKey] || METRIC_MAP[metricKey] || customMetrics?.[metricKey]);
  const unit  = metricDef?.unit || '';
  const label = LABEL_OVERRIDES[metricKey] || metricDef?.label || metricKey;
  const testLabel = isVALD ? (valdDefFor?.(metricKey)?.testType) : null;

  // Tracks the active drag's own cleanup so it can also be torn down on
  // unmount — otherwise removing a tile (or navigating away) mid-drag
  // leaves a document-level pointermove/pointerup listener behind, still
  // holding a closure over this tile's stale onResize/metricKey.
  const activeDragCleanup = useRef(null);
  useEffect(() => () => activeDragCleanup.current?.(), []);

  const handleResizeStart = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startSpan = span;
    const track = e.currentTarget.closest('[data-board]');
    const colWidth = track ? track.clientWidth / 4 : 200;
    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const next = Math.min(4, Math.max(1, startSpan + Math.round(dx / colWidth)));
      if (next !== span) onResize?.(next);
    };
    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      activeDragCleanup.current = null;
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    activeDragCleanup.current = onUp;
  };

  const spanClass = { 1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4' }[span] || 'col-span-1';

  return (
    <div
      className={`group relative bg-white rounded-xl border border-gray-100 p-4 ${spanClass}`}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      {onRemove && (
        <button onClick={onRemove}
          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-400 transition-opacity">
          <X size={12} />
        </button>
      )}

      <div className="mb-2 pr-5">
        <p className="text-xs font-semibold text-gray-700 truncate">{label}</p>
        {(testLabel || chartData) && (
          <p className="text-[10px] text-gray-400">
            {[testLabel, chartData ? `N=${chartData.chartData.length}` : null].filter(Boolean).join(" - ")}
          </p>
        )}
      </div>

      {!chartData ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-xs text-gray-300 italic">No data recorded yet.</p>
        </div>
      ) : span === 1 ? (
        // ── 1 column: dial ──────────────────────────────────────────
        isDualLine ? (
          <div className="flex flex-col items-center gap-1">
            <Ring
              pct={chartData.lsi != null ? chartData.lsi / 100 : null}
              color={chartData.lsi != null ? lsiColour(chartData.lsi) : '#d1d5db'}
              figure={chartData.lsi != null ? `${chartData.lsi.toFixed(0)}%` : '—'}
              unit="LSI"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Ring
              pct={
                chartData.chartData.length >= 3
                  ? (() => {
                      const vals = chartData.chartData.map(d => d.v);
                      const min = Math.min(...vals), max = Math.max(...vals);
                      return min === max ? 0.5 : (chartData.latest - min) / (max - min);
                    })()
                  : null
              }
              color={chartData.isFlagged ? AMBER : TEAL}
              figure={fmtNum(chartData.latest)}
              unit={unit}
            />
          </div>
        )
      ) : isDualLine ? (
        // ── 2+ columns, bilateral: grouped L/R bar chart ─────────────
        <>
          <div className="flex items-center gap-4 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="inline-block" style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: TEAL }} />
              <span className="text-xs text-gray-500" style={{ fontSize: 10 }}>Left</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block" style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: GOLD }} />
              <span className="text-xs text-gray-500" style={{ fontSize: 10 }}>Right</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={140}>
            <ComposedChart data={chartData.chartData} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#d1d5db' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: '#d1d5db' }} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0]?.payload;
                  if (!p) return null;
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 shadow-md text-xs">
                      <p className="text-gray-400 mb-0.5">{p.label}</p>
                      <p className="font-bold" style={{ color: TEAL }}>L: {p.valueL != null ? `${fmtNum(p.valueL)}${unit ? ' ' + unit : ''}` : '—'}</p>
                      <p className="font-bold" style={{ color: GOLD }}>R: {p.valueR != null ? `${fmtNum(p.valueR)}${unit ? ' ' + unit : ''}` : '—'}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="valueL" fill={TEAL} radius={[2, 2, 0, 0]} maxBarSize={18} isAnimationActive={false} />
              <Bar dataKey="valueR" fill={GOLD} radius={[2, 2, 0, 0]} maxBarSize={18} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-4 gap-1 mt-3">
            <StatCell label="L Latest" value={fmtNum(chartData.latestL)} />
            <StatCell label="R Latest" value={fmtNum(chartData.latestR)} />
            <StatCell label="L Roll Avg" value={fmtNum(chartData.rollingAvgL)} />
            <StatCell label="R Roll Avg" value={fmtNum(chartData.rollingAvgR)} />
          </div>

          <div className="mt-3 flex items-center justify-end">
            {chartData.lsi != null ? (
              <span className="text-xs font-bold" style={{ color: lsiColour(chartData.lsi) }}>LSI: {chartData.lsi.toFixed(1)}%</span>
            ) : (
              <span className="text-xs" style={{ color: '#9ca3af' }}>LSI: insufficient data</span>
            )}
          </div>
        </>
      ) : (
        // ── 2+ columns, single value: bar chart ──────────────────────
        <>
          <ResponsiveContainer width="100%" height={120}>
            <ComposedChart data={chartData.chartData} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#d1d5db' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: '#d1d5db' }} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0];
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 shadow-md text-xs">
                      <p className="text-gray-400 mb-0.5">{p?.payload?.label}</p>
                      <p className="font-bold text-gray-900">{fmtNum(p?.value)}{unit ? ` ${unit}` : ''}</p>
                    </div>
                  );
                }}
              />
              {/* maxBarSize keeps a lone bar (or two) from stretching to
                  fill the tile — it stays centered at a sensible width,
                  same as a chart with a full ~5-session band would use. */}
              <Bar dataKey="v" radius={[3, 3, 0, 0]} maxBarSize={32} isAnimationActive={false}>
                {chartData.chartData.map((d, i) => (
                  <Cell key={i} fill={d.flagged ? AMBER : (i === chartData.chartData.length - 1 ? TEAL : FADE)} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-4 gap-1 mt-3">
            <StatCell label="Latest" value={fmtNum(chartData.latest)} />
            <StatCell label="All-Time" value={fmtNum(chartData.allTimeBest)} />
            <StatCell label="Rolling Avg" value={fmtNum(chartData.rollingAvg)} />
            <StatCell label="Rolling SD" value={fmtNum(chartData.rollingSD)} />
          </div>

          {chartData.isFlagged && (
            <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: '#fef3c7' }}>
              <span style={{ fontSize: 11 }}>⚠</span>
              <p className="text-xs font-medium" style={{ color: '#92400e', fontSize: 11 }}>Below rolling average — monitor</p>
            </div>
          )}
        </>
      )}

      {onToggleReport && (
        <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-gray-100">
          {toggleWarning && (
            <span className="text-xs mr-auto" style={{ color: '#b91c1c', fontSize: 10 }}>{toggleWarning}</span>
          )}
          <span className="text-xs" style={{ color: '#6b7280', fontSize: 10 }}>Include in Report</span>
          <button
            type="button"
            role="switch"
            aria-checked={!!includedInReport}
            onClick={() => onToggleReport(metricKey)}
            className="relative inline-flex items-center rounded-full transition-colors shrink-0"
            style={{ height: 14, width: 26, backgroundColor: includedInReport ? TEAL : '#d1d5db' }}
          >
            <span className="inline-block rounded-full bg-white shadow transition-transform"
              style={{ height: 10, width: 10, transform: includedInReport ? 'translateX(14px)' : 'translateX(2px)' }} />
          </button>
        </div>
      )}

      {onResize && <ResizeHandle onPointerDown={handleResizeStart} />}
    </div>
  );
}
