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
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}) {
  const alignment = align === 'center' ? 'text-center mx-auto items-center' : 'text-left items-start';
  const titleTone = tone === 'dark' ? 'text-white' : 'text-ink-900';
  const descTone = tone === 'dark' ? 'text-white/65' : 'text-ink-500';
  const eyebrowTone = tone === 'dark' ? 'text-brand-200' : 'text-brand-600';

  return (
    <div className={`flex max-w-2xl flex-col gap-3 ${alignment} ${className}`}>
      {eyebrow ? (
        <span className={`text-xs font-semibold uppercase tracking-[0.14em] ${eyebrowTone}`}>
          {eyebrow}
        </span>
      ) : null}
      <Tag className={`text-2xl sm:text-3xl lg:text-[2.35rem] ${titleTone}`}>{title}</Tag>
      {description ? (
        <p className={`text-base leading-relaxed sm:text-lg ${descTone}`}>{description}</p>
      ) : null}
    </div>
  );
}
