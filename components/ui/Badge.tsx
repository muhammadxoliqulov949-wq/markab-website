import type { ReactNode } from 'react';

type Tone = 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'pending';

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-sunken text-ink-700 border-line',
  brand: 'bg-brand-50 text-brand-800 border-brand-100',
  accent: 'bg-accent-50 text-accent-600 border-accent-100',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-100',
  warning: 'bg-amber-50 text-amber-800 border-amber-100',
  danger: 'bg-rose-50 text-rose-800 border-rose-100',
  pending: 'bg-surface-sunken text-ink-500 border-dashed border-line-strong',
};

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium',
        tones[tone],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
