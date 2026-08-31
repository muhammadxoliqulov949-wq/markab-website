import type { Product } from '@/lib/data/types';
import { stockLabels } from '@/lib/labels';

/**
 * Availability rules for the electronics catalogue.
 *
 * This module exists so the card, the detail page and the cart all apply the
 * same rule instead of three slightly different ones.
 *
 * `out_of_stock`  → the source explicitly says sold out. NOT purchasable.
 * `in_stock`      → the source explicitly says available. Purchasable.
 * `unknown`       → the source published nothing. This is the absence of
 *                   availability information, not availability. It is never
 *                   rendered as "Mavjud"; the product stays orderable and the
 *                   pending marker carries the caveat, because dropping every
 *                   unconfirmed item would empty the catalogue.
 */
export function isPurchasable(product: Product): boolean {
  return product.stockStatus !== 'out_of_stock';
}

export function stockMeta(product: Product): { label: string; tone: 'success' | 'warning' | 'pending' } {
  return stockLabels[product.stockStatus];
}

export function availabilityNote(product: Product): string {
  switch (product.stockStatus) {
    case 'in_stock':
      return 'Ochiq e’londa mavjud deb ko‘rsatilgan.';
    case 'out_of_stock':
      return 'Ochiq e’londa “Qolmadi” deb belgilangan — hozircha buyurtma berib bo‘lmaydi.';
    default:
      return 'Mavjudligi ochiq e’londa ko‘rsatilmagan — ariza yuborilgach rasmiy manba bilan tasdiqlanadi.';
  }
}
