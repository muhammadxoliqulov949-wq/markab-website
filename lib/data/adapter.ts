import type {
  FaqItem,
  Lesson,
  LessonCategory,
  LessonQuery,
  LoyaltyProgram,
  Paginated,
  Product,
  ProductFacets,
  ProductQuery,
  Result,
  Vehicle,
  VehicleFacets,
  VehicleQuery,
  InvestmentProfile,
} from './types';
import type { AccountSnapshot } from '../account/types';

/**
 * Data-source contract.
 *
 * UI  →  repository (lib/data/index.ts)  →  DataAdapter  →  provider
 *
 * Two providers exist:
 *   • mockProvider  – local fixtures built from verified public listing data
 *   • httpProvider  – real Markab API (requires credentials; not enabled)
 *
 * Swapping providers must never require a UI change.
 */
export interface DataAdapter {
  readonly name: string;

  listVehicles(query?: VehicleQuery): Promise<Result<Paginated<Vehicle>>>;
  getVehicleBySlug(slug: string): Promise<Result<Vehicle>>;
  /** Real filter options for the marketplace (never guessed by the UI). */
  getVehicleFacets(): Promise<Result<VehicleFacets>>;

  listProducts(query?: ProductQuery): Promise<Result<Paginated<Product>>>;
  getProductById(id: string): Promise<Result<Product>>;
  /** Real filter options for the electronics catalogue. */
  getProductFacets(): Promise<Result<ProductFacets>>;

  getFeatured(): Promise<Result<{ vehicles: Vehicle[]; products: Product[] }>>;

  /**
   * Academy listing. `q` and `category` are optional and combinable; results
   * are deterministic so the same URL always yields the same list.
   */
  listLessons(query?: LessonQuery): Promise<Result<Lesson[]>>;
  getLessonBySlug(slug: string): Promise<Result<Lesson>>;
  /**
   * Categories counted against real lessons, so the Academy never offers a
   * filter that returns nothing.
   */
  getLessonCategories(): Promise<Result<LessonCategory[]>>;
  /**
   * Deterministic related lessons — same category first, then shared topics,
   * then title order. Never labelled a recommendation or an AI suggestion.
   */
  listRelatedLessons(slug: string, limit?: number): Promise<Result<Lesson[]>>;

  listFaq(): Promise<Result<FaqItem[]>>;

  /**
   * The investment product as the source can support it. Any value Markab has
   * not published arrives as null and renders as a pending marker — never as a
   * number the UI invented.
   */
  getInvestmentProfile(): Promise<Result<InvestmentProfile>>;

  /**
   * The signed-in customer's account: applications, agreements, payment
   * schedule and notifications.
   *
   * There is no authentication backend and no account backend in this
   * prototype, so BOTH providers return `unavailable` — that is the truthful
   * answer and the UI renders it as an explicit state. The interface exists so
   * a real account service can be dropped in without touching a component.
   */
  getAccountSnapshot(): Promise<Result<AccountSnapshot>>;

  /**
   * The loyalty program: published material, what works today, and what needs
   * a backend — kept as three separate things on purpose.
   */
  getLoyaltyProgram(): Promise<Result<LoyaltyProgram>>;
}
