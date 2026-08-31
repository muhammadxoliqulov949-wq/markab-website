import type {
  FaqItem,
  Lesson,
  Paginated,
  Product,
  ProductFacets,
  ProductQuery,
  Result,
  Vehicle,
  VehicleFacets,
  VehicleQuery,
} from './types';

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

  listLessons(category?: string): Promise<Result<Lesson[]>>;
  getLessonBySlug(slug: string): Promise<Result<Lesson>>;

  listFaq(): Promise<Result<FaqItem[]>>;
}
