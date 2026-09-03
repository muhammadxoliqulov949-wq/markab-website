import type { Product } from '@/lib/data/types';

/**
 * Deterministic "related products" selection.
 *
 * NOT a recommendation engine and never labelled as one — no "AI", no "siz
 * uchun tanlangan". It is a fixed, fully reproducible score over attributes
 * that already exist in the adapter data: same category, same brand, close
 * price, same storage tier.
 *
 * `id` is the final tie-breaker so a page always renders the same set, on
 * every request and every server.
 */
export function selectRelatedProducts(
  current: Product,
  candidates: Product[],
  limit = 4,
): Product[] {
  return candidates
    .filter((item) => item.id !== current.id)
    .map((item) => ({ item, score: relatednessScore(current, item) }))
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id))
    .slice(0, limit)
    .map((entry) => entry.item);
}

function relatednessScore(current: Product, candidate: Product): number {
  let score = 0;

  if (candidate.category === current.category) score += 4;
  if (candidate.brand === current.brand) score += 3;

  // Relative price distance: 0 → identical, 1 → an order of magnitude apart.
  const priceDistance =
    Math.abs(candidate.priceUzs - current.priceUzs) / Math.max(current.priceUzs, 1);
  if (priceDistance <= 0.15) score += 3;
  else if (priceDistance <= 0.35) score += 2;
  else if (priceDistance <= 0.6) score += 1;

  if (candidate.storageGb !== null && candidate.storageGb === current.storageGb) score += 2;

  // A sold-out item is a poor suggestion next to one that can still be ordered.
  if (candidate.stockStatus === 'out_of_stock') score -= 2;

  // Prefer closer battery health when both publish it.
  if (
    candidate.batteryHealthPercent !== null &&
    current.batteryHealthPercent !== null &&
    Math.abs(candidate.batteryHealthPercent - current.batteryHealthPercent) <= 5
  ) {
    score += 1;
  }

  return score;
}

/**
 * Transparent reason shown under each related card, so the relationship reads
 * as a rule rather than a personalised guess.
 */
export function relatedProductReason(current: Product, candidate: Product): string {
  if (candidate.brand === current.brand && candidate.storageGb === current.storageGb) {
    return `Shu brend · ${candidate.storageGb} GB`;
  }
  if (candidate.brand === current.brand) return 'Shu brend';
  const priceDistance =
    Math.abs(candidate.priceUzs - current.priceUzs) / Math.max(current.priceUzs, 1);
  if (priceDistance <= 0.35) return 'Shunga yaqin narx';
  if (candidate.category === current.category) return 'Shu kategoriya';
  return 'Shunga o‘xshash mahsulot';
}
