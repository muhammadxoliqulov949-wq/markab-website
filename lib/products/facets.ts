/**
 * Electronics facet derivation.
 *
 * Shared by both providers (see `lib/vehicles/facets.ts` for the rules).
 *
 * Category labels: the fixture provider knows a published catalogue of
 * categories and passes its own label lookup. The HTTP provider does not, so
 * the API's category value is used verbatim as the label — showing the
 * source's own word is better than translating it into something it may not
 * mean.
 */
import type { Product, ProductFacets } from '@/lib/data/types';

function countBy<T extends string | number>(
  source: Product[],
  pick: (item: Product) => T | null,
): { value: T; count: number }[] {
  const map = new Map<T, number>();
  for (const item of source) {
    const value = pick(item);
    if (value === null || value === undefined) continue;
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return [...map.entries()].map(([value, count]) => ({ value, count }));
}

/** Returns null when there is nothing to count — the caller maps that to `empty`. */
export function deriveProductFacets(
  source: Product[],
  labelFor: (id: string) => string = (id) => id,
): ProductFacets | null {
  if (source.length === 0) return null;

  return {
    total: source.length,
    categories: countBy(source, (p) => p.category).map((entry) => ({
      value: entry.value,
      label: labelFor(entry.value),
      count: entry.count,
    })),
    brands: countBy(source, (p) => p.brand),
    storages: countBy(source, (p) => p.storageGb).sort((a, b) => a.value - b.value),
    batteryHealth: countBy(source, (p) => p.batteryHealthPercent).sort((a, b) => b.value - a.value),
    priceMin: Math.min(...source.map((p) => p.priceUzs)),
    priceMax: Math.max(...source.map((p) => p.priceUzs)),
    // Stock counts are reported per published status. `unknown` is counted as
    // its own bucket and never merged into "in stock".
    inStock: source.filter((p) => p.stockStatus === 'in_stock').length,
    outOfStock: source.filter((p) => p.stockStatus === 'out_of_stock').length,
    unknownStock: source.filter((p) => p.stockStatus === 'unknown').length,
    withFinancing: source.filter((p) => p.financing.monthlyPaymentUzs !== null).length,
  };
}
