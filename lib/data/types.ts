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
  sort?: 'popular' | 'price-asc' | 'price-desc';
  page?: number;
  pageSize?: number;
}
