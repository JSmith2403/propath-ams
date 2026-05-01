import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getMetricColour } from '../../utils/wellnessFlags';
import { getInsight, INSIGHT_TONE_COLOURS } from '../../utils/wellnessInsights';
import Sparkline from './Sparkline';

const RING_COLOUR = { green: '#22c55e', amber: '#f59e0b', red: '#ef4444' };

const METRICS = [
  { key: 'sleep_duration',  label: 'Sleep Duration',  unit: 'hrs', target: 7,   higherBetter: true  },
  { key: 'sleep_quality',   label: 'Sleep Quality',   unit: '/7',  target: 3,   higherBetter: false },
  { key: 'fatigue',         label: 'Fatigue',         unit: '/7',  target: 3,   higherBetter: false },
  { key: 'muscle_soreness', label: 'Muscle Soreness', unit: '/7',  target: 3,   higherBetter: false },
  { key: 'stress',          label: 'Stress',          unit: '/7',  target: 3,   higherBetter: false },
];

const RANGES = [
  { id: 7,  label: '7d'  },
  { id: 28, label: '28d' },
  { id: 90, label: '90d' },
];

function average(arr) {
  if (!arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function formatAvg(metric, val) {
  if (val == null) return '—';
  return metric.key === 'sleep_duration' ? val.toFixed(1) : val.toFixed(1);
}

/**
 * Whoop-style trend view. For each of the 5 wellness metrics:
 *   - big average for the chosen window
 *   - change vs the equivalent prior window (▲▼)
 *   - sparkline of the chosen window
 *   - a short coaching insight tuned to the average
 */
export default function WellnessTab({ athleteId }) {
  const [submissions, setSubmissions] = useState([]);
  const [useCustom,   setUseCustom]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(28);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data: subs }, { data: appTok }] = await Promise.all([
        supabase.from('wellness_submissions').select('*')
          .eq('athlete_id', athleteId)
          .order('submission_date', { ascending: true }),
        supabase.from('athlete_app_tokens').select('use_custom_wellness')
          .eq('athlete_id', athleteId).maybeSingle(),
      ]);
      if (cancelled) return;
      setSubmissions(subs || []);
      setUseCustom(!!appTok?.use_custom_wellness);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [athleteId]);

  // Slice into current + prior windows for change-vs-previous calc.
  const { current, prior } = useMemo(() => {
    if (!submissions.length) return { current: [], prior: [] };
    const cutoffNow = new Date();
    cutoffNow.setHours(0, 0, 0, 0);
    const cutoffCurrent = new Date(cutoffNow); cutoffCurrent.setDate(cutoffCurrent.getDate() - range);
    const cutoffPrior   = new Date(cutoffNow); cutoffPrior.setDate(cutoffPrior.getDate() - range * 2);

    const cur = [], pri = [];
    for (const s of submissions) {
      const d = new Date(s.submission_date + 'T00:00:00');
      if (d >= cutoffCurrent && d <= cutoffNow) cur.push(s);
      else if (d >= cutoffPrior && d < cutoffCurrent) pri.push(s);
    }
    return { current: cur, prior: pri };
  }, [submissions, range]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-7 h-7 rounded-full border-4 animate-spin"
          style={{ borderColor: 'rgba(165,141,105,0.25)', borderTopColor: '#A58D69' }} />
      </div>
    );
  }

  if (useCustom) {
    return (
      <div className="px-4 pt-6">
        <div className="rounded-xl p-8 text-center bg-white border border-ink-100 shadow-card">
          <p className="text-body font-semibold mb-1 text-ink-900">Custom questionnaire active</p>
          <p className="text-meta text-ink-500">
            Your coach has set up a personalised questionnaire — your daily check-ins are saved
            against those questions. Trends for custom questions are coming in the next update.
          </p>
        </div>
      </div>
    );
  }

  if (!submissions.length) {
    return (
      <div className="px-4 pt-6">
        <div className="rounded-xl p-8 text-center bg-white border border-ink-100 shadow-card">
          <p className="text-body font-semibold mb-1 text-ink-900">No wellness history yet</p>
          <p className="text-meta text-ink-500">
            Once you log a few check-ins, your trends and personalised insights will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      {/* Header */}
      <div>
        <p className="text-micro font-bold uppercase text-ink-400">Trends &amp; Insights</p>
        <p className="text-h3 text-ink-900">Your Wellness</p>
      </div>

      {/* Range picker */}
      <div className="flex gap-1.5">
        {RANGES.map(r => {
          const isOn = r.id === range;
          return (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`flex-1 py-2 rounded-md text-meta font-bold tracking-wider uppercase transition-all active:scale-95 border ${
                isOn
                  ? 'bg-gold-500 text-white border-gold-500'
                  : 'bg-white text-ink-600 border-ink-200 hover:border-gold-400'
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Metric tiles */}
      {METRICS.map((m) => {
        const curVals = current.map(s => Number(s[m.key])).filter(v => !isNaN(v));
        const priVals = prior.map(s => Number(s[m.key])).filter(v => !isNaN(v));
        const curAvg = average(curVals);
        const priAvg = average(priVals);

        const change = curAvg != null && priAvg != null && priAvg !== 0
          ? ((curAvg - priAvg) / priAvg) * 100
          : null;

        const improved = change == null ? null
          : (m.higherBetter ? change > 0 : change < 0);

        const colour = curAvg != null ? RING_COLOUR[getMetricColour(m.key, curAvg)] : '#9ca3af';
        const sparkValues = curVals.length >= 2 ? curVals : null;
        const insight = curAvg != null ? getInsight(m.key, curAvg) : null;

        return (
          <div key={m.key} className="rounded-xl p-4 bg-white border border-ink-100 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-micro font-bold uppercase text-ink-400">
                  {m.label}
                </p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-display font-bold" style={{ color }}>
                    {formatAvg(m, curAvg)}
                  </span>
                  <span className="text-meta font-semibold text-ink-500">
                    {m.unit}
                  </span>
                </div>
                {change != null && (
                  <div className="flex items-center gap-1 mt-1.5">
                    {Math.abs(change) < 1 ? (
                      <Minus size={12} className="text-ink-400" />
                    ) : improved ? (
                      <TrendingUp size={12} className="text-green-600" />
                    ) : (
                      <TrendingDown size={12} className="text-red-600" />
                    )}
                    <span className={`text-caption font-semibold ${
                      Math.abs(change) < 1 ? 'text-ink-400'
                        : improved ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {change > 0 ? '+' : ''}{change.toFixed(1)}% vs prior {range}d
                    </span>
                  </div>
                )}
              </div>
              {sparkValues && (
                <div className="shrink-0">
                  <Sparkline values={sparkValues} colour={colour} />
                  <p className="text-[9px] text-right mt-0.5 text-ink-400">
                    {curVals.length} log{curVals.length === 1 ? '' : 's'}
                  </p>
                </div>
              )}
            </div>

            {insight && (
              <div className="mt-3 pt-3 border-t border-ink-100 flex gap-2.5">
                <span
                  className="w-1 rounded-full shrink-0 self-stretch"
                  style={{ backgroundColor: INSIGHT_TONE_COLOURS[insight.tone] }}
                />
                <div className="min-w-0">
                  <p className="text-meta font-bold mb-0.5 text-ink-900">
                    {insight.title}
                  </p>
                  <p className="text-meta leading-relaxed text-ink-600">
                    {insight.body}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <p className="text-micro text-center pt-2 text-ink-400">
        Insights are general guidance. Always defer to your coach for individual advice.
      </p>
    </div>
  );
}
