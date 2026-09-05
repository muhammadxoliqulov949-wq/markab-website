import 'server-only';

import { cache } from 'react';
import { httpProvider } from './httpProvider';
import { mockProvider } from './mockProvider';
import type { DataAdapter } from './adapter';
import { vehicleBrands } from './fixtures/vehicles';
import { productCategories } from './fixtures/products';
import type { LessonQuery, ProductQuery, VehicleQuery } from './types';
import { serverEnv } from '@/lib/env/server';

/**
 * Repository — the single entry point the UI talks to.
 *
 * SERVER-ONLY, and enforced as such: `import 'server-only'` turns any attempt
 * to pull this module into a client bundle into a hard error rather than a
 * silent bundling of the provider graph. Client components therefore receive
 * catalogue data as props from the server components that render them — see
 * `components/sell/SellWizard.tsx`, which used to import this module directly
 * and shipped every fixture to the browser as a side effect.
 *
 * Provider selection is per-request, read through serverEnv():
 *
 *   MARKAB_DATA_SOURCE=mock  → mockProvider   (default; local verified fixtures)
 *   MARKAB_DATA_SOURCE=http  → httpProvider   (real Markab API; token required)
 *
 * NO SILENT FALLBACK: in HTTP mode, if the API is unavailable or returns an
 * error, the UI renders the honest unavailable/error state — fixtures never
 * appear as a stand-in.
 *
 * There is NO module-level provider singleton. Earlier versions captured
 * `getAdapter().name` once at import time, which caused a build-time vs
 * request-time mismatch when the environment changed between build and run
 * (e.g. sitemap built with mock, pages served with http). Every public
 * repository method resolves the adapter fresh per request.
 */
function getAdapter(): DataAdapter {
  const source = serverEnv().dataSource;
  return source === 'http' ? httpProvider : mockProvider;
}

/**
 * Per-request adapter identity. Used by the UI to render the "Demo rejim"
 * disclosure banner when mock data is active. Must NOT be cached at module
 * scope — serverEnv() is read each time so build-time and runtime values
 * always agree with the adapter that actually served the request.
 */
export function currentDataSourceName(): DataAdapter['name'] {
  return getAdapter().name;
}

/**
 * Human-readable note surfaced in the UI when demo/mock data is active.
 *
 * Returns `null` in HTTP mode so no disclosure banner is shown for real data.
 * Evaluated per request via currentDataSourceName() — not a module constant.
 */
export function dataSourceNote(): string | null {
  return currentDataSourceName() === 'http'
    ? null
    : 'Namuna ma’lumotlari: markab.uz ochiq sahifalaridagi tasdiqlangan e’lonlar asosida.';
}

/**
 * Several marketing blocks read the same content during one render. `cache`
 * dedupes them to a single provider call per request, so moving content behind
 * the repository does not multiply data access.
 */
const siteContentOnce = cache(() => getAdapter().getSiteContent());

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
  getSiteContent: () => siteContentOnce(),
  getInvestmentProfile: () => getAdapter().getInvestmentProfile(),
  getAccountSnapshot: () => getAdapter().getAccountSnapshot(),
  getLoyaltyProgram: () => getAdapter().getLoyaltyProgram(),
};

export { vehicleBrands, productCategories };
export * from './types';
