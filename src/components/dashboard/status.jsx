/** The small round status marks on the coach dashboard: a sessions ring and a state disc. */

const TEAL = '#437E8D';
const AMBER = '#C9982E';

/** Sessions done of planned this week, as a ring with "1/3" in the middle. */
export function SessionRing({ done, planned, size = 40 }) {
  const r = 14, c = 2 * Math.PI * r;
  const pct = planned ? Math.min(1, done / planned) : 0;
  const idle = planned > 0 && done === 0;
  const label = planned ? `Sessions this week: ${done} of ${planned} done` : 'No sessions planned this week';
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }} title={label}>
      <svg viewBox="0 0 36 36" width={size} height={size} role="img" aria-label={label}>
        <circle cx="18" cy="18" r={r} fill="none" stroke="#e5e5e7" strokeWidth="5" />
        {pct > 0 && <circle cx="18" cy="18" r={r} fill="none" stroke={TEAL} strokeWidth="5" strokeDasharray={`${pct * c} ${c}`} transform="rotate(-90 18 18)" />}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold" style={{ color: idle ? '#8a4510' : '#1C1C1C' }}>
        {planned ? `${done}/${planned}` : '–'}
      </span>
    </span>
  );
}

// kind → how the disc looks. Dashed = no data, so nothing is implied.
const DISC = {
  green: { glyph: '✓', bg: '#15803d', fg: '#ffffff', border: '#15803d', dashed: false },
  amber: { glyph: '!', bg: AMBER, fg: '#1C1C1C', border: AMBER, dashed: false },
  red: { glyph: '!', bg: '#b91c1c', fg: '#ffffff', border: '#b91c1c', dashed: false },
  ok: { glyph: '•', bg: TEAL, fg: '#ffffff', border: TEAL, dashed: false },
  silent: { glyph: '!', bg: '#ffffff', fg: '#8a4510', border: AMBER, dashed: true },
  none: { glyph: '–', bg: '#ffffff', fg: '#71717a', border: '#9a9aa0', dashed: true },
};

export function StateDisc({ kind, title, size = 28 }) {
  const d = DISC[kind] || DISC.none;
  return (
    <span title={title} aria-label={title} role="img"
      className="inline-flex items-center justify-center rounded-full font-bold shrink-0"
      style={{ width: size, height: size, background: d.bg, color: d.fg, fontSize: size * 0.5, border: `2px ${d.dashed ? 'dashed' : 'solid'} ${d.border}`, boxSizing: 'border-box' }}>
      {d.glyph}
    </span>
  );
}

export const TONE = {
  act: { fg: '#b91c1c', bg: '#fef2f2' },
  watch: { fg: '#8a4510', bg: '#fffbeb' },
  grey: { fg: '#52525b', bg: '#f4f4f5' },
  go: { fg: '#15803d', bg: 'transparent' },
};
