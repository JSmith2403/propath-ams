import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import { ACSI_SUBSCALES } from '../../data/referenceData';

function buildRadarData(entry) {
  if (!entry) return ACSI_SUBSCALES.map(s => ({ subject: s.label, value: 0 }));
  return ACSI_SUBSCALES.map(s => ({ subject: s.label, value: entry[s.key] ?? 0, fullMark: 28 }));
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

export default function AcsiRadar({ entries = [], compareDate = null }) {
  if (!entries.length) {
    return (
      <div className="flex items-center justify-center text-xs text-gray-300 py-16">
        No ACSI-28 assessments recorded yet
      </div>
    );
  }

  // Sorted: most recent first
  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = sorted[0];
  const compare = compareDate ? entries.find(e => e.date === compareDate) : null;

  const latestData = buildRadarData(latest);
  const compareData = compare ? buildRadarData(compare) : null;

  // Merge into single dataset for Recharts RadarChart
  const chartData = ACSI_SUBSCALES.map((s, i) => ({
    subject: s.label,
    latest: latest[s.key] ?? 0,
    ...(compare ? { compare: compare[s.key] ?? 0 } : {}),
    fullMark: 28,
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <PolarRadiusAxis angle={90} domain={[0, 28]} tick={{ fontSize: 9, fill: '#9ca3af' }} tickCount={4} />
          <Radar
            name={formatDate(latest.date)}
            dataKey="latest"
            stroke="#A58D69"
            fill="#A58D69"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          {compare && (
            <Radar
              name={formatDate(compare.date)}
              dataKey="compare"
              stroke="#437E8D"
              fill="#437E8D"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          )}
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Tooltip
            formatter={(value, name) => [`${value} / 28`, name]}
            labelFormatter={() => ''}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Subscale table */}
      <div className="mt-4 border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th className="text-left px-3 py-2 font-semibold text-gray-500">Subscale</th>
              <th className="text-right px-3 py-2 font-semibold" style={{ color: '#A58D69' }}>
                {formatDate(latest.date)}
              </th>
              {compare && (
                <th className="text-right px-3 py-2 font-semibold" style={{ color: '#437E8D' }}>
                  {formatDate(compare.date)}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {ACSI_SUBSCALES.map(s => (
              <tr key={s.key} className="border-t border-gray-50">
                <td className="px-3 py-2 text-gray-600">{s.label}</td>
                <td className="px-3 py-2 text-right font-medium text-gray-900">{latest[s.key] ?? '—'}</td>
                {compare && (
                  <td className="px-3 py-2 text-right font-medium text-gray-900">{compare[s.key] ?? '—'}</td>
                )}
              </tr>
            ))}
            <tr className="border-t border-gray-200 font-semibold">
              <td className="px-3 py-2 text-gray-700">Total</td>
              <td className="px-3 py-2 text-right text-gray-900">{latest.total ?? '—'}</td>
              {compare && <td className="px-3 py-2 text-right text-gray-900">{compare.total ?? '—'}</td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
