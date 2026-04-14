import { useState } from 'react';
import { useWellness } from '../../hooks/useWellness';
import { METRIC_KEYS } from '../../utils/wellnessFlags';
import WellnessChart from '../wellness/WellnessChart';
import WellnessSubmissionLog from '../wellness/WellnessSubmissionLog';

const METRIC_LABELS = {
  sleep_duration:  'Sleep Duration',
  sleep_quality:   'Sleep Quality',
  fatigue:         'Fatigue',
  muscle_soreness: 'Muscle Soreness',
  stress:          'Stress',
};

export default function WellnessTab({ athlete }) {
  const {
    tokenData, submissions, loading,
    activateWellness, deactivateWellness,
  } = useWellness(athlete.id);

  const [copied, setCopied] = useState(false);

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

  const isActive = tokenData?.is_active ?? false;
  const shareUrl = tokenData?.token
    ? `${window.location.origin}/wellness/${tokenData.token}`
    : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = async () => {
    if (isActive) {
      await deactivateWellness();
    } else {
      await activateWellness();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* ── Activation Panel ─────────────────────────────────────────────── */}
      <div className="rounded-xl p-5" style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Wellness Tracking</h3>

          {/* Toggle */}
          <button
            onClick={handleToggle}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            style={{ backgroundColor: isActive ? '#A58D69' : '#d1d5db' }}
          >
            <span
              className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
              style={{ transform: isActive ? 'translateX(22px)' : 'translateX(4px)' }}
            />
          </button>
        </div>

        {isActive ? (
          <div>
            <p className="text-xs text-gray-500 mb-3">
              Wellness tracking is active. Share the link below with this athlete.
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 rounded-lg px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-200 text-gray-600 outline-none"
              />
              <button
                onClick={handleCopy}
                className="rounded-lg px-3 py-2 text-xs font-semibold transition-colors"
                style={{ backgroundColor: '#A58D69', color: '#fff' }}
              >
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

      {/* ── Charts ───────────────────────────────────────────────────────── */}
      {isActive && submissions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Trends</h3>
          {METRIC_KEYS.map((key) => (
            <WellnessChart key={key} submissions={submissions} metric={key} />
          ))}
        </div>
      )}

      {/* ── Submission Log ───────────────────────────────────────────────── */}
      {isActive && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Submissions</h3>
          <WellnessSubmissionLog submissions={submissions} />
        </div>
      )}
    </div>
  );
}
