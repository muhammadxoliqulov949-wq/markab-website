/**
 * Account domain types.
 *
 * These types describe the shape a real Markab account backend would return.
 * They exist so the dashboard has clean interfaces to render against — NOT so
 * the prototype can invent data to fill them. Every provider currently returns
 * `unavailable`, and the UI renders that as an explicit state.
 *
 * There is deliberately no field for a balance, a debt, a credit score, an
 * income figure or any other personal financial value. When the real backend
 * arrives it will bring its own contract; this prototype does not pre-empt it
 * with guesswork.
 */

/** Lifecycle of a financing application. */
export type ApplicationStatus =
  /** Saved locally by the visitor; never transmitted. */
  | 'draft'
  /** Submitted to a real backend. Only a real backend may set this. */
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected';

export type FinancingApplication = {
  id: string;
  /** 'Namuna' identifiers mark fixture rows the visitor can recognise as fake. */
  reference: string;
  /** Product the application is about, when known. */
  productTitle: string | null;
  productHref: string | null;
  status: ApplicationStatus;
  /** ISO date string, or null when unknown. */
  createdAt: string | null;
};

export type FinancingAgreement = {
  id: string;
  reference: string;
  productTitle: string | null;
  productHref: string | null;
  /** Contract type as published by the source, or null. */
  contractType: string | null;
  /** Monthly payment as published on the agreement, or null. Never calculated. */
  monthlyPaymentUzs: number | null;
  /** Remaining term in months, or null when the source does not state it. */
  termMonths: number | null;
};

/**
 * One line of a payment schedule.
 *
 * `amountUzs` is null in every row the prototype shows: a schedule without an
 * official figure is rendered as a structural placeholder, never as an example
 * amount that could be mistaken for a real instalment.
 */
export type PaymentEntry = {
  id: string;
  /** Sequence number, e.g. 1 for the first payment. */
  sequence: number;
  dueDate: string | null;
  amountUzs: number | null;
  status: 'pending_data' | 'due' | 'paid' | 'overdue';
};

export type AccountNotification = {
  id: string;
  title: string;
  body: string | null;
  createdAt: string | null;
  read: boolean;
};

/**
 * A saved catalogue item.
 *
 * Saved items are real visitor actions held in browser-local storage — they are
 * the one part of the dashboard backed by something the visitor actually did.
 * They are still not an account: nothing syncs anywhere.
 */
export type SavedItem = {
  /** 'car' | 'electronics' */
  kind: 'car' | 'electronics';
  /** Slug (car) or id (electronics). */
  ref: string;
  title: string;
  priceUzs: number;
  image: string | null;
  href: string;
  savedAt: string;
};

/** Everything the dashboard would show if an account backend existed. */
export type AccountSnapshot = {
  applications: FinancingApplication[];
  agreements: FinancingAgreement[];
  payments: PaymentEntry[];
  notifications: AccountNotification[];
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: 'Qoralama / yuborilmagan',
  submitted: 'Yuborilgan',
  under_review: 'Ko‘rib chiqilmoqda',
  approved: 'Tasdiqlangan',
  rejected: 'Rad etilgan',
};
