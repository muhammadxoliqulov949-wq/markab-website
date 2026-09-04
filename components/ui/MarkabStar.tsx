/**
 * MarkabStar — the brand symbol: an 8-pointed star derived from the logo
 * mark (rendered in SiteHeader). Built from two overlapping squares rotated
 * 45°, it reads as a compass star — exactly the motif for a product named
 * after a navigational star. Reused across dividers, spinners, the 404
 * glyph and dark-band accents so the symbol reads as Markab everywhere.
 */
type Tone = 'brand' | 'ink' | 'accent' | 'muted' | 'white';

const toneClass: Record<Tone, string> = {
  brand: 'text-brand-500',
  ink: 'text-ink-900',
  accent: 'text-accent-500',
  muted: 'text-ink-300',
  white: 'text-white',
};

export function MarkabStar({
  size = 20,
  tone = 'brand',
  className = '',
  pulse = false,
  spin = false,
  stroke = false,
  ariaHidden = true,
}: {
<<<<<<< HEAD
  size?: 12 | 16 | 20 | 24 | 32 | 48 | 64 | 96 | 128;
=======
  size?: number;
>>>>>>> 8f654f2 (feat(design): phase 2 premium push — editorial hero, 16px body, refined tokens, 9-section home, upgraded CTAs)
  tone?: Tone;
  className?: string;
  pulse?: boolean;
  spin?: boolean;
  stroke?: boolean;
  ariaHidden?: boolean;
}) {
  const sizePx = `${size}px`;
  return (
    <span
      className={[
        'inline-flex shrink-0 items-center justify-center',
        toneClass[tone],
        pulse ? 'animate-star-breathe' : '',
        spin ? 'animate-star-spin' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: sizePx, height: sizePx }}
      aria-hidden={ariaHidden ? 'true' : undefined}
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill={stroke ? 'none' : 'currentColor'}
        stroke={stroke ? 'currentColor' : 'none'}
        strokeWidth={stroke ? 1.5 : 0}
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {stroke ? (
          <>
            <path d="M12 2.5 L14.5 9.5 L21.5 12 L14.5 14.5 L12 21.5 L9.5 14.5 L2.5 12 L9.5 9.5 Z" />
            <path d="M4.5 4.5 L19.5 19.5 M19.5 4.5 L4.5 19.5" />
          </>
        ) : (
          <path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z" />
        )}
      </svg>
    </span>
  );
}

/** Hairline divider with the Markab star in the middle — used between
<<<<<<< HEAD
    content sections / in footers where a small brand mark is welcome. */
export function MarkabDivider({ className = '' }: { className?: string }) {
  return (
    <div className={['relative flex items-center py-4', className].filter(Boolean).join(' ')} aria-hidden="true">
      <div className="h-px flex-1 bg-line" />
      <MarkabStar size={12} tone="muted" className="mx-3 opacity-60" />
      <div className="h-px flex-1 bg-line" />
=======
    content sections / in footers where a small brand mark is welcome.
    Accepts `tone` so it can render on dark brand bands without forcing
    light text on a light divider. */
export function MarkabDivider({
  className = '',
  tone = 'light',
}: {
  className?: string;
  tone?: 'light' | 'dark';
}) {
  const line = tone === 'dark' ? 'bg-white/20' : 'bg-line';
  return (
    <div className={['relative flex items-center py-4', className].filter(Boolean).join(' ')} aria-hidden="true">
      <div className={`h-px flex-1 ${line}`} />
      <MarkabStar size={12} tone={tone === 'dark' ? 'white' : 'muted'} className="mx-3 opacity-70" />
      <div className={`h-px flex-1 ${line}`} />
>>>>>>> 8f654f2 (feat(design): phase 2 premium push — editorial hero, 16px body, refined tokens, 9-section home, upgraded CTAs)
    </div>
  );
}

/** Outlined spinning star used in submit buttons and loading fallbacks. */
export function MarkabSpinner({ size = 20, tone = 'brand' }: { size?: 16 | 20 | 24; tone?: Tone }) {
  return (
    <span className="relative inline-flex" aria-label="Yuklanmoqda" role="status">
      <MarkabStar size={size} tone={tone} stroke spin />
    </span>
  );
}
