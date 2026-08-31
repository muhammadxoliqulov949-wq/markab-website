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
  yearFrom?: number;
  yearTo?: number;
  priceMin?: number;
  priceMax?: number;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'mileage-asc';
  page?: number;
  pageSize?: number;
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
