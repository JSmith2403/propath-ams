import { GripVertical, Trash2 } from 'lucide-react';
import WeekCell from './WeekCell';

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
export const WEEK_COL_WIDTH   = 110;

/**
 * SessionExerciseRow — one exercise inside a section. Sticky-left
 * columns (drag, accent, name+note, prescription type) stay visible
 * while the week columns scroll horizontally inside the parent.
 */
export default function SessionExerciseRow({
  exercise,
  accentColour,
  weeks,
  onChange,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnter,
  onDragLeave,
  isDropTarget,
}) {
  const ptype = exercise.prescription_type || exercise.default_prescription_type || 'reps_only';
  const prescriptions = exercise.week_prescriptions || [];

  const updateWeek = (weekNumber, patch) => {
    const next = prescriptions.slice();
    const idx = next.findIndex(p => p.week_number === weekNumber);
    if (idx >= 0) next[idx] = { ...next[idx], ...patch };
    else next.push({ week_number: weekNumber, sets: null, reps: '', target_value: '', rest_seconds: null, ...patch });
    next.sort((a, b) => a.week_number - b.week_number);
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
      className="group flex items-stretch transition-colors hover:bg-gray-50"
      style={{
        borderTop: isDropTarget ? '2px solid #437E8D' : '2px solid transparent',
      }}
    >
      {/* Sticky-left fixed area */}
      <div
        className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 flex items-stretch gap-2 px-2 py-2"
        style={{
          width: ROW_STICKY_WIDTH,
          minWidth: ROW_STICKY_WIDTH,
          borderRight: '1px solid #f3f4f6',
        }}
      >
        {/* Drag handle */}
        <div
          className="flex items-center cursor-grab text-gray-300 hover:text-gray-500 transition-colors shrink-0"
          title="Drag to reorder"
        >
          <GripVertical size={14} />
        </div>

        {/* Section accent bar */}
        <div
          className="shrink-0 self-stretch"
          style={{ width: 4, borderRadius: 2, backgroundColor: accentColour }}
        />

        {/* Name + coach note */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate" style={{ color: '#1C1C1C' }}>
            {exercise.exercise_name}
            {exercise.bilateral_unilateral === 'unilateral' && (
              <span className="ml-2 text-[10px] font-normal" style={{ color: '#9ca3af' }}>
                (unilateral)
              </span>
            )}
          </div>
          <input
            value={exercise.notes || ''}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="+ Add note"
            className="w-full mt-0.5 text-[11px] focus:outline-none placeholder:italic bg-transparent"
            style={{ color: '#6b7280' }}
          />
        </div>

        {/* Prescription type */}
        <div className="flex items-center shrink-0">
          <select
            value={ptype}
            onChange={(e) => onChange({ prescription_type: e.target.value })}
            className="text-[11px] px-2 py-1 rounded border border-gray-200 bg-white focus:outline-none focus:border-gray-300"
            style={{ color: '#1C1C1C' }}
          >
            {PRESCRIPTION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Trash */}
        <button
          onClick={onRemove}
          className="flex items-center opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-opacity shrink-0 self-center"
          style={{ color: '#dc2626' }}
          title="Remove exercise"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Week columns (scrolling area) */}
      <div className="flex">
        {Array.from({ length: weeks }, (_, i) => {
          const wk = i + 1;
          const wp = prescriptions.find(p => p.week_number === wk)
            || { week_number: wk, sets: null, reps: '', target_value: '', rest_seconds: null };
          return (
            <WeekCell
              key={wk}
              prescription={wp}
              prescriptionType={ptype}
              onChange={(patch) => updateWeek(wk, patch)}
              width={WEEK_COL_WIDTH}
            />
          );
        })}
      </div>
    </div>
  );
}
