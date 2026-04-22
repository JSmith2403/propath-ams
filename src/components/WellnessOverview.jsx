import { useState, useEffect, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getMetricColour, METRIC_KEYS, computeRollingStats, isTier1Flagged } from '../utils/wellnessFlags';
import WellnessChart from './wellness/WellnessChart';

const METRIC_LABELS = {
  sleep_duration:  'Sleep Hrs',
  sleep_quality:   'Sleep Qual',
  fatigue:         'Fatigue',
  muscle_soreness: 'Soreness',
  stress:          'Stress',
};

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl p-4 bg-white" style={{ border: '1px solid #e5e7eb' }}>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

const COLOUR_MAP = { green: '#22c55e', amber: '#f59e0b', red: '#ef4444' };

function CellValue({ metric, value }) {
  const colour = getMetricColour(metric, Number(value));
  return (
    <span style={{ color: COLOUR_MAP[colour], fontWeight: 600 }}>{value}</span>
  );
}

export default function WellnessOverview({ athletes, role }) {
  const [tokens, setTokens] = useState([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const canDelete = role === 'admin' || role === 'co_admin';

  const handleDeleteSubmission = async (sub) => {
    const dateLabel = formatDate(sub.submission_date);
    if (!window.confirm(`Are you sure you want to delete this wellness entry for ${dateLabel}? This cannot be undone.`)) {
      return;
    }
    const { error } = await supabase
      .from('wellness_submissions')
      .delete()
      .eq('id', sub.id);
    if (error) {
      alert('Failed to delete submission: ' + (error.message || error));
      return;
    }
    // Remove from local state so the row disappears immediately
    setSubmissions(prev => prev.filter(s => s.id !== sub.id));
  };

  // Fetch all active wellness tokens
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('wellness_tokens')
        .select('athlete_id, is_active')
        .eq('is_active', true);
      setTokens(data || []);
      setLoading(false);
    })();
  }, []);

  // Athletes that have active wellness
  const activeAthletes = useMemo(() => {
    const activeIds = new Set((tokens).map(t => t.athlete_id));
    return athletes.filter(a => activeIds.has(a.id));
  }, [athletes, tokens]);

  // Auto-select first athlete
  useEffect(() => {
    if (!selectedAthleteId && activeAthletes.length > 0) {
      setSelectedAthleteId(activeAthletes[0].id);
    }
  }, [activeAthletes, selectedAthleteId]);

  // Fetch submissions for selected athlete
  useEffect(() => {
    if (!selectedAthleteId) { setSubmissions([]); return; }
    (async () => {
      const { data } = await supabase
        .from('wellness_submissions')
        .select('*')
        .eq('athlete_id', selectedAthleteId)
        .order('submission_date', { ascending: true });
      setSubmissions(data || []);
    })();
  }, [selectedAthleteId]);

  const selectedAthlete = athletes.find(a => a.id === selectedAthleteId);

  // Stats
  const stats = useMemo(() => {
    if (submissions.length === 0) return null;
    const latest = submissions[submissions.length - 1];
    const last28 = submissions.filter(s => {
      const d = new Date(s.submission_date);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 28);
      return d >= cutoff;
    });
    const avg = (key) => {
      if (last28.length === 0) return '-';
      const sum = last28.reduce((a, s) => a + Number(s[key]), 0);
      return (sum / last28.length).toFixed(1);
    };
    return {
      lastDate: formatDate(latest.submission_date),
      avgSleep: avg('sleep_duration'),
      avgFatigue: avg('fatigue'),
      avgStress: avg('stress'),
    };
  }, [submissions]);

  // Flagging for table rows
  const rollingStats = useMemo(() => computeRollingStats(submissions), [submissions]);

  const isRowFlagged = (sub) => {
    for (const key of METRIC_KEYS) {
      if (isTier1Flagged(key, Number(sub[key]))) return true;
    }
    return false;
  };

  const displaySubs = [...submissions].reverse();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full border-4 animate-spin"
          style={{ borderColor: 'rgba(165,141,105,0.25)', borderTopColor: '#A58D69' }}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Wellness</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of athlete wellness submissions</p>
      </div>

      {activeAthletes.length === 0 ? (
        <div className="px-8 py-20 text-center">
          <p className="text-gray-400">No athletes have wellness tracking activated.</p>
          <p className="text-sm text-gray-400 mt-1">Activate tracking from an athlete's Wellness tab.</p>
        </div>
      ) : (
        <div className="px-8 pb-8 space-y-6">
          {/* Athlete selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Athlete
            </label>
            <select
              value={selectedAthleteId}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
              className="w-full max-w-xs rounded-lg px-3 py-2 text-sm border border-gray-200 bg-white text-gray-700 outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#A58D69' }}
            >
              {activeAthletes.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {selectedAthlete && submissions.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-gray-400">No submissions yet for this athlete.</p>
            </div>
          )}

          {selectedAthlete && submissions.length > 0 && (
            <>
              {/* Summary cards */}
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Last submission" value={stats.lastDate} />
                  <StatCard label="Avg sleep (28d)" value={`${stats.avgSleep} hrs`} />
                  <StatCard label="Avg fatigue (28d)" value={stats.avgFatigue} sub="1 low - 7 high" />
                  <StatCard label="Avg stress (28d)" value={stats.avgStress} sub="1 low - 7 high" />
                </div>
              )}

              {/* Submission log */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Submission Log</h3>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                        {METRIC_KEYS.map(k => (
                          <th key={k} className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">
                            {METRIC_LABELS[k]}
                          </th>
                        ))}
                        {canDelete && <th className="w-8" />}
                      </tr>
                    </thead>
                    <tbody>
                      {displaySubs.map((sub) => {
                        const flagged = isRowFlagged(sub);
                        return (
                          <tr
                            key={sub.id}
                            className="group border-t border-gray-100"
                            style={flagged ? { backgroundColor: '#fef2f2' } : {}}
                          >
                            <td className="px-3 py-2 font-medium text-gray-700">
                              {formatDate(sub.submission_date)}
                            </td>
                            {METRIC_KEYS.map(k => (
                              <td key={k} className="px-3 py-2">
                                <CellValue metric={k} value={sub[k]} />
                              </td>
                            ))}
                            {canDelete && (
                              <td className="px-2 py-2 text-right">
                                <button
                                  onClick={() => handleDeleteSubmission(sub)}
                                  title="Delete submission"
                                  className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Charts */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Trends</h3>
                {METRIC_KEYS.map(key => (
                  <WellnessChart key={key} submissions={submissions} metric={key} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
