import Link from 'next/link';
import type { ReactNode } from 'react';

type Action = {
  href?: string;
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  external?: boolean;
};

/**
 * EmptyState — the single primitive used for "nothing to show here" surfaces:
 * empty cart, no saved items, no search results, empty investment portfolio,
 * network failure that renders as a soft empty block.
 *
 * Deliberately restrained: no cartoon illustration, no full-page drama, just
 * a subtle symbol, a short heading, one explanatory paragraph and 1–2
 * actions. Premium fintech tone — calm, helpful, not cutesy.
 */
export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = '',
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  primaryAction?: Action;
  secondaryAction?: Action;
  className?: string;
}) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-6 py-14 text-center sm:py-16',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-brand-600 ring-1 ring-line">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500">{description}</p>
      ) : null}
      {(primaryAction || secondaryAction) && (
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
          {primaryAction ? <ActionButton action={primaryAction} variant="primary" /> : null}
          {secondaryAction ? <ActionButton action={secondaryAction} variant="secondary" /> : null}
        </div>
      )}
    </div>
  );
}

function ActionButton({ action, variant }: { action: Action; variant: 'primary' | 'secondary' | 'ghost' }) {
  const cls =
    variant === 'primary'
      ? 'tap-target inline-flex h-[46px] items-center justify-center rounded-btn bg-brand-600 px-6 text-[0.9375rem] font-semibold text-white shadow-glow transition-ctrl hover:bg-brand-700 hover-only:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2'
      : variant === 'secondary'
        ? 'tap-target inline-flex h-[46px] items-center justify-center rounded-btn border border-line bg-white px-6 text-[0.9375rem] font-semibold text-ink-900 shadow-card transition-ctrl hover:border-brand-200 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2'
        : 'tap-target inline-flex h-11 items-center justify-center rounded-btn px-5 text-sm font-medium text-ink-600 transition-ctrl hover:bg-surface-sunken hover:text-ink-900';

  if (action.href) {
    if (action.external) {
      return (
        <a
          href={action.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={action.onClick}
          className={cls}
        >
          {action.label}
        </a>
      );
    }
    return (
      <Link href={action.href} onClick={action.onClick} className={cls}>
        {action.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={cls}>
      {action.label}
    </button>
  );
}
