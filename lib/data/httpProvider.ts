import 'server-only';

import { cache } from 'react';

import { apiConfig } from '@/lib/env/server';
import { API_PATHS, apiGet } from './http/client';
import { mapList, mapProduct, mapVehicle, normalisePaged, SCHEMA } from './http/mapping';
import type { Quarantine } from './http/validate';
import { applyVehicleFilters } from '../vehicles/applyQuery';
import { applyProductFilters } from '../products/applyQuery';
import { deriveVehicleFacets } from '../vehicles/facets';
import { deriveProductFacets } from '../products/facets';
import { searchCatalogueRecords } from '../search/catalogue';
import { DEFAULT_PAGE_SIZE, paginate } from './paginate';
import { empty, failure, notFound, success, unavailable } from './types';
import type {
  CatalogueSearchResults,
  FaqItem,
  InvestmentProfile,
  Lesson,
  LessonCategory,
  LessonQuery,
  LoyaltyProgram,
  Paginated,
  Product,
  ProductFacets,
  ProductQuery,
  Result,
  SiteContent,
  Vehicle,
  VehicleFacets,
  VehicleQuery,
} from './types';
import type { AccountSnapshot } from '../account/types';
import type { DataAdapter } from './adapter';

/**
 * HTTP provider — live catalogue data from api.markab.uz.
 *
 * THIS PROVIDER NEVER SERVES FIXTURE DATA. There is no `?? mockProvider`
 * anywhere below it. If the API cannot be reached, is not configured, or
 * returns something we cannot trust, the method returns the honest status
 * (`unavailable` / `error` / `not_found` / `empty`) and the UI renders the
 * matching state. A failed catalogue must look like a failed catalogue, not
 * like an empty one and certainly not like a working one (Phase 13 §10).
 *
 * WHAT IS VERIFIED AND WHAT IS NOT
 *
 * Verified (docs/API-CONTRACT.md §1): the host, the `/api/v1/` base path, that
 * Bearer authentication is required, that DRF redirects a missing trailing
 * slash, and that listings are paginated twelve to a page.
 *
 * Not verified: the response schema. No token has ever been available, so not
 * one response has been read. `SCHEMA.confirmed === false` and every read goes
 * through `lib/data/http/mapping.ts`, which drops records it cannot map rather
 * than guessing at them.
 *
 * Because the schema is unconfirmed, filtering, sorting and pagination happen
 * here over the records we fetched, using the same helpers the fixture provider
 * uses. See `lib/vehicles/applyQuery.ts` for why that is safer than sending
 * guessed query parameters upstream.
 */

/** Hard stop on pagination crawling. 20 pages × 12 = 240 records per request. */
const MAX_PAGES = 20;

/** Shared public message. Diagnostics stay in the server log. */
const PUBLIC_ERROR_MESSAGE = "Ma'lumotlar hozir ko'rsatilmagan.";

/** A record the API sent but that must not be published. */
type Drop = { detail: string; quarantine: Quarantine | null };

type Collection<T> =
  | { ok: true; items: T[]; dropped: Drop[] }
  /** The honest status to surface: an API failure the visitor must be shown. */
  | { ok: false; status: 'empty' | 'not_found' | 'unavailable' | 'error' };

/**
 * Map a transport outcome onto the Result contract.
 *
 * | API outcome      | Result      | Why the visitor sees that                     |
 * |------------------|-------------|-----------------------------------------------|
 * | ok               | (data)      | —                                             |
 * | not_found        | not_found   | the record genuinely is not published         |
 * | 401 / 403        | unavailable | we are not authorised; the catalogue is not ours to show yet |
 * | 429 / 5xx / net  | unavailable | the upstream is not answering; retrying is logged |
 * | malformed JSON   | error       | we received data we cannot trust, so we publish nothing |
 * | misconfigured    | error       | the integration is switched on but not set up |
 *
 * 401 and 403 are deliberately not `error`: they are an operations problem and
 * the customer-facing meaning is the same as any outage — the catalogue cannot
 * be shown. They are logged as errors with the status code.
 */
function toCollectionStatus(kind: string): 'not_found' | 'unavailable' | 'error' {
  switch (kind) {
    case 'not_found':
      return 'not_found';
    case 'unauthorized':
    case 'forbidden':
    case 'rate_limited':
    case 'server_error':
    case 'timeout':
    case 'network':
      return 'unavailable';
    default:
      return 'error';
  }
}

/**
 * Fetch every accessible page of a collection, then map and validate it.
 *
 * Pages are fetched until one comes back short or the cap is hit. The cap is
 * not optimism: an API that reports `count` larger than what it serves must
 * not be able to turn one page request into an unbounded crawl.
 */
async function loadCollection<T>(
  path: (typeof API_PATHS)[keyof typeof API_PATHS],
  mapOne: Parameters<typeof mapList<T>>[1],
  revalidate: number,
): Promise<Collection<T>> {
  const items: T[] = [];
  const dropped: Drop[] = [];
  let rawRecords = 0;

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const outcome = await apiGet<unknown>(path, { page }, { revalidate });

    if (outcome.kind !== 'ok') {
      // A failure on the first page is an answer for the whole collection.
      // A failure part-way through is logged and the pages we already have are
      // published — a truncated listing beats an empty one, and the record
      // count is not inflated because `total` is derived from what we fetched.
      if (page === 1) {
        const status = toCollectionStatus(outcome.kind);
        logApiFailure(path, outcome);
        return { ok: false, status };
      }
      logApiFailure(path, outcome, page);
      break;
    }

    const paged = normalisePaged(outcome.data, page, DEFAULT_PAGE_SIZE);
    if (!paged.ok) {
      logApiFailure(path, { kind: 'malformed', detail: paged.detail }, page);
      return { ok: false, status: 'error' };
    }

    const mapped = mapList(paged.items, mapOne);
    rawRecords += paged.items.length;
    items.push(...mapped.items);
    dropped.push(...mapped.dropped);

    if (paged.items.length < DEFAULT_PAGE_SIZE) break;
    if (page === MAX_PAGES) {
      // Reached the cap with a full page: say so, loudly, in the server log.
      logApiFailure(path, { kind: 'page_cap', detail: `${MAX_PAGES} pages fetched` }, page);
    }
  }

  if (dropped.length > 0) {
    logDropped(path, dropped);
  }

  if (items.length > 0) return { ok: true, items, dropped };

  /**
   * Nothing publishable came back, and the difference matters.
   *
   * `empty` means the source genuinely has no records. `error` means it sent
   * records we could not trust — which, until the response schema is
   * confirmed, is the expected outcome of switching this on. Reporting that as
   * an empty catalogue would tell visitors "Markab has no cars" when the true
   * statement is "we could not read the catalogue".
   */
  if (rawRecords > 0) {
    logApiFailure(path, {
      kind: 'unmappable',
      detail: `${rawRecords} record(s) received, none publishable`,
    });
    return { ok: false, status: 'error' };
  }
  return { ok: false, status: 'empty' };
}

/* -------------------------------------------------------------------------- */
/* Structured logging                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Server-side diagnostics only.
 *
 * Nothing logged here is rendered, and nothing logged here contains a token,
 * an Authorization header, or a full URL with query string. A visitor can
 * never see the difference between "no token configured" and "token revoked";
 * that distinction belongs to whoever runs the service.
 */
function logApiFailure(path: string, outcome: { kind: string; detail?: string }, page?: number): void {
  console.error(
    JSON.stringify({
      event: 'api.collection.failed',
      path,
      page: page ?? 1,
      outcome: outcome.kind,
      detail: outcome.detail,
      schemaConfirmed: SCHEMA.confirmed,
    }),
  );
}

function logDropped(path: string, dropped: Drop[]): void {
  const quarantined = dropped.filter((entry) => entry.quarantine !== null);
  const unusable = dropped.length - quarantined.length;

  console.warn(
    JSON.stringify({
      event: 'api.records.dropped',
      path,
      unusable,
      quarantined: quarantined.length,
      // Rule ids and field names only — never the visitor-facing page, never
      // a customer's data. Enough for an operator to find the record upstream.
      rules: unique(
        quarantined
          .map((entry) => entry.quarantine)
          .filter((q): q is Quarantine => q !== null)
          .map((q) => q.rule),
      ),
    }),
  );
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort();
}

/* -------------------------------------------------------------------------- */
/* Provider                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * One collection fetch per request, shared by every repository method.
 *
 * A listing page asks for vehicles three or four times over a single render
 * (the list itself, the facets, the featured strip, search). `cache` collapses
 * those into one crawl of the endpoint and one mapping pass, so the cost of the
 * HTTP provider does not multiply with the number of blocks on the page.
 */
const vehiclesOnce = cache(
  (): Promise<Collection<Vehicle>> => loadCollection(API_PATHS.vehicles, mapVehicle, revalidateFor('vehicles')),
);

const productsOnce = cache(
  (): Promise<Collection<Product>> => loadCollection(API_PATHS.products, mapProduct, revalidateFor('products')),
);

/**
 * Reuse window per resource.
 *
 * Catalogue data moves slowly and pages render often, so a short reuse window
 * removes most upstream traffic without making a listing visibly stale. Set
 * `MARKAB_API_REVALIDATE_SECONDS=0` to disable it.
 */
function revalidateFor(_kind: 'vehicles' | 'products'): number {
  const resolved = apiConfig();
  return resolved.ok ? resolved.config.revalidateSeconds : 0;
}

/** Convert a failed collection into the matching Result envelope. */
function collectionFailure<T>(
  status: 'empty' | 'not_found' | 'unavailable' | 'error',
): Result<T> {
  switch (status) {
    case 'not_found':
      return notFound<T>();
    case 'empty':
      return empty<T>();
    case 'unavailable':
      return unavailable<T>();
    default:
      // `code` is an internal marker for logs and monitoring; the visitor only
      // ever sees the generic Uzbek sentence.
      return failure<T>('api_unavailable', PUBLIC_ERROR_MESSAGE);
  }
}

export const httpProvider: DataAdapter = {
  name: 'http',

  async listVehicles(query: VehicleQuery = {}): Promise<Result<Paginated<Vehicle>>> {
    const collection = await vehiclesOnce();
    if (!collection.ok) return collectionFailure(collection.status);

    const filtered = applyVehicleFilters(collection.items, query);
    if (filtered.length === 0) return empty<Paginated<Vehicle>>();
    return success(paginate(filtered, query.page, query.pageSize));
  },

  /**
   * Detail lookup.
   *
   * No detail endpoint is documented, so the record is found in the listing we
   * already fetched rather than by guessing at `/vehicles/{id}/`. When Markab
   * documents one, this is the only method that changes.
   */
  async getVehicleBySlug(slug: string): Promise<Result<Vehicle>> {
    const collection = await vehiclesOnce();
    if (!collection.ok) return collectionFailure(collection.status);

    const vehicle = collection.items.find((item) => item.slug === slug || item.id === slug);
    return vehicle ? success(vehicle) : notFound<Vehicle>();
  },

  async getVehicleFacets(): Promise<Result<VehicleFacets>> {
    const collection = await vehiclesOnce();
    if (!collection.ok) return collectionFailure(collection.status);

    const facets = deriveVehicleFacets(collection.items);
    return facets ? success(facets) : empty<VehicleFacets>();
  },

  async listProducts(query: ProductQuery = {}): Promise<Result<Paginated<Product>>> {
    const collection = await productsOnce();
    if (!collection.ok) return collectionFailure(collection.status);

    const filtered = applyProductFilters(collection.items, query);
    if (filtered.length === 0) return empty<Paginated<Product>>();
    return success(paginate(filtered, query.page, query.pageSize));
  },

  /** See `getVehicleBySlug`: found in the fetched listing, not a guessed URL. */
  async getProductById(id: string): Promise<Result<Product>> {
    const collection = await productsOnce();
    if (!collection.ok) return collectionFailure(collection.status);

    const product = collection.items.find((item) => item.id === id);
    return product ? success(product) : notFound<Product>();
  },

  async getProductFacets(): Promise<Result<ProductFacets>> {
    const collection = await productsOnce();
    if (!collection.ok) return collectionFailure(collection.status);

    // No category catalogue is published, so the API's own category value is
    // used as its label. Showing the source's word beats translating it into
    // something it may not mean.
    const facets = deriveProductFacets(collection.items);
    return facets ? success(facets) : empty<ProductFacets>();
  },

  /**
   * Homepage showcase: the most-viewed published records.
   *
   * Both collections must succeed. Showing cars but silently omitting
   * electronics because that request failed would read as "Markab has no
   * electronics", which is a different statement from "we could not load
   * them".
   */
  async getFeatured() {
    const [vehicles, products] = await Promise.all([vehiclesOnce(), productsOnce()]);

    if (!vehicles.ok && !products.ok) {
      return vehicles.status === 'error' || products.status === 'error'
        ? failure('api_unavailable', PUBLIC_ERROR_MESSAGE)
        : unavailable();
    }
    if (!vehicles.ok) return collectionFailure(vehicles.status);
    if (!products.ok) return collectionFailure(products.status);

    const top = <T extends { views: number }>(items: T[]): T[] =>
      [...items].sort((a, b) => b.views - a.views).slice(0, 3);

    return success({ vehicles: top(vehicles.items), products: top(products.items) });
  },

  /**
   * Search runs against the records we actually hold — never against a local
   * list invented for the occasion, and never against fixtures reached around
   * the provider. If the catalogue could not be loaded, the answer is
   * `unavailable`, not "no results".
   */
  async searchCatalogue(query: string, limitPerKind = 6): Promise<Result<CatalogueSearchResults>> {
    const [vehicles, products] = await Promise.all([vehiclesOnce(), productsOnce()]);

    if (!vehicles.ok && !products.ok) {
      return vehicles.status === 'error' || products.status === 'error'
        ? failure('api_unavailable', PUBLIC_ERROR_MESSAGE)
        : unavailable();
    }

    const results = searchCatalogueRecords(
      {
        vehicles: vehicles.ok ? vehicles.items : [],
        products: products.ok ? products.items : [],
      },
      query,
      limitPerKind,
    );

    if (!results) return empty<CatalogueSearchResults>();
    if (results.vehicles.length === 0 && results.products.length === 0) {
      return empty<CatalogueSearchResults>();
    }
    return success(results);
  },

  /* ---------------------------------------------------------------------- */
  /* Not served by the API (yet)                                             */
  /* ---------------------------------------------------------------------- */

  /**
   * These are `unavailable`, not empty and not fixture-backed.
   *
   * Markab documents no endpoint for Academy lessons, FAQ, site content, the
   * investment profile or the loyalty programme (docs/API-CONTRACT.md §5).
   * Returning fixtures here would put locally-written editorial copy in front
   * of visitors as though the business had published it through the API, which
   * is exactly the confusion this phase exists to prevent.
   *
   * The practical effect in http mode: those blocks render empty rather than
   * inventing content. Every consumer already guards on
   * `status === 'success'`, so a downgraded block is a gap on the page — never
   * a crash and never a fabricated claim.
   */
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

  async getLoyaltyProgram(): Promise<Result<LoyaltyProgram>> {
    return unavailable();
  },

  /**
   * Always unavailable.
   *
   * There is no authenticated customer behind a server-side render, and
   * inventing one would put fake private data on screen. Auth is out of scope
   * for this phase.
   */
  async getAccountSnapshot(): Promise<Result<AccountSnapshot>> {
    return unavailable();
  },
};
