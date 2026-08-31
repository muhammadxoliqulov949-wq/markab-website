'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/data/types';
import { formatUzs, formatViews } from '@/lib/format';
import { stockLabels } from '@/lib/labels';
import { Badge } from '@/components/ui/Badge';
import { PendingValue } from '@/components/ui/StateBlock';
import { useCart } from '@/components/cart/CartProvider';

function NoImage() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-sunken text-ink-400">
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="6" y="3" width="12" height="18" rx="2.5" />
        <path d="M11 18h2" strokeLinecap="round" />
      </svg>
      <span className="text-xs">Rasm mavjud emas</span>
    </div>
  );
}

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addItem, items } = useCart();
  const inCart = items.some((item) => item.id === product.id);
  const outOfStock = product.stockStatus === 'out_of_stock';
  const stock = stockLabels[product.stockStatus];
  const image = product.images[0];

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card-hover">
      <Link href={`/electronics/${product.id}`} className="block">
        {/* 4:3 — the same frame every catalogue card uses, so grids stay even. */}
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-sunken">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              priority={priority}
              loading={priority ? undefined : 'lazy'}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.04]"
            />
          ) : (
            <NoImage />
          )}
          <div className="absolute left-3 top-3">
            <Badge tone={stock.tone}>{stock.label}</Badge>
          </div>
        </div>

        <div className="flex-1 p-4">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-ink-900">
            {product.name}
          </h3>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {product.storageGb ? (
              <span className="rounded-md bg-surface-sunken px-2 py-0.5 text-xs text-ink-600">
                {product.storageGb} GB
              </span>
            ) : null}
            {product.batteryHealthPercent ? (
              <span className="rounded-md bg-surface-sunken px-2 py-0.5 text-xs text-ink-600">
                Batareya {product.batteryHealthPercent}%
              </span>
            ) : null}
          </div>

          <div className="mt-3">
            <p className="text-base font-semibold text-ink-900">{formatUzs(product.priceUzs)}</p>
            {product.financing.monthlyPaymentUzs ? (
              <p className="mt-0.5 text-sm text-brand-700">
                {formatUzs(product.financing.monthlyPaymentUzs)} / oy
              </p>
            ) : (
              <p className="mt-0.5">
                <PendingValue label="Oylik to‘lov: hisob-kitob tayyorlanmoqda" />
              </p>
            )}
          </div>

          <p className="mt-2 text-xs text-ink-400">{formatViews(product.views)}</p>
        </div>
      </Link>

      <div className="border-t border-line p-3">
        <button
          type="button"
          disabled={outOfStock || inCart}
          onClick={() =>
            addItem({
              id: product.id,
              name: product.name,
              priceUzs: product.priceUzs,
              image: image ?? null,
              href: `/electronics/${product.id}`,
            })
          }
          className="w-full rounded-lg border border-line-strong px-3 py-2.5 text-sm font-medium text-ink-800 transition-all duration-200 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-800 disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-muted disabled:text-ink-400"
        >
          {outOfStock ? 'Qolmadi' : inCart ? 'Savatchada' : 'Savatchaga'}
        </button>
      </div>
    </article>
  );
}
