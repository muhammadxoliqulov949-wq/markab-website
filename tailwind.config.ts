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
        'display-sm': ['2rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-xl': [
          'clamp(2.35rem, 5.4vw, 4.25rem)',
          { lineHeight: '1.03', letterSpacing: '-0.035em' },
        ],
        'display-md': ['2.75rem', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        'display-lg': ['3.5rem', { lineHeight: '1.04', letterSpacing: '-0.03em' }],
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
        container: '1200px',
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
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
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
