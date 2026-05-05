import { X } from 'lucide-react';

const PLACEHOLDER = {
  kg:            '60kg',
  percent_1rm:   '70%',
  velocity_zone: '0.3-0.5',
  rir:           'RIR 2',
  rpe:           'RPE 8',
  time:          '30s',
  reps_only:     '',
  band_colour:   'red',
};

const TARGET_LABEL = {
  kg:            'Load',
  percent_1rm:   'Load',
  velocity_zone: 'Vel.',
  rir:           'RIR',
  rpe:           'RPE',
  time:          'Time',
  reps_only:     '',
  band_colour:   'Band',
};

/**
 * WeekCell — single-week prescription rendered HORIZONTALLY:
 *
 *    Sets │ Reps │ Load
 *      3  │  8   │ 75%
 *
 * Visual model:
 *  - Real grid lines (left + bottom borders) so columns and rows form
 *    an unmistakable matrix.
 *  - Even-numbered weeks (Wk2, Wk4, Wk6…) get a near-imperceptible
 *    background tint for spreadsheet-style column rhythm.
 *  - Inherited cells (matching Wk1) drop to 65% opacity — readable,
 *    but visually subordinate to deliberately-edited values.
 *  - Hover/focus brings any cell to full opacity + light hover tint.
 */
export default function WeekCell({
  prescription,
  prescriptionType,
  inherited = false,
  weekNumber = 1,
  isCurrent = false,
  overrideExerciseName = null,
  onClearOverride,
  onChange,
  width = 160,
}) {
  const wp = prescription || { sets: null, reps: '', target_value: '', rest_seconds: null };
  const ptype = prescriptionType || 'reps_only';
  const showTarget = ptype !== 'reps_only';
  const targetLabel = TARGET_LABEL[ptype] || 'Load';
  const isEvenWeek = weekNumber % 2 === 0;
  const swapped = !!overrideExerciseName;

  const divider = <span className="text-[12px] select-none" style={{ color: '#e5e7eb' }}>│</span>;

  // Cell background — swapped cells get a soft gold tint so the
  // per-week override is unmistakable. Current week gets a faint
  // gold underline accent on hover so coaches orient quickly.
  const cellBg = swapped
    ? 'rgba(165,141,105,0.10)'
    : isEvenWeek ? '#FCFCFD' : '#fff';

  return (
    <div
      className="group/cell shrink-0 flex flex-col justify-center px-2 py-2.5 transition-all hover:bg-[#F3F6F8] focus-within:bg-[#F3F6F8]"
      style={{
        width,
        borderLeft: '1px solid #e5e7eb',
        borderBottom: '1px solid #f3f4f6',
        backgroundColor: cellBg,
        boxShadow: isCurrent ? 'inset 0 -2px 0 rgba(165,141,105,0.55)' : 'none',
        opacity: inherited && !swapped ? 0.65 : 1,
      }}
      onMouseEnter={(e) => { if (inherited && !swapped) e.currentTarget.style.opacity = 1; }}
      onMouseLeave={(e) => { if (inherited && !swapped) e.currentTarget.style.opacity = 0.65; }}
      onFocus={(e) => { if (inherited && !swapped) e.currentTarget.style.opacity = 1; }}
    >
      {/* Per-week swap indicator — only shown when override_exercise_id
          is set on this week's prescription. Coach can ✕ to restore
          the row's base exercise for this week alone. */}
      {swapped && (
        <div className="flex items-center gap-1 mb-1.5">
          <span
            className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded truncate"
            style={{ color: '#A58D69', backgroundColor: 'rgba(165,141,105,0.20)' }}
            title={`Swapped to ${overrideExerciseName}`}
          >
            Now: {overrideExerciseName}
          </span>
          {onClearOverride && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClearOverride(); }}
              className="ml-auto p-0.5 rounded hover:bg-white/70 shrink-0 transition-colors"
              title="Restore the row's base exercise for this week"
            >
              <X size={10} style={{ color: '#A58D69' }} />
            </button>
          )}
        </div>
      )}

      {/* Mini headers */}
      <div className="flex items-center justify-around text-[9px] font-semibold uppercase tracking-wider leading-none" style={{ color: '#b8b8b8' }}>
        <span className="w-9 text-center">Sets</span>
        {divider}
        <span className="w-9 text-center">Reps</span>
        {showTarget && (
          <>
            {divider}
            <span className="w-12 text-center">{targetLabel}</span>
          </>
        )}
      </div>

      {/* Values */}
      <div className="flex items-center justify-around mt-1.5 leading-none">
        <input
          inputMode="numeric"
          value={wp.sets ?? ''}
          onChange={(e) => onChange({ sets: e.target.value ? Number(e.target.value) : null })}
          className="w-9 text-center tabular-nums text-[15px] font-semibold bg-transparent border-0 focus:outline-none placeholder:text-gray-300"
          style={{ color: '#1C1C1C' }}
          placeholder="—"
          title="Sets"
        />
        {divider}
        <input
          value={wp.reps ?? ''}
          onChange={(e) => onChange({ reps: e.target.value })}
          className="w-9 text-center tabular-nums text-[15px] font-semibold bg-transparent border-0 focus:outline-none placeholder:text-gray-300"
          style={{ color: '#1C1C1C' }}
          placeholder="—"
          title="Reps"
        />
        {showTarget && (
          <>
            {divider}
            <input
              value={wp.target_value ?? ''}
              onChange={(e) => onChange({ target_value: e.target.value })}
              placeholder={PLACEHOLDER[ptype] || '—'}
              className="w-12 text-center tabular-nums text-[15px] font-semibold bg-transparent border-0 focus:outline-none placeholder:text-gray-300 placeholder:not-italic"
              style={{ color: '#1C1C1C' }}
              title="Target"
            />
          </>
        )}
      </div>
    </div>
  );
}
