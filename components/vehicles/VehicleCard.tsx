import Image from 'next/image';
import Link from 'next/link';
import type { Vehicle } from '@/lib/data/types';
import { formatKm, formatUzs, formatViews } from '@/lib/format';
import { fuelLabel, transmissionLabel } from '@/lib/labels';
import { Badge } from '@/components/ui/Badge';
import { PendingValue } from '@/components/ui/StateBlock';

function NoImage({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-sunken text-ink-400">
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="m4 16 4.5-4.5 3 3L16 10l4 4" strokeLinecap="round" />
      </svg>
      <span className="text-xs">{label}</span>
    </div>
  );
}

export function VehicleCard({ vehicle, priority = false }: { vehicle: Vehicle; priority?: boolean }) {
  const image = vehicle.images[0];

  return (
    <article className="group overflow-hidden rounded-xl border border-line bg-surface shadow-card transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card-hover">
      <Link href={`/cars/${vehicle.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-sunken">
          {image ? (
            <Image
              src={image}
              alt={vehicle.title}
              fill
              priority={priority}
              loading={priority ? undefined : 'lazy'}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.04]"
            />
          ) : (
            <NoImage label="Rasm mavjud emas" />
          )}

          <div className="absolute left-3 top-3 flex gap-2">
            {vehicle.isNew ? (
              <Badge tone="brand" className="bg-white/95 backdrop-blur">
                Yangi
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="p-5">
          <h3 className="truncate text-[0.9375rem] font-semibold text-ink-900">{vehicle.title}</h3>
          <p className="mt-1 text-sm text-ink-500">
            {vehicle.year} · {formatKm(vehicle.mileageKm)} · {fuelLabel(vehicle.fuelType)} ·{' '}
            {transmissionLabel(vehicle.transmission)}
          </p>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-lg font-semibold tracking-[-0.01em] text-ink-900">
                {formatUzs(vehicle.priceUzs)}
              </p>
              {vehicle.financing.monthlyPaymentUzs ? (
                <p className="mt-0.5 text-sm text-brand-700">
                  {formatUzs(vehicle.financing.monthlyPaymentUzs)} / oy
                </p>
              ) : (
                <p className="mt-0.5">
                  <PendingValue label="Oylik to‘lov: hisob-kitob tayyorlanmoqda" />
                </p>
              )}
            </div>
            <span className="text-xs text-ink-400">{formatViews(vehicle.views)}</span>
          </div>
        </div>

        {/*
          The whole card is one link; this is the visible CTA affordance, not a
          second interactive element.
        */}
        <div className="flex items-center justify-between border-t border-line px-5 py-3">
          <span className="text-sm font-medium text-ink-800 transition-colors group-hover:text-brand-800">
            Batafsil
          </span>
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
        </div>
      </Link>
    </article>
  );
}
