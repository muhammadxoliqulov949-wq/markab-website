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
 *
 * Server component on purpose. It uses no hooks and no browser APIs — the
 * interactive parts inside it (CatalogueImage, SaveButton, AddToCartButton)
 * are client components and hydrate on their own. Marking the card itself
 * 'use client' would ship this entire card's markup as JavaScript for every
 * item in the grid, which is the single most repeated component on the site.
 */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const image = product.images[0];
  const stock = stockMeta(product);
  const monthly = product.financing.monthlyPaymentUzs;
  const href = `/electronics/${product.id}`;

  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-[16px] border border-line-hairline bg-surface shadow-[0_2px_10px_-4px_rgba(11,18,32,0.08)] transition-card active:scale-[0.98]
                        sm:rounded-card sm:border-line sm:shadow-none
                        hover-only:-translate-y-0.5 hover-only:border-brand-200/70 hover-only:shadow-card-hover">
      <Link href={href} className="flex flex-1 flex-col">
        {/* Fixed frame — source photo proportions cannot change it. */}
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
          <CatalogueImage
            src={image ?? null}
            alt={product.name}
            priority={priority}
            sizes="(max-width: 640px) 78vw, (max-width: 1280px) 45vw, 30vw"
            /* contain + padding = the product floats on neutral ground */
            className="object-contain object-center p-3 transition-transform duration-700 ease-smooth group-hover:scale-[1.03] sm:p-4"
          />

          <div className="absolute left-2 top-2">
            <Badge tone={stock.tone} className="text-[10px] sm:text-xs">{stock.label}</Badge>
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

        <div className="flex flex-1 flex-col p-3.5 sm:p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-500 sm:text-[11px] sm:tracking-[0.14em]">
            {product.brand}
          </p>

          {/* Two lines, always — so every price starts on the same row. */}
          <h3 className="mt-1 line-clamp-2 min-h-[2.25rem] text-[14px] font-semibold leading-snug text-ink-900 sm:min-h-[2.5rem] sm:text-base">
            {product.name}
          </h3>

          <div className="mt-1 flex min-h-[1.25rem] flex-wrap items-center gap-1 sm:mt-1.5 sm:min-h-[1.375rem] sm:gap-1.5">
            {product.storageGb ? (
              <span className="rounded-md bg-surface-sunken px-1.5 py-0.5 text-[10px] text-ink-600 sm:px-2 sm:text-xs">
                {product.storageGb} GB
              </span>
            ) : null}
            {product.batteryHealthPercent ? (
              <span className="rounded-md bg-surface-sunken px-1.5 py-0.5 text-[10px] text-ink-600 sm:px-2 sm:text-xs">
                Batareya {product.batteryHealthPercent}%
              </span>
            ) : null}
          </div>

          <div className="mt-2.5 flex flex-1 flex-col justify-end sm:mt-3">
            <p className="text-[15px] font-semibold leading-tight tracking-[-0.01em] text-ink-900 sm:text-[1.0625rem]">
              {formatUzs(product.priceUzs)}
            </p>
            {/* Fixed height: a pending payment must not move the rows below. */}
            <p className="mt-0.5 flex h-5 items-center text-[12px] sm:mt-1 sm:text-sm">
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
        anchor. On mobile we collapse to a single full-width "add to cart"
        button (no "Xususiyatlar" chevron) to keep cards short; desktop keeps
        both actions.
      */}
      <div className="mt-auto flex items-center gap-2 border-t border-line-hairline p-2.5 sm:border-line sm:p-3">
        <div className="min-w-0 flex-1">
          <AddToCartButton product={product} size="sm" />
        </div>
        <Link
          href={href}
          aria-label={`${product.name} — xususiyatlarni ko‘rish`}
          className="hidden h-10 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-ink-800 transition-colors hover:bg-surface-muted hover:text-brand-800 sm:inline-flex"
        >
          Xususiyatlar
          <svg
            className="h-4 w-4 text-ink-400 transition-transform duration-300 ease-smooth group-hover:translate-x-1 group-hover:text-brand-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
