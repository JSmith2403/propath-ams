import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { getQuestionColour, isAnyResponseFlagged } from '../utils/wellnessFlags';
import WellnessChart from './wellness/WellnessChart';

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

function formatValue(q, v) {
  if (v == null || v === '') return '-';
  if (q.question_type === 'yes_no') return v === 'yes' ? 'Yes' : 'No';
  if (q.question_type === 'text') {
    const s = String(v);
    return s.length > 30 ? s.slice(0, 30) + '…' : s;
  }
  return v;
}

function CellValue({ q, value }) {
  const colour = (q.question_type === 'scale' || q.question_type === 'numerical')
    ? getQuestionColour(q, value)
    : 'green';
  const formatted = formatValue(q, value);
  const isFlaggable = colour === 'red' || colour === 'amber';
  return (
    <span style={{ color: isFlaggable ? COLOUR_MAP[colour] : '#374151', fontWeight: 600 }}>
      {formatted}
    </span>
  );
}

export default function WellnessOverview({ athletes }) {
  const [tokens, setTokens] = useState([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [assignedQuestions, setAssignedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // All active wellness tokens
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

  const activeAthletes = useMemo(() => {
    const activeIds = new Set(tokens.map(t => t.athlete_id));
    return athletes.filter(a => activeIds.has(a.id));
  }, [athletes, tokens]);

  useEffect(() => {
    if (!selectedAthleteId && activeAthletes.length > 0) {
      setSelectedAthleteId(activeAthletes[0].id);
    }
  }, [activeAthletes, selectedAthleteId]);

  // Fetch submissions + assigned questions for selected athlete
  useEffect(() => {
    if (!selectedAthleteId) { setSubmissions([]); setAssignedQuestions([]); return; }
    (async () => {
      const [subsRes, aqRes] = await Promise.all([
        supabase.from('wellness_submissions').select('*').eq('athlete_id', selectedAthleteId).order('submission_date', { ascending: true }),
        supabase.from('wellness_athlete_questions').select('question_id, display_order').eq('athlete_id', selectedAthleteId).order('display_order', { ascending: true }),
      ]);
      setSubmissions(subsRes.data || []);

      const ids = (aqRes.data || []).map(a => a.question_id);
      if (ids.length === 0) {
        setAssignedQuestions([]);
        return;
      }
      const { data: qs } = await supabase
        .from('wellness_questions')
        .select('*')
        .in('id', ids);
      const byId = Object.fromEntries((qs || []).map(q => [q.id, q]));
      const ordered = (aqRes.data || []).map(a => byId[a.question_id]).filter(Boolean);
      setAssignedQuestions(ordered);
    })();
  }, [selectedAthleteId]);

  const selectedAthlete = athletes.find(a => a.id === selectedAthleteId);

  // Summary stats — first numerical question, last submission date
  const stats = useMemo(() => {
    if (submissions.length === 0) return null;
    const latest = submissions[submissions.length - 1];
    const last28 = submissions.filter(s => {
      const d = new Date(s.submission_date);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 28);
      return d >= cutoff;
    });
    const quant = assignedQuestions.filter(q => q.question_type === 'scale' || q.question_type === 'numerical');
    const avgFor = (q) => {
      const vals = last28.map(s => Number(s.responses?.[q.id])).filter(v => !isNaN(v));
      if (vals.length === 0) return '-';
      const u = q.numerical_unit ? ` ${q.numerical_unit}` : '';
      return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) + u;
    };
    return {
      lastDate: formatDate(latest.submission_date),
      cards: quant.slice(0, 3).map(q => ({
        label: `Avg ${q.question_text.length > 16 ? q.question_text.slice(0, 16) + '…' : q.question_text} (28d)`,
        value: avgFor(q),
      })),
    };
  }, [submissions, assignedQuestions]);

  const displaySubs = [...submissions].sort(
    (a, b) => new Date(b.submission_date) - new Date(a.submission_date),
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 animate-spin"
          style={{ borderColor: 'rgba(165,141,105,0.25)', borderTopColor: '#A58D69' }} />
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
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Athlete</label>
            <select value={selectedAthleteId}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
              className="w-full max-w-xs rounded-lg px-3 py-2 text-sm border border-gray-200 bg-white text-gray-700 outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#A58D69' }}>
              {activeAthletes.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {selectedAthlete && assignedQuestions.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-gray-400">No survey questions assigned for this athlete.</p>
              <p className="text-sm text-gray-400 mt-1">Configure questions from the athlete's Wellness tab.</p>
            </div>
          )}

          {selectedAthlete && assignedQuestions.length > 0 && submissions.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-gray-400">No submissions yet for this athlete.</p>
            </div>
          )}

          {selectedAthlete && submissions.length > 0 && (
            <>
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Last submission" value={stats.lastDate} />
                  {stats.cards.map((c, i) => (
                    <StatCard key={i} label={c.label} value={c.value} />
                  ))}
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Submission Log</h3>
                <div className="rounded-xl overflow-hidden overflow-x-auto" style={{ border: '1px solid #e5e7eb' }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                        {assignedQuestions.map(q => (
                          <th key={q.id} className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">
                            {q.question_text.length > 18 ? q.question_text.slice(0, 18) + '…' : q.question_text}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {displaySubs.map(sub => {
                        const flagged = isAnyResponseFlagged(sub, assignedQuestions);
                        return (
                          <tr key={sub.id} className="border-t border-gray-100"
                            style={flagged ? { backgroundColor: '#fef2f2' } : {}}>
                            <td className="px-3 py-2 font-medium text-gray-700">{formatDate(sub.submission_date)}</td>
                            {assignedQuestions.map(q => (
                              <td key={q.id} className="px-3 py-2">
                                <CellValue q={q} value={sub.responses?.[q.id]} />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Trends</h3>
                {assignedQuestions
                  .filter(q => q.question_type === 'scale' || q.question_type === 'numerical')
                  .map(q => (
                    <WellnessChart key={q.id} submissions={submissions} question={q} />
                  ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
