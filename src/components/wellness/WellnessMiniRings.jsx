import WellnessDonutRing from './WellnessDonutRing';
import { getQuestionColour } from '../../utils/wellnessFlags';

/**
 * Props:
 *   submission — latest submission row with .responses jsonb
 *   date — latest submission date
 *   questions — ordered array of wellness_question rows that have show_on_roster = true
 */
export default function WellnessMiniRings({ submission, date, questions }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div>
      {date && (
        <p className="text-center mb-1.5" style={{ fontSize: 9, color: '#9ca3af' }}>
          {new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </p>
      )}
      <div className="flex items-start justify-between">
        {questions.map((q) => {
          const raw = submission?.responses?.[q.id];
          const val = raw == null || raw === '' ? 0 : Number(raw);
          const max = q.question_type === 'numerical'
            ? (Number.isFinite(Number(q.numerical_max)) ? Number(q.numerical_max) : 10)
            : (Number.isFinite(Number(q.scale_max)) ? Number(q.scale_max) : 7);
          const colour = getQuestionColour(q, val);
          const label = q.question_text.length > 8
            ? q.question_text.split(' ').slice(0, 2).join(' ')
            : q.question_text;
          return (
            <WellnessDonutRing
              key={q.id}
              value={val}
              max={max}
              colour={colour}
              label={label}
              size={36}
            />
          );
        })}
      </div>
    </div>
  );
}
