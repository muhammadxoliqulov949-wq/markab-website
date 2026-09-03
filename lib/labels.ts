import type { FuelType, StockStatus, Transmission } from './data/types';

/**
 * Enum → Uzbek label mapping.
 *
 * Raw database values must never reach the UI. The live site currently renders
 * "petrol" and "automatic" to users (docs/DATA-QUALITY-REGISTER.md §V-2/§V-3);
 * this module is the single place that prevents it.
 */

export const fuelLabels: Record<FuelType, string> = {
  petrol: 'Benzin',
  diesel: 'Dizel',
  hybrid: 'Gibrid',
  electric: 'Elektr',
  gas: 'Gaz',
};

export const transmissionLabels: Record<Transmission, string> = {
  manual: 'Mexanik',
  automatic: 'Avtomat',
};

export const stockLabels: Record<StockStatus, { label: string; tone: 'success' | 'warning' | 'pending' }> = {
  in_stock: { label: 'Mavjud', tone: 'success' },
  out_of_stock: { label: 'Qolmadi', tone: 'warning' },
  unknown: { label: 'Holati aniqlanmoqda', tone: 'pending' },
};

export function fuelLabel(value: FuelType): string {
  return fuelLabels[value] ?? 'Ma’lumot tayyorlanmoqda';
}

export function transmissionLabel(value: Transmission): string {
  return transmissionLabels[value] ?? 'Ma’lumot tayyorlanmoqda';
}
