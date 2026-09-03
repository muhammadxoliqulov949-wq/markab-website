import type { Product } from '@/lib/data/types';
import { stockLabels } from '@/lib/labels';

/**
 * Availability rules for the electronics catalogue.
 *
 * This module exists so the card, the detail page and the cart all apply the
 * same rule instead of three slightly different ones.
 *
 *   in_stock      → the source explicitly says available. Add to cart allowed.
 *   out_of_stock  → the source explicitly says sold out. Action disabled.
 *   unknown       → the source published nothing. Add to cart is NOT allowed.
 *                   Unknown is the absence of information, not availability —
 *                   treating it as "can buy" would quietly promise stock. The
 *                   neutral action is a contact flow that asks Markab to
 *                   confirm it.
 */
export function isPurchasable(product: Product): boolean {
  return product.stockStatus === 'in_stock';
}

export function stockMeta(
  product: Product,
): { label: string; tone: 'success' | 'warning' | 'pending' } {
  return stockLabels[product.stockStatus];
}

/** Where the "Mavjudligini aniqlash" action sends the visitor. */
export function availabilityHref(product: Product): string {
  return `/contact?type=electronics&ref=${encodeURIComponent(product.id)}`;
}

export function availabilityNote(product: Product): string {
  switch (product.stockStatus) {
    case 'in_stock':
      return 'Ochiq e’londa mavjud deb ko‘rsatilgan.';
    case 'out_of_stock':
      return 'Ochiq e’londa “Qolmadi” deb belgilangan — hozircha buyurtma berib bo‘lmaydi.';
    default:
      return 'Mavjudligi ochiq e’londa ko‘rsatilmagan. Savatchaga qo‘shish uchun avval mavjudlikni aniqlash kerak.';
  }
}
