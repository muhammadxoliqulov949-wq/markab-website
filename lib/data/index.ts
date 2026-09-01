import { httpProvider } from './httpProvider';
import { mockProvider } from './mockProvider';
import type { DataAdapter } from './adapter';
import { vehicleBrands } from './fixtures/vehicles';
import { productCategories } from './fixtures/products';
import type { LessonQuery, ProductQuery, VehicleQuery } from './types';

/**
 * Repository — the single entry point the UI talks to.
 *
 * Provider selection is environment-driven so the production API can replace
 * fixtures without touching a single component.
 */
function getAdapter(): DataAdapter {
  const source = process.env.MARKAB_DATA_SOURCE ?? 'mock';
  return source === 'http' ? httpProvider : mockProvider;
}

export const repository = {
  listVehicles: (query?: VehicleQuery) => getAdapter().listVehicles(query),
  getVehicleBySlug: (slug: string) => getAdapter().getVehicleBySlug(slug),
  getVehicleFacets: () => getAdapter().getVehicleFacets(),
  listProducts: (query?: ProductQuery) => getAdapter().listProducts(query),
  getProductById: (id: string) => getAdapter().getProductById(id),
  getProductFacets: () => getAdapter().getProductFacets(),
  getFeatured: () => getAdapter().getFeatured(),
  searchCatalogue: (query: string, limitPerKind?: number) =>
    getAdapter().searchCatalogue(query, limitPerKind),
  listLessons: (query?: LessonQuery) => getAdapter().listLessons(query),
  getLessonBySlug: (slug: string) => getAdapter().getLessonBySlug(slug),
  getLessonCategories: () => getAdapter().getLessonCategories(),
  listRelatedLessons: (slug: string, limit?: number) =>
    getAdapter().listRelatedLessons(slug, limit),
  listFaq: () => getAdapter().listFaq(),
  getInvestmentProfile: () => getAdapter().getInvestmentProfile(),
  getAccountSnapshot: () => getAdapter().getAccountSnapshot(),
  getLoyaltyProgram: () => getAdapter().getLoyaltyProgram(),
};

export const activeDataSourceName = getAdapter().name;

/** Human-readable note surfaced in the UI so demo data is never mistaken for live data. */
export const dataSourceNote =
  activeDataSourceName === 'http'
    ? null
    : 'Namuna ma’lumotlari: markab.uz ochiq sahifalaridagi tasdiqlangan e’lonlar asosida.';

export { vehicleBrands, productCategories };
export * from './types';
