/**
 * Catalogue search, shared by both data providers.
 *
 * The HTTP provider must not degrade into a different search experience, so
 * the ranking logic lives here rather than inside the mock provider.
 *
 * WHAT THIS IS NOT
 *
 * This is not relevance ranking and must never be described as one. It is a
 * fixed three-step ladder — whole-field prefix, then word prefix, then
 * substring — with alphabetical and id tie-breaks, so the same query always
 * returns the same list in the same order, from fixtures or from the API.
 *
 * It searches only records the repository actually has. There is no hidden
 * local fallback list: if the API is unreachable, the caller receives
 * `unavailable` and the UI says so (Phase 13 §27).
 */
import type {
  CatalogueSearchResults,
  Product,
  SearchHit,
  Vehicle,
} from '@/lib/data/types';

/** Splits a query into terms; every term must match something (AND, not OR). */
function searchTerms(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Deterministic match quality.
 *
 * Scoring ladder: 3 = field starts with the term, 2 = a word starts with the
 * term, 1 = the term appears anywhere. 0 means no match on this field.
 */
function matchScore(haystack: string, needle: string): number {
  const field = haystack.toLowerCase();
  if (field.startsWith(needle)) return 3;
  if (new RegExp(`\\b${escapeRegExp(needle)}`).test(field)) return 2;
  if (field.includes(needle)) return 1;
  return 0;
}

function scoreFields(fields: string[], terms: string[]): number {
  let score = 0;
  for (const term of terms) {
    let best = 0;
    for (const field of fields) {
      best = Math.max(best, matchScore(field, term));
      if (best === 3) break;
    }
    // A term matching nothing disqualifies the record entirely.
    if (best === 0) return 0;
    score += best;
  }
  return score;
}

function buildSearchHits(
  vehicles: Vehicle[],
  products: Product[],
): { vehicles: SearchHit[]; products: SearchHit[] } {
  return {
    vehicles: vehicles.map((vehicle) => ({
      id: vehicle.id,
      kind: 'vehicle' as const,
      title: vehicle.title,
      subtitle: [vehicle.brand, String(vehicle.year)].filter(Boolean).join(' · '),
      priceUzs: vehicle.priceUzs,
      image: vehicle.images[0] ?? null,
      href: `/cars/${vehicle.slug}`,
      // Vehicle availability is never claimed: the source publishes no stock
      // field, so "unknown" is the honest answer, not a gap to be filled.
      availability: 'unknown' as const,
    })),
    products: products.map((product) => ({
      id: product.id,
      kind: 'product' as const,
      title: product.name,
      subtitle: [product.brand, product.storageGb ? `${product.storageGb} GB` : null]
        .filter(Boolean)
        .join(' · '),
      priceUzs: product.priceUzs,
      image: product.images[0] ?? null,
      href: `/electronics/${product.id}`,
      availability:
        product.stockStatus === 'in_stock'
          ? ('in_stock' as const)
          : product.stockStatus === 'out_of_stock'
            ? ('sold' as const)
            : ('unknown' as const),
    })),
  };
}

/**
 * Search the supplied records.
 *
 * Returns `null` when the query has no searchable term — the caller decides
 * what that means for its own result envelope.
 */
export function searchCatalogueRecords(
  source: { vehicles: Vehicle[]; products: Product[] },
  query: string,
  limitPerKind = 6,
): CatalogueSearchResults | null {
  const trimmed = query.trim();
  const terms = searchTerms(query);

  if (!trimmed || terms.length === 0) return null;

  const index = buildSearchHits(source.vehicles, source.products);

  const rank = <T extends SearchHit>(items: { hit: T; haystack: string[] }[]): T[] =>
    items
      .map((entry) => ({ ...entry, score: scoreFields(entry.haystack, terms) }))
      .filter((entry) => entry.score > 0)
      // Highest score first; alphabetical then id keep it stable.
      .sort(
        (a, b) =>
          b.score - a.score || a.hit.title.localeCompare(b.hit.title) || a.hit.id.localeCompare(b.hit.id),
      )
      .map((entry) => entry.hit);

  const vehicleMatches = rank(
    index.vehicles.map((hit, i) => ({
      hit,
      haystack: [
        hit.title,
        hit.subtitle,
        source.vehicles[i].brand,
        source.vehicles[i].model,
        String(source.vehicles[i].year),
      ],
    })),
  );

  const productMatches = rank(
    index.products.map((hit, i) => ({
      hit,
      haystack: [hit.title, hit.subtitle, source.products[i].rawTitle, source.products[i].category],
    })),
  );

  return {
    query: trimmed,
    vehicles: vehicleMatches.slice(0, limitPerKind),
    products: productMatches.slice(0, limitPerKind),
    vehicleTotal: vehicleMatches.length,
    productTotal: productMatches.length,
  };
}
