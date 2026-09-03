import type { Config } from 'tailwindcss';

/**
 * Markab 2.0 — design tokens (prototype).
 *
 * BRAND NOTE: the production palette could not be extracted (no access to the
 * live stylesheet). These tokens are a provisional, premium fintech palette
 * chosen to be brand-neutral; replace with official Markab brand values
 * (see docs/LEGAL-TRUST-REGISTER.md and docs/PHASE-0.5-IMPLEMENTATION-PLAN.md).
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    /**
     * Defined in full (not via `extend`) so `nav` can be placed between `md`
     * and `lg`. Appending it in `extend` would emit its utilities after `2xl`,
     * which would let `nav:` override `lg:` — the opposite of what we want.
     *
     * `nav: 900px` is the measured threshold for the desktop header bar:
     * logo (120) + primary nav (599) + cart/Kirish (144) = 863px of content,
     * which needs ~912px of inner width to sit without compression.
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
          DEFAULT: '#0C1116',
          900: '#0C1116',
          800: '#141B22',
          700: '#1D262F',
          600: '#2A3540',
          500: '#47535F',
          400: '#5F6B77',
          300: '#939DA7',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F6F7F8',
          sunken: '#F0F2F4',
        },
        line: {
          DEFAULT: '#E4E8EC',
          strong: '#D3D9DF',
        },
        brand: {
          50: '#EAF4F0',
          100: '#CFE6DE',
          200: '#A5D0C2',
          300: '#71B39E',
          400: '#3F9179',
          500: '#1E7A61',
          600: '#146550',
          700: '#10513F',
          800: '#0D4033',
          900: '#0A3328',
        },
        accent: {
          50: '#FBF6E9',
          100: '#F4E9C6',
          400: '#D9B657',
          500: '#C39A32',
          600: '#A27C22',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
      fontSize: {
        'display-sm': ['1.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        /**
         * Hero headline — large but controlled. 34px on a 320px phone,
         * 52–56px on desktop. Deliberately smaller than a "landing-page
         * shout": the page should read calm, not loud.
         */
        'display-xl': [
          'clamp(2.125rem, 1.05rem + 2.6vw, 3.5rem)',
          { lineHeight: '1.06', letterSpacing: '-0.03em' },
        ],
        'display-md': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        'display-lg': ['2.875rem', { lineHeight: '1.07', letterSpacing: '-0.028em' }],
      },
      borderRadius: {
        DEFAULT: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '22px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(12, 17, 22, 0.04), 0 1px 3px rgba(12, 17, 22, 0.03)',
        'card-hover': '0 6px 20px -6px rgba(12, 17, 22, 0.12), 0 2px 6px rgba(12, 17, 22, 0.05)',
        panel: '0 1px 2px rgba(12, 17, 22, 0.05)',
        lift: '0 18px 40px -20px rgba(12, 17, 22, 0.28)',
      },
      maxWidth: {
        /**
         * Single source of truth for the content grid. Core content aligns to
         * this width on every page; only intentionally full-bleed visuals
         * (hero photography edge, section washes) go past it.
         */
        container: '1280px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        /**
         * Restrained entrance motion only — no looping, no parallax. The
         * global prefers-reduced-motion rule collapses these to ~0ms.
         */
        'sheet-up': {
          from: { transform: 'translateY(8%)', opacity: '0.4' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'dropdown-in': {
          from: { transform: 'translateY(-6px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'sheet-up': 'sheet-up 0.28s cubic-bezier(0.22, 1, 0.36, 1) both',
        'dropdown-in': 'dropdown-in 0.18s cubic-bezier(0.22, 1, 0.36, 1) both',
        'rise-1': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both',
        'rise-2': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.14s both',
        'rise-3': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.23s both',
        'rise-4': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.32s both',
        'rise-5': 'fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.42s both',
      },
    },
  },
  plugins: [],
};

export default config;
