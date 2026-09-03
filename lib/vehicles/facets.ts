/**
 * Vehicle facet derivation.
 *
 * Shared by both providers so a filter sidebar shows the same shape of
 * information whether the catalogue came from fixtures or from the API.
 *
 * Every count here is computed from records the marketplace actually lists.
 * Nothing is estimated and no filter value is offered that would return zero
 * results — a facet that says "3 hybrids" must lead to 3 hybrids.
 */
import type { Vehicle, VehicleFacets } from '@/lib/data/types';

function countBy<T extends string | number>(
  source: Vehicle[],
  pick: (item: Vehicle) => T | null,
): { value: T; count: number }[] {
  const map = new Map<T, number>();
  for (const item of source) {
    const value = pick(item);
    if (value === null || value === undefined) continue;
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return [...map.entries()].map(([value, count]) => ({ value, count }));
}

/** Returns null when there is nothing to count — the caller maps that to `empty`. */
export function deriveVehicleFacets(source: Vehicle[]): VehicleFacets | null {
  if (source.length === 0) return null;

  const brands = countBy(source, (v) => v.brand).sort((a, b) => a.value.localeCompare(b.value));
  const years = countBy(source, (v) => v.year).sort((a, b) => b.value - a.value);
  const fuelTypes = countBy(source, (v) => v.fuelType).sort((a, b) => b.count - a.count);
  const transmissions = countBy(source, (v) => v.transmission).sort((a, b) => b.count - a.count);

  const newCount = source.filter((v) => v.isNew).length;
  const condition: { value: 'new' | 'used'; count: number }[] = [];
  if (newCount > 0) condition.push({ value: 'new', count: newCount });
  if (source.length - newCount > 0) condition.push({ value: 'used', count: source.length - newCount });

  return {
    total: source.length,
    brands,
    years,
    priceMin: Math.min(...source.map((v) => v.priceUzs)),
    priceMax: Math.max(...source.map((v) => v.priceUzs)),
    fuelTypes,
    transmissions,
    condition,
    // Counted, never inferred: a vehicle is "with financing" only when the
    // source publishes a financing figure for it.
    withFinancing: source.filter((v) => v.financing.monthlyPaymentUzs !== null).length,
  };
}
