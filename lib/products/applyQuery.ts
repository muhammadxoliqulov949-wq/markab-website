/**
 * Electronics listing filter and sort semantics.
 *
 * Shared by both providers (Phase 13 §25). See `lib/vehicles/applyQuery.ts`
 * for why filtering happens in memory until the API's filter parameters are
 * confirmed.
 */
import type { Product, ProductQuery } from '@/lib/data/types';

export function applyProductFilters(source: Product[], query: ProductQuery): Product[] {
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
