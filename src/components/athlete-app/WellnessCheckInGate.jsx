import { useEffect, useState } from 'react';
import { Lock, HeartPulse } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import WellnessQuestionField, { countAnswered } from './WellnessQuestionField';

function todayLocal() { return new Date().toLocaleDateString('en-CA'); }

/**
 * Full-screen, non-dismissable daily wellness check-in. Sits above the
 * athlete app shell and blocks it entirely until today's check-in is
 * submitted. Only engages when the athlete has wellness monitoring
 * turned on (wellnessToken present) AND has at least one active
 * coach-selected question AND hasn't already submitted today.
 *
 * All questions render on one scrollable page (rather than one-per-
 * screen with swipe/arrows) so it's quick to scan and submit.
 *
 * Renders `children` once the gate is clear (or never applied).
 */
export default function WellnessCheckInGate({ athleteId, wellnessToken, children }) {
  const [state, setState] = useState('checking'); // checking | blocked | clear
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!wellnessToken) { setState('clear'); return; }
      const today = todayLocal();
      const [{ data: selections }, { data: existing }] = await Promise.all([
        supabase.from('athlete_wellness_questions')
          .select('question_id, wellness_question_library(*)')
          .eq('athlete_id', athleteId),
        supabase.from('wellness_responses')
          .select('id')
          .eq('athlete_id', athleteId)
          .eq('submission_date', today)
          .maybeSingle(),
      ]);
      if (cancelled) return;

      const qs = (selections || [])
        .map(r => r.wellness_question_library)
        .filter(Boolean)
        .filter(q => q.is_active)
        .sort((a, b) => a.display_order - b.display_order);

      if (existing || qs.length === 0) {
        setState('clear');
      } else {
        setQuestions(qs);
        setState('blocked');
      }
    })();
    return () => { cancelled = true; };
  }, [athleteId, wellnessToken]);

  const setVal = (qid, v) => setResponses(prev => ({ ...prev, [qid]: v }));

  const allAnswered = questions.length > 0 && countAnswered(responses, questions) === questions.length;

  const submit = async () => {
    if (!wellnessToken || !allAnswered) return;
    setSubmitting(true);
    setError(null);
    const { error: err } = await supabase.from('wellness_responses').insert({
      athlete_id: athleteId,
      token: wellnessToken,
      submission_date: todayLocal(),
      responses,
    });
    if (err) {
      setError(err.message);
      setSubmitting(false);
      return;
    }
    setState('clear');
  };

  if (state === 'checking') return null;
  if (state === 'clear') return children;

  // ── Blocked: full-screen check-in ─────────────────────────────────────────
  // Matches the app shell's phone-preview treatment: edge-to-edge on real
  // phones, a centered 480px column on wider screens.
  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-ink-100">
    <div className="w-full flex flex-col bg-ink-50 shadow-card" style={{ maxWidth: 480 }}>
      {/* Header */}
      <div className="px-6 pt-10 pb-4 text-center shrink-0">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-gold-50">
          <HeartPulse size={24} className="text-gold-600" />
        </div>
        <h1 className="text-h2 font-bold text-ink-900">Let's start with you.</h1>
        <p className="text-meta mt-2 leading-relaxed text-ink-500">
          Your daily wellness check helps us tailor your plan and keep you performing at your best.
        </p>
      </div>

      {/* Every question, stacked on one scrollable page */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 space-y-3 pb-2">
        {questions.map(q => (
          <div key={q.id} className="rounded-xl p-5 bg-white border border-ink-100 shadow-card">
            <WellnessQuestionField
              question={q}
              value={responses[q.id]}
              onChange={(v) => setVal(q.id, v)}
            />
          </div>
        ))}
      </div>

      {/* Footer — submit */}
      <div className="px-6 pt-3 pb-8 shrink-0 space-y-3">
        {error && <p className="text-meta text-center text-red-600">{error}</p>}
        <button
          onClick={submit}
          disabled={!allAnswered || submitting}
          className="w-full rounded-md py-3.5 text-body font-bold transition-all active:scale-[0.99] bg-gold-500 text-white hover:bg-gold-600 disabled:opacity-40 disabled:active:scale-100 shadow-xs"
        >
          {submitting ? 'Submitting…' : 'Complete check-in'}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-micro text-ink-400">
          <Lock size={11} />
          Dashboard unlocks after check-in
        </p>
      </div>
    </div>
    </div>
  );
}
