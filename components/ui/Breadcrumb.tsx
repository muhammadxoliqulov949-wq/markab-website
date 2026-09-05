import Link from 'next/link';
import { Fragment } from 'react';
import { Container } from '@/components/ui/Section';

export type Crumb = { label: string; href?: string };

/**
 * RDFa microdata attributes must be emitted with the exact lowercase name
 * `typeof`. SWC's JSX transform rewrites a JSX attribute literally named
 * `typeof` (a reserved word) into the prop `typeOf`, which React then writes
 * to the DOM — silently invalidating the schema.org markup and triggering a
 * React dev warning. Passing the attribute through a spread of an object
 * keeps the exact key, so the rendered HTML carries `typeof="…"` correctly.
 */
const RDFA_BREADCRUMB_LIST = { typeof: 'BreadcrumbList' };
const RDFA_WEBPAGE = { typeof: 'WebPage' };

/**
 * Breadcrumb — slim nav band above page headers.
 *
 * Uses RDFa `data-vocabulary.org/Breadcrumb` markup so Google reads the trail.
 * The last item is the current page (no href). Never more than 3 hops deep —
 * if a caller passes more, crumbs collapse silently to preserve clarity.
 */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Joylashuv" className="border-b border-line-faint bg-surface">
      <Container className="py-3">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] text-ink-500">
          {items.map((crumb, i) => {
            const last = i === items.length - 1;
            return (
              <Fragment key={`${crumb.label}-${i}`}>
                <li
                  {...RDFA_BREADCRUMB_LIST}
                  vocab="https://schema.org/"
                  property="itemListElement"
                  className="flex items-center"
                >
                  {crumb.href && !last ? (
                    <Link
                      href={crumb.href}
                      property="item"
                      {...RDFA_WEBPAGE}
                      className="inline-flex min-h-[28px] items-center transition-colors hover:text-brand-700"
                    >
                      <span property="name">{crumb.label}</span>
                    </Link>
                  ) : (
                    <span
                      property="item"
                      {...RDFA_WEBPAGE}
                      className="font-medium text-ink-800"
                      aria-current="page"
                    >
                      <span property="name">{crumb.label}</span>
                    </span>
                  )}
                  <meta property="position" content={String(i + 1)} />
                </li>
                {!last ? (
                  <li aria-hidden="true" className="text-ink-300">
                    /
                  </li>
                ) : null}
              </Fragment>
            );
          })}
        </ol>
      </Container>
    </nav>
  );
}

/**
 * PageHeader — a premium interior title block: eyebrow (optional) + large
 * display heading + lead description + optional CTA. Re-used by every
 * non-homepage route so interior pages share one visual weight.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  align = 'left',
  className = '',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}) {
  const center = align === 'center';
  return (
    <div
      className={[
        'relative overflow-hidden border-b border-line bg-surface',
        className,
      ].join(' ')}
    >
      {/* Soft brand wash for interior depth, no loud colors. */}
      <div
        className="pointer-events-none absolute -left-20 -top-10 h-48 w-80 rounded-full bg-brand-50/70 blur-3xl"
        aria-hidden="true"
      />
      <Container
        className={[
          'relative py-10 sm:py-14 lg:py-16',
          center ? 'mx-auto max-w-3xl text-center' : 'max-w-4xl',
        ].join(' ')}
      >
        {eyebrow ? (
          <p className={['eyebrow', center ? 'mx-auto' : ''].join(' ')}>{eyebrow}</p>
        ) : null}
        <h1
          className={[
            'mt-5 text-display-md text-ink-900 sm:mt-6 sm:text-display-lg',
          ].join(' ')}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={[
              'mt-5 max-w-2xl text-lead text-ink-500',
              center ? 'mx-auto' : '',
            ].join(' ')}
          >
            {description}
          </p>
        ) : null}
        {actions ? (
          <div
            className={[
              'mt-8 flex flex-col gap-3 sm:flex-row',
              center ? 'justify-center' : '',
            ].join(' ')}
          >
            {actions}
          </div>
        ) : null}
      </Container>
    </div>
  );
}
