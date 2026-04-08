import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';

const SESSION_COLORS = ['#437E8D', '#A58D69', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444'];

const SPLITS = ['5m', '10m', '20m', '30m'];

const SPLIT_REFS = {
  '5m': 1.07, '10m': 1.76, '20m': 2.95, '30m': 4.10,
};

export default function SprintChart({ entries = [] }) {
  if (!entries.length) {
    return (
      <div className="flex items-center justify-center text-xs text-gray-300 py-16">
        No sprint data recorded yet
      </div>
    );
  }

  // Take up to 5 most recent sessions, sorted ascending by date
  const sessions = [...entries]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-5);

  // Build chart data: one entry per split distance
  const chartData = SPLITS.map(split => {
    const row = { split };
    sessions.forEach((s, i) => {
      row[`session${i}`] = s[`split${split.replace('m', '')}m`] ?? null;
    });
    return row;
  });

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="split" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={36} />
          <Tooltip
            formatter={(val, name, props) => {
              const idx = parseInt(name.replace('session', ''));
              const s = sessions[idx];
              return [`${val?.toFixed(2)} s`, s ? new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : name];
            }}
          />
          <Legend
            formatter={(value) => {
              const idx = parseInt(value.replace('session', ''));
              const s = sessions[idx];
              return s ? new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : value;
            }}
            wrapperStyle={{ fontSize: '11px' }}
          />
          {sessions.map((_, i) => (
            <Bar key={i} dataKey={`session${i}`} fill={SESSION_COLORS[i % SESSION_COLORS.length]}
              radius={[2, 2, 0, 0]} maxBarSize={20} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      {/* Cohort avg reference labels */}
      <div className="flex gap-4 mt-2 flex-wrap">
        {SPLITS.map(s => (
          <span key={s} className="text-xs text-gray-400">
            {s} avg: <span className="font-medium text-gray-600">{SPLIT_REFS[s]}s</span>
          </span>
        ))}
      </div>
    </div>
  );
}
