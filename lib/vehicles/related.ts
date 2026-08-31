import type { Vehicle } from '@/lib/data/types';

/**
 * Deterministic "related vehicles" selection.
 *
 * IMPORTANT: this is NOT a recommendation engine and must never be described
 * as "AI", "siz uchun tanlangan" or "tavsiya etiladi". It is a fixed, fully
 * reproducible scoring of attributes that already exist in the adapter data:
 * same brand, close model year, close price, same fuel type.
 *
 * `id` is the final tie-breaker so the same page always renders the same
 * three cars, on every request and on every server.
 */
export function selectRelatedVehicles(
  current: Vehicle,
  candidates: Vehicle[],
  limit = 3,
): Vehicle[] {
  const scored = candidates
    .filter((item) => item.id !== current.id)
    .map((item) => ({ item, score: relatednessScore(current, item) }))
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));

  return scored.slice(0, limit).map((entry) => entry.item);
}

function relatednessScore(current: Vehicle, candidate: Vehicle): number {
  let score = 0;

  if (candidate.brand === current.brand) score += 4;

  const yearGap = Math.abs(candidate.year - current.year);
  if (yearGap === 0) score += 3;
  else if (yearGap === 1) score += 2;
  else if (yearGap <= 2) score += 1;

  // Relative price distance: 0 → identical, 1 → an order of magnitude apart.
  const priceDistance =
    Math.abs(candidate.priceUzs - current.priceUzs) / Math.max(current.priceUzs, 1);
  if (priceDistance <= 0.15) score += 3;
  else if (priceDistance <= 0.35) score += 2;
  else if (priceDistance <= 0.6) score += 1;

  if (candidate.fuelType === current.fuelType) score += 1;
  if (candidate.transmission === current.transmission) score += 1;

  return score;
}

/**
 * Human-readable reason shown next to the related rail, so the relationship is
 * transparent rather than implied to be personalised.
 */
export function relatedReason(current: Vehicle, candidate: Vehicle): string {
  if (candidate.brand === current.brand) return `${candidate.brand} — shu brend`;
  const priceDistance =
    Math.abs(candidate.priceUzs - current.priceUzs) / Math.max(current.priceUzs, 1);
  if (priceDistance <= 0.35) return 'Shunga yaqin narx';
  if (Math.abs(candidate.year - current.year) <= 1) return 'Shunga yaqin yil';
  return 'Shunga o‘xshash e’lon';
}
