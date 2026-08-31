import { productCategories, products } from './fixtures/products';
import { vehicles } from './fixtures/vehicles';
import { faqItems, lessons } from './fixtures/academy';
import { investorFlow } from './fixtures/content';
import { investmentProfile } from './fixtures/investment';
import { empty, notFound, success } from './types';
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
  InvestmentProfile,
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
  if (query.year) items = items.filter((v) => v.year === query.year);
  if (query.yearFrom) items = items.filter((v) => v.year >= query.yearFrom!);
  if (query.yearTo) items = items.filter((v) => v.year <= query.yearTo!);
  if (query.priceMin !== undefined) items = items.filter((v) => v.priceUzs >= query.priceMin!);
  if (query.priceMax !== undefined) items = items.filter((v) => v.priceUzs <= query.priceMax!);
  if (query.condition) {
    const wantNew = query.condition === 'new';
    items = items.filter((v) => v.isNew === wantNew);
  }
  if (query.hasFinancing) {
    items = items.filter((v) => v.financing.monthlyPaymentUzs !== null);
  }

  switch (query.sort) {
    case 'price-asc':
      items.sort((a, b) => a.priceUzs - b.priceUzs || a.id.localeCompare(b.id));
      break;
    case 'price-desc':
      items.sort((a, b) => b.priceUzs - a.priceUzs || a.id.localeCompare(b.id));
      break;
    case 'mileage-asc':
      items.sort((a, b) => a.mileageKm - b.mileageKm || a.id.localeCompare(b.id));
      break;
    default:
      // 'newest' — year descending. `id` is the tie-breaker so pagination is
      // deterministic instead of relying on insertion order.
      items.sort((a, b) => b.year - a.year || a.id.localeCompare(b.id));
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
  if (query.storageGb !== undefined) {
    items = items.filter((p) => p.storageGb === query.storageGb);
  }
  if (query.batteryMin !== undefined) {
    items = items.filter(
      (p) => p.batteryHealthPercent !== null && p.batteryHealthPercent >= query.batteryMin!,
    );
  }
  if (query.batteryMax !== undefined) {
    items = items.filter(
      (p) => p.batteryHealthPercent !== null && p.batteryHealthPercent <= query.batteryMax!,
    );
  }
  // Only records the source explicitly marks sold out are removed. "unknown"
  // is not availability — it is the absence of published availability — so it
  // is never silently promoted to in-stock nor dropped here.
  if (query.hideOutOfStock) items = items.filter((p) => p.stockStatus !== 'out_of_stock');
  if (query.hasFinancing) {
    items = items.filter((p) => p.financing.monthlyPaymentUzs !== null);
  }

  switch (query.sort) {
    case 'price-asc':
      items.sort((a, b) => a.priceUzs - b.priceUzs || a.id.localeCompare(b.id));
      break;
    case 'price-desc':
      items.sort((a, b) => b.priceUzs - a.priceUzs || a.id.localeCompare(b.id));
      break;
    case 'popular':
      items.sort((a, b) => b.views - a.views || a.id.localeCompare(b.id));
      break;
    // Deterministic: identical output on every request, so pagination can
    // never shuffle records between pages.
    default:
      items.sort((a, b) => a.id.localeCompare(b.id));
  }

  return items;
}

function countBy<T, K>(source: T[], key: (item: T) => K | null): { value: K; count: number }[] {
  const map = new Map<K, number>();
  source.forEach((item) => {
    const value = key(item);
    if (value === null || value === undefined) return;
    map.set(value, (map.get(value) ?? 0) + 1);
  });
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => String(a.value).localeCompare(String(b.value)));
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

  /**
   * Facet counts are computed from the same records the marketplace lists, so
   * the UI can never offer a filter value that returns zero results.
   */
  async getVehicleFacets(): Promise<Result<VehicleFacets>> {
    if (vehicles.length === 0) return empty<VehicleFacets>();

    const countBy = <T extends string | number>(pick: (v: Vehicle) => T) => {
      const map = new Map<T, number>();
      vehicles.forEach((v) => {
        const key = pick(v);
        map.set(key, (map.get(key) ?? 0) + 1);
      });
      return map;
    };

    const brands = [...countBy((v) => v.brand).entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value));

    const years = [...countBy((v) => v.year).entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.value - a.value);

    const fuelTypes = [...countBy((v) => v.fuelType).entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);

    const transmissions = [...countBy((v) => v.transmission).entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);

    const newCount = vehicles.filter((v) => v.isNew).length;
    const condition: { value: 'new' | 'used'; count: number }[] = [];
    if (newCount > 0) condition.push({ value: 'new', count: newCount });
    if (vehicles.length - newCount > 0) {
      condition.push({ value: 'used', count: vehicles.length - newCount });
    }

    return success({
      total: vehicles.length,
      brands,
      years,
      priceMin: Math.min(...vehicles.map((v) => v.priceUzs)),
      priceMax: Math.max(...vehicles.map((v) => v.priceUzs)),
      fuelTypes,
      transmissions,
      condition,
      withFinancing: vehicles.filter((v) => v.financing.monthlyPaymentUzs !== null).length,
    });
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

  async getProductFacets(): Promise<Result<ProductFacets>> {
    if (products.length === 0) return empty<ProductFacets>();

    // Category labels come from the fixture's own catalogue definition, so the
    // UI never has to hard-code a translation.
    const labelFor = (id: string) =>
      productCategories.find((entry) => entry.id === id)?.name ?? id;

    return success<ProductFacets>({
      total: products.length,
      categories: countBy(products, (p) => p.category).map((entry) => ({
        value: entry.value,
        label: labelFor(entry.value),
        count: entry.count,
      })),
      brands: countBy(products, (p) => p.brand),
      storages: countBy(products, (p) => p.storageGb).sort((a, b) => a.value - b.value),
      batteryHealth: countBy(products, (p) => p.batteryHealthPercent).sort(
        (a, b) => b.value - a.value,
      ),
      priceMin: Math.min(...products.map((p) => p.priceUzs)),
      priceMax: Math.max(...products.map((p) => p.priceUzs)),
      inStock: products.filter((p) => p.stockStatus === 'in_stock').length,
      outOfStock: products.filter((p) => p.stockStatus === 'out_of_stock').length,
      unknownStock: products.filter((p) => p.stockStatus === 'unknown').length,
      withFinancing: products.filter((p) => p.financing.monthlyPaymentUzs !== null).length,
    });
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

  /**
   * Investment profile.
   *
   * The published half comes from the fixture (which only contains wording that
   * appears in Markab's own public material). The pending half is a fixed list
   * of the fields a person needs before investing — every one of them null,
   * because none of them is published.
   */
  async getInvestmentProfile(): Promise<Result<InvestmentProfile>> {
    return success({
      ...investmentProfile,
      // The published model description is Markab's own three-step diagram.
      modelTitle: investorFlow.title,
      modelSteps: investorFlow.steps,
    });
  },
};
