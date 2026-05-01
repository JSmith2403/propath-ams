/**
 * Tiny inline SVG sparkline used by the wellness trend tiles.
 * Pure presentational — caller passes an array of numbers, oldest first.
 */
export default function Sparkline({ values, width = 100, height = 28, colour = '#A58D69' }) {
  if (!values || values.length < 2) return <div style={{ width, height }} />;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);

  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  // Last point gets a dot for emphasis.
  const [lastX, lastY] = points[points.length - 1].split(',').map(Number);

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline
        fill="none"
        stroke={colour}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(' ')}
      />
      <circle cx={lastX} cy={lastY} r={2.5} fill={colour} />
    </svg>
  );
}
