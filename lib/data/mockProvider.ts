import { products } from './fixtures/products';
import { vehicles } from './fixtures/vehicles';
import { faqItems, lessons } from './fixtures/academy';
import { empty, notFound, success } from './types';
import type {
  FaqItem,
  Lesson,
  Paginated,
  Product,
  ProductQuery,
  Result,
  Vehicle,
  VehicleQuery,
} from './types';
import type { DataAdapter } from './adapter';

const DEFAULT_PAGE_SIZE = 12;

function paginate<T>(items: T[], page = 1, pageSize = DEFAULT_PAGE_SIZE): Paginated<T> {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page: safePage,
    pageSize,
  };
}

function applyVehicleFilters(source: Vehicle[], query: VehicleQuery): Vehicle[] {
  let items = [...source];

  if (query.q) {
    const q = query.q.trim().toLowerCase();
    items = items.filter((v) =>
      [v.title, v.brand, v.model, String(v.year)].join(' ').toLowerCase().includes(q),
    );
  }
  if (query.brand) items = items.filter((v) => v.brand === query.brand);
  if (query.fuelType) items = items.filter((v) => v.fuelType === query.fuelType);
  if (query.transmission) items = items.filter((v) => v.transmission === query.transmission);
  if (query.yearFrom) items = items.filter((v) => v.year >= query.yearFrom!);
  if (query.yearTo) items = items.filter((v) => v.year <= query.yearTo!);
  if (query.priceMin !== undefined) items = items.filter((v) => v.priceUzs >= query.priceMin!);
  if (query.priceMax !== undefined) items = items.filter((v) => v.priceUzs <= query.priceMax!);

  switch (query.sort) {
    case 'price-asc':
      items.sort((a, b) => a.priceUzs - b.priceUzs);
      break;
    case 'price-desc':
      items.sort((a, b) => b.priceUzs - a.priceUzs);
      break;
    case 'mileage-asc':
      items.sort((a, b) => a.mileageKm - b.mileageKm);
      break;
    default:
      items.sort((a, b) => b.year - a.year || b.views - a.views);
  }

  return items;
}

function applyProductFilters(source: Product[], query: ProductQuery): Product[] {
  let items = [...source];

  if (query.q) {
    const q = query.q.trim().toLowerCase();
    items = items.filter((p) => `${p.name} ${p.rawTitle} ${p.brand}`.toLowerCase().includes(q));
  }
  if (query.category) items = items.filter((p) => p.category === query.category);
  if (query.brand) items = items.filter((p) => p.brand === query.brand);
  if (query.priceMin !== undefined) items = items.filter((p) => p.priceUzs >= query.priceMin!);
  if (query.priceMax !== undefined) items = items.filter((p) => p.priceUzs <= query.priceMax!);

  switch (query.sort) {
    case 'price-asc':
      items.sort((a, b) => a.priceUzs - b.priceUzs);
      break;
    case 'price-desc':
      items.sort((a, b) => b.priceUzs - a.priceUzs);
      break;
    default:
      items.sort((a, b) => b.views - a.views);
  }

  return items;
}

/**
 * Fixture provider.
 *
 * Data provenance is documented in each fixture file. No value here is invented:
 * anything that was not publicly published is `null` or omitted, and the UI
 * renders it as a pending/integration state.
 */
export const mockProvider: DataAdapter = {
  name: 'mock',

  async listVehicles(query: VehicleQuery = {}): Promise<Result<Paginated<Vehicle>>> {
    const filtered = applyVehicleFilters(vehicles, query);
    if (filtered.length === 0) return empty<Paginated<Vehicle>>();
    return success(paginate(filtered, query.page, query.pageSize));
  },

  async getVehicleBySlug(slug: string): Promise<Result<Vehicle>> {
    const vehicle = vehicles.find((v) => v.slug === slug);
    return vehicle ? success(vehicle) : notFound<Vehicle>();
  },

  async listProducts(query: ProductQuery = {}): Promise<Result<Paginated<Product>>> {
    const filtered = applyProductFilters(products, query);
    if (filtered.length === 0) return empty<Paginated<Product>>();
    return success(paginate(filtered, query.page, query.pageSize));
  },

  async getProductById(id: string): Promise<Result<Product>> {
    const product = products.find((p) => p.id === id);
    return product ? success(product) : notFound<Product>();
  },

  async getFeatured() {
    return success({
      vehicles: [...vehicles].sort((a, b) => b.views - a.views).slice(0, 3),
      products: [...products].sort((a, b) => b.views - a.views).slice(0, 3),
    });
  },

  async listLessons(category?: string): Promise<Result<Lesson[]>> {
    const items = category ? lessons.filter((l) => l.category === category) : lessons;
    return items.length ? success(items) : empty<Lesson[]>();
  },

  async getLessonBySlug(slug: string): Promise<Result<Lesson>> {
    const lesson = lessons.find((l) => l.slug === slug);
    return lesson ? success(lesson) : notFound<Lesson>();
  },

  async listFaq(): Promise<Result<FaqItem[]>> {
    return faqItems.length ? success(faqItems) : empty<FaqItem[]>();
  },
};
