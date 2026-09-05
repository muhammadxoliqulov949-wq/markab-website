import type { ReactNode } from 'react';

type Tone = 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'pending';

/**
 * Tone styles + tone glyph for non-colour identification.
 *
 * Colour is not the only signal — each tone carries a small dot/glyph so a
 * visitor with colour-vision deficiency can still distinguish states. The
 * glyph is aria-hidden (the text already carries the accessible name).
 */
const tones: Record<Tone, string> = {
  neutral: 'bg-surface-sunken text-ink-700 border-line',
  brand: 'bg-brand-50 text-brand-800 border-brand-100',
  accent: 'bg-accent-50 text-accent-600 border-accent-100',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-rose-50 text-rose-800 border-rose-200',
  pending: 'bg-surface-sunken text-ink-500 border-dashed border-line-strong',
};

function ToneGlyph({ tone }: { tone: Tone }) {
  const common = 'h-1.5 w-1.5 rounded-full';
  switch (tone) {
    case 'success':
      return (
        <svg className="h-3 w-3 -translate-y-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
          <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'warning':
      return (
        <svg className="h-3 w-3 -translate-y-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
          <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
          <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" strokeLinejoin="round" />
        </svg>
      );
    case 'danger':
      return (
        <svg className="h-3 w-3 -translate-y-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      );
    case 'pending':
      return <span className={`${common} animate-pulse bg-current opacity-60`} aria-hidden="true" />;
    case 'brand':
    case 'accent':
    case 'neutral':
    default:
      return <span className={`${common} bg-current opacity-70`} aria-hidden="true" />;
  }
}

export function Badge({
  children,
  tone = 'neutral',
  className = '',
  showGlyph = true,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  /**
   * Force the glyph off (e.g. when the badge is a tiny numeric count or sits
   * inside a control where the dot creates visual clutter).
   */
  showGlyph?: boolean;
}) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showGlyph ? <ToneGlyph tone={tone} /> : null}
      {children}
    </span>
  );
}
