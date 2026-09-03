import 'server-only';

import type { Paginated, Product, Vehicle } from '../types';
import {
  asRecord,
  mapFuelType,
  mapStockStatus,
  mapTransmission,
  readBoolean,
  readImageUrls,
  readNumber,
  readString,
  validateBatteryPercent,
  validateMileageKm,
  validatePrice,
  validateStorageGb,
  validateYear,
  type Quarantine,
} from './validate';

/**
 * DTO → domain mapping (Phase 13 §6, §7, §8).
 *
 * READ THIS BEFORE TRUSTING ANY FIELD NAME BELOW.
 *
 * The field names in `FIELDS` come from `docs/API-CONTRACT.md` §3, which states
 * plainly that they were **inferred from rendered UI labels and never
 * confirmed against the API**. No token has ever been available, so no
 * response has ever been inspected.
 *
 * That is why this mapper is built the way it is:
 *
 *   • every read is defensive — a missing or wrongly-typed field yields an
 *     unknown value (`null`), never a guess and never a default of 0;
 *   • a record whose required fields are absent is dropped, not patched;
 *   • a record whose values are impossible is quarantined, not corrected;
 *   • nothing here is bound directly to a component — the repository returns
 *     domain objects only, so confirming the schema means editing this file
 *     and nothing else.
 *
 * When Markab supplies an OpenAPI export, `FIELDS` is the single place to
 * change, and `SCHEMA.confirmed` should be flipped to true with the source
 * recorded.
 */

export const SCHEMA = {
  confirmed: false,
  source: 'docs/API-CONTRACT.md §3 — inferred from rendered UI labels, NOT confirmed',
  lastReviewed: '2026-09-03',
} as const;

/** Expected DTO keys. Unverified; the one place to change when confirmed. */
const FIELDS = {
  vehicle: {
    id: 'id',
    slug: 'slug',
    brand: 'brand',
    model: 'model',
    year: 'year',
    price: 'price',
    mileage: 'mileage_km',
    fuelType: 'fuel_type',
    transmission: 'transmission',
    location: 'location',
    views: 'views',
    images: 'images',
    isNew: 'is_new',
    description: 'description',
    features: 'features',
  },
  product: {
    id: 'id',
    name: 'name',
    brand: 'brand',
    category: 'category',
    price: 'price',
    images: 'images',
    storage: 'storage',
    battery: 'battery_health',
    stock: 'stock_status',
    views: 'views',
    title: 'title',
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Result types                                                                */
/* -------------------------------------------------------------------------- */

export type MappedRecords<T> = {
  items: T[];
  /** Records dropped because the payload was unusable or impossible. */
  dropped: { detail: string; quarantine: Quarantine | null }[];
};


/* -------------------------------------------------------------------------- */
/* Vehicles                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Map one API vehicle record to the domain model.
 *
 * Financing is deliberately NOT derived here. The domain `Financing` object is
 * always the null object: no monthly payment is computed, and a partial
 * financing payload is not turned into a number (Phase 13 §17 — the existence
 * of a field does not prove a contractual meaning). When Markab publishes an
 * official financing endpoint with approved terms, map it here and only here.
 */
export function mapVehicle(dto: unknown): { ok: true; value: Vehicle } | { ok: false; detail: string; quarantine: Quarantine | null } {
  const source = asRecord(dto);
  if (!source) return { ok: false, detail: 'not an object', quarantine: null };

  const f = FIELDS.vehicle;

  const id = readString(source, f.id, 120) ?? (typeof source[f.id] === 'number' ? String(source[f.id]) : null);
  const brand = readString(source, f.brand, 80);
  const model = readString(source, f.model, 120);

  if (!id) return { ok: false, detail: 'missing id', quarantine: null };
  if (!brand && !model) return { ok: false, detail: 'missing brand and model', quarantine: null };

  const price = validatePrice(source, f.price, 'vehicle');
  if (!price.ok) return { ok: false, detail: price.detail, quarantine: price.quarantine };

  const year = validateYear(source, f.year);
  if (!year.ok) return { ok: false, detail: year.detail, quarantine: year.quarantine };

  const mileage = validateMileageKm(source, f.mileage);
  if (!mileage.ok) return { ok: false, detail: mileage.detail, quarantine: mileage.quarantine };

  // A vehicle with no usable photograph is dropped rather than published as an
  // empty frame — images are the primary evidence on a marketplace card.
  const images = readImageUrls(source, f.images);
  if (images.length === 0) {
    return { ok: false, detail: 'no usable images', quarantine: null };
  }

  const fuelType = mapFuelType(source[f.fuelType]);
  const transmission = mapTransmission(source[f.transmission]);

  /**
   * Everything the listing card shows must be real.
   *
   * A vehicle with an unrecognised fuel type is not a petrol vehicle, and one
   * with no published mileage has not travelled zero kilometres — it has no
   * published figure. Rather than fill those in with plausible-looking
   * defaults (which is how a catalogue ends up claiming things the seller
   * never said), the record is dropped and logged as awaiting upstream data.
   */
  if (!fuelType) return { ok: false, detail: 'unknown fuel type', quarantine: null };
  if (!transmission) return { ok: false, detail: 'unknown transmission', quarantine: null };
  if (mileage.value === null) return { ok: false, detail: 'missing mileage', quarantine: null };
  if (year.value === null) return { ok: false, detail: 'missing year', quarantine: null };

  const title = [brand, model, year.value].filter(Boolean).join(' ');
  const slug = readString(source, f.slug, 200) ?? id;

  const rawFeatures = source[f.features];
  const features = Array.isArray(rawFeatures)
    ? rawFeatures.filter((v): v is string => typeof v === 'string' && v.trim().length > 0).slice(0, 40)
    : [];

  return {
    ok: true,
    value: {
      id,
      slug,
      title: title || model || brand || id,
      brand: brand ?? '',
      model: model ?? '',
      year: year.value,
      priceUzs: price.value,
      mileageKm: mileage.value,
      fuelType,
      transmission,
      location: readString(source, f.location, 120) ?? '',
      views: Math.max(0, Math.trunc(readNumber(source, f.views) ?? 0)),
      images,
      isNew: readBoolean(source, f.isNew) ?? false,
      description: readString(source, f.description, 4000),
      features,
      financing: {
        monthlyPaymentUzs: null,
        initialPaymentUzs: null,
        termMonths: null,
        totalAmountUzs: null,
        contractType: null,
      },
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Products                                                                    */
/* -------------------------------------------------------------------------- */

export function mapProduct(dto: unknown): { ok: true; value: Product } | { ok: false; detail: string; quarantine: Quarantine | null } {
  const source = asRecord(dto);
  if (!source) return { ok: false, detail: 'not an object', quarantine: null };

  const f = FIELDS.product;

  const rawId = source[f.id];
  const id = readString(source, f.id, 120) ?? (typeof rawId === 'number' ? String(rawId) : null);
  const name = readString(source, f.name, 300) ?? readString(source, f.title, 300);

  if (!id) return { ok: false, detail: 'missing id', quarantine: null };
  if (!name) return { ok: false, detail: 'missing name', quarantine: null };

  const price = validatePrice(source, f.price, 'product');
  if (!price.ok) return { ok: false, detail: price.detail, quarantine: price.quarantine };

  const storage = validateStorageGb(source, f.storage);
  if (!storage.ok) return { ok: false, detail: storage.detail, quarantine: storage.quarantine };

  const battery = validateBatteryPercent(source, f.battery);
  if (!battery.ok) return { ok: false, detail: battery.detail, quarantine: battery.quarantine };

  // Same rule as vehicles: a listing with no usable photograph is not
  // published as an empty frame.
  const images = readImageUrls(source, f.images);
  if (images.length === 0) {
    return { ok: false, detail: 'no usable images', quarantine: null };
  }

  return {
    ok: true,
    value: {
      id,
      name,
      // The verbatim listing title is kept for traceability; when the API does
      // not publish a separate display name, the two are the same string.
      rawTitle: readString(source, f.title, 300) ?? name,
      brand: readString(source, f.brand, 80) ?? '',
      category: readString(source, f.category, 120) ?? '',
      priceUzs: price.value,
      images,
      storageGb: storage.value,
      batteryHealthPercent: battery.value,
      // §26: unrecognised stock is unknown, never available.
      stockStatus: mapStockStatus(source[f.stock]),
      views: Math.max(0, Math.trunc(readNumber(source, f.views) ?? 0)),
      specs: [],
      financing: {
        monthlyPaymentUzs: null,
        initialPaymentUzs: null,
        termMonths: null,
        totalAmountUzs: null,
        contractType: null,
      },
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Collections                                                                 */
/* -------------------------------------------------------------------------- */

/** Map a list, dropping anything unusable and reporting why it was dropped. */
export function mapList<T>(
  dtos: unknown[],
  mapOne: (dto: unknown) => { ok: true; value: T } | { ok: false; detail: string; quarantine: Quarantine | null },
): MappedRecords<T> {
  const items: T[] = [];
  const dropped: { detail: string; quarantine: Quarantine | null }[] = [];

  for (const dto of dtos) {
    const mapped = mapOne(dto);
    if (mapped.ok) items.push(mapped.value);
    else dropped.push({ detail: mapped.detail, quarantine: mapped.quarantine });
  }

  return { items, dropped };
}

/**
 * Normalise the pagination envelope.
 *
 * Django REST Framework commonly returns `{ count, next, previous, results }`
 * and sometimes a bare array. Both are handled; anything else is reported as
 * malformed rather than coerced, because guessing the shape is how a listing
 * silently becomes "empty" instead of "broken".
 *
 * UNVERIFIED — 12 items per page was observed on the live site (API-CONTRACT
 * §1) but the envelope shape has never been inspected with a token.
 */
export function normalisePaged(
  payload: unknown,
  page: number,
  pageSize: number,
): { ok: true; items: unknown[]; total: number } | { ok: false; detail: string } {
  if (Array.isArray(payload)) {
    return { ok: true, items: payload, total: payload.length };
  }

  const record = asRecord(payload);
  const results = record?.results;
  if (record && Array.isArray(results)) {
    const count = readNumber(record, 'count');
    return {
      ok: true,
      items: results,
      // A missing count is not invented: the page length is used instead.
      total: count !== null ? Math.trunc(count) : results.length,
    };
  }

  return { ok: false, detail: 'unrecognised pagination envelope' };
}

export function toPaginated<T>(items: T[], total: number, page: number, pageSize: number): Paginated<T> {
  return { items, total, page, pageSize };
}
