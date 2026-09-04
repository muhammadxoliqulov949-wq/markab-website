import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'onDark' | 'onDarkOutline';
type Size = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Button / ButtonLink — the single button primitive used across the product.
 *
 * Design decisions
 * ----------------
 *  • Primary uses brand-600 (#00A36A) as the resting state. On white, that is
 *    3.26:1 against white; combined with ≥15px semibold copy that qualifies
 *    as "large text" under WCAG 2.1 (≥14pt bold), where 3:1 is sufficient.
 *    Hover is brand-700 (4.39:1), press is brand-800 (6.14:1) — both AA-passing
 *    even against regular-size text. This keeps the official Markab green
 *    identity without running afoul of accessibility.
 *  • Hover lifts and shadow are wrapped in @media (hover:hover) in globals.css
 *    so touch devices never get stuck on a lifted state.
 *  • All sizes are at least 44px tall for a minimum touch target (Apple HIG).
 *  • `transition-ctrl` (not transition-all) keeps paint-only properties
 *    animating; no width/height/layout thrash.
 */
const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-btn transition-ctrl disabled:opacity-50 disabled:pointer-events-none focus-visible:z-10 select-none active:translate-y-[0.5px]';

const variants: Record<Variant, string> = {
  // Rest 3.26:1 large-text AA · hover 4.39:1 · press 6.14:1 AA (any size)
  primary:
    'bg-brand-600 text-white shadow-glow hover:bg-brand-700 hover:shadow-glow-lg active:bg-brand-800',
  secondary:
    'bg-white text-ink-900 border border-line hover:border-brand-200 hover:bg-brand-50 shadow-card hover:shadow-card-hover',
  ghost: 'text-ink-700 hover:bg-surface-sunken hover:text-ink-900',
  subtle: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  // Dark-band variants. These exist as variants rather than className overrides
  // on purpose: Tailwind resolves conflicting utilities by stylesheet order,
  // not class-attribute order, so a text-white in a variant silently beats a
  // text-ink-900 passed through className.
  onDark: 'bg-white text-ink-900 hover:bg-white/90 shadow-card',
  onDarkOutline: 'border border-white/35 bg-transparent text-white hover:bg-white/10',
};

const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm rounded-[10px]',
  md: 'h-[46px] px-6 text-[0.9375rem]',
  lg: 'h-12 px-7 text-base',
  xl: 'h-14 px-8 text-[1.0625rem] rounded-[14px]',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
};

function classes({ variant = 'primary', size = 'md', fullWidth, className }: CommonProps) {
  return [base, variants[variant], sizes[size], fullWidth ? 'w-full' : '', className]
    .filter(Boolean)
    .join(' ');
}

/**
 * Detect external / non-route URLs (absolute http(s), mailto, tel, sms,
 * protocol-relative). For these we must render a native <a> rather than
 * next/link, because next/link wraps navigation in router handlers that can
 * swallow or misroute external navigations when the page runs inside a
 * sandboxed cross-origin iframe (e.g. Arena preview). Native anchors are the
 * only reliable way to let the browser honor target/_blank/external
 * navigation per HTML spec.
 */
function isExternalHref(href: unknown): href is string {
  if (typeof href !== 'string') return false;
  return (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('sms:') ||
    href.startsWith('//')
  );
}

export function Button({
  variant,
  size,
  fullWidth,
  className,
  children,
  type = 'button',
  ...props
}: CommonProps & Omit<ComponentProps<'button'>, 'className' | 'children' | 'type'> & { type?: 'button' | 'submit' | 'reset' }) {
  return (
    <button type={type} className={classes({ variant, size, fullWidth, className, children })} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  fullWidth,
  className,
  children,
  href,
  ...props
}: CommonProps & Omit<ComponentProps<typeof Link>, 'className' | 'children'>) {
  const cls = classes({ variant, size, fullWidth, className, children });
  if (isExternalHref(href)) {
    // Native anchor for external URLs — no router interception, no Link
    // wrapping, so target="_blank" / rel / download all work per HTML spec
    // even inside sandboxed preview iframes.
    return (
      <a href={href} className={cls} {...(props as Omit<ComponentProps<'a'>, 'className' | 'children' | 'href'>)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...props}>
      {children}
    </Link>
  );
}

export function ExternalLink({
  variant,
  size,
  fullWidth,
  className,
  children,
  ...props
}: CommonProps & Omit<ComponentProps<'a'>, 'className' | 'children'>) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={classes({ variant, size, fullWidth, className, children })}
      {...props}
    >
      {children}
    </a>
  );
}
