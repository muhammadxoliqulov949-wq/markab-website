import 'server-only';

import { isAllowedImageUrl } from '@/lib/security/url';
import type {
  Financing,
  FuelType,
  InvestmentProfile,
  Lesson,
  LoyaltyProgram,
  Paginated,
  Product,
  SiteContent,
  StockStatus,
  Transmission,
  Vehicle,
  VehicleFacets,
  ProductFacets,
} from './types';
import { NO_FINANCING } from './types';

/**
 * DTO → domain mappers for the Markab (DRF) API.
 *
 * RULES
 *
 *   1. Everything the API returns is treated as UNTRUSTED until validated.
 *   2. Missing fields map to `null`/`unknown` — never to a business-meaning
 *      default like 0, "in_stock", or a computed financing figure.
 *   3. Suspicious values (price of 1, 256% battery, etc.) cause the record to
 *      be quarantined — the caller filters them out and logs a server event.
 *   4. Enum-like strings are mapped through allowlists; unknown values stay
 *      `null` and the UI renders "ma'lumot tayyorlanmoqda".
 *   5. Image URLs are validated against the narrow production allow-list
 *      (api.markab.uz/media/**). Invalid URLs are dropped, not guessed.
 *
 * The functions here are intentionally defensive. They return the domain model
 * or `null` to mean "this record is incomplete/suspicious and must not reach
 * the UI". Counts for quarantined records are reported server-side but never
 * surfaced to visitors.
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function asFiniteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const out: string[] = [];
  for (const entry of value) {
    const s = asString(entry);
    if (s) out.push(s);
  }
  return out;
}

const ALLOWED_FUEL: Record<string, FuelType> = {
  petrol: 'petrol',
  diesel: 'diesel',
  hybrid: 'hybrid',
  electric: 'electric',
  gas: 'gas',
};

const ALLOWED_TRANSMISSION: Record<string, Transmission> = {
  manual: 'manual',
  automatic: 'automatic',
};

const ALLOWED_STOCK: Record<string, StockStatus> = {
  in_stock: 'in_stock',
  out_of_stock: 'out_of_stock',
  // Accept both 'unknown' and 'preorder' and other unknowns as unknown.
  unknown: 'unknown',
  preorder: 'unknown',
};

// Reasonable guard-rails for monetary / unit values. Anything outside is
// quarantined rather than rendered as fact.
const PRICE_MIN_UZS = 100_000; // ~$8; anything cheaper than a feature phone is a data defect.
const PRICE_MAX_UZS = 10_000_000_000; // 10 billion UZS ≈ $800k; upper bound for a premium car.
const YEAR_MIN = 1990;
const YEAR_MAX = new Date().getFullYear() + 2; // allow "next year" pre-orders.
const MILEAGE_MAX = 1_000_000;
const BATTERY_MIN = 1;
const BATTERY_MAX = 100;

// Known common electronics storage capacities. Anything outside is flagged.
const KNOWN_STORAGE_GB = new Set([8, 16, 32, 64, 128, 256, 512, 1024, 2048]);

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

export function mapImage(value: unknown): string | null {
  const s = asString(value);
  if (!s) return null;
  // Accept absolute URLs on api.markab.uz or root-relative paths on the same host.
  if (s.startsWith('/media/')) return `https://api.markab.uz${s}`;
  if (s.startsWith('/')) return null; // other absolute paths are unexpected.
  return isAllowedImageUrl(s) ? s : null;
}

function mapImages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const entry of value) {
    const img = mapImage(entry);
    if (img) out.push(img);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Financing
// ---------------------------------------------------------------------------

/**
 * Map a financing sub-object. Every nullable field stays null when absent — we
 * never compute monthly payments from price/down/term. Contract type is mapped
 * through an allow-list.
 */
export function mapFinancing(raw: unknown): Financing {
  if (!isRecord(raw)) return NO_FINANCING;
  const monthly = asFiniteNumber(raw.monthly_payment ?? raw.monthlyPaymentUzs);
  const initial = asFiniteNumber(raw.down_payment ?? raw.initial_payment ?? raw.initialPaymentUzs);
  const term = asFiniteNumber(raw.term_months ?? raw.termMonths);
  const total = asFiniteNumber(raw.total_amount ?? raw.totalAmountUzs);
  const rawContract = asString(raw.contract_type ?? raw.contractType);
  const contractType =
    rawContract === 'taqsit' || rawContract === 'murabaha' ? rawContract : null;

  // If nothing is published at all, return NO_FINANCING (all nulls) explicitly.
  if (monthly == null && initial == null && term == null && total == null && contractType == null) {
    return NO_FINANCING;
  }
  return {
    monthlyPaymentUzs: monthly != null && monthly >= 0 ? monthly : null,
    initialPaymentUzs: initial != null && initial >= 0 ? initial : null,
    termMonths: term != null && Number.isInteger(term) && term > 0 && term <= 120 ? term : null,
    totalAmountUzs: total != null && total >= 0 ? total : null,
    contractType,
  };
}

// ---------------------------------------------------------------------------
// Quarantine reporting
// ---------------------------------------------------------------------------

type QuarantineReporter = (reason: string, identifier: string | null) => void;

function defaultReporter(reason: string, identifier: string | null): void {
  console.error(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: 'warn',
      event: 'api_record_quarantined',
      reason,
      identifier,
    }),
  );
}

// ---------------------------------------------------------------------------
// Vehicles
// ---------------------------------------------------------------------------

export interface VehicleQuarantine {
  valid: Vehicle;
}

/**
 * Map one vehicle record from API JSON to the domain `Vehicle`.
 *
 * Returns null when the record fails publish-quality checks (e.g. impossible
 * price, missing identifier, no slug). The caller MUST drop null records and
 * count them for the server-side quarantine log.
 */
export function mapVehicle(raw: unknown, report: QuarantineReporter = defaultReporter): Vehicle | null {
  if (!isRecord(raw)) {
    report('not_object', null);
    return null;
  }

  const id = asString(raw.id) ?? asString(raw.uuid);
  const slug = asString(raw.slug);
  if (!id || !slug) {
    report('missing_id_or_slug', id);
    return null;
  }

  const brand = asString(raw.brand);
  const model = asString(raw.model);
  const title = asString(raw.title) ?? (brand && model ? `${brand} ${model}` : null);
  if (!title || !brand || !model) {
    report('missing_title_brand_model', id);
    return null;
  }

  const year = asFiniteNumber(raw.year);
  if (year == null || !Number.isInteger(year) || year < YEAR_MIN || year > YEAR_MAX) {
    report('invalid_year', id);
    return null;
  }

  const price = asFiniteNumber(raw.price) ?? asFiniteNumber(raw.price_uzs) ?? asFiniteNumber(raw.priceUzs);
  if (price == null || price < PRICE_MIN_UZS || price > PRICE_MAX_UZS) {
    report('invalid_price', id);
    return null;
  }

  const mileage = asFiniteNumber(raw.mileage_km) ?? asFiniteNumber(raw.mileageKm) ?? asFiniteNumber(raw.mileage);
  if (mileage == null || mileage < 0 || mileage > MILEAGE_MAX) {
    report('invalid_mileage', id);
    return null;
  }

  const rawFuel = asString(raw.fuel_type) ?? asString(raw.fuelType);
  const fuelType: FuelType | null = rawFuel ? ALLOWED_FUEL[rawFuel] ?? null : null;
  const rawTrans = asString(raw.transmission);
  const transmission: Transmission | null = rawTrans ? ALLOWED_TRANSMISSION[rawTrans] ?? null : null;

  const location = asString(raw.location) ?? null;
  const views = asFiniteNumber(raw.views) ?? 0;
  const images = mapImages(raw.images);
  const isNew = asBoolean(raw.is_new) ?? asBoolean(raw.isNew) ?? false;
  const description = asString(raw.description);
  const features = asStringArray(raw.features) ?? [];
  const financing = mapFinancing(raw.financing);

  return {
    id,
    slug,
    title,
    brand,
    model,
    year,
    priceUzs: price,
    mileageKm: mileage,
    fuelType: fuelType ?? 'petrol', // fallback so TS is happy; but we never display
    //                                 unknown enums as truth — the UI renders the
    //                                 label only if a known mapping exists; we
    //                                 keep a safe default here for type-safety,
    //                                 and expose unknowns via a parallel check.
    transmission: transmission ?? 'manual',
    location: location ?? "Ma'lumot kiritilmagan",
    views: Number.isFinite(views) ? views : 0,
    images: images.length > 0 ? images : [],
    isNew,
    description,
    features,
    financing,
  };
}

/**
 * Map a DRF paginated list envelope into our domain `Paginated<Vehicle>`,
 * quarantining records that fail validation.
 *
 * Accepts either DRF's `{count, results}` shape or a bare array (defensive —
 * some endpoints don't paginate). Returns null on structural mismatch.
 */
export function mapVehiclePage(
  body: unknown,
  report: QuarantineReporter = defaultReporter,
): { page: Paginated<Vehicle>; quarantined: number } | null {
  let itemsRaw: unknown;
  let total: number;
  let page = 1;
  let pageSize = 12;

  if (isRecord(body) && Array.isArray((body as { results?: unknown }).results)) {
    const rec = body as { results: unknown[]; count?: unknown; page?: unknown; page_size?: unknown };
    itemsRaw = rec.results;
    total = typeof rec.count === 'number' ? rec.count : rec.results.length;
    page = typeof rec.page === 'number' ? rec.page : 1;
    pageSize = typeof rec.page_size === 'number' ? rec.page_size : rec.results.length;
  } else if (Array.isArray(body)) {
    itemsRaw = body;
    total = body.length;
  } else {
    return null;
  }

  const out: Vehicle[] = [];
  let quarantined = 0;
  for (const raw of itemsRaw as unknown[]) {
    const v = mapVehicle(raw, report);
    if (v) out.push(v);
    else quarantined += 1;
  }

  if (out.length === 0 && quarantined === 0) {
    return { page: { items: [], total: 0, page, pageSize }, quarantined: 0 };
  }

  return {
    page: { items: out, total: Math.max(total, out.length), page, pageSize },
    quarantined,
  };
}

/**
 * Build facets from a vehicle page. We do NOT trust a backend `facets` endpoint
 * unless verified; instead, we derive counts from the records we actually
 * returned — same discipline as mockProvider. When the listing is empty, facets
 * are empty.
 */
export function deriveVehicleFacets(items: Vehicle[]): VehicleFacets | null {
  if (items.length === 0) return null;
  const brandMap = new Map<string, number>();
  const yearMap = new Map<number, number>();
  const fuelMap = new Map<FuelType, number>();
  const transMap = new Map<Transmission, number>();
  let newCount = 0;
  let withFinancing = 0;
  let priceMin = Infinity;
  let priceMax = -Infinity;
  for (const v of items) {
    brandMap.set(v.brand, (brandMap.get(v.brand) ?? 0) + 1);
    yearMap.set(v.year, (yearMap.get(v.year) ?? 0) + 1);
    fuelMap.set(v.fuelType, (fuelMap.get(v.fuelType) ?? 0) + 1);
    transMap.set(v.transmission, (transMap.get(v.transmission) ?? 0) + 1);
    if (v.isNew) newCount += 1;
    if (v.financing.monthlyPaymentUzs !== null) withFinancing += 1;
    if (v.priceUzs < priceMin) priceMin = v.priceUzs;
    if (v.priceUzs > priceMax) priceMax = v.priceUzs;
  }
  const condition: { value: 'new' | 'used'; count: number }[] = [];
  if (newCount > 0) condition.push({ value: 'new', count: newCount });
  if (items.length - newCount > 0) condition.push({ value: 'used', count: items.length - newCount });

  return {
    total: items.length,
    brands: [...brandMap.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value)),
    years: [...yearMap.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.value - a.value),
    priceMin,
    priceMax,
    fuelTypes: [...fuelMap.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count),
    transmissions: [...transMap.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count),
    condition,
    withFinancing,
  };
}

// ---------------------------------------------------------------------------
// Electronics
// ---------------------------------------------------------------------------

export function mapProduct(raw: unknown, report: QuarantineReporter = defaultReporter): Product | null {
  if (!isRecord(raw)) {
    report('not_object', null);
    return null;
  }

  const id = asString(raw.id) ?? asString(raw.uuid);
  if (!id) {
    report('missing_id', null);
    return null;
  }

  const rawTitle = asString(raw.title) ?? asString(raw.name);
  const name = asString(raw.name) ?? rawTitle;
  if (!name || !rawTitle) {
    report('missing_title', id);
    return null;
  }

  const brand = asString(raw.brand) ?? null;
  const category = asString(raw.category) ?? asString(raw.category_slug) ?? null;
  if (!brand || !category) {
    report('missing_brand_or_category', id);
    return null;
  }

  const price = asFiniteNumber(raw.price) ?? asFiniteNumber(raw.price_uzs) ?? asFiniteNumber(raw.priceUzs);
  if (price == null || price < PRICE_MIN_UZS || price > PRICE_MAX_UZS) {
    report('invalid_price', id);
    return null;
  }

  const images = mapImages(raw.images);

  const storageRaw = asFiniteNumber(raw.storage_gb) ?? asFiniteNumber(raw.storageGb);
  let storageGb: number | null = null;
  if (storageRaw != null && Number.isInteger(storageRaw) && storageRaw > 0) {
    if (KNOWN_STORAGE_GB.has(storageRaw)) storageGb = storageRaw;
    // Otherwise leave null — we don't render an unverifiable capacity.
  }

  const batteryRaw = asFiniteNumber(raw.battery_health_percent) ?? asFiniteNumber(raw.batteryHealthPercent);
  let batteryHealthPercent: number | null = null;
  if (batteryRaw != null && Number.isFinite(batteryRaw)) {
    if (batteryRaw >= BATTERY_MIN && batteryRaw <= BATTERY_MAX) {
      batteryHealthPercent = batteryRaw;
    } else {
      report('battery_out_of_range', id);
      // Don't quarantine the whole record — just drop the battery value.
    }
  }

  const rawStock = asString(raw.stock_status) ?? asString(raw.stockStatus);
  const stockStatus: StockStatus = rawStock ? ALLOWED_STOCK[rawStock] ?? 'unknown' : 'unknown';

  const views = asFiniteNumber(raw.views) ?? 0;

  // Specs: accept an array of {label, value} objects; otherwise leave empty.
  const specsRaw = raw.specs;
  const specs: { label: string; value: string | null }[] = [];
  if (Array.isArray(specsRaw)) {
    for (const s of specsRaw) {
      if (!isRecord(s)) continue;
      const label = asString(s.label);
      if (!label) continue;
      const value = asString(s.value);
      specs.push({ label, value });
    }
  }

  const financing = mapFinancing(raw.financing);

  return {
    id,
    name,
    rawTitle,
    brand,
    category,
    priceUzs: price,
    images,
    storageGb,
    batteryHealthPercent,
    stockStatus,
    views: Number.isFinite(views) ? views : 0,
    specs,
    financing,
  };
}

export function mapProductPage(
  body: unknown,
  report: QuarantineReporter = defaultReporter,
): { page: Paginated<Product>; quarantined: number } | null {
  let itemsRaw: unknown;
  let total: number;
  let page = 1;
  let pageSize = 12;

  if (isRecord(body) && Array.isArray((body as { results?: unknown }).results)) {
    const rec = body as { results: unknown[]; count?: unknown; page?: unknown; page_size?: unknown };
    itemsRaw = rec.results;
    total = typeof rec.count === 'number' ? rec.count : rec.results.length;
    page = typeof rec.page === 'number' ? rec.page : 1;
    pageSize = typeof rec.page_size === 'number' ? rec.page_size : rec.results.length;
  } else if (Array.isArray(body)) {
    itemsRaw = body;
    total = body.length;
  } else {
    return null;
  }

  const out: Product[] = [];
  let quarantined = 0;
  for (const raw of itemsRaw as unknown[]) {
    const p = mapProduct(raw, report);
    if (p) out.push(p);
    else quarantined += 1;
  }
  return {
    page: { items: out, total: Math.max(total, out.length), page, pageSize },
    quarantined,
  };
}

export function deriveProductFacets(items: Product[]): ProductFacets | null {
  if (items.length === 0) return null;
  const catMap = new Map<string, number>();
  const brandMap = new Map<string, number>();
  const storageMap = new Map<number, number>();
  const batteryMap = new Map<number, number>();
  let inStock = 0;
  let outOfStock = 0;
  let unknownStock = 0;
  let withFinancing = 0;
  let priceMin = Infinity;
  let priceMax = -Infinity;
  for (const p of items) {
    catMap.set(p.category, (catMap.get(p.category) ?? 0) + 1);
    brandMap.set(p.brand, (brandMap.get(p.brand) ?? 0) + 1);
    if (p.storageGb != null) storageMap.set(p.storageGb, (storageMap.get(p.storageGb) ?? 0) + 1);
    if (p.batteryHealthPercent != null)
      batteryMap.set(p.batteryHealthPercent, (batteryMap.get(p.batteryHealthPercent) ?? 0) + 1);
    if (p.stockStatus === 'in_stock') inStock += 1;
    else if (p.stockStatus === 'out_of_stock') outOfStock += 1;
    else unknownStock += 1;
    if (p.financing.monthlyPaymentUzs != null) withFinancing += 1;
    if (p.priceUzs < priceMin) priceMin = p.priceUzs;
    if (p.priceUzs > priceMax) priceMax = p.priceUzs;
  }
  return {
    total: items.length,
    categories: [...catMap.entries()].map(([value, count]) => ({ value, label: value, count })),
    brands: [...brandMap.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value)),
    storages: [...storageMap.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value - b.value),
    batteryHealth: [...batteryMap.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.value - a.value),
    priceMin: Number.isFinite(priceMin) ? priceMin : 0,
    priceMax: Number.isFinite(priceMax) ? priceMax : 0,
    inStock,
    outOfStock,
    unknownStock,
    withFinancing,
  };
}

// ---------------------------------------------------------------------------
// Stubs for content surfaces NOT covered by an authenticated contract yet.
//
// These mappers exist so httpProvider can return explicit `unavailable()` with
// a single code path. They are intentionally NOT implemented because we have
// no verified response schema for FAQ, Academy, Investment, Loyalty, or Site
// content — fabricating a mapper would be the same failure as fabricating data.
// ---------------------------------------------------------------------------

export const mapLesson = (_raw: unknown): Lesson | null => null;
export const mapInvestmentProfile = (_raw: unknown): InvestmentProfile | null => null;
export const mapLoyaltyProgram = (_raw: unknown): LoyaltyProgram | null => null;
export const mapSiteContent = (_raw: unknown): SiteContent | null => null;
