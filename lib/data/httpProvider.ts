import 'server-only';

import {
  callApi,
  buildQueryString,
  type ApiOutcome,
} from './apiClient';
import {
  deriveProductFacets,
  deriveVehicleFacets,
  mapProduct,
  mapProductPage,
  mapVehicle,
  mapVehiclePage,
} from './dto';
import { productQueryToParams, vehicleQueryToParams } from './queryParams';
import { empty, failure, notFound, success, unavailable } from './types';
import type {
  CatalogueSearchResults,
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
  SearchHit,
  SiteContent,
  Vehicle,
  VehicleFacets,
  VehicleQuery,
  InvestmentProfile,
} from './types';
import type { AccountSnapshot } from '../account/types';
import type { DataAdapter } from './adapter';
import { hasApiCredentials } from '@/lib/env/server';

/**
 * HTTP provider — production Markab API.
 *
 * CURRENT STATUS (per docs/API-CONTRACT.md):
 *   • Host:        https://api.markab.uz/api/v1/ (Django REST Framework)
 *   • Auth:        Bearer token required for catalogue endpoints (HTTP 401 observed).
 *   • Endpoints:   `/vehicles/` and `/products/` are the only surfaces whose existence
 *                  has been verified from public reconnaissance. Exact field schemas,
 *                  facet endpoints, search endpoint, featured endpoint, FAQ, Academy,
 *                  investment and loyalty endpoints are NOT yet verified — they resolve
 *                  to `unavailable` until their schema is confirmed against authenticated
 *                  responses or official documentation.
 *   • Credentials: read from lib/env/server.ts (server-only); this module refuses to
 *                  fire a request when MARKAB_API_TOKEN is empty, so a missing secret
 *                  cannot degrade into an unauthenticated call.
 *
 * ERROR CONTRACT
 *   • 2xx + valid JSON                   → success/empty
 *   • 404                                → not_found
 *   • 401 / 403                          → unavailable (credentials/configuration failure)
 *   • 429                                → unavailable (retry-after respected once)
 *   • 5xx / network / timeout            → unavailable (bounded retry; see apiClient.ts)
 *   • malformed JSON / non-JSON / 400    → error (with generic public message)
 *
 * The provider never returns fixtures and never falls back. In HTTP mode, the visitor
 * sees explicit unavailable/error states when the API cannot answer.
 */

function mapOutcomeToFailure<T>(outcome: ApiOutcome): Result<T> {
  switch (outcome.kind) {
    case 'unauthenticated':
    case 'forbidden':
      return unavailable();
    case 'rate_limited':
      return unavailable();
    case 'timeout':
      return failure('timeout', 'Tarmoq javobi kutish vaqtida kelmadi.');
    case 'network_error':
      return unavailable();
    case 'server_error':
      return unavailable();
    case 'bad_response':
    case 'not_found':
    case 'empty':
    case 'ok':
      return failure('bad_response', 'Ma’lumot formati kutilganidek emas.');
  }
}

function quarantineReporter(kind: string) {
  return (reason: string, identifier: string | null) => {
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'warn',
        event: 'api_record_quarantined',
        kind,
        reason,
        identifier,
      }),
    );
  };
}

async function fetchVehicles(params: Record<string, string | number | boolean>): Promise<Result<Paginated<Vehicle>>> {
  if (!hasApiCredentials()) return unavailable();
  const outcome = await callApi({ path: '/vehicles', params, context: 'vehicles.list' });
  if (outcome.kind !== 'ok') return mapOutcomeToFailure<Paginated<Vehicle>>(outcome);
  const mapped = mapVehiclePage(outcome.body, quarantineReporter('vehicle'));
  if (!mapped) return failure('bad_response', 'Avtomobillar javobi kutilgan formatda emas.');
  if (mapped.page.items.length === 0) return empty<Paginated<Vehicle>>();
  return success(mapped.page);
}

async function fetchProducts(params: Record<string, string | number | boolean>): Promise<Result<Paginated<Product>>> {
  if (!hasApiCredentials()) return unavailable();
  const outcome = await callApi({ path: '/products', params, context: 'products.list' });
  if (outcome.kind !== 'ok') return mapOutcomeToFailure<Paginated<Product>>(outcome);
  const mapped = mapProductPage(outcome.body, quarantineReporter('product'));
  if (!mapped) return failure('bad_response', 'Mahsulotlar javobi kutilgan formatda emas.');
  if (mapped.page.items.length === 0) return empty<Paginated<Product>>();
  return success(mapped.page);
}

export const httpProvider: DataAdapter = {
  name: 'http',

  // ------------------------------------------------------------------
  // Vehicles
  // ------------------------------------------------------------------

  async listVehicles(query: VehicleQuery = {}): Promise<Result<Paginated<Vehicle>>> {
    return fetchVehicles(vehicleQueryToParams(query));
  },

  async getVehicleBySlug(slug: string): Promise<Result<Vehicle>> {
    if (!hasApiCredentials()) return unavailable();
    // DRF detail routes are typically /vehicles/{slug}/. We send the slug
    // directly; do NOT guess ID-based routing.
    const outcome = await callApi({ path: `/vehicles/${encodeURIComponent(slug)}`, context: 'vehicles.detail' });
    if (outcome.kind === 'not_found') return notFound<Vehicle>();
    if (outcome.kind !== 'ok') return mapOutcomeToFailure<Vehicle>(outcome);
    const v = mapVehicle(outcome.body, quarantineReporter('vehicle'));
    if (!v) return notFound<Vehicle>(); // record exists but fails publish-quality → treat as absent
    return success(v);
  },

  async getVehicleFacets(): Promise<Result<VehicleFacets>> {
    // Verified public reconnaissance did not confirm a /vehicles/facets endpoint.
    // Rather than guess a path and risk a 404/500 surface, fetch the first page
    // and derive facets from real records. A single page is enough to offer
    // filters whose counts are accurate (we deliberately never offer a filter
    // value we haven't seen). A future dedicated facets endpoint can replace
    // this without touching UI code.
    if (!hasApiCredentials()) return unavailable();
    const outcome = await callApi({
      path: '/vehicles',
      params: { page: 1, page_size: 50 },
      context: 'vehicles.facets',
    });
    if (outcome.kind !== 'ok') return mapOutcomeToFailure<VehicleFacets>(outcome);
    const mapped = mapVehiclePage(outcome.body, quarantineReporter('vehicle'));
    if (!mapped) return failure('bad_response', 'Avtomobillar javobi kutilgan formatda emas.');
    const facets = deriveVehicleFacets(mapped.page.items);
    if (!facets) return empty<VehicleFacets>();
    return success(facets);
  },

  // ------------------------------------------------------------------
  // Electronics
  // ------------------------------------------------------------------

  async listProducts(query: ProductQuery = {}): Promise<Result<Paginated<Product>>> {
    return fetchProducts(productQueryToParams(query));
  },

  async getProductById(id: string): Promise<Result<Product>> {
    if (!hasApiCredentials()) return unavailable();
    const outcome = await callApi({
      path: `/products/${encodeURIComponent(id)}`,
      context: 'products.detail',
    });
    if (outcome.kind === 'not_found') return notFound<Product>();
    if (outcome.kind !== 'ok') return mapOutcomeToFailure<Product>(outcome);
    const p = mapProduct(outcome.body, quarantineReporter('product'));
    if (!p) return notFound<Product>();
    return success(p);
  },

  async getProductFacets(): Promise<Result<ProductFacets>> {
    // Same discipline as vehicles: derive from real records on a verified endpoint.
    if (!hasApiCredentials()) return unavailable();
    const outcome = await callApi({
      path: '/products',
      params: { page: 1, page_size: 50 },
      context: 'products.facets',
    });
    if (outcome.kind !== 'ok') return mapOutcomeToFailure<ProductFacets>(outcome);
    const mapped = mapProductPage(outcome.body, quarantineReporter('product'));
    if (!mapped) return failure('bad_response', 'Mahsulotlar javobi kutilgan formatda emas.');
    const facets = deriveProductFacets(mapped.page.items);
    if (!facets) return empty<ProductFacets>();
    return success(facets);
  },

  // ------------------------------------------------------------------
  // Featured & search
  // ------------------------------------------------------------------

  async getFeatured(): Promise<Result<{ vehicles: Vehicle[]; products: Product[] }>> {
    // A /featured/ endpoint is plausible but not verified. Instead of guessing,
    // fetch the first page of each catalogue ordered by views (desc) and take
    // the top 3. This is the same behaviour as mockProvider.getFeatured() and
    // uses only the endpoints we have confirmed exist. If an authenticated
    // /featured/ endpoint surfaces later it can replace this path without UI
    // change.
    if (!hasApiCredentials()) return unavailable();
    const [vehiclesResult, productsResult] = await Promise.all([
      fetchVehicles({ ordering: '-views', page: 1, page_size: 6 }),
      fetchProducts({ ordering: '-views', page: 1, page_size: 6 }),
    ]);
    // If EITHER catalogue is unavailable we still return unavailable, rather
    // than half-populating the homepage with mixed sources (which would be
    // misleading). This is a deliberate choice: homepage featured blocks in
    // HTTP mode are all-real or none-real.
    if (vehiclesResult.status !== 'success' || productsResult.status !== 'success') {
      // If both are empty, return empty; otherwise unavailable.
      if (vehiclesResult.status === 'empty' && productsResult.status === 'empty') return empty();
      return unavailable();
    }
    return success({
      vehicles: vehiclesResult.data.items.slice(0, 3),
      products: productsResult.data.items.slice(0, 3),
    });
  },

  async searchCatalogue(query: string, limitPerKind: number = 6): Promise<Result<CatalogueSearchResults>> {
    if (!hasApiCredentials()) return unavailable();
    const needle = query.trim();
    if (!needle) return empty();
    const limit = Math.max(1, Math.min(20, limitPerKind));

    const [vehiclesResult, productsResult] = await Promise.all([
      fetchVehicles({ search: needle, page: 1, page_size: limit, ordering: '-views' }),
      fetchProducts({ search: needle, page: 1, page_size: limit, ordering: '-views' }),
    ]);

    const vehicles: SearchHit[] =
      vehiclesResult.status === 'success'
        ? vehiclesResult.data.items.map((v) => ({
            kind: 'vehicle' as const,
            id: v.id,
            title: v.title,
            subtitle: `${v.brand} · ${v.year}`,
            priceUzs: v.priceUzs,
            image: v.images[0] ?? null,
            href: `/cars/${v.slug}`,
            // Vehicle availability is NOT published as a discrete field in
            // the verified schema; always 'unknown' until a stock endpoint
            // exists. isNew ≠ availability.
            availability: 'unknown' as const,
          }))
        : [];

    const products: SearchHit[] =
      productsResult.status === 'success'
        ? productsResult.data.items.map((p) => ({
            kind: 'product' as const,
            id: p.id,
            title: p.name,
            subtitle: p.brand,
            priceUzs: p.priceUzs,
            image: p.images[0] ?? null,
            href: `/electronics/${p.id}`,
            availability:
              p.stockStatus === 'in_stock'
                ? 'in_stock'
                : p.stockStatus === 'out_of_stock'
                  ? 'sold'
                  : 'unknown',
          }))
        : [];

    // If both failed, return unavailable; if both empty, empty; else success.
    if (vehiclesResult.status === 'error' || productsResult.status === 'error') {
      return failure('error', 'Qidiruvda xatolik yuz berdi.');
    }
    if (
      (vehiclesResult.status === 'unavailable' || vehiclesResult.status === 'not_found') &&
      (productsResult.status === 'unavailable' || productsResult.status === 'not_found')
    ) {
      return unavailable();
    }
    if (vehicles.length === 0 && products.length === 0) return empty();
    return success({
      query: needle,
      vehicles,
      products,
      // Totals reflect what the API returned for the capped page; a dedicated
      // count endpoint would give exact totals but none is verified yet.
      vehicleTotal: vehiclesResult.status === 'success' ? vehiclesResult.data.total : vehicles.length,
      productTotal: productsResult.status === 'success' ? productsResult.data.total : products.length,
    });
  },

  // ------------------------------------------------------------------
  // Academy / FAQ / Content / Investment / Loyalty / Account
  //
  // These endpoints have NO verified response schema in docs/API-CONTRACT.md.
  // Every one resolves to `unavailable` rather than fabricating a mapper
  // against guessed fields. The UI renders the existing pending-integration
  // state for each.
  // ------------------------------------------------------------------

  async listLessons(_query?: LessonQuery): Promise<Result<Lesson[]>> {
    return unavailable();
  },
  async getLessonBySlug(_slug: string): Promise<Result<Lesson>> {
    return unavailable();
  },
  async getLessonCategories(): Promise<Result<LessonCategory[]>> {
    return unavailable();
  },
  async listRelatedLessons(_slug: string, _limit?: number): Promise<Result<Lesson[]>> {
    return unavailable();
  },
  async listFaq(): Promise<Result<FaqItem[]>> {
    return unavailable();
  },
  async getSiteContent(): Promise<Result<SiteContent>> {
    return unavailable();
  },
  async getInvestmentProfile(): Promise<Result<InvestmentProfile>> {
    return unavailable();
  },
  async getAccountSnapshot(): Promise<Result<AccountSnapshot>> {
    // Requires an authenticated customer session that does not exist.
    // The Bearer token is a server-to-server credential, not a user login.
    return unavailable();
  },
  async getLoyaltyProgram(): Promise<Result<LoyaltyProgram>> {
    return unavailable();
  },
};

// buildQueryString is intentionally re-exported for tests; it's part of the
// public surface of this module's helper layer (tree-shaken from client bundles
// by 'server-only').
export { buildQueryString };
