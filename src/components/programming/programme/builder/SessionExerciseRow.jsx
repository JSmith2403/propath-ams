import { useState } from 'react';
import { GripVertical, Trash2, Clock } from 'lucide-react';
import WeekCell from './WeekCell';
import LoadingPopover from './LoadingPopover';
import ExerciseSearchDropdown from './ExerciseSearchDropdown';
import { cascadeWk1Edit, isInheritedFromWk1 } from './loadingPatterns';

// Format rest_seconds as a compact human label: 90s → "1:30", 180 → "3:00".
function fmtRest(s) {
  if (s == null || s <= 0) return null;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${sec}s`;
}

const PRESCRIPTION_OPTIONS = [
  { value: 'kg',            label: 'kg' },
  { value: 'percent_1rm',   label: '% 1RM' },
  { value: 'velocity_zone', label: 'Velocity' },
  { value: 'rpe',           label: 'RPE' },
  { value: 'rir',           label: 'RIR' },
  { value: 'reps_only',     label: 'Reps only' },
  { value: 'time',          label: 'Time' },
  { value: 'band_colour',   label: 'Band' },
];

export const ROW_STICKY_WIDTH = 360;
export const WEEK_COL_WIDTH   = 160;

/**
 * SessionExerciseRow — one exercise. Wk1 is the source of truth;
 * Wk2..N inherit from it visually (dimmed) until the coach explicitly
 * edits or applies a Loading pattern. Auto-cascade: editing a Wk1
 * field updates any later week whose value still matched the OLD Wk1
 * — overrides are preserved.
 */
export default function SessionExerciseRow({
  exercise,
  accentColour,
  weeks,
  // Athlete-mode only — when present, drives the scope dialog "this
  // week" labels. Null when block dates aren't known (e.g. template
  // builder), in which case the dialog falls back to a per-week
  // checkbox picker.
  currentWk = null,
  linkedToPrev = false,
  linkedToNext = false,
  onChange,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnter,
  onDragLeave,
  isDropTarget,
}) {
  const ptype = exercise.prescription_type || exercise.default_prescription_type || 'kg';
  const prescriptions = exercise.week_prescriptions || [];
  const wk1 = prescriptions.find(p => p.week_number === 1) || null;
  const [replacing,   setReplacing]   = useState(false);
  const [pendingSwap, setPendingSwap] = useState(null); // { lib }

  // ── Scope-aware swap ────────────────────────────────────────────────
  // After the picker chooses a replacement, instead of immediately
  // overwriting the row we ask "which weeks?". The chosen scope drives
  // whether the row's exercise_id changes (entire block) or whether
  // override_exercise_id is set on selected weeks (per-week swap).

  const handleReplaceSelect = (lib) => {
    setReplacing(false);
    // Always go through the scope dialog so coaches don't accidentally
    // wipe a multi-week progression with a one-click row replace.
    setPendingSwap({ lib });
  };

  // Resolve the current effective exercise for a given week — override
  // if set, otherwise the row's base exercise.
  const baselineEffectiveFor = (week) => {
    const wp = prescriptions.find(p => p.week_number === week);
    return wp?.override_exercise_id || exercise.exercise_id;
  };

  const applySwapWithScope = (scope, customWeeks) => {
    if (!pendingSwap) return;
    const { lib } = pendingSwap;
    setPendingSwap(null);

    // Ensure every week 1..N has a prescription row so override writes
    // have somewhere to land. Missing weeks get a sensible default.
    const baseRows = Array.from({ length: weeks }, (_, i) => {
      const wk = i + 1;
      const existing = prescriptions.find(p => p.week_number === wk);
      return existing || {
        week_number: wk, sets: 3, reps: '8',
        target_value: '', rest_seconds: null,
        override_exercise_id: null, override_exercise_name: null,
      };
    });

    // ── Entire block — replace row exercise, clear all overrides ──
    if (scope === 'entire_block') {
      const cleared = baseRows.map(p => ({
        ...p,
        override_exercise_id:   null,
        override_exercise_name: null,
      }));
      onChange({
        exercise_id:               lib.id,
        exercise_name:             lib.name,
        category:                  lib.category,
        bilateral_unilateral:      lib.bilateral_unilateral,
        default_prescription_type: lib.default_prescription_type,
        prescription_type:         lib.default_prescription_type,
        week_prescriptions:        cleared,
      });
      return;
    }

    // ── Specific-weeks scope — set override on chosen weeks only ──
    // Coach explicitly checked the weeks they want, so we apply
    // unconditionally (no smart-overwrite skip — they were deliberate).
    const weeksToTouch = (customWeeks || []).filter(w => w >= 1 && w <= weeks);
    if (!weeksToTouch.length) return;

    const next = baseRows.map(p => {
      if (!weeksToTouch.includes(p.week_number)) return p;
      return {
        ...p,
        override_exercise_id:   lib.id,
        override_exercise_name: lib.name,
      };
    });
    onChange({ week_prescriptions: next });
  };

  // ✕ on a week cell — restore the row's base exercise for that week.
  const clearOverrideForWeek = (weekNumber) => {
    const next = prescriptions.map(p =>
      p.week_number === weekNumber
        ? { ...p, override_exercise_id: null, override_exercise_name: null }
        : p
    );
    onChange({ week_prescriptions: next });
  };

  const updateWeek = (weekNumber, patch) => {
    const before = prescriptions.map(p => ({ ...p }));
    const idx = before.findIndex(p => p.week_number === weekNumber);
    let after;
    if (idx >= 0) {
      after = before.map((p, i) => (i === idx ? { ...p, ...patch } : p));
    } else {
      after = [
        ...before,
        { week_number: weekNumber, sets: null, reps: '', target_value: '', rest_seconds: null, ...patch },
      ];
    }
    if (weekNumber === 1) {
      const oldWk1 = before.find(p => p.week_number === 1) || {};
      const newWk1 = after.find(p => p.week_number === 1) || {};
      after = cascadeWk1Edit(after, oldWk1, newWk1);
    }
    after.sort((a, b) => a.week_number - b.week_number);
    onChange({ week_prescriptions: after });
  };

  const applyPattern = (next) => {
    next.sort((a, b) => a.week_number - b.week_number);
    onChange({ week_prescriptions: next });
  };

  const setRestAll = (seconds) => {
    const next = prescriptions.map(p => ({ ...p, rest_seconds: seconds }));
    onChange({ week_prescriptions: next });
  };

  // Rest is per-week in the data model; surface the Wk1 value as the
  // "default" badge on the row. If multiple weeks have varying rest,
  // we still show the Wk1 figure — the LoadingPopover handles per-week
  // adjustments.
  const restLabel = fmtRest(wk1?.rest_seconds);

  // Tinted background for supersetted rows so the link reads visually.
  const bgClass = (linkedToPrev || linkedToNext)
    ? 'bg-[rgba(165,141,105,0.04)] group-hover:bg-[rgba(165,141,105,0.08)]'
    : 'bg-white group-hover:bg-[#FAFAFA]';

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      className={`group flex items-stretch transition-colors ${
        (linkedToPrev || linkedToNext) ? 'hover:bg-[rgba(165,141,105,0.06)]' : 'hover:bg-[#FAFAFA]'
      }`}
      style={{
        borderTop: isDropTarget ? '2px solid #437E8D' : '2px solid transparent',
      }}
    >
      {/* Sticky-left fixed area */}
      <div
        className={`sticky left-0 z-10 ${bgClass} flex items-stretch gap-2.5 pl-3 pr-3 py-3.5`}
        style={{
          width: ROW_STICKY_WIDTH,
          minWidth: ROW_STICKY_WIDTH,
          borderRight: '1px solid #e5e7eb',
          // Suppress the row divider when this row chains into the next
          // — the SupersetLinkButton + breathing gap below carries the
          // visual separation.
          borderBottom: linkedToNext ? 'none' : '1px solid #f3f4f6',
        }}
      >
        <div
          className="flex items-center cursor-grab text-gray-300 hover:text-gray-500 transition-colors shrink-0"
          title="Drag to reorder"
        >
          <GripVertical size={14} />
        </div>

        {/* Accent stripe — wider when supersetted so the chain reads clearly */}
        <div
          className="shrink-0 self-stretch"
          style={{
            width: linkedToPrev || linkedToNext ? 4 : 3,
            borderRadius: linkedToPrev || linkedToNext ? 0 : 2,
            backgroundColor: linkedToPrev || linkedToNext ? '#A58D69' : accentColour,
          }}
        />

        <div className="flex-1 min-w-0">
          {replacing ? (
            <ExerciseSearchDropdown
              autoFocus
              label={null}
              placeholder="Replace with…"
              initialQuery={exercise.exercise_name || ''}
              selectOnFocus
              onSelect={handleReplaceSelect}
              onClose={() => setReplacing(false)}
            />
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReplacing(true)}
                className="text-body font-semibold truncate text-left hover:underline decoration-dotted underline-offset-4"
                style={{ color: '#1C1C1C' }}
                title="Click to replace exercise"
              >
                {exercise.exercise_name}
              </button>
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <select
              value={ptype}
              onChange={(e) => onChange({ prescription_type: e.target.value })}
              className="text-micro font-semibold uppercase px-2 py-0.5 rounded-full border-0 focus:outline-none cursor-pointer appearance-none"
              style={{
                color: '#437E8D',
                backgroundColor: 'rgba(67,126,141,0.08)',
                paddingRight: 8,
              }}
              title="Prescription type"
            >
              {PRESCRIPTION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {restLabel && (
              <span
                className="inline-flex items-center gap-1 text-micro font-semibold uppercase px-2 py-0.5 rounded-full"
                style={{ color: '#52525b', backgroundColor: 'rgba(15,15,15,0.05)' }}
                title={`Rest: ${restLabel}`}
              >
                <Clock size={10} />
                {restLabel}
              </span>
            )}

            {weeks > 1 && (
              <LoadingPopover
                prescriptions={prescriptions}
                onApply={applyPattern}
                onSetRestAll={setRestAll}
              />
            )}

            <input
              value={exercise.notes || ''}
              onChange={(e) => onChange({ notes: e.target.value })}
              placeholder="+ Add note"
              className="flex-1 min-w-[60px] text-meta italic focus:outline-none placeholder:italic bg-transparent"
              style={{ color: '#6b7280' }}
            />
          </div>
        </div>

        <button
          onClick={onRemove}
          className="self-start mt-0.5 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 hover:text-red-500 transition-all shrink-0"
          style={{ color: '#9ca3af' }}
          title="Remove exercise"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Week columns */}
      <div className="flex">
        {Array.from({ length: weeks }, (_, i) => {
          const wk = i + 1;
          const wp = prescriptions.find(p => p.week_number === wk)
            || { week_number: wk, sets: null, reps: '', target_value: '', rest_seconds: null };
          const inherited = isInheritedFromWk1(wp, wk1);
          return (
            <WeekCell
              key={wk}
              prescription={wp}
              prescriptionType={ptype}
              inherited={inherited}
              weekNumber={wk}
              isCurrent={currentWk != null && wk === currentWk}
              overrideExerciseName={wp.override_exercise_name || null}
              onClearOverride={() => clearOverrideForWeek(wk)}
              onChange={(patch) => updateWeek(wk, patch)}
              width={WEEK_COL_WIDTH}
            />
          );
        })}
      </div>

      {/* Scope dialog — gates every exercise replace so coaches don't
          accidentally wipe a multi-week progression. */}
      {pendingSwap && (
        <ScopeDialog
          fromName={exercise.exercise_name}
          toName={pendingSwap.lib.name}
          weeks={weeks}
          currentWk={currentWk}
          onCancel={() => setPendingSwap(null)}
          onConfirm={applySwapWithScope}
        />
      )}
    </div>
  );
}

// ─── ScopeDialog ──────────────────────────────────────────────────────
// Asks the coach which weeks the exercise replacement should land on.
// Sits above the modal (z-[110]) and uses the same gold call-to-action
// styling as the rest of the builder.
function ScopeDialog({ fromName, toName, weeks, currentWk, onCancel, onConfirm }) {
  // currentWk being non-null is our signal that we're in athlete mode
  // (block dates known). Template mode skips per-week overrides because
  // saveBlockTemplate doesn't round-trip override_exercise_id — so the
  // Specific Weeks option hides there and we fall through to row-wide
  // replace by default.
  const athleteMode = currentWk != null;
  const clampedCurrent = currentWk && currentWk >= 1 && currentWk <= weeks
    ? currentWk
    : null;

  const [scope, setScope] = useState('entire_block');
  const [picked, setPicked] = useState(() => clampedCurrent ? new Set([clampedCurrent]) : new Set());

  const togglePick = (w) => {
    setPicked(prev => {
      const next = new Set(prev);
      if (next.has(w)) next.delete(w); else next.add(w);
      return next;
    });
  };

  const canConfirm = scope !== 'specific' || picked.size > 0;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-xl w-[460px] max-w-[92vw] p-5 shadow-xl">
        <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: '#9ca3af' }}>
          Replace exercise · which weeks?
        </p>
        <h3 className="text-sm font-bold mb-4" style={{ color: '#1C1C1C' }}>
          {fromName} → {toName}
        </h3>

        <div className="space-y-2 mb-4">
          <ScopeRadio
            label={`Entire block (Week 1–${weeks})`}
            help="Replaces the row's base exercise. Clears any per-week overrides."
            value="entire_block" current={scope} onChange={setScope}
          />
          <ScopeRadio
            label="Specific weeks"
            help={athleteMode ? null : 'Block dates not set — only available in athlete mode.'}
            value="specific" current={scope} onChange={setScope}
            disabled={!athleteMode}
          />
          {scope === 'specific' && (
            <div className="pl-6 pt-1 grid grid-cols-6 gap-1">
              {Array.from({ length: weeks }, (_, i) => i + 1).map(w => {
                const on = picked.has(w);
                const isCurrent = w === clampedCurrent;
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => togglePick(w)}
                    className="text-[11px] font-semibold py-1 rounded border transition-colors relative"
                    style={{
                      borderColor: on ? '#A58D69' : '#e5e7eb',
                      backgroundColor: on ? 'rgba(165,141,105,0.15)' : '#fff',
                      color: on ? '#A58D69' : '#6b7280',
                    }}
                    title={isCurrent ? 'Current week' : undefined}
                  >
                    Wk {w}{isCurrent ? ' •' : ''}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold px-3 py-1.5"
            style={{ color: '#6b7280' }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => onConfirm(scope, scope === 'specific' ? Array.from(picked) : null)}
            className="text-xs font-semibold px-4 py-1.5 rounded text-white disabled:opacity-50"
            style={{ backgroundColor: '#A58D69' }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

function ScopeRadio({ label, help, value, current, onChange, disabled = false }) {
  return (
    <label
      className={`flex flex-col gap-0.5 cursor-pointer ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <span className="flex items-center gap-2 text-xs font-medium" style={{ color: '#1C1C1C' }}>
        <input
          type="radio" disabled={disabled}
          checked={current === value}
          onChange={() => onChange(value)}
        />
        {label}
      </span>
      {help && (
        <span className="text-[10px] italic pl-6" style={{ color: '#9ca3af' }}>
          {help}
        </span>
      )}
    </label>
  );
}
