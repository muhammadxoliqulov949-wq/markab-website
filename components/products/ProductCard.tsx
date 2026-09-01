'use client';

import Link from 'next/link';
import type { Product } from '@/lib/data/types';
import { formatUzs } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { CatalogueImage } from '@/components/products/CatalogueImage';
import { SaveButton } from '@/components/account/SaveButton';
import { PendingValue } from '@/components/ui/StateBlock';
import { AddToCartButton } from '@/components/products/AddToCartButton';
import { stockMeta } from '@/lib/products/stock';

/**
 * Electronics catalogue card.
 *
 * Deliberately NOT the vehicle card. The differences are functional, not
 * decorative:
 *   • `object-contain` with padding inside a fixed 4:3 frame, so a tall phone
 *     photo and a wide accessory shot occupy the same box and nothing is
 *     cropped — the automotive card uses `object-cover`, which would cut a
 *     phone in half. The 4:3 ratio itself is kept: it is the shared catalogue
 *     geometry approved in Phase 1.1, so the homepage rail and this grid stay
 *     aligned and no approved layout changes size;
 *   • availability is a first-class badge, because stock decides whether the
 *     second action exists at all;
 *   • two actions — a link to the detail page and a real add-to-cart button
 *     that renders disabled for a sold-out product.
 *
 * Every row is fixed-height, so a missing image, a missing spec or a pending
 * monthly payment never shifts the rows below it.
 */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const image = product.images[0];
  const stock = stockMeta(product);
  const monthly = product.financing.monthlyPaymentUzs;
  const href = `/electronics/${product.id}`;

  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card-hover">
      <Link href={href} className="flex flex-1 flex-col">
        {/* Fixed frame — source photo proportions cannot change it. */}
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
          <CatalogueImage
            src={image ?? null}
            alt={product.name}
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 45vw, 30vw"
            /* contain + padding = the product floats on neutral ground */
            className="object-contain object-center p-4 transition-transform duration-700 ease-smooth group-hover:scale-[1.03]"
          />

          <div className="absolute left-3 top-3">
            <Badge tone={stock.tone}>{stock.label}</Badge>
          </div>

          {/*
            Floated inside the existing 4:3 frame, so saving adds no height and
            cannot disturb the tuned marketplace grid.
          */}
          <SaveButton
            variant="overlay"
            item={{
              kind: 'electronics',
              ref: product.id,
              title: product.name,
              priceUzs: product.priceUzs,
              image: image,
              href,
            }}
          />
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
            {product.brand}
          </p>

          {/* Two lines, always — so every price starts on the same row. */}
          <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-base font-semibold leading-snug text-ink-900">
            {product.name}
          </h3>

          <div className="mt-1.5 flex min-h-[1.375rem] flex-wrap items-center gap-1.5">
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

          <div className="mt-3 flex flex-1 flex-col justify-end">
            <p className="text-[1.0625rem] font-semibold leading-tight tracking-[-0.01em] text-ink-900">
              {formatUzs(product.priceUzs)}
            </p>
            {/* Fixed height: a pending payment must not move the rows below. */}
            <p className="mt-1 flex h-5 items-center text-sm">
              {monthly ? (
                <span className="font-medium text-brand-700">{formatUzs(monthly)} / oy</span>
              ) : (
                <PendingValue label="Oylik to‘lov tayyorlanmoqda" />
              )}
            </p>
          </div>
        </div>
      </Link>

      {/*
        Actions live outside the content link so the button is not nested in an
        anchor. Both are real controls: the button is disabled for sold-out
        products.
      */}
      <div className="mt-auto flex items-center gap-2 border-t border-line p-3">
        <div className="min-w-0 flex-1">
          <AddToCartButton product={product} size="sm" />
        </div>
        <Link
          href={href}
          aria-label={`${product.name} — batafsil`}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-ink-800 transition-colors hover:bg-surface-muted hover:text-brand-800"
        >
          Batafsil
          <svg
            className="h-4 w-4 text-ink-400 transition-transform duration-300 ease-smooth group-hover:translate-x-1 group-hover:text-brand-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
