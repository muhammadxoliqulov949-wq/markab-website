/**
 * Financing handoff — passing a catalogue item into the calculator and the
 * application form.
 *
 * Pure module: it knows the URL contract and the shape of a subject, nothing
 * else. Resolution against real data happens in `subject.ts`, which talks to
 * the repository — never to fixtures.
 */

export type SubjectKind = 'car' | 'electronics';

/** What the calculator/application knows about the item it was handed. */
export type FinancingSubject = {
  kind: SubjectKind;
  /** Slug (car) or id (electronics). */
  ref: string;
  title: string;
  priceUzs: number;
  image: string | null;
  href: string;
  /**
   * Monthly payment as published on the listing, or null when the source
   * published none. This is the ONLY financing figure that may be displayed —
   * it is quoted from the source, never derived here.
   */
  publishedMonthlyUzs: number | null;
};

export function isSubjectKind(value: string | undefined): value is SubjectKind {
  return value === 'car' || value === 'electronics';
}

export function subjectKindLabel(kind: SubjectKind): string {
  return kind === 'car' ? 'Avtomobil' : 'Elektronika';
}

/** `/financing/calculator?productType=car&productId=chevrolet-cobalt-2023` */
export function calculatorHref(kind: SubjectKind, ref: string): string {
  return `/financing/calculator?productType=${kind}&productId=${encodeURIComponent(ref)}`;
}

/** `/financing/apply?type=car&ref=chevrolet-cobalt-2023` */
export function applyHref(kind: SubjectKind, ref: string): string {
  return `/financing/apply?type=${kind}&ref=${encodeURIComponent(ref)}`;
}

export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
