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
          DEFAULT: '#0F172A',
          900: '#0F172A',
          800: '#172033',
          700: '#1E293B',
          600: '#334155',
          500: '#475569',
          400: '#64748B',
          300: '#94A3B8',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8FAFC',
          sunken: '#F1F5F9',
        },
        line: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E1',
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
        'display-xl': ['clamp(2.25rem, 1.1rem + 2.8vw, 3.75rem)', { lineHeight: '1.02', letterSpacing: '-0.035em', fontWeight: '700' }],
        'display-lg': ['clamp(2rem, 1.4rem + 1.7vw, 3rem)', { lineHeight: '1.08', letterSpacing: '-0.028em', fontWeight: '700' }],
        'display-md': ['clamp(1.75rem, 1.2rem + 1.2vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-sm': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        lead: ['1.125rem', { lineHeight: '1.7' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.65' }],
        body: ['0.9375rem', { lineHeight: '1.6' }],
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
        btn: '12px',
        card: '16px',
        panel: '20px',
        pill: '9999px',
      },
      /**
       * Shadow ladder — three elevation tiers plus the brand glow for CTAs.
       * No colourised/coloured shadows outside the glow family.
       */
      boxShadow: {
        card: '0 1px 0 rgba(15,23,42,0.04), 0 1px 2px rgba(15,23,42,0.03)',
        'card-hover': '0 12px 32px -12px rgba(15,23,42,0.14), 0 2px 8px -2px rgba(15,23,42,0.05)',
        panel: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.08)',
        lift: '0 24px 48px -20px rgba(15,23,42,0.22), 0 2px 8px rgba(15,23,42,0.05)',
        glow: '0 6px 16px -6px rgba(0,163,106,0.45)',
        'glow-lg': '0 12px 28px -8px rgba(0,163,106,0.5)',
        header: '0 1px 0 rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.08)',
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
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.2,0.8,0.2,1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'sheet-up': 'sheet-up 0.28s cubic-bezier(0.2,0.8,0.2,1) both',
        'dropdown-in': 'dropdown-in 0.18s cubic-bezier(0.2,0.8,0.2,1) both',
        'rise-1': 'fade-up 0.7s cubic-bezier(0.2,0.8,0.2,1) 0.05s both',
        'rise-2': 'fade-up 0.7s cubic-bezier(0.2,0.8,0.2,1) 0.14s both',
        'rise-3': 'fade-up 0.7s cubic-bezier(0.2,0.8,0.2,1) 0.23s both',
        'rise-4': 'fade-up 0.7s cubic-bezier(0.2,0.8,0.2,1) 0.32s both',
        'rise-5': 'fade-up 0.9s cubic-bezier(0.2,0.8,0.2,1) 0.42s both',
        'scale-pulse': 'scale-pulse 0.5s cubic-bezier(0.2,0.8,0.2,1) both',
        'star-breathe': 'star-breathe 3s ease-in-out infinite',
        'star-spin': 'star-spin 1.2s linear infinite',
        'heart-pop': 'heart-pop 0.45s cubic-bezier(0.2,0.8,0.2,1)',
        'accordion-down': 'accordion-down 0.25s ease',
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
