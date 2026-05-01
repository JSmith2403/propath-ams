import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Save, X, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getRagColour, validateThresholds, defaultThresholds } from '../../utils/wellnessRag';

const GOLD = '#A58D69';
const COLOUR = { green: '#22c55e', amber: '#f59e0b', red: '#ef4444' };

// Spec-style response_type label, derived from question_type + direction.
function responseTypeLabel(question) {
  const { question_type: t, direction, label } = question;
  if (t === 'slider' || t === 'slider_1_7') {
    return direction === 'higher_better' ? 'Scale 1–7, higher is better' : 'Scale 1–7, lower is better';
  }
  if (t === 'yes_no') {
    return direction === 'yes_better' ? 'Yes / No, yes is better' : 'Yes / No, no is better';
  }
  if (t === 'number' && label === 'How many hours did you sleep last night?') {
    return 'Hours of sleep';
  }
  if (t === 'number') {
    return direction === 'higher_better' ? 'Number, higher is better' : 'Number, lower is better';
  }
  if (t === 'text') return 'Free text';
  if (t === 'multi_choice') return 'Multi-choice';
  return t;
}

const DIRECTION_LABELS = {
  higher_better: 'Higher is better (e.g. fresh, ready, fuelled)',
  lower_better:  'Lower is better (e.g. stress, soreness, fatigue)',
  no_better:     'No is better (e.g. "any pain?")',
  yes_better:    'Yes is better (e.g. "did you sleep well?")',
  none:          'No direction',
};

// ─── Live preview row of coloured pips ─────────────────────────────────────
function Preview({ question, draft }) {
  const { question_type: type, config = {} } = question;
  const min = (type === 'slider' || type === 'slider_1_7') ? 1 : (config.min ?? 1);
  const max = (type === 'slider' || type === 'slider_1_7') ? 7 : (config.max ?? 7);

  if (type === 'yes_no') {
    return (
      <div className="flex gap-2 mt-2">
        {['yes','no'].map(v => {
          const c = getRagColour(v, { ...question, rag_thresholds: draft });
          return (
            <span key={v}
              className="px-3 py-1 text-xs font-bold uppercase rounded"
              style={{
                backgroundColor: c ? COLOUR[c] : '#e5e7eb',
                color: c ? '#fff' : '#9ca3af',
              }}>
              {v}
            </span>
          );
        })}
      </div>
    );
  }

  // numeric range — draw each value as a coloured pip
  const values = [];
  for (let v = min; v <= max; v++) values.push(v);
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {values.map(v => {
        const c = getRagColour(v, { ...question, rag_thresholds: draft });
        return (
          <span key={v}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              backgroundColor: c ? COLOUR[c] : '#e5e7eb',
              color: c ? '#fff' : '#9ca3af',
            }}>
            {v}
          </span>
        );
      })}
    </div>
  );
}

// ─── Numeric boundary input with clamping ──────────────────────────────────
function BoundaryInput({ label, value, min, max, onChange, helpText }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </label>
      <input
        type="number"
        min={min} max={max} step={1}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-1"
        style={{ '--tw-ring-color': GOLD }}
      />
      {helpText && <p className="text-[10px] text-gray-400 mt-1">{helpText}</p>}
    </div>
  );
}

// ─── Main editor (inline, expandable, lives inside the library row) ────────
export default function QuestionThresholdEditor({ question, onClose, onSaved }) {
  const [direction, setDirection] = useState(question.direction || 'lower_better');
  const [draft, setDraft]         = useState(() => question.rag_thresholds || {});
  const [error, setError]         = useState(null);
  const [saving, setSaving]       = useState(false);

  // Derive numeric range
  const { min, max, isRated, isYesNo, isFreeText, isMulti, isHoursSleep } = useMemo(() => {
    const c = question.config || {};
    const t = question.question_type;
    const rated = (t === 'slider' || t === 'slider_1_7' || t === 'number');
    return {
      min: (t === 'slider' || t === 'slider_1_7') ? 1 : (c.min ?? 1),
      max: (t === 'slider' || t === 'slider_1_7') ? 7 : (c.max ?? 7),
      isRated: rated,
      isYesNo: t === 'yes_no',
      isFreeText: t === 'text',
      isMulti: t === 'multi_choice',
      isHoursSleep: t === 'number' && question.label === 'How many hours did you sleep last night?',
    };
  }, [question]);

  // When direction flips on a slider, regenerate sensible defaults so
  // the preview doesn't go all-red until coach types something.
  useEffect(() => {
    if (!isRated) return;
    if (Object.keys(draft).length === 0) {
      setDraft(defaultThresholds({ ...question, direction }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction]);

  const handleReset = () => {
    setDraft(defaultThresholds({ ...question, direction }));
    setError(null);
  };

  const handleClear = () => {
    setDraft({});
    setError(null);
  };

  // Continuous validation — drives both the inline warning and
  // whether the Save button is enabled.
  const validation = useMemo(() => {
    if (!isRated) return { ok: true };
    const hasAny = draft.green_boundary != null || draft.amber_boundary != null;
    if (!hasAny) return { ok: true }; // empty thresholds are allowed (e.g. pain numerics by default)
    return validateThresholds(draft, { direction, min, max });
  }, [draft, direction, min, max, isRated]);

  const handleSave = async () => {
    setError(null);
    if (!validation.ok) { setError(validation.error); return; }

    setSaving(true);
    const { error: err } = await supabase
      .from('wellness_question_library')
      .update({ direction, rag_thresholds: draft })
      .eq('id', question.id);
    setSaving(false);

    if (err) { setError('Save failed: ' + err.message); return; }
    onSaved?.({ ...question, direction, rag_thresholds: draft });
    onClose?.();
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mt-2 space-y-3"
      onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{question.label}</p>
          <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 mt-0.5">
            {responseTypeLabel({ ...question, direction })}
          </p>
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
          <X size={14} />
        </button>
      </div>

      {/* Scope note */}
      <div className="flex items-start gap-1.5 text-[11px] text-gray-500 bg-white border border-gray-200 rounded px-2.5 py-1.5">
        <Info size={11} className="mt-0.5 shrink-0" style={{ color: GOLD }} />
        <span>Affects all athletes with this question selected.</span>
      </div>

      {/* Direction (sliders + numbers + yes_no) */}
      {(isRated || isYesNo) && (
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Direction
          </label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-white"
          >
            {(isYesNo
              ? ['no_better', 'yes_better']
              : ['lower_better', 'higher_better']
            ).map(d => (
              <option key={d} value={d}>{DIRECTION_LABELS[d]}</option>
            ))}
          </select>
        </div>
      )}

      {/* Threshold inputs (rated numeric only) */}
      {isRated && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <BoundaryInput
              label="Green boundary"
              value={draft.green_boundary}
              min={min} max={max}
              onChange={(v) => setDraft(d => ({ ...d, green_boundary: v }))}
              helpText={direction === 'higher_better'
                ? `≥ this value is green`
                : `≤ this value is green`}
            />
            <BoundaryInput
              label="Amber boundary"
              value={draft.amber_boundary}
              min={min} max={max}
              onChange={(v) => setDraft(d => ({ ...d, amber_boundary: v }))}
              helpText={direction === 'higher_better'
                ? `≥ this value is amber`
                : `≤ this value is amber`}
            />
          </div>

          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Live preview
            </p>
            <Preview question={{ ...question, direction }} draft={draft} />
          </div>
        </>
      )}

      {isYesNo && (
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Live preview
          </p>
          <Preview question={{ ...question, direction }} draft={draft} />
        </div>
      )}

      {(isFreeText || isMulti) && (
        <p className="text-xs text-gray-400">
          No RAG thresholds for {isFreeText ? 'free-text' : 'multi-choice'} questions.
        </p>
      )}

      {/* Inline validation warning (real-time, not waiting for Save) */}
      {!validation.ok && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1.5">
          {validation.error}
        </p>
      )}
      {error && validation.ok && <p className="text-xs text-red-600">{error}</p>}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="flex gap-1">
          {isRated && (
            <button onClick={handleReset}
              className="text-[11px] font-semibold text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 px-2 py-1">
              <RotateCcw size={11} /> Reset to default
            </button>
          )}
          {isRated && Object.keys(draft).length > 0 && (
            <button onClick={handleClear}
              className="text-[11px] font-semibold text-gray-400 hover:text-red-600 px-2 py-1">
              Clear thresholds
            </button>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={onClose}
            className="text-[11px] font-semibold text-gray-500 px-3 py-1.5 rounded">
            Close
          </button>
          <button onClick={handleSave} disabled={saving || !validation.ok}
            className="text-[11px] font-semibold text-white px-3 py-1.5 rounded inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: GOLD }}
            title={!validation.ok ? validation.error : ''}>
            <Save size={11} /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
