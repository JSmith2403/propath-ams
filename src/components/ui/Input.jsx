import { forwardRef } from 'react';

/**
 * Form input primitive. Wraps either <input> or <select>. Light + dark
 * tones share the same shape, only colours differ.
 *
 *   tone  light (default) | dark
 *   size  sm | md
 */
const SIZES = {
  sm: 'h-8  px-2.5 text-meta',
  md: 'h-10 px-3   text-body',
};

const TONES = {
  light: 'bg-white text-ink-900 border border-ink-200 hover:border-ink-300 focus:border-gold-500',
  dark:  'bg-surface-800 text-ink-100 border border-surface-700 hover:border-ink-500 focus:border-gold-500',
};

const Input = forwardRef(function Input({
  as = 'input',
  tone = 'light',
  size = 'md',
  className = '',
  ...props
}, ref) {
  const Tag = as;
  return (
    <Tag
      ref={ref}
      className={[
        'w-full rounded-md outline-none transition-colors duration-150 ease-soft',
        SIZES[size] || SIZES.md,
        TONES[tone] || TONES.light,
        'placeholder:text-ink-400',
        className,
      ].join(' ')}
      {...props}
    />
  );
});

export default Input;
