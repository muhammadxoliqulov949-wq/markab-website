/**
 * Vehicle listing filter and sort semantics.
 *
 * Shared by both providers so filtering behaves identically whether the
 * catalogue came from fixtures or from the real API (Phase 13 §22).
 *
 * Why the HTTP provider filters in memory rather than sending filter
 * parameters to the API: the parameter names are not confirmed (see
 * docs/PHASE-13-API-INTEGRATION.md). DRF ignores unknown query parameters by
 * default, so sending a guessed `brand=` would appear to work while returning
 * unfiltered results — a wrong page that looks correct. Filtering records we
 * actually fetched cannot fail that way. The seam is `listVehicles`: move
 * filtering server-side once the schema is confirmed.
 */
import type { Vehicle, VehicleQuery } from '@/lib/data/types';

export function applyVehicleFilters(source: Vehicle[], query: VehicleQuery): Vehicle[] {
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
