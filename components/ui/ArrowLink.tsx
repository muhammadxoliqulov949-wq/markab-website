import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Text CTA with an animated arrow. Used instead of a button where the action is
 * secondary — keeps the page calm while staying obviously clickable.
 */
export function ArrowLink({
  href,
  children,
  className = '',
  tone = 'light',
}: {
  href: string;
  children: ReactNode;
  className?: string;
  tone?: 'light' | 'dark';
}) {
  const color = tone === 'dark' ? 'text-white hover:text-white' : 'text-ink-900 hover:text-brand-800';

  return (
    <Link
      href={href}
      className={[
        'group inline-flex min-h-[40px] items-center gap-2 py-2 text-sm font-semibold transition-colors duration-200 lg:min-h-0 lg:py-1.5',
        color,
        className,
      ].join(' ')}
    >
      {children}
      <svg
        className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:translate-x-1"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
