/**
 * Live word count indicator for Assessment note fields.
 *
 * Modes:
 *   soft (default) — grey under the limit, red over it, no hard cap
 *   hard           — grey under the limit, red at the limit, user cannot type beyond
 *                    (enforcement is handled by the caller via the limitWords helper)
 */
export default function WordCounter({ text, limit = 150, hard = false }) {
  const count = countWords(text);
  const atOrOver = hard ? count >= limit : count > limit;
  return (
    <p className="text-xs mt-1 no-print print-hide"
      style={{ color: atOrOver ? '#b91c1c' : '#9ca3af' }}>
      {count} / {limit} words
    </p>
  );
}

/**
 * Count whitespace-delimited words.
 */
export function countWords(text) {
  return (text || '').trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Truncate a string to at most `limit` words, preserving inter-word spacing
 * up to but not including the overflow word. Used to enforce a hard cap on
 * input without stripping the trailing space the user may still be typing.
 */
export function limitWords(text, limit) {
  if (!text) return text;
  // Count existing words and allow free typing until we exceed the limit.
  const words = text.split(/\s+/);
  const nonEmpty = words.filter(Boolean);
  if (nonEmpty.length <= limit) return text;
  // Rebuild with only the first `limit` non-empty words, preserving the
  // leading whitespace pattern between them.
  const out = [];
  let remaining = limit;
  for (const tok of words) {
    if (tok === '') { out.push(tok); continue; }
    if (remaining <= 0) break;
    out.push(tok);
    remaining -= 1;
  }
  return out.join(' ');
}
