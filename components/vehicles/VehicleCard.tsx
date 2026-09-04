import Link from 'next/link';
import type { Vehicle } from '@/lib/data/types';
import { formatKm, formatUzs } from '@/lib/format';
import { fuelLabel, transmissionLabel } from '@/lib/labels';
import { Badge } from '@/components/ui/Badge';
import { PendingValue } from '@/components/ui/StateBlock';
import { SaveButton } from '@/components/account/SaveButton';
import { CatalogueImage } from '@/components/products/CatalogueImage';

/**
 * Marketplace vehicle card.
 *
 * Built only from fields the data source actually publishes. The name is
 * composed from `brand` + `model` + `year` rather than the raw `title`, because
 * fixture titles are inconsistent about including the year. The monthly payment
 * is printed only when the source publishes one — it is never derived here.
 */
export function VehicleCard({
  vehicle,
  priority = false,
  highlight = false,
}: {
  vehicle: Vehicle;
  priority?: boolean;
  /**
   * Marks the first card of a curated set. Deliberately NOT a different card
   * size: a shorter card inside a grid row left a large empty gap beneath it.
   */
  highlight?: boolean;
}) {
  const image = vehicle.images[0];
  const href = `/cars/${vehicle.slug}`;
  const monthly = vehicle.financing.monthlyPaymentUzs;

  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-card border border-line bg-surface transition-card hover-only:-translate-y-0.5 hover-only:border-brand-200/70 hover-only:shadow-card-hover">
      <Link href={href} className="flex flex-1 flex-col">
        {/* Fixed 4:3 frame — the same geometry the electronics cards use. */}
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
          <CatalogueImage
            src={image ?? null}
            alt={`${vehicle.brand} ${vehicle.model}`}
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 30vw"
            className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.04]"
          />

          <div className="absolute left-2 top-2 flex flex-wrap gap-2">
            {highlight ? (
              <Badge tone="brand" className="bg-white/95 shadow-sm">
                Tanlangan
              </Badge>
            ) : null}
            {vehicle.isNew ? (
              <Badge tone="brand" className="bg-white/95 shadow-sm">
                Yangi
              </Badge>
            ) : null}
          </div>

          {/*
            Floated inside the existing 4:3 frame, so saving adds no height and
            cannot disturb the tuned marketplace grid.
          */}
          <SaveButton
            variant="overlay"
            item={{
              kind: 'car',
              ref: vehicle.slug,
              title: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
              priceUzs: vehicle.priceUzs,
              image: image ?? null,
              href,
            }}
          />
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="truncate text-base font-semibold leading-snug text-ink-900">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="mt-1 truncate text-sm text-ink-500">
            {vehicle.year} · {formatKm(vehicle.mileageKm)} · {fuelLabel(vehicle.fuelType)} ·{' '}
            {transmissionLabel(vehicle.transmission)}
          </p>

          {/*
            Price block. The monthly payment is always two lines — a fixed label
            plus either the published value or a pending marker — so every card
            in the grid is the same height whichever state it lands in.
          */}
          <div className="mt-4 flex flex-1 flex-col justify-end">
            <p className="text-xl font-semibold leading-tight tracking-[-0.01em] text-ink-900">
              {formatUzs(vehicle.priceUzs)}
            </p>
            <div className="mt-2">
              <p className="text-xs text-ink-500">Oylik to‘lov</p>
              {/* Fixed height: the pending marker carries an icon and would
                  otherwise make those cards 2px taller than the rest. */}
              <p className="mt-0.5 flex h-5 items-center text-sm">
                {monthly ? (
                  <span className="font-medium text-brand-700">{formatUzs(monthly)}</span>
                ) : (
                  <PendingValue label="Tayyorlanmoqda" />
                )}
              </p>
            </div>
          </div>
        </div>

        {/*
          The whole card is one link; this is the visible CTA affordance, not a
          second interactive element.
        */}
        <div className="flex items-center justify-between border-t border-line px-5 py-3">
          <span className="text-sm font-medium text-ink-800 transition-colors group-hover:text-brand-800">
            Avtomobilni ko‘rish
          </span>
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
        </div>
      </Link>
    </article>
  );
}
