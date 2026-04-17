import { getQuestionColour, isAnyResponseFlagged } from '../../utils/wellnessFlags';

const CELL_FLAG = { red: '#ef4444', amber: '#f59e0b', green: '#374151' };

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatValue(q, v) {
  if (v == null || v === '') return '-';
  if (q.question_type === 'yes_no') return v === 'yes' ? 'Yes' : 'No';
  if (q.question_type === 'text') {
    const s = String(v);
    return s.length > 30 ? s.slice(0, 30) + '…' : s;
  }
  return v;
}

export default function WellnessSubmissionLog({ submissions, questions }) {
  if (!submissions || submissions.length === 0) {
    return (
      <div className="rounded-xl p-6 text-center bg-white" style={{ border: '1px solid #e5e7eb' }}>
        <p className="text-xs text-gray-400 italic">No submissions yet.</p>
      </div>
    );
  }
  if (!questions || questions.length === 0) {
    return (
      <div className="rounded-xl p-6 text-center bg-white" style={{ border: '1px solid #e5e7eb' }}>
        <p className="text-xs text-gray-400 italic">No questions assigned.</p>
      </div>
    );
  }

  // Newest first for display
  const display = [...submissions].sort(
    (a, b) => new Date(b.submission_date) - new Date(a.submission_date),
  );

  return (
    <div className="rounded-xl overflow-hidden overflow-x-auto" style={{ border: '1px solid #e5e7eb' }}>
      <table className="w-full text-xs">
        <thead>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">Date</th>
            {questions.map(q => (
              <th key={q.id} className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">
                {q.question_text.length > 18 ? q.question_text.slice(0, 18) + '…' : q.question_text}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {display.map(sub => {
            const flagged = isAnyResponseFlagged(sub, questions);
            return (
              <tr key={sub.id}
                style={flagged ? { backgroundColor: '#fef2f2' } : {}}
                className="border-t border-gray-100">
                <td className="px-3 py-2 font-medium text-gray-700">{formatDate(sub.submission_date)}</td>
                {questions.map(q => {
                  const v = sub.responses?.[q.id];
                  const colour = (q.question_type === 'scale' || q.question_type === 'numerical')
                    ? getQuestionColour(q, v)
                    : 'green';
                  return (
                    <td key={q.id} className="px-3 py-2 font-medium"
                      style={{ color: CELL_FLAG[colour] || '#374151' }}>
                      {formatValue(q, v)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
