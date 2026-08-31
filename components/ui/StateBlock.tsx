import type { ReactNode } from 'react';

/**
 * Shared state component.
 *
 * Every data-driven area renders one of these — never a blank section.
 *  loading     in-flight data (skeleton shown separately when layout matters)
 *  empty       request succeeded, zero records
 *  not-found   the specific record does not exist
 *  error       request failed (users never see raw technical detail)
 *  pending     value/feature not yet supplied by an official source
 *  unavailable no data source configured — integration pending
 */

export type StateVariant = 'loading' | 'empty' | 'not-found' | 'error' | 'pending' | 'unavailable';

const defaults: Record<StateVariant, { title: string; description: string }> = {
  loading: { title: 'Yuklanmoqda…', description: 'Ma’lumotlar tayyorlanmoqda.' },
  empty: {
    title: 'Hozircha ma’lumot yo‘q',
    description: 'Bu bo‘lim tez orada to‘ldiriladi.',
  },
  'not-found': {
    title: 'Ma’lumot topilmadi',
    description: 'Siz qidirayotgan ma’lumot mavjud emas yoki o‘chirilgan.',
  },
  error: {
    title: 'Nimadir xato ketdi',
    description: 'Ma’lumotlarni yuklashda xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring.',
  },
  pending: {
    title: 'Ma’lumot tayyorlanmoqda',
    description: 'Bu ma’lumot rasmiy manba bilan to‘ldiriladi.',
  },
  unavailable: {
    title: 'Ulanish kutilmoqda',
    description: 'Ma’lumotlar manbasi ulanmaganda bu bo‘lim shunday ko‘rinadi.',
  },
};

function Icon({ variant }: { variant: StateVariant }) {
  const common = 'h-6 w-6';
  switch (variant) {
    case 'not-found':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      );
    case 'error':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M12 9v4" strokeLinecap="round" />
          <path d="M12 17h.01" strokeLinecap="round" />
          <path d="M10.3 3.9 2.4 17.3A1.9 1.9 0 0 0 4 20.2h16a1.9 1.9 0 0 0 1.6-2.9L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z" />
        </svg>
      );
    case 'empty':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M3 10h18M8 15h8" strokeLinecap="round" />
        </svg>
      );
    case 'pending':
    case 'unavailable':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M12 8v4l3 2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    default:
      return (
        <svg className={`${common} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}

export function StateBlock({
  variant,
  title,
  description,
  actions,
  compact = false,
  className = '',
  children,
}: {
  variant: StateVariant;
  title?: string;
  description?: string;
  actions?: ReactNode;
  compact?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const copy = defaults[variant];
  const isError = variant === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? undefined : 'polite'}
      className={[
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-surface-muted/60 text-center',
        compact ? 'gap-2 p-5' : 'gap-3 p-8 sm:p-12',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={isError ? 'text-rose-500' : 'text-ink-400'}>
        <Icon variant={variant} />
      </span>
      <h3 className={`font-semibold text-ink-900 ${compact ? 'text-sm' : 'text-base'}`}>
        {title ?? copy.title}
      </h3>
      <p className={`max-w-md text-sm leading-relaxed text-ink-500 ${compact ? 'text-xs' : ''}`}>
        {description ?? copy.description}
      </p>
      {children}
      {actions ? <div className="mt-2 flex flex-wrap items-center justify-center gap-3">{actions}</div> : null}
    </div>
  );
}

/**
 * Inline "value not available" marker used inside tables and spec lists,
 * so a missing value is explicit rather than silently blank.
 */
export function PendingValue({
  label = 'Ma’lumot tayyorlanmoqda',
  className = '',
}: {
  label?: string;
  /** Colour override — the default ink-400 is unreadable on a dark panel. */
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm ${className || 'text-ink-400'}`}
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4l3 2" strokeLinecap="round" />
      </svg>
      {label}
    </span>
  );
}
