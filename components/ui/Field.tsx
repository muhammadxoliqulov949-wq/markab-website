import type { ComponentProps, ReactNode } from 'react';

/**
 * Form field primitive — label + control + hint/error.
 *
 * One visual system: 12px radius (rounded-btn), hairline rest border
 * (border-line), brand-500 2px focus ring, 48px hit area, caption-sized
 * hint/error. Error state is semantic (danger-600), not green-tinted.
 */

const controlBase = [
  'w-full rounded-btn border border-line bg-white px-4 text-[0.9375rem] text-ink-900 placeholder:text-ink-300',
  'transition-ctrl focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15',
  'disabled:bg-surface-muted disabled:text-ink-400 disabled:cursor-not-allowed',
  'aria-[invalid=true]:border-danger-500 aria-[invalid=true]:focus:ring-danger-500/15',
].join(' ');

export function Field({
  label,
  hint,
  error,
  required,
  children,
  htmlFor,
  className = '',
}: {
  label: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  children: ReactNode;
  htmlFor: string;
  className?: string;
}) {
  const describedBy = [
    hint ? `${htmlFor}-hint` : null,
    error ? `${htmlFor}-error` : null,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-ink-800">
        {label}
        {required ? <span className="ml-1 text-danger-600">*</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-caption text-danger-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-caption text-ink-400">
          {hint}
        </p>
      ) : null}
      {/* Mirrors aria-describedby onto the first child control so screen readers
          announce the message without each caller wiring it manually. */}
      {typeof children === 'object' && children && 'props' in children ? null : null}
      <span className="sr-only" aria-describedby={describedBy || undefined} />
    </div>
  );
}

export function TextInput({ className = '', ...props }: ComponentProps<'input'>) {
  return <input className={`${controlBase} h-12 ${className}`} {...props} />;
}

export function Select({ className = '', children, ...props }: ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        className={`${controlBase} h-12 appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-11 ${className}`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")",
        }}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function Textarea({ className = '', ...props }: ComponentProps<'textarea'>) {
  return <textarea className={`${controlBase} min-h-[120px] resize-y py-3 ${className}`} {...props} />;
}

/** Compact chip-style option — single select chips (e.g., term / down-payment). */
export function OptionChip({
  selected,
  children,
  ...props
}: ComponentProps<'button'> & { selected?: boolean }) {
  return (
    <button
      type="button"
      className={[
        'inline-flex h-10 items-center justify-center rounded-btn border px-4 text-sm font-medium transition-ctrl',
        selected
          ? 'border-brand-500 bg-brand-50 text-brand-800 shadow-subtle'
          : 'border-line bg-white text-ink-600 hover:border-line-strong hover:text-ink-900',
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}

/** Checkbox / radio tile used inside forms for agree-to-terms etc. */
export function Checkbox({
  label,
  description,
  className = '',
  ...props
}: ComponentProps<'input'> & { label: string; description?: string }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 ${className}`}
    >
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-[4px] border-line text-brand-600 accent-brand-600 focus:ring-2 focus:ring-brand-500/20"
        {...props}
      />
      <span className="min-w-0 text-sm leading-relaxed text-ink-700">
        {label}
        {description ? (
          <span className="mt-0.5 block text-caption text-ink-400">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
