import WellnessDonutRing from './WellnessDonutRing';
import { getMetricColour } from '../../utils/wellnessFlags';

const METRICS = [
  { key: 'sleep_duration',  label: 'Slp',  max: 12 },
  { key: 'sleep_quality',   label: 'SQ',   max: 7 },
  { key: 'fatigue',         label: 'Fat',  max: 7 },
  { key: 'muscle_soreness', label: 'MS',   max: 7 },
  { key: 'stress',          label: 'Str',  max: 7 },
];

export default function WellnessMiniRings({ submission, date }) {
  return (
    <div>
      <div className="flex items-center justify-center gap-2">
        {METRICS.map((m) => {
          const val = Number(submission[m.key]);
          const colour = getMetricColour(m.key, val);
          return (
            <WellnessDonutRing
              key={m.key}
              value={val}
              max={m.max}
              colour={colour}
              label={m.label}
              size={26}
            />
          );
        })}
      </div>
      {date && (
        <p className="text-center mt-1" style={{ fontSize: 9, color: '#9ca3af' }}>
          {new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </p>
      )}
    </div>
  );
}
