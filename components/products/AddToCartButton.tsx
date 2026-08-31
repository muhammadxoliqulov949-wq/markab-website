'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/data/types';
import { useCart } from '@/components/cart/CartProvider';

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const inCart = items.some((item) => item.id === product.id);
  const outOfStock = product.stockStatus === 'out_of_stock';

  if (outOfStock) {
    return (
      <div className="rounded-lg border border-dashed border-line-strong bg-surface-muted px-4 py-3 text-sm text-ink-500">
        Hozircha mavjud emas. O‘xshash mahsulotlarni ko‘rib chiqishingiz mumkin.
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
        className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-brand-700 px-6 text-base font-medium text-white transition-all duration-200 hover:bg-brand-800 active:translate-y-[0.5px] disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-400"
      >
        {inCart ? 'Savatchaga qo‘shildi' : 'Savatchaga qo‘shish'}
      </button>

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
