import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'onDark' | 'onDarkOutline';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 ease-smooth disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-700 text-white shadow-card hover:bg-brand-800 hover:shadow-card-hover active:translate-y-[0.5px]',
  secondary:
    'bg-white text-ink-900 border border-line-strong hover:border-ink-300 hover:bg-surface-muted',
  ghost: 'text-ink-700 hover:bg-surface-sunken hover:text-ink-900',
  subtle: 'bg-brand-50 text-brand-800 hover:bg-brand-100',
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
  return (
    <Link
      href={href}
      className={classes({ variant, size, fullWidth, className, children })}
      {...props}
    >
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
