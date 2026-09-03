import 'server-only';

import type { ProductQuery, VehicleQuery } from './types';

/**
 * Translate repository query objects into DRF-friendly query parameters.
 *
 * THIS IS A WHITELIST, NOT A PASS-THROUGH.
 *
 * Browser query strings are parsed in the UI layer (lib/vehicles/filters.ts,
 * lib/products/filters.ts), validated into strongly-typed `VehicleQuery` /
 * `ProductQuery`, and only here do those known fields get mapped onto HTTP
 * parameters. Arbitrary user input NEVER reaches the API verbatim — an
 * attacker-controlled query string cannot smuggle extra parameters, SQL-ish
 * filters, or host-switching values.
 *
 * The DRF parameter names below are the conventional Django-filter names; they
 * are the most-likely production surface but will be re-verified against the
 * real schema when credentials + schema are available. Fields the backend
 * does not recognise will be 400s, which the client treats as `error` rather
 * than silently ignoring — that is intentional: we want to notice mismatches.
 */

const DEFAULT_LIST_PAGE_SIZE = 12;

export function vehicleQueryToParams(query: VehicleQuery): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {};

  if (query.q) params.search = query.q;
  if (query.brand) params.brand = query.brand;
  if (query.fuelType) params.fuel_type = query.fuelType;
  if (query.transmission) params.transmission = query.transmission;
  if (query.year != null) params.year = query.year;
  if (query.yearFrom != null) params.year__gte = query.yearFrom;
  if (query.yearTo != null) params.year__lte = query.yearTo;
  if (query.priceMin != null) params.price__gte = query.priceMin;
  if (query.priceMax != null) params.price__lte = query.priceMax;
  if (query.condition === 'new') params.is_new = true;
  else if (query.condition === 'used') params.is_new = false;
  if (query.hasFinancing) params.has_financing = true;

  // Sorting. The mock uses our own keys; map to likely DRF ordering field.
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, query.pageSize ?? DEFAULT_LIST_PAGE_SIZE));
  params.page = page;
  params.page_size = pageSize;

  switch (query.sort) {
    case 'price-asc':
      params.ordering = 'price';
      break;
    case 'price-desc':
      params.ordering = '-price';
      break;
    case 'mileage-asc':
      params.ordering = 'mileage_km';
      break;
    case 'newest':
    default:
      params.ordering = '-year';
  }

  return params;
}

export function productQueryToParams(query: ProductQuery): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {};

  if (query.q) params.search = query.q;
  if (query.category) params.category = query.category;
  if (query.brand) params.brand = query.brand;
  if (query.priceMin != null) params.price__gte = query.priceMin;
  if (query.priceMax != null) params.price__lte = query.priceMax;
  if (query.storageGb != null) params.storage_gb = query.storageGb;
  if (query.batteryMin != null) params.battery_health_percent__gte = query.batteryMin;
  if (query.batteryMax != null) params.battery_health_percent__lte = query.batteryMax;
  if (query.hideOutOfStock) params.stock_status = 'in_stock';
  if (query.hasFinancing) params.has_financing = true;

  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, query.pageSize ?? DEFAULT_LIST_PAGE_SIZE));
  params.page = page;
  params.page_size = pageSize;

  switch (query.sort) {
    case 'price-asc':
      params.ordering = 'price';
      break;
    case 'price-desc':
      params.ordering = '-price';
      break;
    case 'popular':
      params.ordering = '-views';
      break;
    case 'default':
    default:
      params.ordering = 'id';
  }

  return params;
}
