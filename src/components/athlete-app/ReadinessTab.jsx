import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import WellnessMiniRings from '../wellness/WellnessMiniRings';
import WellnessDonutRing from '../wellness/WellnessDonutRing';
import { getMetricColour } from '../../utils/wellnessFlags';

const METRICS = [
  { key: 'sleep_duration',  label: 'Sleep',    max: 12 },
  { key: 'sleep_quality',   label: 'Quality',  max: 7 },
  { key: 'fatigue',         label: 'Fatigue',  max: 7 },
  { key: 'muscle_soreness', label: 'Soreness', max: 7 },
  { key: 'stress',          label: 'Stress',   max: 7 },
];

/**
 * Mirrors the dashboard wellness rings: latest submission as a row of
 * five donuts (large), then a 7-day mini history beneath.
 */
export default function ReadinessTab({ athleteId }) {
  const [submissions, setSubmissions] = useState([]);
  const [useCustom,   setUseCustom]   = useState(false);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data: subs }, { data: appTok }] = await Promise.all([
        supabase.from('wellness_submissions').select('*')
          .eq('athlete_id', athleteId)
          .order('submission_date', { ascending: false }).limit(7),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-7 h-7 rounded-full border-4 animate-spin"
          style={{ borderColor: 'rgba(165,141,105,0.25)', borderTopColor: '#A58D69' }} />
      </div>
    );
  }

  const latest = submissions[0];
  const history = [...submissions].reverse(); // oldest -> newest for the strip

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="mb-4">
        <p className="text-micro font-bold uppercase text-ink-400">Today's Readiness</p>
        <p className="text-h3 text-ink-900">
          {latest
            ? new Date(latest.submission_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
            : 'No submissions yet'}
        </p>
      </div>

      {useCustom ? (
        <div className="rounded-xl p-8 text-center bg-white border border-ink-100 shadow-card">
          <p className="text-body font-semibold mb-1 text-ink-900">Custom questionnaire active</p>
          <p className="text-meta text-ink-500">
            Your coach has set up a personalised questionnaire. Readiness rings use the default
            5 wellness metrics — they will populate again if your coach switches custom mode off.
          </p>
        </div>
      ) : !latest ? (
        <div className="rounded-xl p-8 text-center bg-white border border-ink-100 shadow-card">
          <p className="text-meta text-ink-500">
            Submit your first wellness check-in to see your readiness here.
          </p>
        </div>
      ) : (
        <>
          {/* Big rings — today */}
          <div className="rounded-xl p-5 mb-5 bg-white border border-ink-100 shadow-card">
            <div className="flex items-start justify-between">
              {METRICS.map((m) => {
                const val = Number(latest[m.key]);
                const colour = getMetricColour(m.key, val);
                return (
                  <div key={m.key} className="flex flex-col items-center">
                    <div className="relative">
                      <WellnessDonutRing value={val} max={m.max} colour={colour} size={60} />
                      <span className="absolute inset-0 flex items-center justify-center text-meta font-bold text-ink-900">
                        {val}
                      </span>
                    </div>
                    <span className="text-micro mt-1.5 font-bold uppercase text-ink-400">
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7-day strip */}
          {history.length > 1 && (
            <div className="rounded-xl p-4 bg-white border border-ink-100 shadow-card">
              <p className="text-micro font-bold uppercase mb-3 text-ink-400">
                Last {history.length} days
              </p>
              <div className="space-y-3">
                {history.map((s) => (
                  <div key={s.id} className="rounded-md p-2.5 bg-ink-50">
                    <WellnessMiniRings submission={s} date={s.submission_date} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
