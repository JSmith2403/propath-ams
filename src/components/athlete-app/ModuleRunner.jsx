import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock, Loader2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useModuleSessionTimer } from '../../hooks/useModuleSessionTimer';

const GOLD = '#A58D69';

/**
 * ModuleRunner — full-screen data-driven walker for one Mental Skills
 * module. Reads its steps from mf_module_steps and dispatches each one
 * to a small renderer keyed off step_type. The session-timer hook
 * handles time accumulation, the 60-second inactivity prompt, and the
 * 3-strike kill rule.
 *
 * Responses (assessment answers, free-text reflections, builder
 * content) persist to the corresponding mf_* tables as the athlete
 * moves through. Refreshing mid-module loses progress on screen but
 * partial responses + timer total are preserved on the server.
 */
export default function ModuleRunner({ athleteId, module, onExit }) {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [responses, setResponses] = useState({}); // per-step local state
  const [attemptId] = useState(() => crypto.randomUUID());
  const [finishSaving, setFinishSaving] = useState(false);

  const timer = useModuleSessionTimer({ athleteId, moduleId: module.id });

  // Bootstrap: fetch steps, start the timer.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('mf_module_steps')
        .select('*')
        .eq('module_id', module.id)
        .order('order_index', { ascending: true });
      if (cancelled) return;
      if (error) console.error('[ModuleRunner] steps fetch failed', error);
      setSteps(data || []);
      setLoading(false);
      timer.start();
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module.id]);

  const step = steps[stepIndex];
  const isLast = steps.length > 0 && stepIndex === steps.length - 1;

  // Persist last_step_index whenever we move forward.
  useEffect(() => {
    if (!steps.length || timer.killed || timer.finished) return;
    timer.updateLastStep(stepIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, steps.length]);

  // ── Container-level activity tracking ──
  const containerRef = useRef(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    const handler = () => timer.markActivity();
    events.forEach(e => el.addEventListener(e, handler, { passive: true }));
    return () => events.forEach(e => el.removeEventListener(e, handler));
  }, [timer.markActivity]);

  const setStepResponse = useCallback((value) => {
    setResponses(r => ({ ...r, [stepIndex]: value }));
    timer.markActivity();
  }, [stepIndex, timer]);

  const goNext = useCallback(async () => {
    timer.markActivity();
    if (!step) return;

    // Save side effects for steps that emit data.
    const value = responses[stepIndex];
    if (step.step_type === 'assessment' && value) {
      const items = step.content?.items || [];
      const rows = items
        .filter(it => value[it.id] != null)
        .map(it => ({
          athlete_id:   athleteId,
          step_id:      step.id,
          instrument:   step.content?.instrument || 'unknown',
          item_id:      it.id,
          anchor_index: value[it.id],
          attempt_id:   attemptId,
        }));
      if (rows.length) {
        const { error } = await supabase.from('mf_assessment_item_responses').insert(rows);
        if (error) console.error('[ModuleRunner] assessment save failed', error);
      }
    } else if ((step.step_type === 'builder' || step.step_type === 'reflection') && value?.trim()) {
      const { error } = await supabase.from('mf_reflections').insert({
        athlete_id: athleteId,
        module_id:  module.id,
        step_id:    step.id,
        content:    String(value).trim(),
      });
      if (error) console.error('[ModuleRunner] reflection save failed', error);
    }

    if (isLast) {
      setFinishSaving(true);
      await timer.finish();
      setFinishSaving(false);
      return;
    }
    setStepIndex(i => i + 1);
  }, [step, stepIndex, isLast, responses, athleteId, attemptId, module.id, timer]);

  const goBack = useCallback(() => {
    timer.markActivity();
    if (stepIndex > 0) setStepIndex(i => i - 1);
  }, [stepIndex, timer]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] bg-ink-50 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin" style={{ color: GOLD }} />
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="fixed inset-0 z-[60] bg-ink-50 flex flex-col items-center justify-center px-6">
        <p className="text-sm font-bold text-ink-900">This module has no steps yet.</p>
        <button onClick={onExit} className="mt-4 text-xs font-semibold text-gold-600">Back</button>
      </div>
    );
  }

  // Killed by inactivity — show the kill screen.
  if (timer.killed) {
    return (
      <KillScreen onExit={onExit} />
    );
  }
  // Successfully finished — show the wrap screen.
  if (timer.finished) {
    return (
      <FinishScreen module={module} seconds={timer.seconds} onExit={onExit} />
    );
  }

  const progressPct = ((stepIndex + 1) / steps.length) * 100;
  const valueForStep = responses[stepIndex];
  const canAdvance   = isStepComplete(step, valueForStep);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[60] bg-ink-50 overflow-y-auto flex flex-col"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-ink-100">
        <div className="max-w-[480px] mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onExit} className="p-1.5 rounded hover:bg-ink-50" aria-label="Exit module">
            <X size={18} className="text-ink-500" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-ink-900 truncate">{module.title}</p>
            <p className="text-[10px] text-ink-400">
              Step {stepIndex + 1} of {steps.length}
            </p>
          </div>
          <div className="text-[11px] font-semibold text-ink-500 inline-flex items-center gap-1 tabular-nums">
            <Clock size={11} /> {fmtMmSs(timer.seconds)}
          </div>
        </div>
        <div className="h-1 bg-ink-100 max-w-[480px] mx-auto">
          <div className="h-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: GOLD }} />
        </div>
      </header>

      {/* Step body */}
      <main className="flex-1 max-w-[480px] w-full mx-auto px-4 py-5">
        <StepRenderer
          step={step}
          value={valueForStep}
          onChange={setStepResponse}
        />
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-ink-100" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-[480px] mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={goBack}
            disabled={stepIndex === 0}
            className="flex items-center gap-1 text-xs font-semibold text-ink-500 disabled:opacity-30 px-3 py-2"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <button
            onClick={goNext}
            disabled={!canAdvance || finishSaving}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-bold text-white py-3 rounded-lg disabled:opacity-40"
            style={{ backgroundColor: GOLD }}
          >
            {finishSaving
              ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
              : isLast
                ? <><Check size={14} /> Finish</>
                : <>Next <ArrowRight size={14} /></>}
          </button>
        </div>
      </footer>

      {/* Inactivity prompt */}
      {timer.prompting && (
        <InactivityPrompt
          deadlineMs={timer.promptDeadlineMs}
          strike={timer.strike + 1}
          maxStrikes={timer.KILL_AFTER_STRIKES}
          onAck={timer.acknowledgePrompt}
        />
      )}
    </div>
  );
}

// ─── Per-step renderers ───────────────────────────────────────────────
function StepRenderer({ step, value, onChange }) {
  switch (step.step_type) {
    case 'learn':       return <LearnStep step={step} />;
    case 'interaction': return <InteractionStep step={step} value={value} onChange={onChange} />;
    case 'quiz':        return <QuizStep step={step} value={value} onChange={onChange} />;
    case 'builder':     return <TextEntryStep step={step} value={value} onChange={onChange} />;
    case 'reflection':  return <TextEntryStep step={step} value={value} onChange={onChange} />;
    case 'assessment':  return <AssessmentStep step={step} value={value || {}} onChange={onChange} />;
    default:
      return <p className="text-xs italic text-ink-400">Unknown step type: {step.step_type}</p>;
  }
}

function LearnStep({ step }) {
  return (
    <article className="space-y-3">
      <h3 className="text-lg font-bold text-ink-900 leading-tight">
        {step.content?.headline}
      </h3>
      <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">
        {step.content?.body}
      </p>
    </article>
  );
}

function InteractionStep({ step, value, onChange }) {
  const c = step.content || {};
  if (c.interaction === 'gap_fill') {
    return <GapFillStep content={c} value={value} onChange={onChange} />;
  }
  if (c.interaction === 'tap_select') {
    return <TapSelectStep content={c} value={value} onChange={onChange} />;
  }
  if (c.interaction === 'reorder') {
    return <ReorderStep content={c} value={value} onChange={onChange} />;
  }
  return <p className="text-xs italic text-ink-400">Unknown interaction: {c.interaction}</p>;
}

function GapFillStep({ content, value, onChange }) {
  const correct = value === content.answer;
  const parts = (content.sentence || '').split('___');
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-700 leading-relaxed">
        {parts[0]}
        <span
          className="inline-flex items-center justify-center min-w-[80px] px-3 py-0.5 rounded-md mx-1 align-middle font-bold"
          style={{
            backgroundColor: value ? (correct ? 'rgba(22,163,74,0.10)' : 'rgba(165,141,105,0.10)') : 'rgba(165,141,105,0.06)',
            color:           value ? (correct ? '#15803d' : GOLD) : '#9ca3af',
            border: `1px dashed ${value ? (correct ? '#15803d' : GOLD) : '#d1d5db'}`,
          }}
        >
          {value || '____'}
        </span>
        {parts[1] || ''}
      </p>
      <div className="flex flex-wrap gap-2">
        {(content.bank || []).map(w => {
          const on = value === w;
          return (
            <button
              key={w}
              onClick={() => onChange(w)}
              className="text-xs font-bold px-3 py-2 rounded-md border transition-all"
              style={{
                color:           on ? '#fff' : '#1C1C1C',
                backgroundColor: on ? GOLD : '#fff',
                borderColor:     on ? GOLD : '#e5e7eb',
              }}
            >
              {w}
            </button>
          );
        })}
      </div>
      {value && !correct && (
        <p className="text-[11px] italic text-ink-500">Try another word from the bank.</p>
      )}
      {value && correct && (
        <p className="text-[11px] italic font-bold" style={{ color: '#15803d' }}>Got it.</p>
      )}
    </div>
  );
}

function TapSelectStep({ content, value, onChange }) {
  const selected = value;
  const correct = selected === content.answer;
  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-ink-900">{content.prompt}</h3>
      <ul className="space-y-2">
        {(content.options || []).map((opt, i) => {
          const isOn = selected === i;
          const isRight = i === content.answer;
          const shouldHighlight = selected != null && (isOn || isRight);
          return (
            <li key={i}>
              <button
                onClick={() => onChange(i)}
                className="w-full text-left px-4 py-3 rounded-lg border transition-all"
                style={{
                  backgroundColor: isOn ? (correct ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.06)') : '#fff',
                  borderColor:     isOn ? (correct ? '#15803d'             : '#dc2626')             : (shouldHighlight && isRight ? '#15803d' : '#e5e7eb'),
                  color: '#1C1C1C',
                }}
              >
                <span className="text-sm font-semibold">{opt}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {selected != null && !correct && (
        <p className="text-[11px] italic text-ink-500">Not quite — try again.</p>
      )}
    </div>
  );
}

function ReorderStep({ content, value, onChange }) {
  // Initialise the working list — start from the source items if value
  // is empty, then let the athlete swap rows up / down.
  const list = value || content.items || [];
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const expected = content.answer || [];
  const correct = list.length === expected.length && list.every((v, i) => v === expected[i]);

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-ink-900">{content.prompt}</h3>
      <ul className="space-y-2">
        {list.map((item, i) => (
          <li
            key={item}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border bg-white"
            style={{ borderColor: '#e5e7eb' }}
          >
            <span className="text-[10px] font-bold w-5 text-center tabular-nums"
                  style={{ color: GOLD }}>{i + 1}</span>
            <span className="flex-1 text-sm font-semibold text-ink-900">{item}</span>
            <button onClick={() => move(i, -1)} disabled={i === 0}
                    className="p-1.5 rounded hover:bg-ink-50 disabled:opacity-30">
              <ChevronUp size={14} className="text-ink-500" />
            </button>
            <button onClick={() => move(i, +1)} disabled={i === list.length - 1}
                    className="p-1.5 rounded hover:bg-ink-50 disabled:opacity-30">
              <ChevronDown size={14} className="text-ink-500" />
            </button>
          </li>
        ))}
      </ul>
      {correct && (
        <p className="text-[11px] italic font-bold" style={{ color: '#15803d' }}>That's it.</p>
      )}
    </div>
  );
}

function QuizStep({ step, value, onChange }) {
  const c = step.content || {};
  const selected = value;
  const correct = selected === c.answer;
  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-ink-900">{c.prompt}</h3>
      <ul className="space-y-2">
        {(c.options || []).map((opt, i) => {
          const isOn = selected === i;
          return (
            <li key={i}>
              <button
                onClick={() => onChange(i)}
                className="w-full text-left px-4 py-3 rounded-lg border transition-all"
                style={{
                  backgroundColor: isOn ? (correct ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.06)') : '#fff',
                  borderColor:     isOn ? (correct ? '#15803d' : '#dc2626')                          : '#e5e7eb',
                }}
              >
                <span className="text-sm font-semibold text-ink-900">{opt}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {selected != null && (
        <div
          className="rounded-lg p-3 text-xs"
          style={{
            backgroundColor: correct ? 'rgba(22,163,74,0.08)' : 'rgba(165,141,105,0.08)',
            color:           correct ? '#15803d' : '#1C1C1C',
            border: `1px solid ${correct ? '#86efac' : '#e7d9c1'}`,
          }}
        >
          <p className="font-bold mb-1">{correct ? 'Correct.' : 'Worth another look.'}</p>
          {c.explain && <p className="text-ink-700">{c.explain}</p>}
        </div>
      )}
    </div>
  );
}

function TextEntryStep({ step, value, onChange }) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-ink-900 leading-tight">
        {step.content?.prompt}
      </h3>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        placeholder="Type your thoughts here…"
        className="w-full px-3 py-3 text-sm rounded-lg border border-ink-200 focus:outline-none focus:border-gold-400 resize-none leading-relaxed"
      />
      <p className="text-[10px] italic text-ink-400">
        Your coach can see what you write here. Be honest — it helps them help you.
      </p>
    </div>
  );
}

function AssessmentStep({ step, value, onChange }) {
  const c = step.content || {};
  const items = c.items || [];
  const anchors = c.scale?.anchors || [];
  const answeredCount = Object.values(value).filter(v => v != null).length;
  const pct = items.length ? Math.round((answeredCount / items.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {c.intro && (
        <p className="text-sm text-ink-700 leading-relaxed">{c.intro}</p>
      )}
      <div className="rounded-lg px-3 py-2 text-[11px] font-semibold flex items-center justify-between"
           style={{ backgroundColor: 'rgba(165,141,105,0.08)', color: GOLD }}>
        <span>{answeredCount} of {items.length} answered</span>
        <span className="tabular-nums">{pct}%</span>
      </div>

      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.id} className="rounded-xl bg-white border border-ink-100 p-3"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <p className="text-sm text-ink-800 mb-2.5 leading-snug">{it.text}</p>
            <div className="grid grid-cols-4 gap-1.5">
              {anchors.map((label, idx) => {
                const on = value[it.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => onChange({ ...value, [it.id]: idx })}
                    className="text-[10px] font-bold px-1 py-2 rounded-md border transition-colors"
                    style={{
                      color:           on ? '#fff' : '#6b7280',
                      backgroundColor: on ? GOLD : '#fff',
                      borderColor:     on ? GOLD : '#e5e7eb',
                      lineHeight: 1.1,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Step "ready to advance" rules ───────────────────────────────────
function isStepComplete(step, value) {
  if (!step) return false;
  switch (step.step_type) {
    case 'learn':       return true;
    case 'interaction': {
      const c = step.content || {};
      if (c.interaction === 'gap_fill')  return value === c.answer;
      if (c.interaction === 'tap_select')return value === c.answer;
      if (c.interaction === 'reorder')   {
        const expected = c.answer || [];
        const list = value || c.items || [];
        return list.length === expected.length && list.every((v, i) => v === expected[i]);
      }
      return true;
    }
    case 'quiz':        return value != null;  // can advance once answered, right or wrong
    case 'builder':     return !!(value || '').trim();
    case 'reflection':  return !!(value || '').trim();
    case 'assessment': {
      const items = step.content?.items || [];
      const v = value || {};
      return items.every(it => v[it.id] != null);
    }
    default: return true;
  }
}

// ─── Inactivity prompt + end-state screens ───────────────────────────
function InactivityPrompt({ deadlineMs, strike, maxStrikes, onAck }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000)));
  useEffect(() => {
    const t = setInterval(() => {
      setRemaining(Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000)));
    }, 250);
    return () => clearInterval(t);
  }, [deadlineMs]);
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center"
         style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
      <div className="bg-white w-full sm:max-w-sm shadow-2xl px-5 py-6 text-center"
           style={{
             maxWidth: 420,
             borderTopLeftRadius: 24, borderTopRightRadius: 24,
             paddingBottom: 'env(safe-area-inset-bottom)',
           }}>
        <h3 className="text-base font-bold text-ink-900 mb-1">Are you still training?</h3>
        <p className="text-meta text-ink-500 mb-4">
          We paused your timer. Tap to keep going — otherwise this session will close.
        </p>
        <button
          onClick={onAck}
          className="w-full py-3 rounded-lg text-sm font-bold text-white"
          style={{ backgroundColor: GOLD }}
        >
          Yes, still here ({remaining}s)
        </button>
        <p className="text-[10px] uppercase tracking-widest font-bold mt-3" style={{ color: strike >= maxStrikes - 1 ? '#dc2626' : '#9ca3af' }}>
          Prompt {strike} of {maxStrikes}
        </p>
      </div>
    </div>
  );
}

function KillScreen({ onExit }) {
  return (
    <div className="fixed inset-0 z-[60] bg-ink-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
           style={{ backgroundColor: 'rgba(220,38,38,0.10)', color: '#dc2626' }}>
        <X size={26} />
      </div>
      <h3 className="text-base font-bold text-ink-900">Session paused</h3>
      <p className="text-meta text-ink-500 max-w-xs mt-1">
        You stopped responding to the prompts so we've closed this session. Your progress is saved
        — come back when you're ready to pick it up.
      </p>
      <button
        onClick={onExit}
        className="mt-5 px-5 py-2.5 rounded-lg text-sm font-bold text-white"
        style={{ backgroundColor: GOLD }}
      >
        Back to modules
      </button>
    </div>
  );
}

function FinishScreen({ module, seconds, onExit }) {
  return (
    <div className="fixed inset-0 z-[60] bg-ink-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
           style={{ backgroundColor: 'rgba(165,141,105,0.12)', color: GOLD }}>
        <Check size={26} />
      </div>
      <h3 className="text-base font-bold text-ink-900">Module complete</h3>
      <p className="text-sm text-ink-700 mt-1">{module.title}</p>
      <p className="text-meta text-ink-500 mt-1">
        Time spent <strong>{fmtMmSs(seconds)}</strong>
        {module.xp_reward ? <> · <strong>+{module.xp_reward} XP</strong></> : null}
      </p>
      <button
        onClick={onExit}
        className="mt-6 px-5 py-2.5 rounded-lg text-sm font-bold text-white"
        style={{ backgroundColor: GOLD }}
      >
        Back to modules
      </button>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────
function fmtMmSs(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}
