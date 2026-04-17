import { useState, useMemo } from 'react';
import { useWellness } from '../../hooks/useWellness';
import { useWellnessQuestions } from '../../hooks/useWellnessQuestions';
import { useAthleteSurvey } from '../../hooks/useAthleteSurvey';
import SurveyAssignment from '../wellness/SurveyAssignment';
import WellnessChart from '../wellness/WellnessChart';
import WellnessSubmissionLog from '../wellness/WellnessSubmissionLog';

export default function WellnessTab({ athlete }) {
  const { tokenData, submissions, loading: wLoading, activateWellness, deactivateWellness } = useWellness(athlete.id);
  const { questions, loading: qLoading } = useWellnessQuestions();
  const { assignments, saveAssignments } = useAthleteSurvey(athlete.id);

  const [copied, setCopied] = useState(false);

  // Assigned questions for this athlete, ordered
  const assignedQuestions = useMemo(() => {
    return assignments
      .slice()
      .sort((a, b) => a.display_order - b.display_order)
      .map(a => questions.find(q => q.id === a.question_id))
      .filter(Boolean);
  }, [assignments, questions]);

  // Quantitative questions (those we can chart)
  const quantQuestions = useMemo(
    () => assignedQuestions.filter(q => q.question_type === 'scale' || q.question_type === 'numerical'),
    [assignedQuestions]
  );

  if (wLoading || qLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 rounded-full border-4 animate-spin"
          style={{ borderColor: 'rgba(165,141,105,0.25)', borderTopColor: '#A58D69' }} />
      </div>
    );
  }

  const isActive = tokenData?.is_active ?? false;
  const shareUrl = tokenData?.token ? `${window.location.origin}/wellness/${tokenData.token}` : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = async () => {
    if (isActive) await deactivateWellness();
    else await activateWellness();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Activation panel */}
      <div className="rounded-xl p-5 bg-white" style={{ border: '1px solid #e5e7eb' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Wellness Tracking</h3>
          <button onClick={handleToggle}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            style={{ backgroundColor: isActive ? '#A58D69' : '#d1d5db' }}>
            <span className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
              style={{ transform: isActive ? 'translateX(22px)' : 'translateX(4px)' }} />
          </button>
        </div>

        {isActive ? (
          <div>
            <p className="text-xs text-gray-500 mb-3">Wellness tracking is active. Share the link below with this athlete.</p>
            <div className="flex items-center gap-2">
              <input readOnly value={shareUrl}
                className="flex-1 rounded-lg px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-200 text-gray-600 outline-none" />
              <button onClick={handleCopy}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-white"
                style={{ backgroundColor: '#A58D69' }}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400">
            {tokenData
              ? 'Wellness tracking is deactivated. Toggle on to reactivate the link.'
              : 'Toggle on to generate a shareable wellness form link for this athlete.'}
          </p>
        )}
      </div>

      {/* Survey assignment */}
      {isActive && (
        <SurveyAssignment
          questions={questions}
          initialAssignments={assignments}
          onSave={saveAssignments}
        />
      )}

      {/* Charts */}
      {isActive && submissions.length > 0 && quantQuestions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Trends</h3>
          {quantQuestions.map(q => (
            <WellnessChart key={q.id} submissions={submissions} question={q} />
          ))}
        </div>
      )}

      {/* Submission log */}
      {isActive && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Submissions</h3>
          <WellnessSubmissionLog submissions={submissions} questions={assignedQuestions} />
        </div>
      )}
    </div>
  );
}
