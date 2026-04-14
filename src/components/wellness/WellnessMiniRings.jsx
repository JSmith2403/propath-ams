import WellnessDonutRing from './WellnessDonutRing';
import { getMetricColour } from '../../utils/wellnessFlags';

const METRICS = [
  { key: 'sleep_duration',  label: 'Sleep',    max: 12 },
  { key: 'sleep_quality',   label: 'Quality',  max: 7 },
  { key: 'fatigue',         label: 'Fatigue',  max: 7 },
  { key: 'muscle_soreness', label: 'Soreness', max: 7 },
  { key: 'stress',          label: 'Stress',   max: 7 },
];

export default function WellnessMiniRings({ submission, date }) {
  return (
    <div>
      {date && (
        <p className="text-center mb-1.5" style={{ fontSize: 9, color: '#9ca3af' }}>
          {new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </p>
      )}
      <div className="flex items-start justify-between">
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
              size={36}
            />
          );
        })}
      </div>
    </div>
  );
}
