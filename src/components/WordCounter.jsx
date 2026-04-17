/**
 * Live word count indicator for Assessment note fields.
 * Grey under the limit, red over it. Non-blocking — purely visual guidance.
 */
export default function WordCounter({ text, limit = 150 }) {
  const count = (text || '').trim().split(/\s+/).filter(Boolean).length;
  const over = count > limit;
  return (
    <p className="text-xs mt-1 no-print print-hide"
      style={{ color: over ? '#b91c1c' : '#9ca3af' }}>
      {count} / {limit} words
    </p>
  );
}
