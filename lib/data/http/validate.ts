import 'server-only';

import { isAllowedImageUrl } from '@/lib/security/url';
import type { FuelType, StockStatus, Transmission } from '../types';

/**
 * Runtime validation for API payloads (Phase 13 §7, §8).
 *
 * Everything arriving from api.markab.uz is untrusted input — not because the
 * API is hostile, but because a marketplace that binds raw responses to the UI
 * turns every upstream field rename into a broken page, and every corrupt
 * record into inventory the business never published.
 *
 * THREE OUTCOMES, NEVER TWO
 *
 *   • valid        → the field is used as-is
 *   • unknown      → the field is null and renders as "ma'lumot kiritilmagan".
 *                    Used when the value is merely absent or unrecognised.
 *   • quarantined  → the record is dropped from public listings, because the
 *                    value is not merely missing but impossible.
 *
 * Nothing is ever corrected. A battery health of 256 % does not become 100 %
 * and does not become null-in-silence: it removes the record and logs why
 * (DATA-QUALITY-REGISTER E-1).
 */

export type Quarantine = {
  /** Stable rule id, e.g. 'PRODUCT_BATTERY_RANGE'. */
  rule: string;
  field: string;
  /** Short, loggable description of what was seen. Never shown to customers. */
  observed: string;
  /** Always 'omit' — a quarantined record is not published in any form. */
  action: 'omit';
};

export type Validated<T> =
  | { ok: true; value: T }
  | { ok: false; quarantine: Quarantine | null; detail: string };

const ok = <T,>(value: T): Validated<T> => ({ ok: true, value });
const bad = <T,>(detail: string, quarantine: Quarantine | null = null): Validated<T> => ({
  ok: false,
  quarantine,
  detail,
});
const quarantine = <T,>(rule: string, field: string, observed: string): Validated<T> =>
  bad(`${rule} on ${field}`, { rule, field, observed: observed.slice(0, 60), action: 'omit' });

/* -------------------------------------------------------------------------- */
/* Primitive readers                                                           */
/* -------------------------------------------------------------------------- */

export function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** A non-empty string, length-capped so a runaway field cannot wreck layout. */
export function readString(source: Record<string, unknown>, key: string, max = 300): string | null {
  const raw = source[key];
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 && trimmed.length <= max ? trimmed : null;
}

export function readNumber(source: Record<string, unknown>, key: string): number | null {
  const raw = source[key];
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  if (typeof raw === 'string' && raw.trim() !== '') {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function readBoolean(source: Record<string, unknown>, key: string): boolean | null {
  const raw = source[key];
  if (typeof raw === 'boolean') return raw;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return null;
}

/**
 * Image URLs, validated against the same allow-list the CSP and next/image
 * use. An off-host or http URL from the API is dropped: it would either leak
 * a referrer to a host we did not choose, or make next/image throw at render.
 *
 * Two shapes are accepted — an array of URL strings, and an array of objects
 * with a `url` (or `image`) key, which is what a nested DRF serializer
 * commonly emits. This is tolerance for a payload shape, not an invention:
 * if the API sends neither, no image is read and the record is not published
 * on the strength of a guess. The canonical shape still has to be confirmed.
 */
export function readImageUrls(source: Record<string, unknown>, key: string): string[] {
  const raw = source[key];
  const candidates = Array.isArray(raw) ? raw : typeof raw === 'string' && raw ? [raw] : [];

  return candidates
    .map((entry) => {
      if (typeof entry === 'string') return entry;
      if (entry !== null && typeof entry === 'object') {
        const record = entry as Record<string, unknown>;
        const value = record.url ?? record.image;
        return typeof value === 'string' ? value : null;
      }
      return null;
    })
    .filter((value): value is string => isAllowedImageUrl(value));
}

/* -------------------------------------------------------------------------- */
/* Domain field validators                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Price floors, deliberately conservative.
 *
 * These are not pricing policy and must never be used to "correct" a value —
 * they exist to catch the corruption class already recorded in the data-quality
 * register (V-1: a vehicle published at `1 so'm`). The thresholds are far below
 * any real listing on purpose: the cost of missing a corrupt record is a page
 * showing nonsense, and the cost of a false positive is losing a sale, so the
 * bar is set low.
 */
const VEHICLE_PRICE_FLOOR_UZS = 1_000_000;
const PRODUCT_PRICE_FLOOR_UZS = 10_000;
const PRICE_CEILING_UZS = 100_000_000_000;

export function validatePrice(
  source: Record<string, unknown>,
  key: string,
  kind: 'vehicle' | 'product',
): Validated<number> {
  const raw = readNumber(source, key);
  if (raw === null) return bad('missing price');

  const floor = kind === 'vehicle' ? VEHICLE_PRICE_FLOOR_UZS : PRODUCT_PRICE_FLOOR_UZS;
  if (raw <= 0) return quarantine(`${kind.toUpperCase()}_PRICE_NON_POSITIVE`, key, String(raw));
  if (raw < floor) {
    return quarantine(`${kind.toUpperCase()}_PRICE_FLOOR`, key, String(raw));
  }
  if (raw > PRICE_CEILING_UZS) {
    return quarantine(`${kind.toUpperCase()}_PRICE_CEILING`, key, String(raw));
  }
  return ok(raw);
}

/** Real device storage capacities. Anything else is unknown, not corrected. */
const ALLOWED_STORAGE_GB = new Set([8, 16, 32, 64, 128, 256, 512, 1024, 2048]);

export function validateStorageGb(source: Record<string, unknown>, key: string): Validated<number | null> {
  const raw = readNumber(source, key);
  if (raw === null) return ok(null); // unknown, not zero
  if (!ALLOWED_STORAGE_GB.has(raw)) {
    // E-1: "100 GB" on an iPhone is not a capacity, it is corrupt metadata.
    return quarantine('PRODUCT_STORAGE_IMPOSSIBLE', key, String(raw));
  }
  return ok(raw);
}

export function validateBatteryPercent(
  source: Record<string, unknown>,
  key: string,
): Validated<number | null> {
  const raw = readNumber(source, key);
  if (raw === null) return ok(null);
  if (raw < 0 || raw > 100) {
    // E-1: 256 % is physically impossible — the same class of defect.
    return quarantine('PRODUCT_BATTERY_RANGE', key, String(raw));
  }
  return ok(raw);
}

export function validateYear(source: Record<string, unknown>, key: string): Validated<number | null> {
  const raw = readNumber(source, key);
  if (raw === null) return ok(null);
  const currentYear = new Date().getUTCFullYear();
  // 1900 is a floor, not a judgement: anything older is a data-entry error in
  // a marketplace that sells cars, not antiques. +2 years allows new model
  // years sold ahead of the calendar year.
  if (raw < 1900 || raw > currentYear + 2) {
    return quarantine('VEHICLE_YEAR_RANGE', key, String(raw));
  }
  return ok(Math.trunc(raw));
}

export function validateMileageKm(
  source: Record<string, unknown>,
  key: string,
): Validated<number | null> {
  const raw = readNumber(source, key);
  if (raw === null) return ok(null);
  if (raw < 0) return quarantine('VEHICLE_MILEAGE_NEGATIVE', key, String(raw));
  if (raw > 2_000_000) return quarantine('VEHICLE_MILEAGE_IMPLAUSIBLE', key, String(raw));
  return ok(Math.trunc(raw));
}

/* -------------------------------------------------------------------------- */
/* Enum mapping                                                                */
/* -------------------------------------------------------------------------- */

const FUEL_MAP: Record<string, FuelType> = {
  petrol: 'petrol',
  benzin: 'petrol',
  gasoline: 'petrol',
  diesel: 'diesel',
  dizel: 'diesel',
  hybrid: 'hybrid',
  gibrid: 'hybrid',
  electric: 'electric',
  elektro: 'electric',
  gas: 'gas',
  gaz: 'gas',
};

const TRANSMISSION_MAP: Record<string, Transmission> = {
  manual: 'manual',
  mexanik: 'manual',
  mexanika: 'manual',
  automatic: 'automatic',
  avtomat: 'automatic',
  avtomatik: 'automatic',
};

/**
 * Stock vocabulary mapping (§26).
 *
 * The rule that matters: anything unrecognised maps to `unknown`, never to
 * `in_stock`. An absent or unexpected stock value must not become a claim that
 * a customer can order the item.
 */
const STOCK_MAP: Record<string, StockStatus> = {
  in_stock: 'in_stock',
  available: 'in_stock',
  mavjud: 'in_stock',
  out_of_stock: 'out_of_stock',
  sold: 'out_of_stock',
  qolmadi: 'out_of_stock',
  unavailable: 'out_of_stock',
};

/** Unknown enum values degrade to null — rendered as "not specified". */
export function mapFuelType(value: unknown): FuelType | null {
  if (typeof value !== 'string') return null;
  return FUEL_MAP[value.trim().toLowerCase()] ?? null;
}

export function mapTransmission(value: unknown): Transmission | null {
  if (typeof value !== 'string') return null;
  return TRANSMISSION_MAP[value.trim().toLowerCase()] ?? null;
}

/** Unrecognised stock is `unknown` — never optimistic. */
export function mapStockStatus(value: unknown): StockStatus {
  if (typeof value !== 'string') return 'unknown';
  return STOCK_MAP[value.trim().toLowerCase()] ?? 'unknown';
}
