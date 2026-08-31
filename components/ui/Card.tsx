import type { HTMLAttributes, ReactNode } from 'react';

export function Card({
  children,
  className = '',
  interactive = false,
  ...props
}: { children: ReactNode; interactive?: boolean } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        'rounded-xl border border-line bg-surface shadow-card',
        interactive
          ? 'transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card-hover'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 pb-5 sm:px-6 sm:pb-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border-t border-line px-5 py-4 sm:px-6 ${className}`}>{children}</div>
  );
}
