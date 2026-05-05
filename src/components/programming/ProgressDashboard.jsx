import { useMemo, useState } from 'react';
import {
  ResponsiveContainer, ComposedChart, LineChart,
  Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts';
import { Activity, Calendar, BarChart3, Dumbbell, Target } from 'lucide-react';
import { useAthleteLogs } from '../../hooks/useAthleteLogs';
import { usePlannedSessions } from '../../hooks/usePlannedSessions';
import { computeDashboardMetrics } from '../../utils/loadMetrics';

const GOLD  = '#A58D69';
const TEAL  = '#437E8D';
const NAVY  = '#085777';
const GREEN = '#15803d';
const INK   = '#1C1C1C';

const WEEK_OPTIONS = [
  { weeks: 4,  label: '4 weeks'  },
  { weeks: 8,  label: '8 weeks'  },
  { weeks: 12, label: '12 weeks' },
  { weeks: 16, label: '16 weeks' },
];

function fmtNumber(v, dp = 0) {
  if (v == null || !isFinite(v)) return '—';
  return Number(v).toLocaleString('en-GB', {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}

// Colour-tag the ACWR pill: green = sweet spot, amber = elevated, red = danger.
function acwrTone(v) {
  if (v == null || !isFinite(v)) return { fg: '#9ca3af', bg: '#f4f4f5' };
  if (v >= 0.8 && v <= 1.3) return { fg: GREEN,    bg: 'rgba(34,197,94,0.10)'  };
  if (v <  0.8 || v <= 1.5) return { fg: '#a16207', bg: 'rgba(245,158,11,0.12)' };
  return { fg: '#b91c1c', bg: 'rgba(220,38,38,0.10)' };
}

/**
 * ProgressDashboard — per-athlete training-load + progress overview.
 * Lives at the top of the Programme tab inside Physical Development.
 *
 * Sources:
 *   - useAthleteLogs   → completed session_logs + set_logs
 *   - usePlannedSessions → planned_sessions for compliance %
 *
 * All metric calculations live in src/utils/loadMetrics.js.
 */
export default function ProgressDashboard({ athlete }) {
  const [weeks, setWeeks] = useState(8);

  const { sessions, loading: sessLoading } = useAthleteLogs(athlete?.id);
  const { planned } = usePlannedSessions(useMemo(() => (athlete?.id ? [athlete.id] : []), [athlete?.id]));

  const metrics = useMemo(
    () => computeDashboardMetrics({ sessions, planned, weeks }),
    [sessions, planned, weeks],
  );

  const { kpis, rpeSeries, volumeSeries, exerciseSeries } = metrics;

  return (
    <div className="bg-white rounded-xl border border-ink-100 shadow-card p-5 space-y-5">
      <Header weeks={weeks} setWeeks={setWeeks} />

      {/* ── KPI row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCardRing
          icon={Calendar}
          label="Sessions Completed"
          value={`${kpis.sessionsCompleted.count} / ${kpis.sessionsCompleted.planned}`}
          ringPct={kpis.sessionsCompleted.planned > 0
            ? Math.min(100, Math.round((kpis.sessionsCompleted.count / kpis.sessionsCompleted.planned) * 100))
            : 0}
          ringColour={GOLD}
          subtitle="Sessions"
          footer="Rolling 8-week window"
        />
        <KpiCardRing
          icon={Target}
          label="Session Compliance"
          value={`${kpis.compliance}%`}
          ringPct={kpis.compliance}
          ringColour={NAVY}
          subtitle="Completed"
          footer="Rolling 8-week window"
        />
        <KpiCardSpark
          icon={Activity}
          label="Session RPE × Duration"
          value={`${fmtNumber(kpis.rpe.total)} AU`}
          spark={rpeSeries}
          sparkColour={GREEN}
          rollingLabel={`Rolling 8-week avg: ${fmtNumber(kpis.rpe.rolling8wAvg)} AU`}
          acwr={kpis.rpe.latestACWR}
        />
        <KpiCardSpark
          icon={Dumbbell}
          label="Session Load (Volume)"
          value={`${fmtNumber(kpis.volume.total)} kg`}
          spark={volumeSeries}
          sparkColour={TEAL}
          rollingLabel={`Rolling 8-week avg: ${fmtNumber(kpis.volume.rolling8wAvg)} kg`}
          acwr={kpis.volume.latestACWR}
        />
      </div>

      {/* ── Two main charts ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <LoadChartCard
          title="Session RPE × Duration"
          series={rpeSeries}
          loadLabel="Daily Load (RPE × Duration)"
          unit="AU"
          colour={GREEN}
        />
        <LoadChartCard
          title="Session Load (Volume)"
          series={volumeSeries}
          loadLabel="Daily Load (kg)"
          unit="kg"
          colour={TEAL}
        />
      </div>

      {/* ── Exercise progress checker ───────────────────────────── */}
      <ExerciseProgressCard series={exerciseSeries} weeks={weeks} loading={sessLoading} />
    </div>
  );
}

// ─── Header — title + date range ──────────────────────────────────────────
function Header({ weeks, setWeeks }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-h2 text-ink-900 font-bold leading-tight">Progress Dashboard</h2>
        <p className="text-meta text-ink-500 mt-1">
          Track training performance and progress over time.
        </p>
      </div>
      <select
        value={weeks}
        onChange={e => setWeeks(Number(e.target.value))}
        className="text-xs font-semibold text-ink-700 bg-white border border-ink-200 rounded px-3 py-1.5 cursor-pointer focus:outline-none focus:border-gold-500"
      >
        {WEEK_OPTIONS.map(o => <option key={o.weeks} value={o.weeks}>Last {o.label}</option>)}
      </select>
    </div>
  );
}

// ─── KPI card variants ────────────────────────────────────────────────────
function KpiCardRing({ icon: Icon, label, value, ringPct, ringColour, subtitle, footer }) {
  const r = 32;
  const C = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, ringPct)) / 100) * C;
  return (
    <div className="bg-white rounded-xl border border-ink-100 p-4 shadow-card">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={12} style={{ color: GOLD }} />
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">{label}</p>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-h1 font-bold text-ink-900 leading-none">{value}</p>
          {subtitle && <p className="text-meta text-ink-500 mt-1">{subtitle}</p>}
        </div>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
          <circle
            cx="40" cy="40" r={r}
            fill="none"
            stroke={ringColour}
            strokeWidth="6"
            strokeDasharray={`${dash} ${C - dash}`}
            strokeDashoffset={C / 4}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
          />
          <text x="40" y="44" textAnchor="middle" fontSize="14" fontWeight="700" fill={INK}>
            {Math.round(ringPct)}%
          </text>
        </svg>
      </div>
      {footer && (
        <p className="text-[10px] text-ink-400 mt-3 pt-3 border-t border-ink-100">{footer}</p>
      )}
    </div>
  );
}

function KpiCardSpark({ icon: Icon, label, value, spark, sparkColour, rollingLabel, acwr }) {
  const tone = acwrTone(acwr);
  return (
    <div className="bg-white rounded-xl border border-ink-100 p-4 shadow-card">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={12} style={{ color: GOLD }} />
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">{label}</p>
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="text-h1 font-bold text-ink-900 leading-none truncate">{value}</p>
        <div className="w-24 h-10 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spark} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
              <Line type="monotone" dataKey="rolling" stroke={sparkColour} strokeWidth={1.6} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-ink-100 flex items-center gap-2">
        <p className="text-[10px] text-ink-400 flex-1 truncate" title={rollingLabel}>{rollingLabel}</p>
        {acwr != null && (
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ color: tone.fg, backgroundColor: tone.bg }}
            title="Acute:Chronic Workload Ratio (sweet spot 0.8–1.3)"
          >
            ACWR {acwr}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Combined bar (daily) + line (rolling avg) + line (ACWR) chart ───────
function LoadChartCard({ title, series, loadLabel, unit, colour }) {
  // ACWR uses a secondary Y axis so it stays readable next to absolute load.
  return (
    <div className="bg-white rounded-xl border border-ink-100 p-4 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={14} style={{ color: GOLD }} />
        <p className="text-meta font-bold uppercase tracking-widest text-ink-500">{title}</p>
      </div>
      {series.every(d => d.value === 0) ? (
        <p className="text-xs italic text-ink-400 py-12 text-center">No load recorded in this window.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={series} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={20}
            />
            <YAxis
              yAxisId="load"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <YAxis
              yAxisId="acwr"
              orientation="right"
              domain={[0, 2]}
              ticks={[0, 0.5, 1, 1.3, 1.5, 2]}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              cursor={{ fill: 'rgba(165,141,105,0.06)' }}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
              formatter={(v, name) => {
                if (name === 'ACWR') return [Number(v).toFixed(2), 'ACWR'];
                if (name === 'Rolling 8-week avg') return [`${fmtNumber(v)} ${unit}`, name];
                if (name === loadLabel) return [`${fmtNumber(v)} ${unit}`, name];
                return [v, name];
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 10, paddingTop: 6 }}
              iconType="line"
            />
            <ReferenceLine yAxisId="acwr" y={1.0} stroke="#cbd5e1" strokeDasharray="4 4" />
            <Bar yAxisId="load" dataKey="value" name={loadLabel} fill="#e5e7eb" />
            <Line yAxisId="load" type="monotone" dataKey="rolling" name="Rolling 8-week avg" stroke={colour} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line yAxisId="acwr" type="monotone" dataKey="acwr" name="ACWR" stroke={GOLD} strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ─── Exercise Progress Checker — multi-line chart, Mayhew exercises only ──
// Bodyweight / non-1RM exercises (push-ups etc.) are surfaced separately
// in the Logged Sessions tab grid; mixing them on one kg-axis here would
// either flatten or distort the trends.
function ExerciseProgressCard({ series, weeks, loading }) {
  // Filter to Mayhew-applicable exercises only.
  const mayhew = useMemo(
    () => series.filter(s => s.metric === 'e1rm'),
    [series],
  );

  // Default selection — top 4 most-recently-active Mayhew exercises.
  const defaultIds = useMemo(
    () => mayhew.slice(0, 4).map(s => s.exerciseId),
    [mayhew],
  );
  const [selected, setSelected] = useState(defaultIds);
  // Re-default when the underlying series changes (e.g. weeks toggle).
  useMemo(() => { setSelected(defaultIds); }, [defaultIds.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleSeries = useMemo(
    () => mayhew.filter(s => selected.includes(s.exerciseId)),
    [mayhew, selected],
  );

  // Combined chart-data array — one entry per date with one numeric
  // field per visible exercise.
  const chartData = useMemo(() => {
    const dateSet = new Set();
    visibleSeries.forEach(s => s.points.forEach(p => dateSet.add(p.date)));
    const dates = Array.from(dateSet).sort();
    return dates.map(date => {
      const row = { date, label: dateLabel(date) };
      for (const s of visibleSeries) {
        const hit = s.points.find(p => p.date === date);
        if (hit) row[s.exerciseId] = hit.value;
      }
      return row;
    });
  }, [visibleSeries]);

  const colours = [TEAL, GOLD, NAVY, GREEN, '#7e22ce', '#b91c1c'];

  return (
    <div className="bg-white rounded-xl border border-ink-100 p-4 shadow-card">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Dumbbell size={14} style={{ color: GOLD }} />
          <p className="text-meta font-bold uppercase tracking-widest text-ink-500">
            Exercise Progress Checker
          </p>
          <span className="text-[10px] text-ink-400">
            Estimated 1RM (Mayhew) · last {weeks} weeks
          </span>
        </div>
      </div>

      {loading ? (
        <p className="text-xs italic text-ink-400 py-8 text-center">Loading…</p>
      ) : mayhew.length === 0 ? (
        <p className="text-xs italic text-ink-400 py-8 text-center">
          No weighted exercises in this window — check the session log below for bodyweight progressions.
        </p>
      ) : (
        <>
          {/* Exercise selector chips */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {mayhew.map((s, i) => {
              const isOn = selected.includes(s.exerciseId);
              const colour = colours[i % colours.length];
              return (
                <button
                  key={s.exerciseId}
                  onClick={() => setSelected(prev =>
                    prev.includes(s.exerciseId)
                      ? prev.filter(x => x !== s.exerciseId)
                      : [...prev, s.exerciseId]
                  )}
                  className="text-[10px] font-semibold px-2 py-1 rounded-full transition-colors flex items-center gap-1.5"
                  style={{
                    backgroundColor: isOn ? `${colour}1A` : '#f4f4f5',
                    color:           isOn ? colour : '#9ca3af',
                    border: `1px solid ${isOn ? colour : 'transparent'}`,
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isOn ? colour : '#cbd5e1' }} />
                  {s.name}
                  <span className="text-[9px] font-normal opacity-75">{s.latest}kg</span>
                </button>
              );
            })}
          </div>

          {chartData.length === 0 ? (
            <p className="text-xs italic text-ink-400 py-8 text-center">
              Select one or more exercises to chart.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={20}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  unit="kg"
                />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  formatter={(v, name) => {
                    const s = visibleSeries.find(x => x.exerciseId === name);
                    return [`${fmtNumber(v, 1)} kg`, s?.name || name];
                  }}
                />
                {visibleSeries.map((s, i) => (
                  <Line
                    key={s.exerciseId}
                    type="monotone"
                    dataKey={s.exerciseId}
                    stroke={colours[i % colours.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    isAnimationActive={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </>
      )}
    </div>
  );
}

function dateLabel(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
