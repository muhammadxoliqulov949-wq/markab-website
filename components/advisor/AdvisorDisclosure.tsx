import { Badge } from '@/components/ui/Badge';
import { ADVISOR_DISCLOSURE, isRuleBasedOnly } from '@/lib/advisor/explanation';

/**
 * Honest labelling for the advisor.
 *
 * Rendered by the PAGE, not by the flow, so it is visible in every state —
 * including "catalogue unavailable". The disclosure qualifies the feature
 * itself, not just the results, so it must not disappear when there are no
 * results to qualify.
 *
 * `isRuleBasedOnly()` is evaluated on the server (the page is a server
 * component), so the badge reflects the configured provider rather than a
 * client-side guess.
 */
export function AdvisorDisclosure() {
  const ruleBased = isRuleBasedOnly();

  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-surface-muted px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={ruleBased ? 'pending' : 'brand'}>
          {ruleBased ? 'Qoidalar asosidagi tavsiya' : 'AI tavsiya'}
        </Badge>
        <span className="text-xs font-medium text-ink-500">Tanlov yordamchisi</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-500">{ADVISOR_DISCLOSURE}</p>
    </div>
  );
}
