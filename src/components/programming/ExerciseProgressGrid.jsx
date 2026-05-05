import { useMemo, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { computeExerciseSeries } from '../../utils/loadMetrics';

const TEAL = '#437E8D';
const GOLD = '#A58D69';

function fmtNumber(v, dp = 0) {
  if (v == null || !isFinite(v)) return '—';
  return Number(v).toLocaleString('en-GB', {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}

// Simple first-vs-latest % change. <2% counts as flat — coaches don't
// need a trend arrow flickering on noise. Returns null if there's no
// meaningful baseline (e.g. only one session logged).
function progressTrend(points) {
  if (!points || points.length < 2) return null;
  const first = points[0].value;
  const last  = points[points.length - 1].value;
  if (first == null || first === 0) return null;
  const pct = ((last - first) / first) * 100;
  const direction = pct > 2 ? 'up' : pct < -2 ? 'down' : 'flat';
  return { pct, direction };
}

function TrendBadge({ trend }) {
  if (!trend) return null;
  const conf = trend.direction === 'up'
    ? { Icon: TrendingUp,   colour: '#15803d', label: 'Improving' }
    : trend.direction === 'down'
    ? { Icon: TrendingDown, colour: '#b91c1c', label: 'Declining' }
    : { Icon: Minus,        colour: '#9ca3af', label: 'Holding'   };
  const sign = trend.pct > 0 ? '+' : '';
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded"
      style={{ color: conf.colour, backgroundColor: `${conf.colour}1A` }}
      title={`${conf.label} · ${sign}${trend.pct.toFixed(1)}% over the window`}
    >
      <conf.Icon size={10} strokeWidth={2.4} />
      {sign}{trend.pct.toFixed(0)}%
    </span>
  );
}

/**
 * ExerciseProgressGrid — replaces the old "Estimated 1RM Trends" cluster.
 *
 *   • Multi-select dropdown (defaults to top 4 most-recently-active
 *     exercises) — coach can swap to any other exercise the athlete has
 *     logged sets for.
 *   • Each selected exercise renders as its own small chart in a 2-up
 *     grid. The metric per chart is auto-detected:
 *         weighted      → Estimated 1RM (Mayhew)
 *         bodyweight    → Best Reps per Session
 *     so push-ups don't pretend to have a meaningful 1RM trend.
 */
export default function ExerciseProgressGrid({ sessions, weeks = 8 }) {
  const series = useMemo(
    () => computeExerciseSeries(sessions, weeks),
    [sessions, weeks],
  );

  const defaultIds = useMemo(
    () => series.slice(0, 4).map(s => s.exerciseId),
    [series],
  );
  const [selected, setSelected] = useState(defaultIds);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Re-default when the underlying series shifts (e.g. weeks toggle).
  useMemo(() => { setSelected(defaultIds); }, [defaultIds.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleSeries = useMemo(
    () => selected
      .map(id => series.find(s => s.exerciseId === id))
      .filter(Boolean),
    [series, selected],
  );

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  if (series.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">
          Exercise Progress ({selected.length} selected)
        </p>
        <div className="relative">
          <button
            onClick={() => setPickerOpen(o => !o)}
            className="text-[11px] font-semibold px-3 py-1.5 rounded border border-gray-200 hover:border-gold-500 transition-colors bg-white"
            style={{ color: '#1C1C1C' }}
          >
            Pick exercises ▾
          </button>
          {pickerOpen && (
            <div
              className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg py-1 z-30"
              style={{ border: '1px solid #e5e7eb', minWidth: 240, maxHeight: 320, overflowY: 'auto' }}
              onMouseLeave={() => setPickerOpen(false)}
            >
              {series.map(s => {
                const isOn = selected.includes(s.exerciseId);
                return (
                  <button
                    key={s.exerciseId}
                    onClick={() => toggle(s.exerciseId)}
                    className="w-full text-left px-3 py-1.5 text-[11px] font-medium hover:bg-gray-50 flex items-center gap-2"
                  >
                    <input type="checkbox" checked={isOn} readOnly className="pointer-events-none" />
                    <span className="flex-1 truncate">{s.name}</span>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {s.metric === 'e1rm' ? '1RM' : 'reps'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {visibleSeries.length === 0 ? (
        <p className="text-xs italic text-gray-400 py-6 text-center">
          Use the picker to choose exercises.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visibleSeries.map(s => <Mini key={s.exerciseId} series={s} />)}
        </div>
      )}
    </div>
  );
}

function Mini({ series }) {
  const colour = series.metric === 'e1rm' ? TEAL : GOLD;
  const trend  = progressTrend(series.points);
  return (
    <div className="rounded-lg border border-gray-100 p-3 bg-white"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-xs font-bold text-gray-900 truncate" title={series.name}>{series.name}</p>
        <p className="text-[9px] uppercase tracking-widest text-gray-400 shrink-0">
          {series.metric === 'e1rm' ? 'Est. 1RM (Mayhew)' : 'Best Reps'}
        </p>
      </div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-lg font-bold text-gray-800">{series.latest}</span>
        <span className="text-xs text-gray-500">{series.unit === 'kg' ? 'kg' : 'reps'}</span>
        <span className="ml-auto flex items-center gap-1.5">
          <TrendBadge trend={trend} />
          <span className="text-[10px] text-gray-400">latest</span>
        </span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={series.points} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis
            tick={{ fontSize: 9, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={32}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{ fontSize: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
            formatter={(v) => [`${fmtNumber(v, series.metric === 'e1rm' ? 1 : 0)} ${series.unit === 'kg' ? 'kg' : 'reps'}`, series.metricLabel]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={colour}
            strokeWidth={2}
            dot={{ r: 3, fill: colour }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      {series.metric === 'reps' && (
        <p className="text-[9px] italic text-gray-400 mt-1 text-center">
          Best programmed set — not a max-out test
        </p>
      )}
    </div>
  );
}
