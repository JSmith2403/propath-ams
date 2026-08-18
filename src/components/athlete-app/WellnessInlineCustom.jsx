import { useEffect, useState, useCallback } from 'react';
import { HeartPulse, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import WellnessQuestionField, { countAnswered } from './WellnessQuestionField';

function todayLocal() { return new Date().toLocaleDateString('en-CA'); }

/**
 * Athlete-side daily wellness card on the Training/Today screen.
 * Light theme — matches the AMS visual language.
 */
export default function WellnessInlineCustom({ athleteId, dateISO, wellnessToken }) {
  const [questions, setQuestions] = useState([]);
  const [existing, setExisting]   = useState(null);
  const [responses, setResponses] = useState({});
  const [open, setOpen]           = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState(null);
  const [loading, setLoading]     = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [{ data: selections }, { data: ex }] = await Promise.all([
      supabase.from('athlete_wellness_questions')
        .select('question_id, wellness_question_library(*)')
        .eq('athlete_id', athleteId),
      supabase.from('wellness_responses')
        .select('*')
        .eq('athlete_id', athleteId)
        .eq('submission_date', dateISO)
        .maybeSingle(),
    ]);

    const qs = (selections || [])
      .map(r => r.wellness_question_library)
      .filter(Boolean)
      .filter(q => q.is_active)
      .sort((a, b) => a.display_order - b.display_order);

    setQuestions(qs);
    setExisting(ex || null);
    setResponses(ex?.responses || {});
    setOpen(false);
    setLoading(false);
  }, [athleteId, dateISO]);

  useEffect(() => { refresh(); }, [refresh]);

  const setVal = (qid, v) => setResponses(prev => ({ ...prev, [qid]: v }));

  const submit = async () => {
    if (!wellnessToken) return;
    setSubmitting(true); setError(null);
    const payload = {
      athlete_id: athleteId,
      token: wellnessToken,
      submission_date: dateISO,
      responses,
    };
    const result = existing
      ? await supabase.from('wellness_responses').update(payload).eq('id', existing.id)
      : await supabase.from('wellness_responses').insert(payload);
    if (result.error) {
      setError(result.error.message); setSubmitting(false); return;
    }
    setSubmitting(false);
    await refresh();
  };

  if (loading) return null;
  if (questions.length === 0) return null;

  const today = todayLocal();
  const isFuture = dateISO > today;
  const isPast   = dateISO < today;

  if (isFuture) return null;

  if (isPast) {
    return existing ? (
      <PastIndicator
        tone="logged"
        text="Wellness logged"
        sub={`${countAnswered(existing.responses, questions)}/${questions.length} answered`}
      />
    ) : (
      <PastIndicator tone="missed" text="Not completed" />
    );
  }

  // ── Today, form open ────────────────────────────────────────────────────
  if (open) {
    return (
      <FormCard
        title={existing ? 'Adjust your responses' : 'Daily Wellness'}
        onClose={() => { setOpen(false); refresh(); }}
        onSubmit={submit}
        submitting={submitting}
        submitLabel={existing ? 'Update responses' : 'Submit'}
        error={error}
      >
        {questions.map(q => (
          <WellnessQuestionField
            key={q.id}
            question={q}
            value={responses[q.id]}
            onChange={(v) => setVal(q.id, v)}
          />
        ))}
      </FormCard>
    );
  }

  // ── Today, State B: completed ──────────────────────────────────────────
  if (existing) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl px-4 py-3 text-left active:scale-[0.99] transition-all bg-white border border-ink-100 hover:border-ink-200 shadow-card"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-green-50">
            <Check size={14} strokeWidth={3} className="text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-meta font-bold text-ink-800">Daily Wellness</p>
            <p className="text-meta text-ink-500">Thanks for checking in today.</p>
          </div>
          <span className="text-meta font-semibold underline underline-offset-2 text-gold-600">
            Adjust
          </span>
        </div>
      </button>
    );
  }

  // ── Today, State A: not yet completed ──────────────────────────────────
  return (
    <div className="rounded-xl p-4 bg-white border border-ink-100 shadow-card">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 bg-gold-50">
          <HeartPulse size={20} className="text-gold-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body font-bold text-ink-900">Daily Wellness</p>
          <p className="text-meta mt-0.5 text-ink-500">
            Quick check-in before you train. Takes 30 seconds.
          </p>
        </div>
      </div>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-md py-3 text-body font-bold transition-all active:scale-[0.99] flex items-center justify-center gap-2 bg-gold-500 text-white hover:bg-gold-600 shadow-xs"
      >
        Complete daily wellness
      </button>
    </div>
  );
}

// ─── Read-only indicator for past days ──────────────────────────────────────
function PastIndicator({ tone, text, sub }) {
  return (
    <div className="rounded-xl px-4 py-2.5 flex items-center gap-3 bg-white border border-ink-100">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
        tone === 'logged' ? 'bg-green-50' : 'bg-ink-100'
      }`}>
        {tone === 'logged'
          ? <Check size={12} strokeWidth={3} className="text-green-600" />
          : <X     size={12} strokeWidth={3} className="text-ink-400" />}
      </div>
      <p className="text-meta flex-1 text-ink-600">
        <span className={`font-semibold ${tone === 'logged' ? 'text-green-700' : 'text-ink-500'}`}>
          {text}
        </span>
        {sub ? <span className="text-ink-400"> · {sub}</span> : null}
      </p>
    </div>
  );
}

// ─── Form card shell (used for both first-fill and edit) ───────────────────
function FormCard({ title, onClose, onSubmit, submitting, submitLabel, error, children }) {
  return (
    <div className="rounded-xl p-4 bg-white border-2 border-gold-500 shadow-raised">
      <div className="flex items-center justify-between mb-3">
        <p className="text-body font-bold text-ink-900">{title}</p>
        <button onClick={onClose} aria-label="Close"
          className="w-8 h-8 rounded-md flex items-center justify-center text-ink-500 hover:text-ink-800 hover:bg-ink-100 transition-colors">
          <X size={16} />
        </button>
      </div>

      {children}

      {error && <p className="text-meta mb-2 text-red-600">{error}</p>}

      <button onClick={onSubmit} disabled={submitting}
        className="w-full rounded-md py-3 text-body font-bold transition-all bg-gold-500 text-white hover:bg-gold-600 disabled:opacity-50 shadow-xs">
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </div>
  );
}
