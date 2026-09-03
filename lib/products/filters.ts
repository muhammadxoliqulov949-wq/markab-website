import { formatCompactUzs } from '@/lib/format';
import type { ProductFacets, ProductQuery } from '@/lib/data/types';

/**
 * Electronics catalogue filter state.
 *
 * Deliberately pure: it converts between URL parameters and the adapter's
 * `ProductQuery` and describes the active filters in Uzbek. It owns no data —
 * every option comes from `ProductFacets`, which the provider counts against
 * the real records, so the UI can never offer a value that returns nothing.
 *
 * A filter group is only worth rendering when it can actually change the
 * result set, so the UI asks `worthShowing()` before mounting one. With the
 * current catalogue (one brand, one populated category) that hides the brand
 * and category chips; when the production API supplies more, they appear with
 * no code change.
 */

export type ProductSortOption = 'default' | 'price-asc' | 'price-desc';

export type ProductFilterValues = {
  q?: string;
  brand?: string;
  cat?: string;
  storage?: number;
  /** Battery-health bucket id — see BATTERY_BUCKETS. */
  batt?: string;
  /** true → hide records the source explicitly marks sold out. */
  avail?: boolean;
  minp?: number;
  maxp?: number;
  sort?: ProductSortOption;
};

/** A partial update to the URL state; `null` removes the key. */
export type ProductFilterPatch = Partial<
  Record<keyof ProductFilterValues | 'page', string | number | boolean | null>
>;

export const PRODUCT_SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: 'default', label: 'Standart tartib' },
  { value: 'price-asc', label: 'Narx: arzondan' },
  { value: 'price-desc', label: 'Narx: qimatdan' },
];

/**
 * Battery-health buckets.
 *
 * The thresholds are fixed presentation buckets, not product attributes; the
 * counts inside them come from the published percentages, so an empty bucket
 * is never advertised.
 */
export const BATTERY_BUCKETS: { value: string; label: string; min?: number; max?: number }[] = [
  { value: '90', label: '90% va yuqori', min: 90 },
  { value: '80', label: '80–89%', min: 80, max: 89 },
  { value: 'lo', label: '80% dan past', max: 79 },
];

export function batteryBucketCounts(
  facets: ProductFacets,
): { value: string; label: string; count: number }[] {
  return BATTERY_BUCKETS.map((bucket) => ({
    value: bucket.value,
    label: bucket.label,
    count: facets.batteryHealth
      .filter((entry) => {
        if (bucket.min !== undefined && entry.value < bucket.min) return false;
        if (bucket.max !== undefined && entry.value > bucket.max) return false;
        return true;
      })
      .reduce((sum, entry) => sum + entry.count, 0),
  }));
}

export function batteryBucket(value: string | undefined): { min?: number; max?: number } | null {
  return BATTERY_BUCKETS.find((bucket) => bucket.value === value) ?? null;
}

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
export function parseProductFilters(sp: RawParams): ProductFilterValues {
  const sort = first(sp.sort);
  const batt = first(sp.batt);
  const avail = first(sp.avail);
  const minp = toInt(first(sp.minp));
  const maxp = toInt(first(sp.maxp));
  const storage = toInt(first(sp.storage));

  return {
    q: first(sp.q)?.trim() || undefined,
    brand: first(sp.brand) || undefined,
    cat: first(sp.cat) || undefined,
    storage,
    batt: batteryBucket(batt) ? batt : undefined,
    avail: avail === '1' || avail === 'true' ? true : undefined,
    minp,
    maxp: maxp && minp && maxp < minp ? undefined : maxp,
    sort:
      sort === 'price-asc' || sort === 'price-desc' || sort === 'default' ? sort : undefined,
  };
}

/** Translates URL state into the adapter contract. */
export function toProductQuery(
  values: ProductFilterValues,
  page: number,
  pageSize: number,
): ProductQuery {
  const battery = batteryBucket(values.batt);

  return {
    q: values.q,
    brand: values.brand,
    category: values.cat,
    storageGb: values.storage,
    batteryMin: battery?.min,
    batteryMax: battery?.max,
    hideOutOfStock: values.avail,
    hasFinancing: undefined,
    priceMin: values.minp,
    priceMax: values.maxp,
    sort: values.sort ?? 'default',
    page,
    pageSize,
  };
}

/**
 * Builds an `/electronics` href. `patch` overrides individual keys; passing
 * `null` removes that key, which is how a single filter gets cleared.
 */
export function buildProductHref(
  values: ProductFilterValues,
  patch: ProductFilterPatch = {},
): string {
  const merged: Record<string, string> = {};

  // `null` removes the key outright — that is how a single filter is cleared.
  // Skipping it instead would leave the old value in place and neither the URL
  // nor the result set would ever change.
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
  put('cat', values.cat);
  put('storage', values.storage);
  put('batt', values.batt);
  put('avail', values.avail ? 1 : undefined);
  put('minp', values.minp);
  put('maxp', values.maxp);
  if (values.sort && values.sort !== 'default') put('sort', values.sort);

  Object.entries(patch).forEach(([key, value]) => put(key, value));

  // Any filter change returns to page 1 unless a page was requested explicitly.
  if (!('page' in patch)) delete merged.page;

  const qs = Object.entries(merged)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return qs ? `/electronics?${qs}` : '/electronics';
}

/** URL parameters for the current state, in the shape `Link` helpers expect. */
export function toProductParams(values: ProductFilterValues): Record<string, string | undefined> {
  const params: Record<string, string | undefined> = {};
  const put = (key: string, value: string | number | boolean | undefined) => {
    if (value === undefined || value === '' || value === false) return;
    params[key] = String(value);
  };

  put('q', values.q);
  put('brand', values.brand);
  put('cat', values.cat);
  put('storage', values.storage);
  put('batt', values.batt);
  put('avail', values.avail ? '1' : undefined);
  put('minp', values.minp);
  put('maxp', values.maxp);
  if (values.sort && values.sort !== 'default') put('sort', values.sort);

  return params;
}

export function countActiveProductFilters(values: ProductFilterValues): number {
  return [
    values.q,
    values.brand,
    values.cat,
    values.storage,
    values.batt,
    values.avail,
    values.minp,
    values.maxp,
  ].filter((value) => value !== undefined && value !== false && value !== '').length;
}

export function hasActiveProductFilters(values: ProductFilterValues): boolean {
  return countActiveProductFilters(values) > 0;
}

/**
 * Removable chips describing exactly what is currently filtering the list.
 *
 * `categoryLabels` is a plain id → name map rather than a function so it can
 * cross the server/client boundary.
 */
export function activeProductFilterChips(
  values: ProductFilterValues,
  categoryLabels: Record<string, string>,
): { key: string; label: string; clear: ProductFilterPatch }[] {
  const chips: { key: string; label: string; clear: ProductFilterPatch }[] = [];

  if (values.q) chips.push({ key: 'q', label: `Qidiruv: “${values.q}”`, clear: { q: null } });
  if (values.brand) chips.push({ key: 'brand', label: values.brand, clear: { brand: null } });
  if (values.cat) {
    chips.push({
      key: 'cat',
      label: categoryLabels[values.cat] ?? values.cat,
      clear: { cat: null },
    });
  }
  if (values.storage) {
    chips.push({ key: 'storage', label: `${values.storage} GB`, clear: { storage: null } });
  }
  if (values.batt) {
    chips.push({
      key: 'batt',
      label: BATTERY_BUCKETS.find((b) => b.value === values.batt)?.label ?? 'Batareya',
      clear: { batt: null },
    });
  }
  if (values.avail) {
    chips.push({ key: 'avail', label: 'Qolmaganlar yashirildi', clear: { avail: null } });
  }
  if (values.minp) {
    chips.push({ key: 'minp', label: `Dan: ${formatCompactUzs(values.minp)}`, clear: { minp: null } });
  }
  if (values.maxp) {
    chips.push({ key: 'maxp', label: `Gacha: ${formatCompactUzs(values.maxp)}`, clear: { maxp: null } });
  }

  return chips;
}

/**
 * Rounded price bounds for the min/max selects.
 *
 * The step scales with the catalogue's real price range so a phone catalogue
 * does not inherit the vehicle-sized 25 million increments. These are bounds
 * derived from actual prices — not invented price points.
 */
export function productPriceBounds(facets: ProductFacets): { min: number[]; max: number[] } {
  const { priceMin, priceMax } = facets;
  if (priceMax <= priceMin) return { min: [], max: [] };

  const range = priceMax - priceMin;
  const step =
    range >= 200_000_000
      ? 25_000_000
      : range >= 50_000_000
        ? 5_000_000
        : range >= 10_000_000
          ? 1_000_000
          : range >= 2_000_000
            ? 500_000
            : 100_000;

  const low = Math.floor(priceMin / step) * step;
  const high = Math.ceil(priceMax / step) * step;
  const points: number[] = [];

  for (let i = 0; i < 6; i += 1) {
    const value = Math.round((low + ((high - low) * i) / 5) / step) * step;
    if (value > low && value < high && !points.includes(value)) points.push(value);
  }

  return { min: points, max: points };
}

/**
 * Whether a filter group can change the result set.
 *
 * A group with a single option is not a filter — it is a label. Rendering it
 * would imply a choice the data does not offer.
 */
export function worthShowing(count: number, total: number): boolean {
  return count > 1 && count < total;
}
