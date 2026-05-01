import { useMemo } from 'react';
import { useWellness } from '../../hooks/useWellness';
import { getRagColour } from '../../utils/wellnessRag';
import WellnessQuestionsBuilder from '../wellness/WellnessQuestionsBuilder';
import WellnessQuestionChart, { isChartable } from '../wellness/WellnessQuestionChart';

const COLOUR_MAP = { green: '#22c55e', amber: '#f59e0b', red: '#ef4444' };

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function shortQuestionLabel(label) {
  // Trim to first ~3 words for narrow column headers.
  return label.replace(/\?$/, '').split(/\s+/).slice(0, 3).join(' ');
}

function CellValue({ question, value }) {
  if (value == null || value === '') return <span className="text-gray-300">—</span>;
  const colour = getRagColour(value, question);
  const colourHex = colour ? COLOUR_MAP[colour] : '#374151';
  const display = String(value);
  return <span style={{ color: colourHex, fontWeight: 600 }}>{display}</span>;
}

/**
 * Per-athlete coach-facing wellness view.
 *
 * Top: question library + per-athlete selection / featured stars
 *      (managed by WellnessQuestionsBuilder).
 * Bottom: every wellness submission this athlete has made, with one
 *         column per selected question, RAG-coloured.
 */
export default function WellnessTab({ athlete, role }) {
  const { questions, featuredIds, submissions, loading } = useWellness(athlete.id);

  const sortedSubs = useMemo(
    () => [...submissions].sort((a, b) => b.submission_date.localeCompare(a.submission_date)),
    [submissions]
  );

  // Featured questions go first in the charts strip; everything else
  // chartable below it. Order matches the library display_order.
  const { featuredCharts, otherCharts } = useMemo(() => {
    const f = [], o = [];
    for (const q of questions) {
      if (!isChartable(q)) continue;
      (featuredIds.has(q.id) ? f : o).push(q);
    }
    return { featuredCharts: f, otherCharts: o };
  }, [questions, featuredIds]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div
          className="w-8 h-8 rounded-full border-4 animate-spin"
          style={{ borderColor: 'rgba(165,141,105,0.25)', borderTopColor: '#A58D69' }}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <WellnessQuestionsBuilder athleteId={athlete.id} role={role} />

      {/* Submission log — dynamic columns based on selected questions */}
      {sortedSubs.length === 0 ? (
        <div className="rounded-xl p-8 text-center bg-white border border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-1">No wellness submissions yet</p>
          <p className="text-xs text-gray-400">
            Submissions from the athlete app will appear here automatically.
          </p>
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-xl p-8 text-center bg-white border border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-1">No questions selected</p>
          <p className="text-xs text-gray-400">
            Tick questions above to send to this athlete. Past submissions are stored but cannot be displayed without an active question.
          </p>
        </div>
      ) : (
        <>
          {/* Trends — featured questions first */}
          {(featuredCharts.length + otherCharts.length) > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Trends &amp; Rolling Averages
              </h3>
              {featuredCharts.map(q => (
                <WellnessQuestionChart key={q.id} question={q} submissions={sortedSubs} />
              ))}
              {otherCharts.length > 0 && (
                <details className="mb-2">
                  <summary className="text-xs font-semibold text-gray-500 cursor-pointer py-2 hover:text-gray-700">
                    Show {otherCharts.length} more chart{otherCharts.length === 1 ? '' : 's'}
                  </summary>
                  <div className="mt-2">
                    {otherCharts.map(q => (
                      <WellnessQuestionChart key={q.id} question={q} submissions={sortedSubs} />
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Submissions ({sortedSubs.length})
          </h3>
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
                        {shortQuestionLabel(q.label)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedSubs.map(sub => (
                    <tr key={sub.id} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-medium text-gray-700 sticky left-0 bg-white">
                        {formatDate(sub.submission_date)}
                      </td>
                      {questions.map(q => (
                        <td key={q.id} className="px-3 py-2">
                          <CellValue question={q} value={sub.responses?.[q.id]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
