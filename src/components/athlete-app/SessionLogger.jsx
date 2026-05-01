import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Plus, Timer, CheckCircle2, Check, Minus, ArrowLeft, Dumbbell, Layers, Repeat, Clock, Flame, BarChart3 } from 'lucide-react';
import { useSessionLogger } from '../../hooks/useSessionLogger';
import { tintForLetter } from '../../utils/letterTints';
import { parsePrescription } from '../../utils/prescriptionRender';
import logoBlack from '../../assets/Propath_Primary Logo_Black.png';

const GOLD = '#A58D69';

// Verbal anchor for the gradient RPE slider (0-10).
const RPE_ANCHORS = {
  0: 'Rest',
  1: 'Very easy',  2: 'Very easy',
  3: 'Easy',       4: 'Easy',
  5: 'Moderate',
  6: 'Hard',       7: 'Hard',
  8: 'Very hard',  9: 'Very hard',
  10: 'Maximal',
};

// Smooth red→amber→green gradient used as the slider track.
const RPE_GRADIENT =
  'linear-gradient(to right, #22c55e 0%, #84cc16 30%, #facc15 50%, #f59e0b 70%, #ef4444 100%)';

function fmtClock(s) {
  if (!s || s < 0) return '00:00';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function cleanName(name) {
  if (!name) return '';
  return String(name).replace(/\s+[—–]\s+/g, ': ');
}

export default function SessionLogger({ session, athleteId, onClose }) {
  const exercises = useMemo(
    () => session.items.filter(i => i.kind === 'exercise'),
    [session.items]
  );

  const { sessionLog, sets, loading, start, logSet, deleteSet, finish } =
    useSessionLogger({
      athleteId,
      plannedSessionId: session.id,
      blockSessionId:   session.block_session_id,
    });

  const [now, setNow]         = useState(Date.now());
  // 'logging' (default) → 'finishing' (RPE flow) → 'summary'
  const [phase, setPhase]     = useState('logging');
  const [finishedRpe,        setFinishedRpe]        = useState(null);
  const [finishedDuration,   setFinishedDuration]   = useState(null);
  const [finishedReflection, setFinishedReflection] = useState(null);
  // Snapshot of stats taken BEFORE finish() runs, because the hook's
  // refresh() empties `sets` once completed_at is stamped (it only
  // queries open logs).
  const [finishedStats,      setFinishedStats]      = useState(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!loading && !sessionLog) start();
  }, [loading, sessionLog, start]);

  const { totalExpected, totalLogged, missing } = useMemo(() => {
    let totalExpected = 0;
    let totalLogged   = 0;
    const missingByEx = [];
    for (const ex of exercises) {
      const p = parsePrescription(ex);
      const exSets = sets.filter(
        s => s.session_exercise_id === ex.session_exercise_id && !s.is_extra
      );
      totalExpected += p.expectedSetCount;
      totalLogged   += Math.min(exSets.length, p.expectedSetCount);
      if (exSets.length < p.expectedSetCount) {
        missingByEx.push({
          name: ex.name,
          missing: p.expectedSetCount - exSets.length,
        });
      }
    }
    return { totalExpected, totalLogged, missing: missingByEx };
  }, [exercises, sets]);

  if (loading || !sessionLog) {
    return (
      <Overlay>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 animate-spin"
            style={{ borderColor: 'rgba(165,141,105,0.25)', borderTopColor: GOLD }} />
        </div>
      </Overlay>
    );
  }

  const startedAt = new Date(sessionLog.started_at).getTime();
  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));

  if (phase === 'finishing') {
    return (
      <Overlay>
        <RpePanel
          elapsed={elapsed}
          missing={missing}
          totalExpected={totalExpected}
          totalLogged={totalLogged}
          onCancel={() => setPhase('logging')}
          onConfirm={async ({ rpe, durationMinutes, reflection }) => {
            // Snapshot stats from current sets BEFORE finish() runs
            // (which fires refresh() that empties `sets`).
            setFinishedStats(computeSummaryStats(sets));
            const ok = await finish(rpe, durationMinutes, reflection);
            if (!ok) return;
            setFinishedRpe(rpe);
            setFinishedDuration(durationMinutes);
            setFinishedReflection(reflection);
            setPhase('summary');
          }}
        />
      </Overlay>
    );
  }

  if (phase === 'summary') {
    return (
      <Overlay>
        <SummaryPanel
          session={session}
          stats={finishedStats}
          rpe={finishedRpe}
          durationMinutes={finishedDuration}
          reflection={finishedReflection}
          onBackHome={() => onClose(true)}
          onEdit={() => setPhase('logging')}
        />
      </Overlay>
    );
  }

  const pct = totalExpected ? Math.round((totalLogged / totalExpected) * 100) : 0;

  return (
    <Overlay>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-3 pb-2 bg-white border-b border-ink-100">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => onClose(false)}
            aria-label="Close"
            className="p-2 -ml-2 text-ink-500 hover:text-ink-900 transition-colors"
            style={{ minWidth: 44, minHeight: 44 }}>
            <X size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-micro font-bold uppercase text-ink-400">Logging</p>
            <p className="text-body font-bold truncate text-ink-900">
              {cleanName(session.session_name)}
            </p>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[9px] uppercase tracking-widest font-bold text-ink-400">
              Session time
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md mt-0.5 bg-gold-50 text-gold-600">
              <Timer size={12} />
              <span className="text-meta font-bold tabular-nums">{fmtClock(elapsed)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-ink-100">
            <div className="h-full transition-all bg-gold-500"
              style={{ width: `${pct}%` }} />
          </div>
          <span className="text-micro tabular-nums text-ink-500">
            {totalLogged}/{totalExpected} sets
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-4 space-y-4">
        {exercises.map((ex, idx) => {
          const next = exercises[idx + 1];
          return (
            <ExerciseLogger
              key={ex.session_exercise_id}
              exercise={ex}
              index={idx}
              upNext={next ? next.name : null}
              sets={sets.filter(s => s.session_exercise_id === ex.session_exercise_id)}
              onLog={logSet}
              onDelete={deleteSet}
            />
          );
        })}

        <button
          onClick={() => setPhase('finishing')}
          className="w-full rounded-lg py-4 text-body font-bold tracking-wide active:scale-[0.99] flex items-center justify-center gap-2 bg-gold-500 text-white hover:bg-gold-600 transition-colors shadow-xs"
          style={{ minHeight: 56 }}
        >
          <CheckCircle2 size={18} /> Finish Session
        </button>
      </div>
    </Overlay>
  );
}

function Overlay({ children }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-50">
      <div className="mx-auto bg-ink-50 min-h-full" style={{ maxWidth: 480 }}>{children}</div>
    </div>
  );
}

// ── New post-session RPE flow: gradient slider + duration + reflection ────
function RpePanel({ elapsed, missing, totalExpected, totalLogged, onCancel, onConfirm }) {
  const [rpe, setRpe]                = useState(5);
  const [duration, setDuration]      = useState(() => Math.max(1, Math.round(elapsed / 60)));
  const [reflection, setReflection]  = useState('');
  const [acknowledged, setAck]       = useState(false);
  const [submitting, setSub]         = useState(false);

  const hasMissing = missing.length > 0;

  // Show the "finish early?" gate first if the athlete hasn't logged
  // every prescribed set. Once acknowledged, fall through to the RPE
  // form.
  if (hasMissing && !acknowledged) {
    return (
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onCancel}
            aria-label="Back"
            className="p-2 -ml-2 text-ink-500 hover:text-ink-900 transition-colors"
            style={{ minWidth: 44, minHeight: 44 }}>
            <X size={20} />
          </button>
          <p className="text-micro font-bold uppercase text-ink-400">
            {fmtClock(elapsed)} elapsed
          </p>
          <span className="w-7" />
        </div>
        <h2 className="text-h2 mb-2 text-ink-900">Finish early?</h2>
        <p className="text-body mb-4 text-ink-500">
          {totalExpected - totalLogged} set{(totalExpected - totalLogged) === 1 ? '' : 's'} across {missing.length} exercise{missing.length === 1 ? '' : 's'} {missing.length === 1 ? 'is' : 'are'} unlogged. They will be marked as not completed.
        </p>
        <div className="rounded-md p-3 mb-4 text-meta space-y-1.5 bg-ink-50 border border-ink-100">
          {missing.map((m, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="truncate text-ink-700">{m.name}</span>
              <span className="font-semibold ml-2 shrink-0 text-gold-600">
                {m.missing} unlogged
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 rounded-md py-3 text-body font-bold bg-white text-ink-800 border border-ink-200 hover:bg-ink-50 transition-colors"
            style={{ minHeight: 52 }}>
            Keep logging
          </button>
          <button onClick={() => setAck(true)}
            className="flex-1 rounded-md py-3 text-body font-bold bg-gold-500 text-white hover:bg-gold-600 transition-colors"
            style={{ minHeight: 52 }}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  const safeDuration = Math.max(1, Math.min(600, Number(duration) || 0));

  return (
    <div className="px-4 py-6 pb-32">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onCancel}
          aria-label="Back"
          className="p-2 -ml-2 text-ink-500 hover:text-ink-900 transition-colors"
          style={{ minWidth: 44, minHeight: 44 }}>
          <X size={20} />
        </button>
        <p className="text-micro font-bold uppercase text-ink-400">
          {fmtClock(elapsed)} elapsed
        </p>
        <span className="w-7" />
      </div>

      {/* Section 1: Intensity gradient slider */}
      <section className="mb-8">
        <h3 className="text-h3 text-ink-900">Intensity</h3>
        <p className="text-meta text-ink-500 mb-4">How did this session feel?</p>

        <div className="flex items-baseline justify-center gap-2 mb-2">
          <span className="text-display font-bold text-ink-900 tabular-nums">{rpe}</span>
          <span className="text-meta text-ink-500">/ 10</span>
        </div>
        <p className="text-center text-body font-semibold text-gold-600 mb-4">
          {RPE_ANCHORS[rpe]}
        </p>

        <input
          type="range"
          min={0} max={10} step={1}
          value={rpe}
          onChange={(e) => setRpe(Number(e.target.value))}
          className="rpe-slider w-full"
          aria-label="Session intensity, 0 to 10"
        />
        <div className="flex justify-between mt-1 px-1 text-micro font-bold text-ink-400">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </section>

      {/* Section 2: Duration */}
      <section className="mb-8">
        <h3 className="text-h3 text-ink-900">Training Duration</h3>
        <p className="text-meta text-ink-500 mb-4">Minutes</p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setDuration(d => Math.max(1, Number(d) - 1))}
            className="w-12 h-12 rounded-full bg-white border border-ink-200 hover:border-gold-400 text-ink-700 flex items-center justify-center active:scale-95 transition-all"
            aria-label="Decrease minutes"
          >
            <Minus size={18} />
          </button>
          <input
            type="number" min={1} max={600}
            value={duration}
            onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
            onBlur={() => setDuration(safeDuration)}
            className="w-24 h-14 text-center text-h1 font-bold text-ink-900 bg-white border border-ink-200 rounded-md outline-none focus:border-gold-500 tabular-nums"
          />
          <button
            onClick={() => setDuration(d => Math.min(600, Number(d) + 1))}
            className="w-12 h-12 rounded-full bg-white border border-ink-200 hover:border-gold-400 text-ink-700 flex items-center justify-center active:scale-95 transition-all"
            aria-label="Increase minutes"
          >
            <Plus size={18} />
          </button>
        </div>
      </section>

      {/* Section 3: Session reflection */}
      <section className="mb-8">
        <h3 className="text-h3 text-ink-900">Session Reflection</h3>
        <p className="text-meta text-ink-500 mb-3">This will be shared with your coach</p>
        <textarea
          rows={4}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="How did today's session feel? Anything your coach should know?"
          className="w-full rounded-md px-3 py-2 text-body bg-white border border-ink-200 focus:border-gold-500 outline-none resize-none placeholder:text-ink-400"
        />
      </section>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-1/2 z-40 px-4 pt-3 pb-5 bg-ink-50 border-t border-ink-100"
        style={{ width: '100%', maxWidth: 480, transform: 'translateX(-50%)' }}>
        <button
          onClick={async () => {
            if (submitting) return;
            setSub(true);
            await onConfirm({ rpe, durationMinutes: safeDuration, reflection: reflection.trim() });
          }}
          disabled={submitting}
          className="w-full rounded-lg py-4 text-body font-bold transition-all bg-gold-500 text-white hover:bg-gold-600 disabled:opacity-40 shadow-xs"
          style={{ minHeight: 56 }}>
          {submitting ? 'Saving…' : 'Finish Session'}
        </button>
      </div>

      {/* Slider styling — gradient track + gold thumb */}
      <style>{`
        .rpe-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 14px;
          border-radius: 8px;
          background: ${RPE_GRADIENT};
          outline: none;
          cursor: pointer;
          box-shadow: inset 0 1px 2px rgba(15,15,15,0.10);
        }
        .rpe-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 32px; height: 32px; border-radius: 50%;
          background: #fff; border: 3px solid #1C1C1C;
          cursor: pointer; box-shadow: 0 2px 8px rgba(15,15,15,0.25);
        }
        .rpe-slider::-moz-range-thumb {
          width: 32px; height: 32px; border-radius: 50%;
          background: #fff; border: 3px solid #1C1C1C;
          cursor: pointer; box-shadow: 0 2px 8px rgba(15,15,15,0.25);
        }
      `}</style>
    </div>
  );
}

// Pure helper — used by the SessionLogger before finish() to snapshot
// stats while `sets` is still populated. Exposed at module scope for
// future use by the share-image render in Phase E.
function computeSummaryStats(sets) {
  let totalVolume = 0;
  let totalSets   = 0;
  let totalReps   = 0;
  let weightSeen  = false;
  const exIdsWithLogs = new Set();
  for (const s of sets || []) {
    totalSets += 1;
    if (s.session_exercise_id) exIdsWithLogs.add(s.session_exercise_id);
    const r = Number(s.reps) || 0;
    const w = Number(s.weight_kg) || 0;
    totalReps += r;
    if (w > 0) {
      weightSeen = true;
      totalVolume += w * r;
    }
  }
  return {
    totalVolume,
    hasWeight: weightSeen,
    exercises: exIdsWithLogs.size,
    sets: totalSets,
    reps: totalReps,
  };
}

// ── Post-session summary screen ───────────────────────────────────────────
//
// Designed for shareability: hero, single anchor stat, secondary grid,
// optional reflection, brand mark in the same light frame. The whole
// shareable region is captured into a PNG by the share button.
function SummaryPanel({ session, stats, rpe, durationMinutes, reflection, onBackHome, onEdit }) {
  const safeStats = stats || { totalVolume: 0, hasWeight: false, exercises: 0, sets: 0, reps: 0 };

  const sessionTitle = (session.session_name || 'Session').replace(/\s+[—–]\s+/g, ': ');
  const subTitle = session.week_number != null
    ? `Week ${session.week_number}` + (session.session_order != null ? ` · Day ${session.session_order + 1}` : '')
    : null;

  const heroStat = safeStats.hasWeight
    ? { label: 'Total Volume', value: safeStats.totalVolume.toLocaleString('en-GB'), unit: 'kg' }
    : { label: 'Total Reps',   value: String(safeStats.reps),                         unit: 'reps' };

  // Ref kept for parity with previous structure; export feature was
  // removed (see commit notes — deferred to a later phase).
  const cardRef = useRef(null);

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-ink-100">
        <span style={{ minWidth: 44, minHeight: 44 }} aria-hidden="true" />
        <p className="text-micro font-bold uppercase tracking-widest text-ink-400">Session complete</p>
        <button
          onClick={onBackHome}
          aria-label="Close"
          className="p-2 -mr-2 text-ink-500 hover:text-ink-900 transition-colors"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <X size={20} />
        </button>
      </div>

      {/* ── In-app summary card — mirrors the 1080×1920 export design ──── */}
      <div ref={cardRef} className="bg-white flex-1">
        {/* Hero */}
        <div className="px-5 pt-7 pb-5 text-center">
          <div className="w-14 h-14 rounded-full bg-gold-50 flex items-center justify-center mx-auto mb-3"
            style={{ boxShadow: '0 0 0 6px rgba(165,141,105,0.08)' }}>
            <CheckCircle2 size={28} className="text-gold-600" strokeWidth={2.4} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold-600 mb-2">
            You finished
          </p>
          <h1 className="text-h1 text-ink-900 leading-tight px-2">{sessionTitle}</h1>
          {subTitle && (
            <p className="text-[11px] uppercase tracking-[0.24em] font-semibold mt-2 text-ink-400">{subTitle}</p>
          )}
        </div>

        {/* Hero stat — light cream card with centred dumbbell tile */}
        <div className="px-4">
          <div className="rounded-xl px-5 py-5 text-center"
            style={{ backgroundColor: '#faf7f2', border: '1px solid #f1eadc' }}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2.5"
              style={{ backgroundColor: 'rgba(165,141,105,0.18)' }}>
              <Dumbbell size={22} className="text-gold-600" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-ink-500 mb-1">
              {heroStat.label}
            </p>
            <div className="flex justify-center items-baseline gap-1.5">
              <span className="text-display font-bold tabular-nums leading-none text-ink-900">
                {heroStat.value}
              </span>
              <span className="text-body font-bold text-gold-600">{heroStat.unit}</span>
            </div>
          </div>
        </div>

        {/* Secondary stats — centred-icon-above tiles */}
        <div className="px-4 pt-3 pb-3 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <CentreStat icon={Layers}    label="Exercises" value={String(safeStats.exercises)} />
            <CentreStat icon={BarChart3} label="Sets"      value={String(safeStats.sets)} />
            <CentreStat icon={Repeat}    label="Reps"      value={String(safeStats.reps)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <CentreStat
              icon={Clock} label="Duration"
              value={durationMinutes != null ? String(durationMinutes) : '—'}
              unit={durationMinutes != null ? 'min' : null}
            />
            <CentreStat
              icon={Flame} label="Intensity"
              value={rpe != null ? String(rpe) : '—'}
              unit={rpe != null ? '/ 10' : null}
              valueColor={rpe != null ? rpeColour(rpe) : undefined}
            />
          </div>
        </div>

        {/* Brand mark — proper black logo, no dark band, no border */}
        <div className="px-5 pt-8 pb-6 flex flex-col items-center gap-2 text-center">
          <img
            src={logoBlack}
            alt="ProPath"
            style={{ height: 56, width: 'auto', display: 'block' }}
          />
          <p className="text-[10px] uppercase tracking-[0.32em] font-semibold text-teal-600">
            People . Performance . Pathways
          </p>
        </div>
      </div>
      {/* ── End in-app card ─────────────────────────────────────────────── */}

      {/* Bottom actions */}
      <div className="px-4 py-3 bg-white border-t border-ink-100 flex flex-col gap-1 mt-auto">
        <button
          onClick={onBackHome}
          className="w-full rounded-lg py-3.5 text-body font-bold bg-gold-500 text-white hover:bg-gold-600 active:scale-[0.99] transition-all shadow-xs"
          style={{ minHeight: 50 }}
        >
          Back to home
        </button>
        <button
          onClick={onEdit}
          className="w-full py-2 text-meta font-semibold text-ink-500 hover:text-ink-800 transition-colors flex items-center justify-center gap-1.5"
        >
          <ArrowLeft size={13} /> Edit session
        </button>
      </div>

    </div>
  );
}

// In-app stat tile — centred icon above label and value.
function CentreStat({ icon: Icon, label, value, unit, valueColor }) {
  return (
    <div className="rounded-xl bg-white border border-ink-100 px-3 py-3.5 text-center shadow-card">
      <Icon size={16} className="text-ink-400 mx-auto mb-1.5" />
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500 mb-1">{label}</p>
      <div className="flex justify-center items-baseline gap-1">
        <span
          className="text-h2 font-bold tabular-nums leading-none"
          style={{ color: valueColor || '#1C1C1C' }}
        >
          {value}
        </span>
        {unit && <span className="text-caption text-ink-500 font-semibold">{unit}</span>}
      </div>
    </div>
  );
}

// Match the gradient slider's colour ramp so Intensity reads visually.
function rpeColour(rpe) {
  if (rpe <= 2) return '#22c55e';
  if (rpe <= 4) return '#84cc16';
  if (rpe <= 6) return '#facc15';
  if (rpe <= 8) return '#f59e0b';
  return '#ef4444';
}

function ExerciseLogger({ exercise, index, upNext, sets, onLog, onDelete }) {
  const tint = tintForLetter(exercise.letter);
  const prescription = useMemo(() => parsePrescription(exercise), [exercise]);

  const sortedSets = [...sets].sort((a, b) => a.set_number - b.set_number);
  const prescribedSets = sortedSets.filter(s => !s.is_extra);
  const extraSets      = sortedSets.filter(s =>  s.is_extra);

  const loggedByNumber = new Map();
  prescribedSets.forEach(s => loggedByNumber.set(s.set_number, s));

  const N = prescription.expectedSetCount;
  const completedCount = Math.min(prescribedSets.length, N);
  const isComplete = completedCount >= N;

  const fieldRefs = useRef([]);
  fieldRefs.current = [];

  const handleAddExtra = async () => {
    const nextNo = sortedSets.length
      ? Math.max(...sortedSets.map(s => s.set_number)) + 1
      : N + 1;
    await onLog({
      session_exercise_id: exercise.session_exercise_id,
      exercise_id:         exercise.exercise_id,
      set_number:          nextNo,
      weight_kg:           null,
      reps:                null,
      is_extra:            true,
    });
  };

  return (
    <div className={`rounded-xl overflow-hidden bg-white shadow-card border ${
      isComplete ? 'border-gold-200' : 'border-ink-100'
    }`}
      style={{ opacity: isComplete ? 0.94 : 1 }}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: tint.bg, border: `1.5px solid ${tint.border}` }}>
            <span className="text-meta font-bold" style={{ color: tint.border }}>{exercise.letter}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-body font-bold truncate text-ink-900">
                {exercise.name}
              </p>
              {isComplete && <Check size={14} strokeWidth={3} className="text-gold-600" />}
            </div>
            {prescription.summary && (
              <p className="text-micro font-bold uppercase mt-0.5 text-ink-400">
                Target
              </p>
            )}
            {prescription.summary && (
              <p className="text-meta font-semibold text-gold-600">
                {prescription.summary}
              </p>
            )}
          </div>
          <span className="text-micro font-bold tabular-nums shrink-0 text-ink-400">
            {completedCount}/{N}
          </span>
        </div>

        {exercise.notes && (
          <p className="text-meta mt-2 italic px-1 text-ink-500">
            {exercise.notes}
          </p>
        )}
      </div>

      <div className="px-4 pb-4 border-t border-ink-100">
        {prescription.mode !== 'tick_only' && (
          <div className="grid grid-cols-12 gap-2 px-1 mt-3 mb-1.5">
            <p className="col-span-1 text-[9px] uppercase tracking-widest font-bold text-ink-400">Set</p>
            <p className="col-span-4 text-[9px] uppercase tracking-widest font-bold text-ink-400">Reps</p>
            <p className="col-span-5 text-[9px] uppercase tracking-widest font-bold text-ink-400">Weight (kg)</p>
            <p className="col-span-2" />
          </div>
        )}

        <div className="space-y-1.5 mt-3">
          {Array.from({ length: N }).map((_, i) => {
            const setNo = i + 1;
            const logged = loggedByNumber.get(setNo) || null;
            return (
              <SetRow
                key={`prescribed-${setNo}`}
                setNumber={setNo}
                prescription={prescription}
                exercise={exercise}
                logged={logged}
                rowIndex={i}
                fieldRefs={fieldRefs}
                onLog={onLog}
                onDelete={onDelete}
              />
            );
          })}

          {extraSets.map((s) => (
            <SetRow
              key={`extra-${s.id}`}
              setNumber={s.set_number}
              prescription={prescription}
              exercise={exercise}
              logged={s}
              rowIndex={N + s.set_number}
              fieldRefs={fieldRefs}
              onLog={onLog}
              onDelete={onDelete}
              isExtra
            />
          ))}
        </div>

        <button onClick={handleAddExtra}
          className="w-full mt-3 py-2 text-meta font-bold rounded-md border border-dashed border-gold-300 text-gold-600 hover:bg-gold-50 transition-colors active:scale-[0.99]"
          style={{ minHeight: 36 }}>
          <Plus size={12} className="inline mr-1" /> Add extra set
        </button>

        {upNext && isComplete && (
          <p className="text-micro mt-3 text-center text-ink-400">
            Up next: <span className="text-ink-600 font-semibold">{upNext}</span>
          </p>
        )}
      </div>
    </div>
  );
}

function SetRow({
  setNumber, prescription, exercise, logged, rowIndex, fieldRefs,
  onLog, onDelete, isExtra,
}) {
  const isLogged = !!logged;

  const initialReps   = logged?.reps != null
    ? String(logged.reps)
    : (prescription.prescribedRepsLower != null ? String(prescription.prescribedRepsLower) : '');
  const initialWeight = logged?.weight_kg != null
    ? String(logged.weight_kg)
    : (prescription.prescribedWeightLower != null ? String(prescription.prescribedWeightLower) : '');

  const [reps, setReps]     = useState(initialReps);
  const [weight, setWeight] = useState(initialWeight);

  useEffect(() => {
    if (logged) {
      setReps(logged.reps != null ? String(logged.reps) : '');
      setWeight(logged.weight_kg != null ? String(logged.weight_kg) : '');
    }
  }, [logged?.id, logged?.reps, logged?.weight_kg]);

  const handleToggle = async () => {
    if (isLogged) {
      const ok = window.confirm(`Clear logged set ${setNumber}?`);
      if (!ok) return;
      await onDelete(logged.id);
      setReps(prescription.prescribedRepsLower != null ? String(prescription.prescribedRepsLower) : '');
      setWeight('');
      return;
    }
    await onLog({
      session_exercise_id: exercise.session_exercise_id,
      exercise_id:         exercise.exercise_id,
      set_number:          setNumber,
      reps:                reps === '' ? null : reps,
      weight_kg:           weight === '' ? null : weight,
      is_extra:            !!isExtra,
    });
  };

  const handleSave = async () => {
    if (!isLogged) return;
    await onLog({
      id:                  logged.id,
      session_exercise_id: exercise.session_exercise_id,
      exercise_id:         exercise.exercise_id,
      set_number:          setNumber,
      reps:                reps === '' ? null : reps,
      weight_kg:           weight === '' ? null : weight,
      is_extra:            !!isExtra,
    });
  };

  const registerRef = (ref) => {
    if (ref) fieldRefs.current.push(ref);
  };
  const focusNext = (currentRef) => {
    const idx = fieldRefs.current.indexOf(currentRef);
    const next = fieldRefs.current[idx + 1];
    if (next) next.focus();
  };

  if (prescription.mode === 'tick_only') {
    return (
      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md ${
        isLogged ? 'bg-gold-50' : 'bg-ink-50'
      }`}>
        <span className={`text-meta font-bold w-5 ${isLogged ? 'text-ink-900' : 'text-ink-400'}`}>
          {setNumber}
        </span>
        <p className="flex-1 text-meta text-ink-600">
          {prescription.prescribedReps ? `${prescription.prescribedReps} ` : ''}
          {prescription.prescribedWeight || prescription.summary || 'Complete this set'}
        </p>
        {isExtra && <ExtraBadge />}
        <CompleteToggle isLogged={isLogged} onClick={handleToggle} />
      </div>
    );
  }

  const isBW = prescription.mode === 'reps_bw';
  const inputClass = isLogged
    ? 'bg-white text-ink-900 border-gold-300'
    : 'bg-ink-50 text-ink-700 border-ink-200';

  return (
    <div className="grid grid-cols-12 gap-2 items-center px-1 py-0.5">
      <div className="col-span-1 text-center">
        <span className={`text-meta font-bold ${isLogged ? 'text-ink-900' : 'text-ink-400'}`}>
          {setNumber}
        </span>
      </div>

      <input
        ref={registerRef}
        type="number" inputMode="numeric" step="1"
        value={reps}
        placeholder={prescription.prescribedReps || ''}
        onChange={(e) => setReps(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => { if (e.key === 'Enter') focusNext(e.currentTarget); }}
        className={`col-span-4 px-2 py-2.5 rounded-md text-meta text-center outline-none border ${inputClass} placeholder:text-ink-400`}
        style={{ minHeight: 40 }}
      />

      {isBW ? (
        <div className={`col-span-5 flex items-center justify-center px-2 py-2.5 rounded-md border ${
          isLogged ? 'bg-gold-50 border-gold-300' : 'bg-ink-50 border-ink-200'
        }`}
          style={{ minHeight: 40 }}>
          <span className="text-micro font-bold uppercase tracking-wider text-gold-600">BW</span>
        </div>
      ) : (
        <input
          ref={registerRef}
          type="number" inputMode="decimal" step="0.5"
          value={weight}
          placeholder={prescription.prescribedWeight || '—'}
          onChange={(e) => setWeight(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => { if (e.key === 'Enter') focusNext(e.currentTarget); }}
          className={`col-span-5 px-2 py-2.5 rounded-md text-meta text-center outline-none border ${inputClass} placeholder:text-ink-400`}
          style={{ minHeight: 40 }}
        />
      )}

      <div className="col-span-2 flex items-center justify-center gap-1">
        {isExtra && <ExtraBadge />}
        <CompleteToggle isLogged={isLogged} onClick={handleToggle} />
      </div>
    </div>
  );
}

function CompleteToggle({ isLogged, onClick }) {
  return (
    <button onClick={onClick}
      className={`rounded-full flex items-center justify-center active:scale-90 transition-all ${
        isLogged
          ? 'bg-gold-500 border-gold-500'
          : 'bg-white border-ink-300 hover:border-gold-400'
      }`}
      aria-label={isLogged ? 'Clear logged set' : 'Mark set complete'}
      title={isLogged ? 'Tap to clear' : 'Tap to log'}
      style={{ width: 32, height: 32, minWidth: 32, borderWidth: 1.5, borderStyle: 'solid' }}>
      {isLogged
        ? <Check size={16} strokeWidth={3} color="#fff" />
        : <span className="block w-3 h-3 rounded-full bg-transparent" />}
    </button>
  );
}

function ExtraBadge() {
  return (
    <span className="text-[8px] font-bold uppercase tracking-wider px-1 rounded text-gold-600 border border-gold-200">
      extra
    </span>
  );
}
