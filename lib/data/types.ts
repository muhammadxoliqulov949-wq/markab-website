/**
 * Domain types + Result envelope.
 *
 * The Result type is the backbone of graceful failure:
 *  - 'success'      data present
 *  - 'empty'        request succeeded, zero records
 *  - 'not_found'    the specific record does not exist  → 404 state (never 500)
 *  - 'error'        request failed                       → Error state + retry
 *  - 'unavailable'  no data source configured            → Pending integration state
 */

import type { AccountSnapshot } from '../account/types';

export type Result<T> =
  | { status: 'success'; data: T }
  | { status: 'empty' }
  | { status: 'not_found' }
  | { status: 'error'; error: { code: string; message: string } }
  | { status: 'unavailable' };

export const success = <T,>(data: T): Result<T> => ({ status: 'success', data });
export const empty = <T,>(): Result<T> => ({ status: 'empty' });
export const notFound = <T,>(): Result<T> => ({ status: 'not_found' });
export const unavailable = <T,>(): Result<T> => ({ status: 'unavailable' });
export const failure = <T,>(code: string, message: string): Result<T> => ({
  status: 'error',
  error: { code, message },
});

export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'gas';
export type Transmission = 'manual' | 'automatic';
export type ContractType = 'taqsit' | 'murabaha';
export type StockStatus = 'in_stock' | 'out_of_stock' | 'unknown';

/**
 * Financing information.
 * `null` means "not available from the source" — it must never be computed,
 * estimated or defaulted by the UI.
 */
export interface Financing {
  monthlyPaymentUzs: number | null;
  initialPaymentUzs: number | null;
  termMonths: number | null;
  totalAmountUzs: number | null;
  contractType: ContractType | null;
}

export const NO_FINANCING: Financing = {
  monthlyPaymentUzs: null,
  initialPaymentUzs: null,
  termMonths: null,
  totalAmountUzs: null,
  contractType: null,
};

export interface Vehicle {
  id: string;
  slug: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  priceUzs: number;
  mileageKm: number;
  fuelType: FuelType;
  transmission: Transmission;
  location: string;
  views: number;
  images: string[];
  isNew: boolean;
  description: string | null;
  features: string[];
  financing: Financing;
}

export interface Product {
  id: string;
  /** Cleaned display name (internal SKUs removed). */
  name: string;
  /** Verbatim public listing title, kept for traceability. */
  rawTitle: string;
  brand: string;
  category: string;
  priceUzs: number;
  images: string[];
  storageGb: number | null;
  batteryHealthPercent: number | null;
  stockStatus: StockStatus;
  views: number;
  /** Unknown specifications are null → rendered as "ma'lumot tayyorlanmoqda". */
  specs: { label: string; value: string | null }[];
  financing: Financing;
}

export interface Lesson {
  slug: string;
  title: string;
  category: string;
  durationLabel: string;
  summary: string | null;
  /** false → lesson structure only, official content pending. */
  hasContent: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  /** null → answer pending official confirmation (never invented). */
  answer: string | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface VehicleQuery {
  q?: string;
  brand?: string;
  fuelType?: string;
  transmission?: string;
  /** Exact model year. */
  year?: number;
  yearFrom?: number;
  yearTo?: number;
  priceMin?: number;
  priceMax?: number;
  /**
   * 'new'  → the source marks the vehicle as new
   * 'used' → otherwise
   * Only these two exist in the data; nothing else is offered in the UI.
   */
  condition?: 'new' | 'used';
  /**
   * true → keep only vehicles whose monthly payment is actually published.
   * This reflects data availability, not a promise that finance is approved.
   */
  hasFinancing?: boolean;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'mileage-asc';
  page?: number;
  pageSize?: number;
}

/**
 * Filter options derived from the data source, never from UI assumptions.
 *
 * The marketplace only offers a filter value that can actually return results,
 * so `VehicleFacets` carries the real brands / years / fuel types /
 * transmissions present plus their counts.
 */
export interface VehicleFacets {
  total: number;
  brands: { value: string; count: number }[];
  years: { value: number; count: number }[];
  priceMin: number;
  priceMax: number;
  fuelTypes: { value: FuelType; count: number }[];
  transmissions: { value: Transmission; count: number }[];
  condition: { value: 'new' | 'used'; count: number }[];
  withFinancing: number;
}

export interface ProductQuery {
  q?: string;
  category?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  /** Exact published capacity in GB. */
  storageGb?: number;
  /** Battery-health window, inclusive. */
  batteryMin?: number;
  batteryMax?: number;
  /** Drops records the source explicitly marks sold out. Unknown stays. */
  hideOutOfStock?: boolean;
  /** Only records with a published monthly payment. */
  hasFinancing?: boolean;
  /**
   * 'default' is a deterministic, reproducible order (stable across requests
   * and pages). 'popular' is left in the contract for the production API but
   * is deliberately not offered in the catalogue UI — the prototype will not
   * present an invented popularity ranking.
   */
  sort?: 'default' | 'popular' | 'price-asc' | 'price-desc';
  page?: number;
  pageSize?: number;
}

/**
 * What the electronics catalogue can actually be filtered by.
 *
 * Every entry is counted against the real records, so a filter is never
 * offered for a value the source cannot return. `batteryHealth` lists the
 * distinct published percentages rather than pre-bucketed ranges — the
 * presentation layer decides how to group them, the data layer does not
 * invent the groups.
 */
export interface ProductFacets {
  total: number;
  categories: { value: string; label: string; count: number }[];
  brands: { value: string; count: number }[];
  storages: { value: number; count: number }[];
  batteryHealth: { value: number; count: number }[];
  priceMin: number;
  priceMax: number;
  /** Counts per stock status, so the UI never has to guess availability. */
  inStock: number;
  outOfStock: number;
  unknownStock: number;
  withFinancing: number;
}

/* ------------------------------------------------------------------ */
/* Investment                                                          */
/* ------------------------------------------------------------------ */

/**
 * One row of investment information.
 *
 * `value` is null unless an official Markab source actually publishes it.
 * There is deliberately no field for a guessed or illustrative value — the UI
 * renders a pending marker instead.
 */
export interface InvestmentFact {
  id: string;
  label: string;
  /** Published value, or null when nothing official exists. */
  value: string | null;
  /** Where the published value comes from, so it can be attributed. */
  source: string | null;
  /** Caution printed under a published value. */
  note: string | null;
}

/** A field a person needs before investing, and which is not published. */
export interface InvestmentPendingField {
  id: string;
  label: string;
  /** What is unknown, so an empty row still says something useful. */
  hint: string | null;
}

/** A document category. `href` is null until a real document exists. */
export interface InvestmentDocument {
  id: string;
  title: string;
  description: string;
  /** null → render a pending state, never a download button. */
  href: string | null;
}

/** One journey step. `confirmed` marks whether an official source describes it. */
export interface InvestmentJourneyStep {
  step: number;
  title: string;
  description: string;
  confirmed: boolean;
}

/** A compliance/standards claim attributed to Markab, never independently asserted. */
export interface ComplianceStatement {
  id: string;
  /** What Markab itself states. */
  statement: string;
  /** Why the prototype does not present it as verified. */
  attribution: string;
}

/**
 * The investment product as the source can actually support it.
 *
 * Everything here is either published (and attributed) or absent. There is no
 * return rate, yield, term, minimum, fee, risk score or payout schedule
 * anywhere in this type — by design.
 */
export interface InvestmentProfile {
  /** Markab's own published label for the model. */
  modelTitle: string;
  /** Markab's published three-step description of the model. */
  modelSteps: string[];
  /** Facts an official source supports. */
  published: InvestmentFact[];
  /** Fields nobody has published. */
  pending: InvestmentPendingField[];
  /** Standards claims, attributed to Markab. */
  compliance: ComplianceStatement[];
  /** Document categories — all pending until real files exist. */
  documents: InvestmentDocument[];
  /** The journey, with unconfirmed steps flagged rather than smoothed over. */
  journey: InvestmentJourneyStep[];
}
