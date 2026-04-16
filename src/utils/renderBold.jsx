/**
 * Render text with **bold** markdown support.
 * Converts **text** patterns to <strong> elements.
 * Preserves whitespace and line breaks.
 */
export function renderBold(text) {
  if (!text) return text;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
