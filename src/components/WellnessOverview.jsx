import { useState, useEffect, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getRagColour } from '../utils/wellnessRag';
import { useWellness } from '../hooks/useWellness';
import WellnessQuestionChart, { isChartable } from './wellness/WellnessQuestionChart';

const COLOUR_MAP = { green: '#22c55e', amber: '#f59e0b', red: '#ef4444' };

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function shortLabel(label) {
  return label.replace(/\?$/, '').split(/\s+/).slice(0, 3).join(' ');
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

function CellValue({ question, value }) {
  if (value == null || value === '') return <span className="text-gray-300">—</span>;
  const colour = getRagColour(value, question);
  const colourHex = colour ? COLOUR_MAP[colour] : '#374151';
  return <span style={{ color: colourHex, fontWeight: 600 }}>{String(value)}</span>;
}

/**
 * Sidebar "Wellness" page. Shows every athlete that has wellness
 * activated, lets the coach pick one, and renders that athlete's
 * submissions against their currently-selected library questions.
 *
 * All data comes from the new model (wellness_responses + library +
 * athlete_wellness_questions). Legacy wellness_submissions table is
 * no longer read.
 */
export default function WellnessOverview({ athletes, role }) {
  const [tokens, setTokens] = useState([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState('');
  const [tokensLoading, setTokensLoading] = useState(true);

  const canDelete = role === 'admin' || role === 'co_admin';

  // Active wellness tokens — list of athletes who can submit.
  // wellness_tokens.is_active is meant to mirror athlete_app_tokens (the
  // actual "Athlete App" toggle a coach uses), but the two aren't
  // DB-enforced in sync — cross-check both so a stale wellness_tokens row
  // can't show an athlete as active here.
  useEffect(() => {
    (async () => {
      const [{ data: wellness }, { data: appTokens }] = await Promise.all([
        supabase.from('wellness_tokens').select('athlete_id, is_active').eq('is_active', true),
        supabase.from('athlete_app_tokens').select('athlete_id, is_active').eq('is_active', true),
      ]);
      const activeAppIds = new Set((appTokens || []).map(t => t.athlete_id));
      setTokens((wellness || []).filter(t => activeAppIds.has(t.athlete_id)));
      setTokensLoading(false);
    })();
  }, []);

  const activeAthletes = useMemo(() => {
    const ids = new Set(tokens.map(t => t.athlete_id));
    return athletes.filter(a => ids.has(a.id));
  }, [athletes, tokens]);

  useEffect(() => {
    if (!selectedAthleteId && activeAthletes.length > 0) {
      setSelectedAthleteId(activeAthletes[0].id);
    }
  }, [activeAthletes, selectedAthleteId]);

  const { questions, featuredIds, submissions, loading, refresh, saveCoachNote } = useWellness(selectedAthleteId);

  const sortedSubs = useMemo(
    () => [...submissions].sort((a, b) => b.submission_date.localeCompare(a.submission_date)),
    [submissions]
  );
  // Charts read left→right chronologically.
  const chartSubs = useMemo(
    () => [...submissions].sort((a, b) => a.submission_date.localeCompare(b.submission_date)),
    [submissions]
  );

  // Featured first, the rest folded under a "show more" toggle so the
  // page stays scannable when an athlete has 15+ questions selected.
  const { featuredCharts, otherCharts } = useMemo(() => {
    const f = [], o = [];
    for (const q of questions) {
      if (!isChartable(q)) continue;
      (featuredIds.has(q.id) ? f : o).push(q);
    }
    return { featuredCharts: f, otherCharts: o };
  }, [questions, featuredIds]);

  const stats = useMemo(() => {
    if (!sortedSubs.length) return null;
    const latest = sortedSubs[0];
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 28);
    const last28 = sortedSubs.filter(s => new Date(s.submission_date) >= cutoff);
    return {
      lastDate: formatDate(latest.submission_date),
      total: sortedSubs.length,
      last28Count: last28.length,
    };
  }, [sortedSubs]);

  // Row-level RAG: any cell red = row red; else any amber = amber.
  function rowRag(sub) {
    let worst = null;
    for (const q of questions) {
      const c = getRagColour(sub.responses?.[q.id], q);
      if (c === 'red')   return 'red';
      if (c === 'amber') worst = 'amber';
    }
    return worst;
  }

  const handleDelete = async (sub) => {
    if (!window.confirm(`Delete the ${formatDate(sub.submission_date)} entry? This cannot be undone.`)) return;
    const { error } = await supabase.from('wellness_responses').delete().eq('id', sub.id);
    if (error) { alert('Failed to delete: ' + error.message); return; }
    refresh();
  };

  if (tokensLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 animate-spin"
          style={{ borderColor: 'rgba(165,141,105,0.25)', borderTopColor: '#A58D69' }} />
      </div>
    );
  }

  const selectedAthlete = athletes.find(a => a.id === selectedAthleteId);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Wellness</h1>
        <p className="text-sm text-gray-500 mt-1">Daily check-in submissions from the athlete app.</p>
      </div>

      {activeAthletes.length === 0 ? (
        <div className="px-8 py-20 text-center">
          <p className="text-gray-400">No athletes have wellness tracking activated.</p>
          <p className="text-sm text-gray-400 mt-1">
            Activate the Athlete App on an athlete's Overview tab to enable wellness.
          </p>
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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-7 h-7 rounded-full border-4 animate-spin"
                style={{ borderColor: 'rgba(165,141,105,0.25)', borderTopColor: '#A58D69' }} />
            </div>
          ) : selectedAthlete && sortedSubs.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-400">No submissions yet for this athlete.</p>
              <p className="text-xs text-gray-400 mt-1">
                Once they complete a daily check-in in the app it will appear here.
              </p>
            </div>
          ) : selectedAthlete && (
            <>
              {/* Summary cards */}
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Last submission"  value={stats.lastDate} />
                  <StatCard label="Total submissions" value={stats.total} />
                  <StatCard label="In last 28 days"   value={stats.last28Count} />
                  <StatCard label="Questions sent"    value={questions.length} />
                </div>
              )}

              {/* Trends */}
              {(featuredCharts.length + otherCharts.length) > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Trends &amp; Rolling Averages
                  </h3>
                  {featuredCharts.map(q => (
                    <WellnessQuestionChart key={q.id} question={q} submissions={chartSubs} onSaveNote={saveCoachNote} />
                  ))}
                  {otherCharts.length > 0 && (
                    <details className="mb-2">
                      <summary className="text-xs font-semibold text-gray-500 cursor-pointer py-2 hover:text-gray-700">
                        Show {otherCharts.length} more chart{otherCharts.length === 1 ? '' : 's'}
                      </summary>
                      <div className="mt-2">
                        {otherCharts.map(q => (
                          <WellnessQuestionChart key={q.id} question={q} submissions={chartSubs} onSaveNote={saveCoachNote} />
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {/* Submission log */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Submission Log</h3>
                {questions.length === 0 ? (
                  <div className="rounded-xl p-6 bg-white border border-gray-100">
                    <p className="text-xs text-gray-400">
                      This athlete has no active questions selected.
                      Add some via their profile's Wellness tab.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl overflow-hidden border border-gray-100 bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ backgroundColor: '#f9fafb' }}>
                            <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider sticky left-0"
                              style={{ backgroundColor: '#f9fafb' }}>
                              Date
                            </th>
                            {questions.map(q => (
                              <th key={q.id}
                                title={q.label}
                                className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                {shortLabel(q.label)}
                              </th>
                            ))}
                            {canDelete && <th className="w-8" />}
                          </tr>
                        </thead>
                        <tbody>
                          {sortedSubs.map(sub => {
                            const rag = rowRag(sub);
                            const rowBg = rag === 'red'   ? '#fef2f2'
                                         : rag === 'amber' ? '#fffbeb'
                                         : '#fff';
                            return (
                              <tr key={sub.id} className="group border-t border-gray-100"
                                style={{ backgroundColor: rowBg }}>
                                <td className="px-3 py-2 font-medium text-gray-700 sticky left-0"
                                  style={{ backgroundColor: rowBg }}>
                                  {formatDate(sub.submission_date)}
                                </td>
                                {questions.map(q => (
                                  <td key={q.id} className="px-3 py-2">
                                    <CellValue question={q} value={sub.responses?.[q.id]} />
                                  </td>
                                ))}
                                {canDelete && (
                                  <td className="px-2 py-2 text-right">
                                    <button
                                      onClick={() => handleDelete(sub)}
                                      title="Delete submission"
                                      className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
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
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
