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

const YAXIS_CONFIG = {
  sleep_duration:  { domain: [0, 12], ticks: [0, 3, 6, 9, 12], unit: 'hrs', bottomAnchor: '0 hrs',             topAnchor: '12 hrs' },
  sleep_quality:   { domain: [1, 7],  ticks: [1, 2, 3, 4, 5, 6, 7],  unit: '', bottomAnchor: 'Very, very good', topAnchor: 'Very, very poor' },
  fatigue:         { domain: [1, 7],  ticks: [1, 2, 3, 4, 5, 6, 7],  unit: '', bottomAnchor: 'Very, very low',  topAnchor: 'Very, very high' },
  muscle_soreness: { domain: [1, 7],  ticks: [1, 2, 3, 4, 5, 6, 7],  unit: '', bottomAnchor: 'Very, very low',  topAnchor: 'Very, very high' },
  stress:          { domain: [1, 7],  ticks: [1, 2, 3, 4, 5, 6, 7],  unit: '', bottomAnchor: 'Very, very low',  topAnchor: 'Very, very high' },
};

function CustomDot({ cx, cy, payload }) {
  if (cx == null || cy == null) return null;
  const colour = payload.flag === 'tier1' ? RED : payload.flag === 'tier2' ? AMBER : TEAL;
  return <circle cx={cx} cy={cy} r={4} fill={colour} stroke="#fff" strokeWidth={1.5} />;
}

export default function WellnessChart({ submissions, metric }) {
  if (!submissions || submissions.length === 0) return null;

  const rollingStats = computeRollingStats(submissions);
  const cfg = YAXIS_CONFIG[metric];
  const threshold = TIER1_THRESHOLDS[metric];

  // Compute the actual window span used by the latest data point
  const latestStats = submissions.length > 0
    ? rollingStats.get(submissions[submissions.length - 1].submission_date)?.[metric]
    : null;
  const windowN = latestStats?.n || 0;

  // Calculate the actual day span covered by the rolling window
  let windowDays = 0;
  if (submissions.length >= 2) {
    const latest = new Date(submissions[submissions.length - 1].submission_date);
    // Find the earliest submission within the 28-day window
    const cutoff = new Date(latest);
    cutoff.setDate(cutoff.getDate() - 28);
    let earliest = latest;
    for (let i = submissions.length - 1; i >= 0; i--) {
      const d = new Date(submissions[i].submission_date);
      if (d < cutoff) break;
      earliest = d;
    }
    windowDays = Math.round((latest - earliest) / (1000 * 60 * 60 * 24));
  }

  const showAvg = windowN >= 2;
  const avgLabel = windowDays >= 28 ? '28-day avg' : `${windowDays}-day avg`;

  const chartData = submissions.map((sub) => {
    const val = Number(sub[metric]);
    const stats = rollingStats.get(sub.submission_date)?.[metric];
    const flag = stats ? getMetricFlag(metric, val, stats.mean, stats.sd, stats.n) : null;
    return {
      date: sub.submission_date,
      label: new Date(sub.submission_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      value: val,
      avg: (stats?.n >= 2) ? Math.round(stats.mean * 100) / 100 : null,
      flag,
    };
  });

  return (
    <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {METRIC_LABELS[metric]}
        </h4>
        {showAvg && (
          <span className="text-xs text-gray-400">{avgLabel}</span>
        )}
      </div>

      {/* Anchor labels */}
      <div className="flex items-start gap-2">
        <div className="flex flex-col justify-between shrink-0" style={{ width: 80, height: 140 }}>
          <span className="text-gray-400 leading-tight" style={{ fontSize: 8 }}>{cfg.topAnchor}</span>
          <span className="text-gray-400 leading-tight" style={{ fontSize: 8 }}>{cfg.bottomAnchor}</span>
        </div>

        <div className="flex-1" style={{ minWidth: 0 }}>
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
                domain={cfg.domain}
                ticks={cfg.ticks}
                tick={{ fontSize: 9, fill: '#d1d5db' }}
                axisLine={false}
                tickLine={false}
                width={32}
                allowDataOverflow
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload.find((x) => x.dataKey === 'value') || payload[0];
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 shadow-md text-xs">
                      <p className="text-gray-400 mb-0.5">{p?.payload?.label}</p>
                      <p className="font-bold text-gray-900">
                        {p?.value}{cfg.unit ? ` ${cfg.unit}` : ''}
                      </p>
                      {p?.payload?.avg != null && (
                        <p className="text-gray-400">{avgLabel}: {p.payload.avg}{cfg.unit ? ` ${cfg.unit}` : ''}</p>
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

              {/* Rolling average */}
              {showAvg && (
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
              )}

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
      </div>
    </div>
  );
}
