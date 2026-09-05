'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/data/types';
import { useCart } from '@/components/cart/CartProvider';
import { availabilityHref, availabilityNote, isPurchasable } from '@/lib/products/stock';

/**
 * Purchase action, shared by the catalogue card, the detail page and the sticky
 * bar so all three apply the same availability rule.
 *
 * Three states, driven entirely by what the source published:
 *   in_stock      → add to cart, one line per product
 *   out_of_stock  → disabled, nothing to buy
 *   unknown       → NOT purchaseable. A neutral contact action instead, because
 *                   offering "add to cart" here would imply stock the source
 *                   never confirmed.
 *
 * Duplicate handling is deliberate: adding the same product twice is a no-op
 * and the button reports "Savatchada" rather than silently stacking copies.
 */
export function AddToCartButton({
  product,
  size = 'sm',
  showHint = false,
}: {
  product: Product;
  /** `sm` sits in a card footer or sticky bar; `lg` is the detail CTA. */
  size?: 'sm' | 'lg';
  /** Detail page and sticky bar: shows the availability caveat. */
  showHint?: boolean;
}) {
  const { addItem, items, has } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const inCart = has(product.id);
  const heights =
    size === 'lg'
      ? 'h-12 text-base'
      : 'h-9 text-[13px] sm:h-10 sm:text-sm';

  // Sold out — nothing to offer.
  if (product.stockStatus === 'out_of_stock') {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className={`inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg border border-line bg-surface-muted font-medium text-ink-400 ${heights}`}
        >
          Qolmadi
        </button>
        {showHint ? (
          <p className="text-xs leading-relaxed text-ink-400">{availabilityNote(product)}</p>
        ) : null}
      </div>
    );
  }

  // Unknown — ask, do not assume.
  if (!isPurchasable(product)) {
    return (
      <div className="flex flex-col gap-2">
        <Link
          href={availabilityHref(product)}
          className={`inline-flex w-full items-center justify-center rounded-lg border border-line-strong bg-white px-5 font-medium text-ink-800 transition-colors hover:bg-surface-muted hover:text-brand-800 ${heights}`}
        >
          Mavjudligini aniqlash
        </Link>
        {showHint ? (
          <p className="text-xs leading-relaxed text-ink-400">{availabilityNote(product)}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={inCart}
        onClick={() => {
          addItem({
            id: product.id,
            name: product.name,
            priceUzs: product.priceUzs,
            image: product.images[0] ?? null,
            href: `/electronics/${product.id}`,
          });
          setJustAdded(true);
        }}
        className={[
          'inline-flex w-full items-center justify-center rounded-lg px-5 font-medium transition-all duration-200',
          heights,
          inCart
            ? 'cursor-not-allowed border border-line bg-surface-sunken text-ink-500'
            : 'bg-brand-700 text-white hover:bg-brand-800 active:translate-y-[0.5px]',
        ].join(' ')}
      >
        {inCart ? 'Savatchada' : size === 'lg' ? 'Savatchaga qo‘shish' : 'Savatga'}
      </button>

      {showHint ? (
        <p className="text-xs leading-relaxed text-ink-400">{availabilityNote(product)}</p>
      ) : null}

      {justAdded ? (
        <Link
          href="/cart"
          className="text-center text-sm font-medium text-brand-700 underline underline-offset-2"
        >
          Savatchani ochish
        </Link>
      ) : null}
    </div>
  );
}
