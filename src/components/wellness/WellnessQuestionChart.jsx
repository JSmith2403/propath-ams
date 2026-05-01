import { useMemo } from 'react';
import {
  ResponsiveContainer, ComposedChart, Line, CartesianGrid,
  XAxis, YAxis, Tooltip, ReferenceLine,
} from 'recharts';
import { getRagColour } from '../../utils/wellnessRag';

const TEAL  = '#437E8D';
const GREEN = '#22c55e';
const AMBER = '#f59e0b';
const RED   = '#ef4444';

const RAG_HEX = { green: GREEN, amber: AMBER, red: RED };

// ── Rolling mean over the last `windowDays` days ──────────────────────────
function rollingMeans(submissions, questionId, windowDays = 28) {
  const out = new Map(); // submission_date → { mean, n }
  const items = submissions.map(s => ({
    date: new Date(s.submission_date + 'T00:00:00'),
    iso:  s.submission_date,
    val:  Number(s.responses?.[questionId]),
  })).filter(x => isFinite(x.val));

  for (let i = 0; i < items.length; i++) {
    const cutoff = new Date(items[i].date);
    cutoff.setDate(cutoff.getDate() - windowDays);
    const window = [];
    for (let j = i; j >= 0; j--) {
      if (items[j].date < cutoff) break;
      window.push(items[j].val);
    }
    const mean = window.length
      ? window.reduce((a, b) => a + b, 0) / window.length
      : null;
    out.set(items[i].iso, { mean, n: window.length });
  }
  return out;
}

// ── Y-axis config derived from question shape ─────────────────────────────
function yAxisFor(question) {
  const c = question.config || {};
  const t = question.question_type;
  if (t === 'slider' || t === 'slider_1_7') {
    const max = c.max ?? 7;
    return { domain: [1, max], ticks: Array.from({ length: max }, (_, i) => i + 1), unit: '' };
  }
  if (t === 'number') {
    const min = c.min ?? 0;
    const max = c.max ?? 10;
    const span = max - min;
    const step = span > 8 ? Math.ceil(span / 5) : 1;
    const ticks = [];
    for (let v = min; v <= max; v += step) ticks.push(v);
    if (ticks[ticks.length - 1] !== max) ticks.push(max);
    return { domain: [min, max], ticks, unit: c.unit || '' };
  }
  if (t === 'yes_no') {
    return { domain: [0, 1], ticks: [0, 1], unit: '' };
  }
  return { domain: [0, 1], ticks: [0, 1], unit: '' };
}

// ── Chart-able predicate ──────────────────────────────────────────────────
export function isChartable(question) {
  if (!question) return false;
  const t = question.question_type;
  return t === 'slider' || t === 'slider_1_7' || t === 'number' || t === 'yes_no';
}

// ── Custom dot — colour by per-question RAG ───────────────────────────────
function makeDot(question) {
  return function CustomDot({ cx, cy, payload }) {
    if (cx == null || cy == null) return null;
    const colour = RAG_HEX[payload?.rag] || TEAL;
    return <circle cx={cx} cy={cy} r={4} fill={colour} stroke="#fff" strokeWidth={1.5} />;
  };
}

/**
 * One chart per question. Plots each submission's value as dots (RAG-
 * coloured by the question's saved thresholds) plus a dashed rolling
 * 28-day mean overlay. Threshold boundaries render as dashed
 * reference lines.
 */
export default function WellnessQuestionChart({ question, submissions }) {
  if (!isChartable(question)) return null;
  if (!submissions || submissions.length === 0) return null;

  const cfg = yAxisFor(question);
  const Dot = useMemo(() => makeDot(question), [question]);
  const means = useMemo(
    () => rollingMeans(submissions, question.id, 28),
    [submissions, question.id]
  );

  // Build chart rows. yes_no is mapped to 0/1 so it draws a step line.
  const chartData = useMemo(() => {
    return submissions
      .map((sub) => {
        const raw = sub.responses?.[question.id];
        if (raw == null || raw === '') return null;
        const num = question.question_type === 'yes_no'
          ? (String(raw).toLowerCase() === 'yes' ? 1 : 0)
          : Number(raw);
        if (!isFinite(num)) return null;
        const rag = getRagColour(raw, question);
        const m = means.get(sub.submission_date);
        return {
          date: sub.submission_date,
          label: new Date(sub.submission_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
          value: num,
          avg: m && m.n >= 2 ? Math.round(m.mean * 100) / 100 : null,
          rag,
        };
      })
      .filter(Boolean);
  }, [submissions, question, means]);

  if (chartData.length === 0) return null;

  const latestN = means.get(submissions[submissions.length - 1].submission_date)?.n || 0;
  const showAvg = latestN >= 2;

  // Threshold reference lines — only meaningful for rated numerics.
  const th = question.rag_thresholds || {};
  const thresholdLines = [];
  if (question.question_type !== 'yes_no') {
    if (th.green_boundary != null) thresholdLines.push({ y: th.green_boundary, stroke: GREEN });
    if (th.amber_boundary != null && th.amber_boundary !== th.green_boundary) {
      thresholdLines.push({ y: th.amber_boundary, stroke: AMBER });
    }
  }

  return (
    <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}>
      <div className="flex items-center justify-between mb-3 gap-3">
        <h4 className="text-xs font-semibold text-gray-700" title={question.label}>
          {question.label}
        </h4>
        {showAvg && (
          <span className="text-[10px] uppercase tracking-wider text-gray-400 shrink-0">
            28-day avg
          </span>
        )}
      </div>

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
            tickFormatter={question.question_type === 'yes_no'
              ? (v) => v === 1 ? 'Yes' : 'No'
              : undefined}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload.find((x) => x.dataKey === 'value') || payload[0];
              const display = question.question_type === 'yes_no'
                ? (p?.value === 1 ? 'Yes' : 'No')
                : `${p?.value}${cfg.unit ? ` ${cfg.unit}` : ''}`;
              return (
                <div className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 shadow-md text-xs">
                  <p className="text-gray-400 mb-0.5">{p?.payload?.label}</p>
                  <p className="font-bold text-gray-900">{display}</p>
                  {p?.payload?.avg != null && (
                    <p className="text-gray-400">28d avg: {p.payload.avg}{cfg.unit ? ` ${cfg.unit}` : ''}</p>
                  )}
                </div>
              );
            }}
          />

          {/* Threshold reference lines */}
          {thresholdLines.map((t, i) => (
            <ReferenceLine
              key={i}
              y={t.y}
              stroke={t.stroke}
              strokeDasharray="4 2"
              strokeWidth={1}
              opacity={0.45}
            />
          ))}

          {/* Rolling average */}
          {showAvg && (
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#cbd5e1"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 2"
              isAnimationActive={false}
              connectNulls
            />
          )}

          {/* Daily values */}
          <Line
            type="monotone"
            dataKey="value"
            stroke={TEAL}
            strokeWidth={2}
            dot={<Dot />}
            activeDot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
