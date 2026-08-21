import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { ComposedChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { METRIC_MAP, SPECIAL_METRICS, LABEL_OVERRIDES, DUAL_LINE_METRICS, LOWER_IS_BETTER } from '../../data/sessionMetrics';
import { useCustomMetrics } from '../../hooks/useCustomMetrics';
import { usePerformanceResults } from '../../hooks/usePerformanceResults';
import { useVALDMetrics } from '../../hooks/useVALDMetrics';
import { buildKpiData, buildDualKpiData, fmtNum, lsiColour } from '../../utils/kpiStats';

const GOLD  = '#A58D69';
const TEAL  = '#437E8D';
const AMBER = '#f59e0b';
const FADE  = '#e5e7eb';

/**
 * ProgressTab — read-only view of whatever performance metrics the
 * coach has pinned (the "Show on athlete progress" toggle on each KPI
 * Dashboard tile). Reads performance_test_results / vald_test_results
 * directly (both anon-SELECT, scoped by athleteId) rather than through
 * any coach-only path.
 */
export default function ProgressTab({ athleteId, progressMetrics = [] }) {
  const { customMetrics } = useCustomMetrics();
  const { entries, loading: entriesLoading } = usePerformanceResults(athleteId);
  const { entriesFor: valdEntriesFor, defFor: valdDefFor, loading: valdLoading } = useVALDMetrics(athleteId);

  const loading = entriesLoading || valdLoading;

  const cards = useMemo(() => {
    return (progressMetrics || []).map(metricKey => {
      const isVALD = metricKey?.startsWith?.('vald:');
      const rawEntries = isVALD ? valdEntriesFor(metricKey) : (entries?.[metricKey] || []);
      const isDualLine = !isVALD && DUAL_LINE_METRICS.has(metricKey);
      // Maturation entries (bodyweight) aren't available on the athlete
      // side — only affects the two bodyweight-relative special metrics
      // (cmjRelPower / imtpRelForce), which render "no results" if pinned
      // here rather than a computed value.
      const chartData = isDualLine
        ? buildDualKpiData(rawEntries)
        : buildKpiData(rawEntries, metricKey, [], LOWER_IS_BETTER);

      const metricDef = isVALD
        ? valdDefFor(metricKey)
        : (SPECIAL_METRICS[metricKey] || METRIC_MAP[metricKey] || customMetrics?.[metricKey]);
      const unit  = metricDef?.unit || '';
      const label = LABEL_OVERRIDES[metricKey] || metricDef?.label || metricKey;
      const testLabel = isVALD ? valdDefFor(metricKey)?.testType : null;

      return { metricKey, chartData, isDualLine, unit, label, testLabel };
    });
  }, [progressMetrics, entries, valdEntriesFor, valdDefFor, customMetrics]);

  if (!progressMetrics.length) {
    return (
      <div className="px-4 pt-12 pb-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gold-50">
          <TrendingUp size={28} className="text-gold-600" />
        </div>
        <p className="text-h3 mb-1 text-ink-900">Track Progress</p>
        <p className="text-meta max-w-xs text-ink-500">
          Your coach hasn't pinned any metrics to track here yet — check back once they've set some up.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24">
      <h2 className="text-base font-bold text-ink-900 mb-1">Your Progress</h2>
      <p className="text-meta text-ink-500 mb-4">
        Metrics your coach is tracking with you — updates as new results come in.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-4 animate-spin"
               style={{ borderColor: 'rgba(165,141,105,0.25)', borderTopColor: GOLD }} />
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map(card => <ProgressCard key={card.metricKey} {...card} />)}
        </div>
      )}
    </div>
  );
}

function ProgressCard({ label, unit, testLabel, chartData, isDualLine }) {
  return (
    <div className="rounded-xl bg-white border border-ink-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="mb-2">
        <p className="text-sm font-bold text-ink-900">{label}</p>
        {(testLabel || chartData) && (
          <p className="text-micro text-ink-400">
            {[testLabel, chartData ? `${chartData.chartData.length} recorded` : null].filter(Boolean).join(' — ')}
          </p>
        )}
      </div>

      {!chartData ? (
        <p className="text-meta italic text-ink-400 py-4 text-center">No results recorded yet.</p>
      ) : isDualLine ? (
        <DualCardBody chartData={chartData} unit={unit} />
      ) : (
        <SingleCardBody chartData={chartData} unit={unit} />
      )}
    </div>
  );
}

function SingleCardBody({ chartData, unit }) {
  return (
    <>
      <ResponsiveContainer width="100%" height={110}>
        <ComposedChart data={chartData.chartData} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#d1d5db' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 9, fill: '#d1d5db' }} axisLine={false} tickLine={false} width={30} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0];
              return (
                <div className="bg-white border border-ink-100 rounded-lg px-2 py-1.5 shadow-md text-xs">
                  <p className="text-ink-400 mb-0.5">{p?.payload?.label}</p>
                  <p className="font-bold text-ink-900">{fmtNum(p?.value)}{unit ? ` ${unit}` : ''}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="v" radius={[3, 3, 0, 0]} maxBarSize={28} isAnimationActive={false}>
            {chartData.chartData.map((d, i) => (
              <Cell key={i} fill={d.flagged ? AMBER : (i === chartData.chartData.length - 1 ? TEAL : FADE)} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-1.5 mt-2">
        <Stat label="Latest" value={fmtNum(chartData.latest)} />
        <Stat label="All-Time" value={fmtNum(chartData.allTimeBest)} />
        <Stat label="Roll Avg" value={fmtNum(chartData.rollingAvg)} />
      </div>
    </>
  );
}

function DualCardBody({ chartData, unit }) {
  return (
    <>
      <div className="flex items-center gap-4 mb-1.5">
        <Legend colour={TEAL} label="Left" />
        <Legend colour={GOLD} label="Right" />
      </div>
      <ResponsiveContainer width="100%" height={110}>
        <ComposedChart data={chartData.chartData} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#d1d5db' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 9, fill: '#d1d5db' }} axisLine={false} tickLine={false} width={30} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0]?.payload;
              if (!p) return null;
              return (
                <div className="bg-white border border-ink-100 rounded-lg px-2 py-1.5 shadow-md text-xs">
                  <p className="text-ink-400 mb-0.5">{p.label}</p>
                  <p className="font-bold" style={{ color: TEAL }}>L: {p.valueL != null ? `${fmtNum(p.valueL)}${unit ? ' ' + unit : ''}` : '—'}</p>
                  <p className="font-bold" style={{ color: GOLD }}>R: {p.valueR != null ? `${fmtNum(p.valueR)}${unit ? ' ' + unit : ''}` : '—'}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="valueL" fill={TEAL} radius={[2, 2, 0, 0]} maxBarSize={16} isAnimationActive={false} />
          <Bar dataKey="valueR" fill={GOLD} radius={[2, 2, 0, 0]} maxBarSize={16} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-end">
        {chartData.lsi != null ? (
          <span className="text-meta font-bold" style={{ color: lsiColour(chartData.lsi) }}>LSI: {chartData.lsi.toFixed(1)}%</span>
        ) : (
          <span className="text-meta text-ink-400">LSI: insufficient data</span>
        )}
      </div>
    </>
  );
}

function Legend({ colour, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-block" style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: colour }} />
      <span className="text-micro text-ink-500">{label}</span>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center py-1 rounded-md bg-ink-50">
      <span className="text-ink-400 mb-0.5" style={{ fontSize: 9 }}>{label}</span>
      <span className="text-xs font-bold text-ink-700">{value}</span>
    </div>
  );
}
