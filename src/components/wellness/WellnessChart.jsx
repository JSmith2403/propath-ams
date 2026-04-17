import {
  ResponsiveContainer, ComposedChart, Line, CartesianGrid,
  XAxis, YAxis, Tooltip, ReferenceLine,
} from 'recharts';
import { computeRollingStats, getQuestionColour } from '../../utils/wellnessFlags';

const TEAL = '#437E8D';
const RED  = '#ef4444';
const AMBER = '#f59e0b';

function CustomDot({ cx, cy, payload }) {
  if (cx == null || cy == null) return null;
  const colour = payload.flag === 'red' ? RED : payload.flag === 'amber' ? AMBER : TEAL;
  return <circle cx={cx} cy={cy} r={4} fill={colour} stroke="#fff" strokeWidth={1.5} />;
}

function buildYAxis(question) {
  if (question.question_type === 'numerical') {
    const min = Number.isFinite(question.numerical_min) ? Number(question.numerical_min) : 0;
    const max = Number.isFinite(question.numerical_max) ? Number(question.numerical_max) : 10;
    const unit = question.numerical_unit || '';
    return { domain: [min, max], unit,
      bottomAnchor: `${min}${unit ? ` ${unit}` : ''}`,
      topAnchor:    `${max}${unit ? ` ${unit}` : ''}` };
  }
  // scale
  const min = Number.isFinite(question.scale_min) ? Number(question.scale_min) : 1;
  const max = Number.isFinite(question.scale_max) ? Number(question.scale_max) : 7;
  return { domain: [min, max], unit: '',
    bottomAnchor: question.scale_min_label || `${min}`,
    topAnchor:    question.scale_max_label || `${max}` };
}

export default function WellnessChart({ submissions, question }) {
  if (!submissions || submissions.length === 0 || !question) return null;

  // Only chart quantitative types
  if (question.question_type !== 'scale' && question.question_type !== 'numerical') return null;

  const rollingStats = computeRollingStats(submissions, [question]);
  const { domain, unit, bottomAnchor, topAnchor } = buildYAxis(question);

  // Filter out submissions with no value for this question
  const chartData = submissions.map((sub) => {
    const raw = sub.responses?.[question.id];
    const val = raw == null || raw === '' ? null : Number(raw);
    const stats = rollingStats.get(sub.submission_date)?.[question.id];
    const flag = val != null ? getQuestionColour(question, val) : null;
    return {
      date: sub.submission_date,
      label: new Date(sub.submission_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      value: val,
      avg: stats?.n >= 2 ? Math.round(stats.mean * 100) / 100 : null,
      flag,
    };
  }).filter(d => d.value != null);

  if (chartData.length === 0) return null;

  // Determine window-days label from the latest stats window
  let windowDays = 0;
  if (submissions.length >= 2) {
    const latest = new Date(submissions[submissions.length - 1].submission_date);
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
  const latestStats = rollingStats.get(submissions[submissions.length - 1]?.submission_date)?.[question.id];
  const showAvg = (latestStats?.n || 0) >= 2;
  const avgLabel = windowDays >= 28 ? '28-day avg' : `${windowDays}-day avg`;

  // Threshold for reference line (the amber→red boundary)
  const threshold = question.amber_threshold != null ? Number(question.amber_threshold) : null;

  return (
    <div className="rounded-xl p-4 mb-4 bg-white" style={{ border: '1px solid #e5e7eb' }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {question.question_text}
        </h4>
        {showAvg && <span className="text-xs text-gray-400">{avgLabel}</span>}
      </div>

      <div className="flex items-start gap-2">
        <div className="flex flex-col justify-between shrink-0" style={{ width: 80, height: 140 }}>
          <span className="text-gray-400 leading-tight" style={{ fontSize: 8 }}>{topAnchor}</span>
          <span className="text-gray-400 leading-tight" style={{ fontSize: 8 }}>{bottomAnchor}</span>
        </div>

        <div className="flex-1" style={{ minWidth: 0 }}>
          <ResponsiveContainer width="100%" height={140}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#d1d5db' }}
                axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={domain} tick={{ fontSize: 9, fill: '#d1d5db' }}
                axisLine={false} tickLine={false} width={32} allowDataOverflow />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload.find(x => x.dataKey === 'value') || payload[0];
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 shadow-md text-xs">
                      <p className="text-gray-400 mb-0.5">{p?.payload?.label}</p>
                      <p className="font-bold text-gray-900">{p?.value}{unit ? ` ${unit}` : ''}</p>
                      {p?.payload?.avg != null && (
                        <p className="text-gray-400">{avgLabel}: {p.payload.avg}{unit ? ` ${unit}` : ''}</p>
                      )}
                    </div>
                  );
                }}
              />

              {threshold != null && (
                <ReferenceLine y={threshold} stroke={RED} strokeDasharray="4 2" strokeWidth={1} />
              )}

              {showAvg && (
                <Line type="monotone" dataKey="avg" stroke="#e5e7eb" strokeWidth={1.5}
                  dot={false} strokeDasharray="4 2" isAnimationActive={false} connectNulls />
              )}

              <Line type="monotone" dataKey="value" stroke={TEAL} strokeWidth={2}
                dot={<CustomDot />} activeDot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
