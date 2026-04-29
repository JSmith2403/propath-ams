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

/**
 * WeekCell — single-week prescription block (sets x reps + target).
 * Stacked vertically inside a fixed-width column so all weeks line up.
 */
export default function WeekCell({ prescription, prescriptionType, onChange, width = 100 }) {
  const wp = prescription || { sets: null, reps: '', target_value: '', rest_seconds: null };
  const ptype = prescriptionType || 'reps_only';

  return (
    <div
      className="shrink-0 px-1.5 py-1 flex flex-col gap-1"
      style={{ width }}
    >
      <div className="flex items-center gap-1 justify-center">
        <input
          type="number"
          min={1}
          value={wp.sets ?? ''}
          onChange={(e) => onChange({ sets: e.target.value ? Number(e.target.value) : null })}
          className="w-8 px-1 py-0.5 text-[10px] text-center rounded border border-gray-200 focus:outline-none focus:border-gray-300"
          placeholder="—"
          title="Sets"
        />
        <span className="text-[10px]" style={{ color: '#9ca3af' }}>×</span>
        <input
          type="text"
          value={wp.reps ?? ''}
          onChange={(e) => onChange({ reps: e.target.value })}
          className="w-10 px-1 py-0.5 text-[10px] text-center rounded border border-gray-200 focus:outline-none focus:border-gray-300"
          placeholder="—"
          title="Reps"
        />
      </div>
      {ptype !== 'reps_only' && (
        <input
          type="text"
          value={wp.target_value ?? ''}
          onChange={(e) => onChange({ target_value: e.target.value })}
          className="w-full px-1 py-0.5 text-[10px] text-center rounded border border-gray-200 focus:outline-none focus:border-gray-300"
          placeholder={PLACEHOLDER[ptype] || ''}
          title="Target"
        />
      )}
    </div>
  );
}
