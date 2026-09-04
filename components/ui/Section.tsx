import type { ReactNode } from 'react';
import { MarkabStar } from '@/components/ui/MarkabStar';

type Tone = 'default' | 'muted' | 'sunken' | 'dark';

const tones: Record<Tone, string> = {
  default: 'bg-surface',
  muted: 'bg-surface-muted',
  sunken: 'bg-surface-sunken',
  dark: 'bg-ink-900 text-white',
};

export function Section({
  children,
  tone = 'default',
  className = '',
  id,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`${tones[tone]} ${className}`}>
      {children}
    </section>
  );
}

export function Container({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`container-page ${className}`}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'light',
  as: Tag = 'h2',
  className = '',
  id,
  size = 'md',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  /**
   * Editorial weight. `md` is the default section title; `sm` is used for
   * supporting blocks (FAQ, Academy) so the page has a real hierarchy instead
   * of twelve equally loud titles.
   */
  size?: 'sm' | 'md';
  /** Set so the owning <section> can point aria-labelledby at this heading. */
  id?: string;
}) {
  const alignment =
    align === 'center' ? 'text-center mx-auto items-center' : 'text-left items-start';
  const titleTone = tone === 'dark' ? 'text-white' : 'text-ink-900';
  const descTone = tone === 'dark' ? 'text-white/65' : 'text-ink-500';
  const eyebrowCls =
    tone === 'dark'
      ? 'inline-flex items-center gap-2 rounded-pill bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-100 ring-1 ring-inset ring-white/15'
      : 'eyebrow';

  const titleSize =
    size === 'sm'
      ? 'text-display-sm'
      : 'text-display-md lg:text-display-lg';

  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${alignment} ${className}`}>
      {eyebrow ? <span className={eyebrowCls}>{eyebrow}</span> : null}
      <Tag id={id} className={`${titleSize} ${titleTone}`}>
        {title}
      </Tag>
      {description ? (
        <p className={`max-w-xl text-body sm:text-lead ${descTone}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
