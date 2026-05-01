/**
 * Circular avatar with initials fallback. Sizes match the spacing
 * scale so multiple avatars line up cleanly with adjacent inputs.
 *
 *   size: xs (24) | sm (32) | md (40) | lg (56) | xl (96)
 *   tone: light  | dark
 */
const SIZES = {
  xs: { px: 24, text: 'text-[10px]' },
  sm: { px: 32, text: 'text-caption' },
  md: { px: 40, text: 'text-meta'    },
  lg: { px: 56, text: 'text-body'    },
  xl: { px: 96, text: 'text-h3'      },
};

function initialsOf(name) {
  if (!name) return '·';
  const parts = String(name).trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase()).join('');
}

export default function Avatar({
  src,
  name,
  size = 'md',
  tone = 'light',
  border = false,
  className = '',
}) {
  const cfg = SIZES[size] || SIZES.md;
  const ringClass = border
    ? (tone === 'dark' ? 'ring-1 ring-gold-500' : 'ring-1 ring-ink-100')
    : '';

  return (
    <div
      className={[
        'rounded-full overflow-hidden flex items-center justify-center shrink-0 select-none',
        tone === 'dark' ? 'bg-surface-800 text-gold-500' : 'bg-ink-100 text-ink-600',
        ringClass,
        cfg.text,
        className,
      ].join(' ')}
      style={{ width: cfg.px, height: cfg.px }}
    >
      {src
        ? <img src={src} alt={name || ''} className="w-full h-full object-cover" />
        : <span className="font-semibold tracking-wide">{initialsOf(name)}</span>}
    </div>
  );
}
