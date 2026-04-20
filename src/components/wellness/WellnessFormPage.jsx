import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import logo from '../../assets/Propath_Primary Logo_White.png';
import WellnessSlider from './WellnessSlider';

function todayLocal() {
  return new Date().toLocaleDateString('en-CA');
}
function minDateLocal() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toLocaleDateString('en-CA');
}

// ── Question input components ────────────────────────────────────────────────
function ScaleQuestion({ question, value, onChange }) {
  const min = question.scale_min ?? 1;
  const max = question.scale_max ?? 7;
  return (
    <div className="mb-6">
      <WellnessSlider
        label={question.question_text}
        value={value ?? Math.round((min + max) / 2)}
        onChange={onChange}
        min={min}
        max={max}
        leftAnchor={question.scale_min_label || `${min}`}
        rightAnchor={question.scale_max_label || `${max}`}
      />
    </div>
  );
}

function NumericalQuestion({ question, value, onChange }) {
  const unit = question.numerical_unit || '';
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold mb-2" style={{ color: '#e5e5e5' }}>
        {question.question_text}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={question.numerical_min ?? undefined}
          max={question.numerical_max ?? undefined}
          step={question.numerical_step ?? 'any'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: '#333', color: '#e5e5e5', border: '1px solid #444' }}
        />
        {unit && <span className="text-xs" style={{ color: '#888' }}>{unit}</span>}
      </div>
      {question.numerical_min != null && question.numerical_max != null && (
        <div className="flex justify-between mt-1">
          <span className="text-xs" style={{ color: '#888' }}>{question.numerical_min}{unit ? ` ${unit}` : ''}</span>
          <span className="text-xs" style={{ color: '#888' }}>{question.numerical_max}{unit ? ` ${unit}` : ''}</span>
        </div>
      )}
    </div>
  );
}

function TextQuestion({ question, value, onChange }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold mb-2" style={{ color: '#e5e5e5' }}>
        {question.question_text}
      </label>
      <textarea
        rows={3}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
        style={{ backgroundColor: '#333', color: '#e5e5e5', border: '1px solid #444' }}
      />
    </div>
  );
}

function YesNoQuestion({ question, value, onChange }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold mb-2" style={{ color: '#e5e5e5' }}>
        {question.question_text}
      </label>
      <div className="flex gap-3">
        {['yes', 'no'].map(opt => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className="flex-1 py-3 rounded-lg text-sm font-semibold transition-colors"
              style={{
                backgroundColor: active ? '#A58D69' : '#333',
                color: active ? '#1C1C1C' : '#e5e5e5',
                border: active ? 'none' : '1px solid #444',
              }}
            >
              {opt === 'yes' ? 'Yes' : 'No'}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Paired yes/no + numerical (conditional) ────────────────────────────────
// Renders the Yes/No parent and its numerical child as a single block.
// The numerical input is disabled unless the parent's value matches the
// conditional_on_value (typically 'yes').
function PairedConditional({ parent, child, parentValue, childValue, onParentChange, onChildChange }) {
  const unlocked = parentValue === (child.conditional_on_value || 'yes');
  const unit = child.numerical_unit || '';
  return (
    <div className="mb-6 rounded-lg p-4" style={{ backgroundColor: '#262626', border: '1px solid #333' }}>
      <label className="block text-sm font-semibold mb-3" style={{ color: '#e5e5e5' }}>
        {parent.question_text}
      </label>
      <div className="grid grid-cols-2 gap-3">
        {/* LEFT — Yes/No buttons */}
        <div className="flex flex-col gap-2">
          {['yes', 'no'].map(opt => {
            const active = parentValue === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onParentChange(opt);
                  // When switching to 'no', clear the child value
                  if (opt !== (child.conditional_on_value || 'yes')) {
                    onChildChange(null);
                  }
                }}
                className="py-3 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: active ? '#A58D69' : '#333',
                  color: active ? '#1C1C1C' : '#e5e5e5',
                  border: active ? 'none' : '1px solid #444',
                }}
              >
                {opt === 'yes' ? 'Yes' : 'No'}
              </button>
            );
          })}
        </div>

        {/* RIGHT — Numerical input (disabled when parent not yes) */}
        <div>
          <p className="text-xs mb-2" style={{ color: unlocked ? '#e5e5e5' : '#666' }}>
            {child.question_text}
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={child.numerical_min ?? undefined}
              max={child.numerical_max ?? undefined}
              step={child.numerical_step ?? 'any'}
              value={childValue ?? ''}
              disabled={!unlocked}
              onChange={(e) => onChildChange(e.target.value === '' ? null : Number(e.target.value))}
              className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: unlocked ? '#333' : '#1f1f1f',
                color: unlocked ? '#e5e5e5' : '#555',
                border: `1px solid ${unlocked ? '#444' : '#2a2a2a'}`,
                cursor: unlocked ? 'text' : 'not-allowed',
              }}
            />
            {unit && <span className="text-xs" style={{ color: unlocked ? '#888' : '#444' }}>{unit}</span>}
          </div>
          {child.numerical_min != null && child.numerical_max != null && (
            <div className="flex justify-between mt-1">
              <span className="text-xs" style={{ color: unlocked ? '#888' : '#444' }}>
                {child.numerical_min}{unit ? ` ${unit}` : ''}
              </span>
              <span className="text-xs" style={{ color: unlocked ? '#888' : '#444' }}>
                {child.numerical_max}{unit ? ` ${unit}` : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderStandalone(question, value, onChange) {
  switch (question.question_type) {
    case 'scale':     return <ScaleQuestion key={question.id} question={question} value={value} onChange={onChange} />;
    case 'numerical': return <NumericalQuestion key={question.id} question={question} value={value} onChange={onChange} />;
    case 'text':      return <TextQuestion key={question.id} question={question} value={value} onChange={onChange} />;
    case 'yes_no':    return <YesNoQuestion key={question.id} question={question} value={value} onChange={onChange} />;
    default: return null;
  }
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function WellnessFormPage() {
  const { token } = useParams();

  const [status, setStatus] = useState('loading');
  const [athleteName, setAthleteName] = useState('');
  const [athleteId, setAthleteId] = useState('');
  const [questions, setQuestions] = useState([]); // ordered, assigned to this athlete
  const [date, setDate] = useState(todayLocal());
  const [responses, setResponses] = useState({}); // { [question_id]: value }
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Validate token, load athlete, load assigned questions
  useEffect(() => {
    (async () => {
      const { data: tokenRow } = await supabase
        .from('wellness_tokens')
        .select('athlete_id, is_active')
        .eq('token', token)
        .maybeSingle();

      if (!tokenRow || !tokenRow.is_active) {
        setStatus('invalid');
        return;
      }
      setAthleteId(tokenRow.athlete_id);

      // Load athlete name
      const { data: athleteRow } = await supabase
        .from('athletes')
        .select('data')
        .eq('id', tokenRow.athlete_id)
        .maybeSingle();
      setAthleteName(athleteRow?.data?.name || 'Athlete');

      // Load assigned questions (joined by fetching both then matching)
      const { data: assignments } = await supabase
        .from('wellness_athlete_questions')
        .select('question_id, display_order')
        .eq('athlete_id', tokenRow.athlete_id)
        .order('display_order', { ascending: true });

      const ids = (assignments || []).map(a => a.question_id);
      if (ids.length === 0) {
        setQuestions([]);
        setStatus('no_questions');
        return;
      }

      const { data: qs } = await supabase
        .from('wellness_questions')
        .select('*')
        .in('id', ids)
        .eq('is_active', true);

      // Order by the assignment's display_order
      const byId = Object.fromEntries((qs || []).map(q => [q.id, q]));
      const ordered = (assignments || [])
        .map(a => byId[a.question_id])
        .filter(Boolean);

      setQuestions(ordered);
      setStatus('ready');
    })();
  }, [token]);

  // Build a map of parent question_id → child question (for paired conditional rendering)
  const childMap = useMemo(() => {
    const m = {};
    questions.forEach(q => {
      if (q.conditional_on_question_id) m[q.conditional_on_question_id] = q;
    });
    return m;
  }, [questions]);

  // Check for existing submission when date changes
  const checkExisting = useCallback(async () => {
    if (!athleteId || !date) return;
    const { data } = await supabase
      .from('wellness_submissions')
      .select('*')
      .eq('athlete_id', athleteId)
      .eq('submission_date', date)
      .maybeSingle();

    if (data) {
      setEditingId(data.id);
      setResponses(data.responses || {});
    } else {
      setEditingId(null);
      setResponses({});
    }
  }, [athleteId, date]);

  useEffect(() => {
    if (status === 'ready') checkExisting();
  }, [status, date, checkExisting]);

  const setResp = (qid) => (val) => setResponses(prev => ({ ...prev, [qid]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation: every question must have a value, except a child question
    // whose parent has not been answered "yes" (or matching conditional value)
    const unanswered = questions.filter(q => {
      // Skip a child question when its parent's answer doesn't unlock it
      if (q.conditional_on_question_id) {
        const parentAns = responses[q.conditional_on_question_id];
        const expected = q.conditional_on_value || 'yes';
        if (parentAns !== expected) return false; // locked → not required
      }
      const v = responses[q.id];
      return v == null || v === '';
    });
    if (unanswered.length > 0) {
      setError(`Please answer all ${unanswered.length} remaining question${unanswered.length > 1 ? 's' : ''}.`);
      return;
    }

    setSubmitting(true);
    const payload = {
      athlete_id: athleteId,
      token,
      submission_date: date,
      responses,
    };

    const result = editingId
      ? await supabase.from('wellness_submissions').update(payload).eq('id', editingId)
      : await supabase.from('wellness_submissions').insert(payload);

    if (result.error) {
      setError(result.error.message);
      setSubmitting(false);
      return;
    }

    setStatus('submitted');
    setSubmitting(false);
  };

  // ── Render ──────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1C1C1C' }}>
        <div className="w-8 h-8 rounded-full border-4 animate-spin"
          style={{ borderColor: 'rgba(165,141,105,0.25)', borderTopColor: '#A58D69' }} />
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#1C1C1C' }}>
        <img src={logo} alt="ProPath" style={{ width: '160px' }} className="mb-8" />
        <p className="text-center text-sm" style={{ color: '#999' }}>
          This wellness link is not active. Please contact your coach.
        </p>
      </div>
    );
  }

  if (status === 'no_questions') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#1C1C1C' }}>
        <img src={logo} alt="ProPath" style={{ width: '160px' }} className="mb-8" />
        <p className="text-center text-sm" style={{ color: '#999' }}>
          No survey questions assigned yet. Please contact your coach.
        </p>
      </div>
    );
  }

  if (status === 'submitted') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#1C1C1C' }}>
        <img src={logo} alt="ProPath" style={{ width: '160px' }} className="mb-8" />
        <div className="rounded-xl p-6 max-w-md w-full text-center" style={{ backgroundColor: '#262626' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(165,141,105,0.15)' }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" stroke="#A58D69" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#e5e5e5' }}>Questionnaire complete</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#999' }}>
            Please remember to alert your coach to anything you think they should be aware of. This does not remove the need to inform them directly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1C1C1C' }}>
      <div className="flex flex-col items-center pt-8 pb-4 px-4">
        <img src={logo} alt="ProPath" style={{ width: '140px' }} className="mb-6" />
        <h1 className="text-lg font-semibold" style={{ color: '#A58D69' }}>{athleteName}</h1>
        <p className="text-xs mt-1" style={{ color: '#666' }}>Daily Wellness Check-in</p>
      </div>

      <form onSubmit={handleSubmit}
        className="max-w-md mx-auto rounded-xl p-6 mb-8 mx-4 sm:mx-auto"
        style={{ backgroundColor: '#262626' }}>
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2" style={{ color: '#e5e5e5' }}>Date</label>
          <input type="date" value={date} min={minDateLocal()} max={todayLocal()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: '#333', color: '#e5e5e5', border: '1px solid #444' }} />
          {editingId && (
            <p className="text-xs mt-2 px-1" style={{ color: '#A58D69' }}>
              You have already submitted for this date. Your previous answers are shown below and can be updated.
            </p>
          )}
        </div>

        {questions.map(q => {
          // Child questions are rendered inline with their parent — skip here
          if (q.conditional_on_question_id) return null;

          // Yes/No parent with a linked child → render paired conditional block
          const child = childMap[q.id];
          if (q.question_type === 'yes_no' && child) {
            return (
              <PairedConditional
                key={q.id}
                parent={q}
                child={child}
                parentValue={responses[q.id]}
                childValue={responses[child.id]}
                onParentChange={setResp(q.id)}
                onChildChange={setResp(child.id)}
              />
            );
          }

          return renderStandalone(q, responses[q.id], setResp(q.id));
        })}

        {error && <p className="text-xs mb-4 px-1" style={{ color: '#ef4444' }}>{error}</p>}

        <button type="submit" disabled={submitting}
          className="w-full rounded-lg py-3 text-sm font-semibold"
          style={{
            backgroundColor: '#A58D69', color: '#1C1C1C',
            opacity: submitting ? 0.5 : 1, cursor: submitting ? 'not-allowed' : 'pointer',
          }}>
          {submitting ? 'Submitting...' : editingId ? 'Update' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
