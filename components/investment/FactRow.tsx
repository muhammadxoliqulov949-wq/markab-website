import { Badge } from '@/components/ui/Badge';
import { PendingValue } from '@/components/ui/StateBlock';
import type { InvestmentFact, InvestmentPendingField } from '@/lib/data/types';
import { PENDING_LABEL, PUBLISHED_LABEL } from '@/lib/investment/status';

/**
 * Reusable information-status treatment.
 *
 * One row, two possible states, and the two look nothing alike:
 *
 *  • published — solid surface, the value in strong ink, and the source named
 *    underneath so the claim is attributed rather than asserted.
 *  • pending   — dashed border, muted surface, the label in the primary
 *    position and an explicit pending marker where the value would be.
 *
 * A pending row is never allowed to look like a filled-in one: no placeholder
 * number, no dash, no "tezkorunda", nothing that reads as a value.
 */

function ClockGlyph() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-ink-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PublishedFact({ fact }: { fact: InvestmentFact }) {
  return (
    <div className="border-t border-line px-5 py-4 first:border-t-0 sm:px-6">
      {/* One <dl> per row, not one around the whole table: a <div> inside a
          <dl> may hold only <dt>/<dd>, and a row also carries the status badge,
          the source attribution and a note, none of which belong to a term. */}
      <dl className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <dt className="text-sm text-ink-500">{fact.label}</dt>
        <dd className="text-sm font-semibold text-ink-900 sm:text-right">{fact.value}</dd>
      </dl>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        <Badge tone="brand">{PUBLISHED_LABEL}</Badge>
        {fact.source ? (
          <span className="text-[11px] text-ink-400">Manba: {fact.source}</span>
        ) : null}
      </div>
      {fact.note ? (
        <p className="mt-2 text-xs leading-relaxed text-ink-400">{fact.note}</p>
      ) : null}
    </div>
  );
}

export function PendingField({ field }: { field: InvestmentPendingField }) {
  return (
    <div className="border-t border-dashed border-line px-5 py-4 first:border-t-0 sm:px-6">
      <dl className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <dt className="text-sm text-ink-500">{field.label}</dt>
        <dd className="text-sm sm:text-right">
          <PendingValue label={PENDING_LABEL} />
        </dd>
      </dl>
      {field.hint ? (
        <div className="mt-1.5 flex gap-2">
          <ClockGlyph />
          <p className="text-xs leading-relaxed text-ink-400">{field.hint}</p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * One list that holds both states. Used where a single table has to show what
 * is known and what is not — the visual difference is the point, so the two
 * row types must stay in the same list rather than being split apart.
 */
export function FactTable({
  published,
  pending,
  className = '',
}: {
  published: InvestmentFact[];
  pending: InvestmentPendingField[];
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-xl border border-line bg-surface ${className}`}>
      {published.map((fact) => (
        <PublishedFact key={fact.id} fact={fact} />
      ))}
      {pending.map((field) => (
        <PendingField key={field.id} field={field} />
      ))}
    </div>
  );
}
