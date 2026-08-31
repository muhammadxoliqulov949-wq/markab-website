import type { ReactNode } from 'react';

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
  const eyebrowTone = tone === 'dark' ? 'text-brand-200' : 'text-brand-600';

  const titleSize =
    size === 'sm'
      ? 'text-[1.375rem] sm:text-[1.5rem] lg:text-[1.75rem]'
      : 'text-[1.5rem] sm:text-[1.75rem] lg:text-[2rem]';

  return (
    <div className={`flex max-w-2xl flex-col gap-3 ${alignment} ${className}`}>
      {eyebrow ? (
        <span className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${eyebrowTone}`}>
          {eyebrow}
        </span>
      ) : null}
      <Tag id={id} className={`${titleSize} leading-[1.14] ${titleTone}`}>
        {title}
      </Tag>
      {description ? (
        <p className={`max-w-xl text-[0.9375rem] leading-relaxed sm:text-base ${descTone}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
