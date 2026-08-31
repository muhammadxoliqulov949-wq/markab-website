import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import type { InvestmentDocument } from '@/lib/data/types';
import { investmentContactHref } from '@/lib/investment/status';

/**
 * Documents & transparency.
 *
 * Every category is listed even though every one of them is empty, because a
 * missing document is information too. What is NOT allowed here is a download
 * button for a file that does not exist — a pending document renders as a
 * pending row with a "so'rash" action that opens the contact form, never as a
 * link to a PDF nobody wrote.
 */
export function DocumentList({ documents }: { documents: InvestmentDocument[] }) {
  return (
    <ul className="overflow-hidden rounded-xl border border-line bg-surface">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex flex-col gap-3 border-t border-line px-5 py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-ink-900">{doc.title}</h3>
              <Badge tone={doc.href ? 'brand' : 'pending'}>
                {doc.href ? 'Mavjud' : 'Rasmiy hujjat kutilmoqda'}
              </Badge>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-400">{doc.description}</p>
          </div>

          {doc.href ? (
            <ButtonLink href={doc.href} variant="secondary" size="sm" className="shrink-0">
              Yuklab olish
            </ButtonLink>
          ) : (
            <ButtonLink
              href={investmentContactHref('documents')}
              variant="ghost"
              size="sm"
              className="shrink-0"
            >
              So‘rash
            </ButtonLink>
          )}
        </li>
      ))}
    </ul>
  );
}
