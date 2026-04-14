import {
  ResponsiveContainer, ComposedChart, Line, CartesianGrid,
  XAxis, YAxis, Tooltip, ReferenceLine,
} from 'recharts';
import { computeRollingStats, getMetricFlag } from '../../utils/wellnessFlags';

const TEAL = '#437E8D';
const RED  = '#ef4444';
const AMBER = '#f59e0b';

const METRIC_LABELS = {
  sleep_duration:  'Sleep Duration',
  sleep_quality:   'Sleep Quality',
  fatigue:         'Fatigue',
  muscle_soreness: 'Muscle Soreness',
  stress:          'Stress',
};

const TIER1_THRESHOLDS = {
  sleep_duration:  { value: 5, direction: 'below' },
  sleep_quality:   { value: 6, direction: 'above' },
  fatigue:         { value: 6, direction: 'above' },
  muscle_soreness: { value: 6, direction: 'above' },
  stress:          { value: 6, direction: 'above' },
};

const YAXIS = {
  sleep_duration:  { domain: [0, 12], unit: 'hrs' },
  sleep_quality:   { domain: [1, 7], unit: '' },
  fatigue:         { domain: [1, 7], unit: '' },
  muscle_soreness: { domain: [1, 7], unit: '' },
  stress:          { domain: [1, 7], unit: '' },
};

function CustomDot({ cx, cy, payload }) {
  if (cx == null || cy == null) return null;
  const colour = payload.flag === 'tier1' ? RED : payload.flag === 'tier2' ? AMBER : TEAL;
  return <circle cx={cx} cy={cy} r={4} fill={colour} stroke="#fff" strokeWidth={1.5} />;
}

export default function WellnessChart({ submissions, metric }) {
  if (!submissions || submissions.length === 0) return null;

  const rollingStats = computeRollingStats(submissions);
  const { domain, unit } = YAXIS[metric];
  const threshold = TIER1_THRESHOLDS[metric];

  const chartData = submissions.map((sub) => {
    const val = Number(sub[metric]);
    const stats = rollingStats.get(sub.submission_date)?.[metric];
    const flag = stats ? getMetricFlag(metric, val, stats.mean, stats.sd, stats.n) : null;
    return {
      date: sub.submission_date,
      label: new Date(sub.submission_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      value: val,
      avg: stats?.n >= 2 ? Math.round(stats.mean * 100) / 100 : null,
      flag,
    };
  });

  return (
    <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {METRIC_LABELS[metric]}
      </h4>

      <ResponsiveContainer width="100%" height={140}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: '#d1d5db' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={domain}
            tick={{ fontSize: 9, fill: '#d1d5db' }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload.find((x) => x.dataKey === 'value') || payload[0];
              return (
                <div className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 shadow-md text-xs">
                  <p className="text-gray-400 mb-0.5">{p?.payload?.label}</p>
                  <p className="font-bold text-gray-900">
                    {p?.value}{unit ? ` ${unit}` : ''}
                  </p>
                  {p?.payload?.avg != null && (
                    <p className="text-gray-400">28-day avg: {p.payload.avg}{unit ? ` ${unit}` : ''}</p>
                  )}
                </div>
              );
            }}
          />

          {/* Tier 1 threshold line */}
          <ReferenceLine
            y={threshold.value}
            stroke={RED}
            strokeDasharray="4 2"
            strokeWidth={1}
            label={false}
          />

          {/* Rolling 28-day average */}
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#e5e7eb"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 2"
            isAnimationActive={false}
            connectNulls
          />

          {/* Individual data points */}
          <Line
            type="monotone"
            dataKey="value"
            stroke={TEAL}
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
