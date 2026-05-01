/**
 * Standard card surface. Use everywhere a contained block of content
 * would have its own background + border. Replaces the inline
 * `bg-white rounded-xl border border-gray-100` patterns sprinkled
 * across the AMS, and the `bg-[#1F1F1F] border [#262626]` pattern in
 * the athlete app.
 *
 *   tone     light (coach AMS) | dark (athlete app)
 *   padding  none | sm | md | lg
 *   accent   none | gold        — adds a gold left border for "active" cards
 *   onClick  makes the card behave as a button (cursor + hover lift)
 */
const TONES = {
  light: 'bg-white border border-ink-100',
  dark:  'bg-surface-850 border border-surface-800',
};

const PADDING = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-5',
};

export default function Card({
  tone = 'light',
  padding = 'md',
  accent = 'none',
  onClick,
  className = '',
  style,
  children,
  ...props
}) {
  const interactive = !!onClick;
  return (
    <div
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={[
        'rounded-lg shadow-card',
        TONES[tone] || TONES.light,
        PADDING[padding] || PADDING.md,
        accent === 'gold' ? 'border-l-[3px] border-l-gold-500' : '',
        interactive ? 'cursor-pointer transition-shadow duration-200 ease-soft hover:shadow-raised' : '',
        className,
      ].filter(Boolean).join(' ')}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
