import { computeRollingStats, getMetricFlag, isAnyFlagged } from '../../utils/wellnessFlags';

const COLS = [
  { key: 'submission_date', label: 'Date' },
  { key: 'sleep_duration',  label: 'Sleep Hrs' },
  { key: 'sleep_quality',   label: 'Sleep Qual' },
  { key: 'fatigue',         label: 'Fatigue' },
  { key: 'muscle_soreness', label: 'Soreness' },
  { key: 'stress',          label: 'Stress' },
];

const FLAG_COLOURS = { tier1: '#fecaca', tier2: '#fef3c7' };
const CELL_FLAG    = { tier1: '#ef4444', tier2: '#f59e0b' };

export default function WellnessSubmissionLog({ submissions }) {
  if (!submissions || submissions.length === 0) {
    return (
      <div className="rounded-xl p-6 text-center" style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}>
        <p className="text-xs text-gray-400 italic">No submissions yet.</p>
      </div>
    );
  }

  // Sort oldest-first for stats, then reverse for display
  const sorted = [...submissions].sort(
    (a, b) => new Date(a.submission_date) - new Date(b.submission_date),
  );
  const rollingStats = computeRollingStats(sorted);
  const display = [...sorted].reverse();

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
      <table className="w-full text-xs">
        <thead>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            {COLS.map((c) => (
              <th key={c.key} className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {display.map((sub) => {
            const flagged = isAnyFlagged(sub, rollingStats);
            const stats = rollingStats.get(sub.submission_date);

            return (
              <tr
                key={sub.id}
                style={flagged ? { backgroundColor: '#fef2f2' } : {}}
                className="border-t border-gray-100"
              >
                {COLS.map((c) => {
                  const val = sub[c.key];
                  let cellFlag = null;
                  if (c.key !== 'submission_date' && stats) {
                    const s = stats[c.key];
                    if (s) cellFlag = getMetricFlag(c.key, Number(val), s.mean, s.sd, s.n);
                  }

                  const formatted = c.key === 'submission_date'
                    ? new Date(val + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : val;

                  return (
                    <td
                      key={c.key}
                      className="px-3 py-2 font-medium"
                      style={{ color: cellFlag ? CELL_FLAG[cellFlag] : '#374151' }}
                    >
                      {formatted}
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
