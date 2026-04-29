import { useState } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import WeekCell from './WeekCell';
import LoadingPopover from './LoadingPopover';
import ExerciseSearchDropdown from './ExerciseSearchDropdown';
import { cascadeWk1Edit, isInheritedFromWk1 } from './loadingPatterns';

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
  const [replacing, setReplacing] = useState(false);

  const handleReplaceSelect = (lib) => {
    onChange({
      exercise_id:               lib.id,
      exercise_name:             lib.name,
      category:                  lib.category,
      bilateral_unilateral:      lib.bilateral_unilateral,
      default_prescription_type: lib.default_prescription_type,
      // Adopt the new exercise's prescription type by default — coach
      // can change it back via the pill if they want.
      prescription_type:         lib.default_prescription_type,
    });
    setReplacing(false);
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

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      className="group flex items-stretch transition-colors hover:bg-[#FAFAFA]"
      style={{
        borderTop: isDropTarget ? '2px solid #437E8D' : '2px solid transparent',
      }}
    >
      {/* Sticky-left fixed area */}
      <div
        className="sticky left-0 z-10 bg-white group-hover:bg-[#FAFAFA] flex items-stretch gap-2.5 pl-3 pr-3 py-2.5"
        style={{
          width: ROW_STICKY_WIDTH,
          minWidth: ROW_STICKY_WIDTH,
          borderRight: '1px solid #e5e7eb',
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <div
          className="flex items-center cursor-grab text-gray-300 hover:text-gray-500 transition-colors shrink-0"
          title="Drag to reorder"
        >
          <GripVertical size={14} />
        </div>

        <div
          className="shrink-0 self-stretch"
          style={{
            width: linkedToPrev || linkedToNext ? 4 : 3,
            borderRadius: linkedToPrev || linkedToNext ? 0 : 2,
            backgroundColor: accentColour,
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
                className="text-[15px] font-medium truncate text-left hover:underline decoration-dotted underline-offset-4"
                style={{ color: '#1C1C1C' }}
                title="Click to replace exercise"
              >
                {exercise.exercise_name}
              </button>
              {exercise.bilateral_unilateral === 'unilateral' && (
                <span className="text-[10px] shrink-0" style={{ color: '#9ca3af' }}>uni</span>
              )}
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <select
              value={ptype}
              onChange={(e) => onChange({ prescription_type: e.target.value })}
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border-0 focus:outline-none cursor-pointer appearance-none"
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
              className="flex-1 min-w-[60px] text-[12px] italic focus:outline-none placeholder:italic bg-transparent"
              style={{ color: '#6b7280' }}
            />
          </div>
        </div>

        <button
          onClick={onRemove}
          className="self-start mt-0.5 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 transition-opacity shrink-0"
          style={{ color: '#9ca3af' }}
          title="Remove exercise"
        >
          <Trash2 size={12} />
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
              onChange={(patch) => updateWeek(wk, patch)}
              width={WEEK_COL_WIDTH}
            />
          );
        })}
      </div>
    </div>
  );
}
