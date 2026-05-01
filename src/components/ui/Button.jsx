import { forwardRef } from 'react';

/**
 * The single button primitive used across coach AMS and athlete app.
 *
 *   variant   primary | secondary | ghost | danger
 *   size      sm | md | lg
 *   tone      light (default) | dark    — flips colours for dark surfaces
 *
 * Light vs dark only differs for `secondary` and `ghost` (where the
 * neutral surface colour matters). Primary is always gold; danger
 * always red — they read on either background.
 */
const SIZES = {
  sm: 'h-8  px-3 text-meta gap-1.5',
  md: 'h-10 px-4 text-body gap-2',
  lg: 'h-12 px-5 text-body gap-2',
};

const VARIANTS = {
  light: {
    primary:   'bg-gold-500 text-white hover:bg-gold-600 active:bg-gold-700 shadow-xs',
    secondary: 'bg-ink-100  text-ink-800 hover:bg-ink-200 active:bg-ink-300',
    ghost:     'bg-transparent text-ink-700 hover:bg-ink-100 active:bg-ink-200',
    danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  },
  dark: {
    primary:   'bg-gold-500 text-ink-900 hover:bg-gold-400 active:bg-gold-600 shadow-xs',
    secondary: 'bg-surface-800 text-ink-100 hover:bg-surface-700',
    ghost:     'bg-transparent text-ink-300 hover:bg-surface-800',
    danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  },
};

const Button = forwardRef(function Button({
  variant = 'primary',
  size    = 'md',
  tone    = 'light',
  className = '',
  disabled = false,
  type = 'button',
  children,
  ...props
}, ref) {
  const sizeClasses    = SIZES[size]    || SIZES.md;
  const variantClasses = (VARIANTS[tone] || VARIANTS.light)[variant] || VARIANTS.light.primary;
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center font-semibold rounded-md',
        'transition-colors duration-150 ease-soft',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.99]',
        sizeClasses,
        variantClasses,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
