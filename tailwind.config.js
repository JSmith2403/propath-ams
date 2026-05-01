/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ── Brand palette ────────────────────────────────────────────────────
      // Use semantic names where possible. Numeric ramps follow Tailwind's
      // 50-950 convention so utilities like bg-gold-100 / text-gold-700
      // work without surprises.
      colors: {
        propath: {
          dark:    '#1C1C1C',
          gold:    '#A58D69',
          teal:    '#437E8D',
          navy:    '#085777',
        },
        gold: {
          50:  '#faf7f2',
          100: '#f1eadc',
          200: '#e2d4b9',
          300: '#cdb88e',
          400: '#b89e72',
          500: '#A58D69',
          600: '#8d774f',
          700: '#6f5e3e',
          800: '#52462f',
          900: '#332c1e',
        },
        teal: {
          50:  '#f1f6f8',
          100: '#dfe9ed',
          200: '#bfd3da',
          300: '#8eb3bf',
          400: '#5e8e9e',
          500: '#437E8D',
          600: '#346574',
          700: '#28505d',
          800: '#1d3a44',
          900: '#13242b',
        },
        ink: {
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e5e5e7',
          300: '#d1d1d4',
          400: '#9a9aa0',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#1C1C1C',
        },
        // Dark surface tokens — used by athlete app + any future dark UI
        surface: {
          950: '#0F0F0F',  // outer frame
          900: '#1C1C1C',  // page bg
          850: '#1F1F1F',  // card bg (default)
          800: '#262626',  // card bg (raised) / inputs
          700: '#333333',  // borders
        },
      },

      // ── Typography scale ─────────────────────────────────────────────────
      // Names map to UI roles, not raw sizes.
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        // role :  [size, { lineHeight, letterSpacing, fontWeight }]
        'micro':   ['10px', { lineHeight: '14px', letterSpacing: '0.06em' }],
        'caption': ['11px', { lineHeight: '16px' }],
        'meta':    ['12px', { lineHeight: '16px' }],
        'body':    ['14px', { lineHeight: '20px' }],
        'lead':    ['16px', { lineHeight: '24px' }],
        'h3':      ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'h2':      ['22px', { lineHeight: '28px', fontWeight: '700', letterSpacing: '-0.01em' }],
        'h1':      ['28px', { lineHeight: '34px', fontWeight: '700', letterSpacing: '-0.015em' }],
        'display': ['36px', { lineHeight: '40px', fontWeight: '700', letterSpacing: '-0.02em' }],
      },

      // ── Spacing — extend default 4px scale with semantic shortcuts ──────
      spacing: {
        '0.25': '1px',
        '0.5':  '2px',
        '4.5':  '18px',
      },

      // ── Border radius ───────────────────────────────────────────────────
      // Stick to a tight ramp so containers don't feel inconsistent.
      borderRadius: {
        'xs':  '4px',
        'sm':  '6px',
        'md':  '8px',
        'lg':  '12px',
        'xl':  '16px',
        '2xl': '20px',
      },

      // ── Shadows — subtle, layered ───────────────────────────────────────
      boxShadow: {
        'xs':       '0 1px 2px rgba(15, 15, 15, 0.04)',
        'sm':       '0 1px 3px rgba(15, 15, 15, 0.06), 0 1px 2px rgba(15, 15, 15, 0.04)',
        'card':     '0 1px 3px rgba(15, 15, 15, 0.05)',
        'raised':   '0 4px 12px rgba(15, 15, 15, 0.08)',
        'overlay':  '0 12px 32px rgba(15, 15, 15, 0.18)',
        'focus':    '0 0 0 3px rgba(165, 141, 105, 0.25)',
      },

      // ── Motion ──────────────────────────────────────────────────────────
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
      },
      transitionTimingFunction: {
        'soft': 'cubic-bezier(0.32, 0.72, 0.32, 1)',
      },
      keyframes: {
        'fade-in':       { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'fade-in-up':    { '0%': { opacity: 0, transform: 'translateY(4px)' },
                           '100%': { opacity: 1, transform: 'translateY(0)' } },
        'highlight':     { '0%': { backgroundColor: 'rgba(165,141,105,0.18)' },
                           '100%': { backgroundColor: 'transparent' } },
      },
      animation: {
        'fade-in':    'fade-in 200ms ease-out',
        'fade-in-up': 'fade-in-up 200ms cubic-bezier(0.32, 0.72, 0.32, 1)',
        'highlight':  'highlight 1500ms ease-out',
      },
    },
  },
  plugins: [],
}
