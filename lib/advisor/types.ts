import type { FuelType, Product, Transmission, Vehicle } from '@/lib/data/types';

/**
 * Advisor domain types.
 *
 * The advisor only ever ranks records that already exist in the repository —
 * there is no field here for a product, price, spec or financing value the
 * source did not publish. `null` means "the user did not specify", never
 * "we guessed a sensible default".
 */

export type AdvisorCategory = 'car' | 'electronics';

/** Hard constraints for cars. Every non-null value MUST match. */
export interface CarPreferences {
  budgetMax: number | null;
  brand: string | null;
  fuelType: FuelType | null;
  transmission: Transmission | null;
  condition: 'new' | 'used' | null;
  yearFrom: number | null;
  /** true → keep only listings with a monthly payment actually published. */
  requireFinancing: boolean;
}

/** Hard constraints for electronics. Every non-null value MUST match. */
export interface ElectronicsPreferences {
  budgetMax: number | null;
  category: string | null;
  brand: string | null;
  storageMinGb: number | null;
  batteryMinPercent: number | null;
  /**
   * true → keep only listings the source explicitly marks in stock.
   * "unknown" is the absence of published availability, so it is never
   * promoted to available here (Phase 3 rule).
   */
  requireInStock: boolean;
  requireFinancing: boolean;
}

export type AdvisorPreferences =
  | { category: 'car'; car: CarPreferences }
  | { category: 'electronics'; electronics: ElectronicsPreferences };

export const EMPTY_CAR_PREFERENCES: CarPreferences = {
  budgetMax: null,
  brand: null,
  fuelType: null,
  transmission: null,
  condition: null,
  yearFrom: null,
  requireFinancing: false,
};

export const EMPTY_ELECTRONICS_PREFERENCES: ElectronicsPreferences = {
  budgetMax: null,
  category: null,
  brand: null,
  storageMinGb: null,
  batteryMinPercent: null,
  requireInStock: false,
  requireFinancing: false,
};

/**
 * One recommendation.
 *
 * `reasons` is built ONLY from fields that were both requested and actually
 * matched — the engine cannot produce a sentence about a feature it did not
 * verify. `unmet` is empty for an exact match and populated for a
 * "nearest alternative", so a relaxed result is never presented as a match.
 */
export interface AdvisorMatch {
  id: string;
  kind: AdvisorCategory;
  title: string;
  /** Real record fields (brand/model, year, mileage — never invented). */
  subtitle: string;
  priceUzs: number;
  image: string | null;
  href: string;
  /** Deterministic ranking score, higher is better. */
  score: number;
  reasons: string[];
  unmet: string[];
  /** Published monthly payment only; null when the source publishes none. */
  financingMonthlyUzs: number | null;
  /** Electronics only. */
  stock: { label: string; tone: 'success' | 'warning' | 'pending' } | null;
  /** Published spec rows used by the comparison table. */
  specs: { label: string; value: string | null }[];
  year: number | null;
  brand: string | null;
}

export type AdvisorStatus = 'success' | 'empty' | 'unavailable' | 'error';

export interface AdvisorResult {
  status: AdvisorStatus;
  /** Matches every hard constraint the visitor set. */
  exact: AdvisorMatch[];
  /**
   * Shown only when `exact` is empty. Each entry states which requirement it
   * failed, so nothing is silently relaxed.
   */
  nearest: AdvisorMatch[];
  /** Which hard requirements blocked exact matches, most common first. */
  blockers: { label: string; count: number }[];
  totalConsidered: number;
  /** Short honest note about the ranking method. */
  note: string | null;
}

/** Catalogue data handed to the engine — always from the repository. */
export interface AdvisorCatalogue {
  vehicles: Vehicle[];
  products: Product[];
}
