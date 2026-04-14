const COLOURS = { green: '#22c55e', amber: '#f59e0b', red: '#ef4444' };
const BG      = { green: '#dcfce7', amber: '#fef9c3', red: '#fee2e2' };

/**
 * A tiny SVG donut ring for a single wellness metric.
 * Props: value, max, colour ('green'|'amber'|'red'), label, size (px)
 */
export default function WellnessDonutRing({ value, max, colour = 'green', label, size = 28 }) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circ * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={BG[colour]}
          strokeWidth={3}
        />
        {/* Value arc */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={COLOURS[colour]}
          strokeWidth={3}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {label && (
        <span className="text-gray-400 leading-none" style={{ fontSize: 8 }}>{label}</span>
      )}
    </div>
  );
}
