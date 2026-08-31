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
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-400">
      <svg
        className="h-8 w-8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="6" y="3" width="12" height="18" rx="2.5" />
        <path d="M11 18h2" strokeLinecap="round" />
      </svg>
      <span className="text-xs">Rasm mavjud emas</span>
    </div>
  );
}

/**
 * Electronics catalogue card.
 *
 * SOURCE PHOTOGRAPHY IS INCONSISTENT (studio shots, in-hand shots, shop
 * floors, different crops). Rather than pretend otherwise, the card mounts
 * every photo the same way:
 *   • a fixed 4:3 frame — identical to the vehicle cards, so the two
 *     catalogues share one geometry;
 *   • `object-contain` + padding on a neutral ground, so a tall phone and a
 *     wide accessory occupy the same box and nothing is cropped or blown up;
 *   • fixed-height rows for title, specs, price and monthly payment, so a
 *     missing spec or a pending payment never shifts the rows below it.
 *
 * No product data is changed, invented or replaced.
 */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addItem, items } = useCart();
  const inCart = items.some((item) => item.id === product.id);
  const outOfStock = product.stockStatus === 'out_of_stock';
  const stock = stockLabels[product.stockStatus];
  const image = product.images[0];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card-hover">
      <Link href={`/electronics/${product.id}`} className="flex flex-1 flex-col">
        {/* Fixed frame — source dimensions cannot influence card geometry. */}
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              priority={priority}
              loading={priority ? undefined : 'lazy'}
              sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 30vw"
              /* padding + contain = the product floats on neutral ground */
              className="object-contain object-center p-4 transition-transform duration-700 ease-smooth group-hover:scale-[1.03]"
            />
          ) : (
            <NoImage />
          )}
          <div className="absolute left-3 top-3">
            <Badge tone={stock.tone}>{stock.label}</Badge>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          {/* Title: always two lines tall, so prices start on the same row. */}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-ink-900">
            {product.name}
          </h3>

          {/* Specs: fixed height even when a product publishes no specs. */}
          <div className="mt-1.5 flex min-h-[1.25rem] flex-wrap items-center gap-1.5">
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

          <div className="mt-2.5 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[1.0625rem] font-semibold leading-tight text-ink-900">
                {formatUzs(product.priceUzs)}
              </p>
              {/* Fixed height: a pending payment must not move the rows below. */}
              <p className="mt-1 flex min-h-[1.375rem] items-center text-sm text-brand-700">
                {product.financing.monthlyPaymentUzs ? (
                  `${formatUzs(product.financing.monthlyPaymentUzs)} / oy`
                ) : (
                  <PendingValue label="Oylik to‘lov: hisob-kitob tayyorlanmoqda" />
                )}
              </p>
            </div>
            <span className="shrink-0 text-xs text-ink-400">{formatViews(product.views)}</span>
          </div>
        </div>
      </Link>

      {/* CTA is outside the link and pinned to the card's bottom edge. */}
      <div className="border-t border-line p-2">
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
          className="w-full rounded-lg border border-line-strong px-3 py-2 text-sm font-medium text-ink-800 transition-all duration-200 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-800 disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-muted disabled:text-ink-400"
        >
          {outOfStock ? 'Qolmadi' : inCart ? 'Savatchada' : 'Savatchaga'}
        </button>
      </div>
    </article>
  );
}
