import plugin from 'tailwindcss/plugin';
import type { Config } from 'tailwindcss';

/**
 * Markab 2.0 — design tokens.
 *
 * Brand palette is FROZEN at #00B878 (matching production markab.uz).
 * All semantic tokens (radius / shadow / font sizes / container / motion) are
 * defined here and consumed via class utilities — never via one-off arbitrary
 * values inside component JSX.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    /**
     * `nav` breakpoint sits between md and lg at the measured threshold where
     * the desktop primary nav fits without compression (logo + primary nav +
     * cart/Kirish ≈ 900px). Defining at top-level (not extend) keeps cascade
     * order correct so `nav:` wins over `md:` and loses to `lg:`.
     */
    screens: {
      sm: '640px',
      md: '768px',
      nav: '900px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B1220',
          900: '#0B1220',
          800: '#141C2C',
          700: '#1E2A3E',
          600: '#334155',
          500: '#4B5869',
          400: '#64748B',
          300: '#94A3B8',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F7F9FC',
          sunken: '#EEF2F7',
          elevated: '#FFFFFF',
        },
        line: {
          DEFAULT: '#E4E8EF',
          strong: '#CBD3DE',
          faint: '#F0F2F6',
          hairline: 'rgba(60,60,67,0.18)',
        },
        brand: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#00B878',
          600: '#00A36A',
          700: '#008A5A',
          800: '#065F46',
          900: '#064E3B',
        },
        /** Semantic signal palette — subtle, used only for status.
            Brand green stays the primary action color (never used for success
            badges at full weight, to avoid bleeding meaning). */
        success: {
          50: '#ECFDF5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        danger: {
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        info: {
          50: '#EFF6FF',
          500: '#3B82F6',
          600: '#2563EB',
        },
        accent: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          400: '#FBBF24',
          500: '#F2C94C',
          600: '#D97706',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
      /**
       * Semantic type scale — clamp()-based on mobile, ramping predictably.
       * Every surface uses one of these values; magic pixel sizes are a code
       * smell and should be migrated here.
       */
      fontSize: {
        'display-xl': ['clamp(2.5rem, 1.2rem + 3vw, 4rem)', { lineHeight: '1.0', letterSpacing: '-0.04em', fontWeight: '700' }],
        'display-lg': ['clamp(2.125rem, 1.5rem + 1.9vw, 3.25rem)', { lineHeight: '1.05', letterSpacing: '-0.032em', fontWeight: '700' }],
        'display-md': ['clamp(1.875rem, 1.3rem + 1.3vw, 2.5rem)', { lineHeight: '1.12', letterSpacing: '-0.028em', fontWeight: '700' }],
        'display-sm': ['1.625rem', { lineHeight: '1.2', letterSpacing: '-0.022em', fontWeight: '600' }],
        /** Editorial/UI body lead — 18px/1.65 (premium reading weight). */
        lead: ['1.125rem', { lineHeight: '1.65' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.6' }],
        /** Premium default body — 16px, comfortable line-height. */
        body: ['1rem', { lineHeight: '1.6' }],
        caption: ['0.8125rem', { lineHeight: '1.5' }],
      },
      /**
       * Semantic radii — named by intent, never picked ad-hoc.
       *   btn    – buttons / inputs / badges (compact, 12px)
       *   card   – product / vehicle / content cards (16px)
       *   panel  – large surfaces (form shell / modal / drawer, 20px)
       *   pill   – chips / tabs / status dots (full rounded)
       */
      borderRadius: {
        sm: '8px',
        btn: '12px',
        card: '20px',
        panel: '24px',
        xl: '28px',
        pill: '9999px',
      },
      /**
       * Shadow ladder — tighter, richer.
       *   subtle    – form controls, inputs (bare-there)
       *   card      – rest state (1px hairline only — no cheap grey)
       *   card-hover— active hover lift
       *   panel     – sheets/dropdowns
       *   popover   – select/tooltip — stays crisp
       *   lift      – hero floating card, FinalCTA
       *   glow/glow-lg — brand CTAs
       *   header    – sticky nav
       */
      boxShadow: {
        subtle: '0 1px 2px rgba(11,18,32,0.04), 0 1px 1px rgba(11,18,32,0.02)',
        card: '0 1px 0 rgba(11,18,32,0.05), 0 0 0 1px rgba(11,18,32,0.04)',
        'card-hover': '0 16px 40px -16px rgba(11,18,32,0.18), 0 4px 12px -4px rgba(11,18,32,0.06), 0 0 0 1px rgba(0,163,106,0.08)',
        panel: '0 2px 6px rgba(11,18,32,0.04), 0 12px 32px -12px rgba(11,18,32,0.1)',
        popover: '0 4px 12px rgba(11,18,32,0.08), 0 16px 40px -12px rgba(11,18,32,0.14)',
        lift: '0 28px 60px -24px rgba(11,18,32,0.28), 0 6px 16px rgba(11,18,32,0.06)',
        glow: '0 8px 20px -8px rgba(0,163,106,0.5)',
        'glow-lg': '0 16px 40px -12px rgba(0,163,106,0.55)',
        header: '0 1px 0 rgba(11,18,32,0.05), 0 8px 28px -14px rgba(11,18,32,0.12)',
      },
      maxWidth: {
        /** Single source of truth for the content grid: 1248px.
            Core content aligns here; full-bleed washes are the exception. */
        container: '78rem',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.2,0.8,0.2,1)',
        out: 'cubic-bezier(0.16,1,0.3,1)',
      },
      transitionProperty: {
        ctrl: 'color,background-color,border-color,box-shadow,transform,opacity',
        card: 'border-color,box-shadow,transform',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'skeleton-shimmer': { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
        'sheet-up': {
          from: { transform: 'translateY(8%)', opacity: '0.4' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'dropdown-in': {
          from: { transform: 'translateY(-6px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.25)' },
          '100%': { transform: 'scale(1)' },
        },
        'star-breathe': {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(0.92)' },
        },
        'star-spin': { to: { transform: 'rotate(360deg)' } },
        'heart-pop': {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.3)' },
          '70%': { transform: 'scale(0.92)' },
          '100%': { transform: 'scale(1)' },
        },
        'accordion-down': {
          from: { 'grid-template-rows': '0fr', opacity: '0' },
          to: { 'grid-template-rows': '1fr', opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'sheet-up': 'sheet-up 0.32s cubic-bezier(0.16,1,0.3,1) both',
        'dropdown-in': 'dropdown-in 0.2s cubic-bezier(0.16,1,0.3,1) both',
        'rise-1': 'fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.04s both',
        'rise-2': 'fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.12s both',
        'rise-3': 'fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.20s both',
        'rise-4': 'fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.28s both',
        'rise-5': 'fade-up 1s cubic-bezier(0.16,1,0.3,1) 0.36s both',
        'scale-pulse': 'scale-pulse 0.5s cubic-bezier(0.2,0.8,0.2,1) both',
        'star-breathe': 'star-breathe 4s ease-in-out infinite',
        'star-spin': 'star-spin 1.4s cubic-bezier(0.4,0,0.2,1) infinite',
        'heart-pop': 'heart-pop 0.55s cubic-bezier(0.2,0.8,0.2,1)',
        'accordion-down': 'accordion-down 0.3s cubic-bezier(0.16,1,0.3,1)',
        'float': 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [
    /**
     * Hover-only variant — matches only when the primary pointer is fine
     * (mouse / trackpad) AND can hover. Touch devices never match, which
     * eliminates the sticky "button stays lifted" issue after a tap.
     * Use `hover-only:` everywhere you would otherwise use `hover:`.
     */
    plugin(({ addVariant }) => {
      addVariant('hocus', [
        '@media (hover: hover) and (pointer: fine) { &:is(:hover, :focus-visible) }',
        '&:focus-visible',
      ]);
      addVariant('hover-only', '@media (hover: hover) and (pointer: fine) { &:hover }');
      addVariant('group-hocus', [
        '@media (hover: hover) and (pointer: fine) { :merge(.group):is(:hover, :focus-visible) & }',
        ':merge(.group):focus-visible &',
      ]);
      addVariant('group-hover-only', '@media (hover: hover) and (pointer: fine) { :merge(.group):hover & }');
      addVariant('peer-hocus', [
        '@media (hover: hover) and (pointer: fine) { :merge(.peer):is(:hover, :focus-visible) ~ & }',
        ':merge(.peer):focus-visible ~ &',
      ]);
    }),
  ],
};

export default config;
