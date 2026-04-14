const COLOURS = { green: '#22c55e', amber: '#f59e0b', red: '#ef4444' };

/**
 * A small SVG donut ring for a single wellness metric.
 * Props: value, max, colour ('green'|'amber'|'red'), label, size (px)
 */
export default function WellnessDonutRing({ value, max, colour = 'green', label, size = 36 }) {
  const strokeWidth = 3.5;
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circ * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Unfilled ring — light grey */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Filled arc */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={COLOURS[colour]}
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {label && (
        <span
          className="text-gray-400 text-center leading-tight"
          style={{ fontSize: 7, maxWidth: size + 4, wordWrap: 'break-word' }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
