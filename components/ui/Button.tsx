import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'onDark' | 'onDarkOutline';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 ease-smooth disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-500 text-white shadow-[0_6px_16px_-6px_rgba(0,184,120,0.45)] hover:bg-brand-600 hover:shadow-[0_8px_20px_-6px_rgba(0,184,120,0.5)] active:translate-y-[0.5px] active:bg-brand-700',
  secondary:
    'bg-white text-ink-900 border border-line hover:border-brand-200 hover:bg-brand-50',
  ghost: 'text-ink-700 hover:bg-surface-sunken hover:text-ink-900',
  subtle: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  /**
   * For dark grounds. These exist as variants rather than className overrides
   * on purpose: Tailwind resolves conflicting utilities by stylesheet order,
   * not class-attribute order, so a `text-white` in a variant silently beats a
   * `text-ink-900` passed through className.
   */
  onDark: 'bg-white text-ink-900 hover:bg-white/90',
  onDarkOutline: 'border border-white/30 bg-transparent text-white hover:bg-white/10',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-[0.9375rem]',
  lg: 'h-12 px-6 text-base',
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
  ...props
}: CommonProps & Omit<ComponentProps<'button'>, 'className' | 'children'>) {
  return (
    <button className={classes({ variant, size, fullWidth, className, children })} {...props}>
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
