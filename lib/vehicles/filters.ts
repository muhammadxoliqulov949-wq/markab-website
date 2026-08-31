import type { FuelType, Transmission, VehicleFacets, VehicleQuery } from '@/lib/data/types';

/**
 * Marketplace filter state.
 *
 * This module is deliberately pure: it converts between URL parameters and the
 * adapter's `VehicleQuery`, and describes the active filters in Uzbek. It holds
 * no data of its own — every option comes from `VehicleFacets` supplied by the
 * repository, so the UI can never offer a filter the data source cannot answer.
 */

export type SortOption = 'newest' | 'price-asc' | 'price-desc';

export type VehicleFilterValues = {
  q?: string;
  brand?: string;
  year?: number;
  fuel?: string;
  trans?: string;
  cond?: 'new' | 'used';
  fin?: boolean;
  minp?: number;
  maxp?: number;
  sort?: SortOption;
};

/** A partial update to the URL state; `null` removes the key. */
export type FilterPatch = Partial<
  Record<keyof VehicleFilterValues | 'page', string | number | boolean | null>
>;

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Yangi yil: avval' },
  { value: 'price-asc', label: 'Narx: arzondan' },
  { value: 'price-desc', label: 'Narx: qimatdan' },
];

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

/** Reads the URL. Unknown or malformed values are dropped, never guessed. */
export function parseVehicleFilters(sp: RawParams): VehicleFilterValues {
  const sort = first(sp.sort);
  const cond = first(sp.cond);
  const fin = first(sp.fin);
  const minp = toInt(first(sp.minp));
  const maxp = toInt(first(sp.maxp));

  return {
    q: first(sp.q)?.trim() || undefined,
    brand: first(sp.brand) || undefined,
    year: toInt(first(sp.year)),
    fuel: first(sp.fuel) || undefined,
    trans: first(sp.trans) || undefined,
    cond: cond === 'new' || cond === 'used' ? cond : undefined,
    fin: fin === '1' || fin === 'true' ? true : undefined,
    minp,
    maxp: maxp && minp && maxp < minp ? undefined : maxp,
    sort:
      sort === 'price-asc' || sort === 'price-desc' || sort === 'newest' ? sort : undefined,
  };
}

/** Translates URL state into the adapter contract. */
export function toVehicleQuery(
  values: VehicleFilterValues,
  page: number,
  pageSize: number,
): VehicleQuery {
  return {
    q: values.q,
    brand: values.brand,
    year: values.year,
    fuelType: values.fuel,
    transmission: values.trans,
    condition: values.cond,
    hasFinancing: values.fin,
    priceMin: values.minp,
    priceMax: values.maxp,
    sort: values.sort ?? 'newest',
    page,
    pageSize,
  };
}

/**
 * Builds a `/cars` href. `patch` overrides individual keys; passing `null`
 * removes that key, which is how a single filter gets cleared.
 */
export function buildVehicleHref(
  values: VehicleFilterValues,
  patch: FilterPatch = {},
): string {
  const merged: Record<string, string> = {};

  // `null` removes the key outright — that is how a single filter is cleared.
  // Skipping it instead would leave the old value in place and the URL, and the
  // result set, would never change.
  const put = (key: string, value: string | number | boolean | undefined | null) => {
    if (value === null) {
      delete merged[key];
      return;
    }
    if (value === undefined || value === '' || value === false) return;
    merged[key] = String(value);
  };

  put('q', values.q);
  put('brand', values.brand);
  put('year', values.year);
  put('fuel', values.fuel);
  put('trans', values.trans);
  put('cond', values.cond);
  put('fin', values.fin ? 1 : undefined);
  put('minp', values.minp);
  put('maxp', values.maxp);
  if (values.sort && values.sort !== 'newest') put('sort', values.sort);

  Object.entries(patch).forEach(([key, value]) => put(key, value));

  // Any filter change returns to page 1 unless a page was requested explicitly.
  if (!('page' in patch)) delete merged.page;

  const qs = Object.entries(merged)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return qs ? `/cars?${qs}` : '/cars';
}

/**
 * URL parameters for the current filter state, in the shape Next's `Link`
 * helpers expect. Used by pagination so moving between pages keeps the filters.
 */
export function toVehicleParams(values: VehicleFilterValues): Record<string, string | undefined> {
  const params: Record<string, string | undefined> = {};
  const put = (key: string, value: string | number | boolean | undefined) => {
    if (value === undefined || value === '' || value === false) return;
    params[key] = String(value);
  };

  put('q', values.q);
  put('brand', values.brand);
  put('year', values.year);
  put('fuel', values.fuel);
  put('trans', values.trans);
  put('cond', values.cond);
  put('fin', values.fin ? '1' : undefined);
  put('minp', values.minp);
  put('maxp', values.maxp);
  if (values.sort && values.sort !== 'newest') put('sort', values.sort);

  return params;
}

export function countActiveFilters(values: VehicleFilterValues): number {
  return [
    values.q,
    values.brand,
    values.year,
    values.fuel,
    values.trans,
    values.cond,
    values.fin,
    values.minp,
    values.maxp,
  ].filter((value) => value !== undefined && value !== false && value !== '').length;
}

export function hasActiveFilters(values: VehicleFilterValues): boolean {
  return countActiveFilters(values) > 0;
}

/** Removable chips describing exactly what is currently filtering the list. */
export function activeFilterChips(
  values: VehicleFilterValues,
  labels: { fuel: (value: FuelType) => string; transmission: (value: Transmission) => string },
): { key: string; label: string; clear: FilterPatch }[] {
  const chips: { key: string; label: string; clear: FilterPatch }[] = [];

  if (values.q) chips.push({ key: 'q', label: `Qidiruv: “${values.q}”`, clear: { q: null } });
  if (values.brand) chips.push({ key: 'brand', label: values.brand, clear: { brand: null } });
  if (values.year) chips.push({ key: 'year', label: `${values.year} yil`, clear: { year: null } });
  if (values.fuel) {
    chips.push({
      key: 'fuel',
      label: labels.fuel(values.fuel as FuelType),
      clear: { fuel: null },
    });
  }
  if (values.trans) {
    chips.push({
      key: 'trans',
      label: labels.transmission(values.trans as Transmission),
      clear: { trans: null },
    });
  }
  if (values.cond) {
    chips.push({
      key: 'cond',
      label: values.cond === 'new' ? 'Yangi' : 'Foydalanilgan',
      clear: { cond: null },
    });
  }
  if (values.fin) {
    chips.push({ key: 'fin', label: 'Oylik to‘lov ko‘rsatilgan', clear: { fin: null } });
  }
  if (values.minp) {
    chips.push({ key: 'minp', label: `Dan: ${compactUzs(values.minp)}`, clear: { minp: null } });
  }
  if (values.maxp) {
    chips.push({ key: 'maxp', label: `Gacha: ${compactUzs(values.maxp)}`, clear: { maxp: null } });
  }

  return chips;
}

/**
 * Rounded price bounds for the min/max selects.
 *
 * Derived from the real price range so the steps are meaningful for this
 * catalogue; they are bounds, not invented price points.
 */
export function priceBounds(facets: VehicleFacets): { min: number[]; max: number[] } {
  const { priceMin, priceMax } = facets;
  if (priceMax <= priceMin) return { min: [], max: [] };

  const step = priceMax >= 200_000_000 ? 25_000_000 : 5_000_000;
  const roundDown = (v: number) => Math.floor(v / step) * step;
  const roundUp = (v: number) => Math.ceil(v / step) * step;

  const low = roundDown(priceMin);
  const high = roundUp(priceMax);
  const count = 6;

  const points: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const value = Math.round(low + ((high - low) * i) / (count - 1));
    if (value > low && value < high) points.push(value);
  }

  // "from" options stop before the top; "to" options start after the bottom.
  return { min: points, max: points };
}

/** Compact price label for chips (million so'm), no Intl to stay SSR-stable. */
export function compactUzs(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const text = Number.isInteger(millions) ? String(millions) : millions.toFixed(1);
    return `${text} mln`;
  }
  const grouped = String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${grouped} so‘m`;
}
