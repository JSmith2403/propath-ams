import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceArea, ResponsiveContainer, Dot,
} from 'recharts';
import { CHIP_COLORS } from '../../data/referenceData';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function StatChip({ type, value, unit }) {
  const cfg = CHIP_COLORS[type];
  if (value === null || value === undefined) return null;
  return (
    <div className="flex flex-col items-center px-3 py-1.5 rounded-lg" style={{ backgroundColor: cfg.bg }}>
      <span className="text-xs font-semibold" style={{ color: cfg.text }}>{cfg.label}</span>
      <span className="text-sm font-bold" style={{ color: cfg.text }}>
        {typeof value === 'number' ? value.toFixed(value < 10 ? 2 : 1) : value}
        {unit && <span className="text-xs font-normal ml-0.5">{unit}</span>}
      </span>
    </div>
  );
}

// Custom dot: green inside band, red outside
function CustomDot(props) {
  const { cx, cy, payload, refLow, refHigh, higherIsBetter } = props;
  const v = payload?.value;
  if (v === undefined || v === null || cx === undefined) return null;
  let inBand;
  if (higherIsBetter === false) {
    inBand = v >= refLow && v <= refHigh;
  } else {
    inBand = v >= refLow && v <= refHigh;
  }
  const color = inBand ? '#22c55e' : '#ef4444';
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />
    </g>
  );
}

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="text-gray-500 mb-0.5">{label}</p>
      <p className="font-bold text-gray-900">{typeof v === 'number' ? v.toFixed(v < 10 ? 2 : 1) : v} {unit}</p>
      {payload[0]?.payload?.staff && <p className="text-gray-400">{payload[0].payload.staff}</p>}
    </div>
  );
};

export default function ValdLineChart({
  data = [],          // [{ date, value, staff }]
  unit = '',
  refLow,
  refHigh,
  cohortAvg,
  acuteLimit,
  higherIsBetter = true,
  height = 180,
}) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-xs text-gray-300" style={{ height }}>
        No data recorded yet
      </div>
    );
  }

  // Sort ascending by date for chart display
  const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  const chartData = sorted.map(d => ({ ...d, value: d.value, label: formatDate(d.date) }));

  const values = sorted.map(d => d.value);
  const latest = values[values.length - 1];
  const seasonBest = higherIsBetter ? Math.max(...values) : Math.min(...values);
  const seasonAvg = values.reduce((s, v) => s + v, 0) / values.length;

  // Y-axis padding
  const allVals = [...values, refLow, refHigh, cohortAvg].filter(Boolean);
  const yMin = Math.max(0, Math.min(...allVals) * 0.9);
  const yMax = Math.max(...allVals) * 1.1;

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis domain={[yMin, yMax]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={36} />
          <Tooltip content={<CustomTooltip unit={unit} />} />

          {/* Reference band */}
          {refLow !== undefined && refHigh !== undefined && (
            <ReferenceArea y1={refLow} y2={refHigh} fill="#bbf7d0" fillOpacity={0.35} />
          )}

          {/* Cohort average dashed line */}
          {cohortAvg !== undefined && (
            <ReferenceLine y={cohortAvg} stroke="#9ca3af" strokeDasharray="6 3" strokeWidth={1.5} />
          )}

          {/* Acute limit line */}
          {acuteLimit !== undefined && (
            <ReferenceLine y={acuteLimit} stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1} />
          )}

          {/* Data line */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#437E8D"
            strokeWidth={2}
            dot={<CustomDot refLow={refLow} refHigh={refHigh} higherIsBetter={higherIsBetter} />}
            activeDot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Stat chips */}
      <div className="flex gap-2 mt-3 flex-wrap">
        <StatChip type="latest"        value={latest}              unit={unit} />
        <StatChip type="acuteLimit"    value={acuteLimit}          unit={unit} />
        <StatChip type="seasonBest"    value={seasonBest}          unit={unit} />
        <StatChip type="seasonAverage" value={parseFloat(seasonAvg.toFixed(2))} unit={unit} />
      </div>
    </div>
  );
}
