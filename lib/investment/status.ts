/**
 * Investment information status — pure module, no data.
 *
 * The whole Phase 5 investment surface rests on one distinction:
 *
 *   published — Markab's own public material supports it, and we say where.
 *   pending   — nobody has published it, so it is named and left empty.
 *
 * The two must never be visually confusable. A pending row is dashed, muted
 * and carries a clock glyph; a published row is solid and carries its source.
 * Nothing here turns a missing value into a number.
 */

export const PUBLISHED_LABEL = 'E’lon qilingan';
export const PENDING_LABEL = 'Rasmiy ma’lumot kutilmoqda.';

/**
 * Contact handoff for investment interest.
 *
 * There is no "invest now" flow anywhere in this prototype and there must not
 * be one: no balance, no deposit, no confirmation. Every investment CTA ends
 * here, in the ordinary contact form, with the context pre-filled.
 *
 * `/contact?type=sarmoya`                    — general interest
 * `/contact?type=sarmoya&about=documents`    — asking about the documents
 * `/contact?type=sarmoya&about=terms`        — asking about terms
 */
export type InvestmentEnquiry = 'general' | 'documents' | 'terms' | 'risk';

const ENQUIRIES: Record<InvestmentEnquiry, string> = {
  general:
    'Salom! Markab sarmoya modeli bo‘yicha batafsil ma’lumot olmoqchiman. E’lon qilingan shartlar va keyingi bosqich haqida yozishingizni so‘rayman.',
  documents:
    'Salom! Sarmoya bo‘yicha rasmiy hujjatlar (shartnoma namunasi, ommaviy oferta, risk ogohlantiruvi, hisobot shakli) qachon taqdim etilishini bilmoqchiman.',
  terms:
    'Salom! Sarmoya shartlari — minimal miqdor, muddat, foyda mexanizmi va to‘lovlar — rasmiy manbada e’lon qilingach menga yozishingizni so‘rayman.',
  risk:
    'Salom! Sarmoya bilan bog‘liq risklar haqida rasmiy ogohlantiruv hujjatini olmoqchiman.',
};

export function isInvestmentEnquiry(value: string | undefined): value is InvestmentEnquiry {
  return value === 'general' || value === 'documents' || value === 'terms' || value === 'risk';
}

/** `/contact?type=sarmoya&about=documents` */
export function investmentContactHref(enquiry: InvestmentEnquiry = 'general'): string {
  return enquiry === 'general'
    ? '/contact?type=sarmoya'
    : `/contact?type=sarmoya&about=${enquiry}`;
}

export function investmentEnquiryMessage(enquiry: InvestmentEnquiry): string {
  return ENQUIRIES[enquiry];
}
