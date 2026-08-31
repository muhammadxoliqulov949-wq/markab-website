import type { ReactNode } from 'react';
import { StateBlock } from '@/components/ui/StateBlock';

/**
 * Shared shell for the dashboard panels.
 *
 * Every panel answers the same three questions in the same order: what this
 * area will hold, what it holds right now, and what has to exist before it can
 * hold anything real. Keeping that order identical is what stops the dashboard
 * from drifting into a set of lookalike empty boxes.
 */
export function Panel({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h2 className="text-base font-semibold text-ink-900">{title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{description}</p>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/**
 * The "no backend yet" body used by every panel that has nothing real to show.
 * `demoContent` is passed only when demo mode is on, and it is always rendered
 * below the same explanation rather than instead of it.
 */
export function PendingIntegration({
  what,
  demoContent,
}: {
  /** What will appear here once an official source exists. */
  what: string;
  demoContent?: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <StateBlock
        compact
        variant="unavailable"
        title="Ma’lumot manbasi ulanmagan"
        description={what}
      />
      {demoContent}
    </div>
  );
}

/** A dense label/value row used for account facts and statuses. */
export function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-line py-3 first:border-t-0 first:pt-0">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="text-sm text-ink-900 sm:text-right">{children}</dd>
    </div>
  );
}
