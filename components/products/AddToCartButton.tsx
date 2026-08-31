'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/data/types';
import { useCart } from '@/components/cart/CartProvider';
import { availabilityNote, isPurchasable } from '@/lib/products/stock';

/**
 * Add-to-cart action, shared by the catalogue card and the detail page so both
 * apply the same availability rule.
 *
 * Duplicate handling is deliberate: the prototype cart is one line per
 * product, so adding the same item twice is a no-op and the button reports
 * "Savatchada" instead of silently stacking copies. A product the source marks
 * sold out can never be added.
 */
export function AddToCartButton({
  product,
  size = 'sm',
  showHint = false,
}: {
  product: Product;
  /** `sm` sits in a card footer or sticky bar; `lg` is the detail CTA. */
  size?: 'sm' | 'lg';
  /** Detail page only: shows the availability caveat and a cart shortcut. */
  showHint?: boolean;
}) {
  const { addItem, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const purchasable = isPurchasable(product);
  const inCart = items.some((item) => item.id === product.id);

  const heights = size === 'lg' ? 'h-12 text-base' : 'h-10 text-sm';

  if (!purchasable) {
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
