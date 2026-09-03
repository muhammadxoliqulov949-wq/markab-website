import { repository } from '@/lib/data';
import { isSubjectKind, type FinancingSubject, type SubjectKind } from '@/lib/financing/handoff';

/**
 * Resolves a financing subject (the item the visitor is asking about) against
 * the data source.
 *
 * Server-only: it goes through the repository, so the calculator and the
 * application form never touch fixtures and never hard-code a product. An
 * unknown id is a normal outcome, not an error — callers render the calculator
 * without a product instead of throwing.
 */

export type SubjectResolution =
  | { status: 'none' }
  | { status: 'invalid' }
  | { status: 'resolved'; subject: FinancingSubject };

/**
 * Full resolution. `invalid` means a handoff was attempted but the id does not
 * match anything in the source.
 */
export async function resolveFinancingSubject(
  kindParam: string | undefined,
  refParam: string | undefined,
): Promise<SubjectResolution> {
  if (!kindParam || !refParam) return { status: 'none' };
  if (!isSubjectKind(kindParam)) return { status: 'invalid' };

  const kind: SubjectKind = kindParam;

  if (kind === 'car') {
    const result = await repository.getVehicleBySlug(refParam);
    if (result.status !== 'success') return { status: 'invalid' };
    const vehicle = result.data;
    return {
      status: 'resolved',
      subject: {
        kind,
        ref: vehicle.slug,
        title: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
        priceUzs: vehicle.priceUzs,
        image: vehicle.images[0] ?? null,
        href: `/cars/${vehicle.slug}`,
        publishedMonthlyUzs: vehicle.financing.monthlyPaymentUzs,
      },
    };
  }

  const result = await repository.getProductById(refParam);
  if (result.status !== 'success') return { status: 'invalid' };
  const product = result.data;
  return {
    status: 'resolved',
    subject: {
      kind,
      ref: product.id,
      title: product.name,
      priceUzs: product.priceUzs,
      image: product.images[0] ?? null,
      href: `/electronics/${product.id}`,
      publishedMonthlyUzs: product.financing.monthlyPaymentUzs,
    },
  };
}

/**
 * Lightweight title lookup used for pre-filling a message (e.g. the
 * availability question from a product card). Returns null on anything it
 * cannot resolve, so callers can silently fall back.
 */
export async function describeSubject(
  kindParam: string | undefined,
  refParam: string | undefined,
): Promise<{ title: string; kind: SubjectKind } | null> {
  const resolution = await resolveFinancingSubject(kindParam, refParam);
  return resolution.status === 'resolved'
    ? { title: resolution.subject.title, kind: resolution.subject.kind }
    : null;
}
