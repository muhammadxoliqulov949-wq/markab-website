import type { ComponentProps, ReactNode } from 'react';

const fieldBase =
  'w-full rounded-lg border border-line-strong bg-white px-3.5 py-2.5 text-[0.9375rem] text-ink-900 placeholder:text-ink-300 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-surface-muted disabled:text-ink-400';

export function Field({
  label,
  hint,
  error,
  required,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-700">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({ className = '', ...props }: ComponentProps<'input'>) {
  return <input className={`${fieldBase} ${className}`} {...props} />;
}

export function Select({ className = '', children, ...props }: ComponentProps<'select'>) {
  return (
    <select className={`${fieldBase} appearance-none bg-[length:16px] pr-10 ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className = '', ...props }: ComponentProps<'textarea'>) {
  return <textarea className={`${fieldBase} min-h-[120px] resize-y ${className}`} {...props} />;
}
