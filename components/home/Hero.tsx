import Image from 'next/image';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Container } from '@/components/ui/Section';
import { PendingValue } from '@/components/ui/StateBlock';
import { formatUzs } from '@/lib/format';
import { site } from '@/lib/site';
import type { Product, Vehicle } from '@/lib/data/types';

/**
 * Premium hero — the entry point of the product.
 *
 * Left: what Markab is, in one sentence, plus the two primary goals.
 * Right: a real catalogue composition (vehicle visual + financing card), so the
 * hero shows the actual product instead of an abstract illustration.
 *
 * Only published values are shown: the monthly payment appears only when the
 * source publishes it, otherwise the explicit pending marker is rendered.
 */
export function Hero({ vehicle, product }: { vehicle: Vehicle | null; product: Product | null }) {
  const image = vehicle?.images[0] ?? null;

  return (
    <section className="relative overflow-hidden border-b border-line bg-surface">
      <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      <Container className="relative py-12 sm:py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            <Badge tone="brand" className="mb-5">
              {site.positioning}
            </Badge>

            <h1 className="max-w-xl text-display-sm sm:text-display-md lg:text-display-lg">
              Qadriyatlarga asoslangan zamonaviy moliyaviy ekotizim.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-500 sm:text-lg">
              Markab — avtomobil va elektronikani muddatli to‘lovga taqdim etuvchi,
              qadriyatlarga asoslangan moliya platformasi. Avtomobil, elektronika,
              moliyalashtirish va sarmoya — bitta ekotizimda, ochiq shartlar bilan.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/cars" size="lg" className="sm:w-auto">
                Avtomobillarni ko‘rish
              </ButtonLink>
              <ButtonLink href="/invest" variant="secondary" size="lg" className="sm:w-auto">
                Sarmoya imkoniyatlarini ko‘rish
              </ButtonLink>
            </div>

            <p className="mt-5 text-sm text-ink-500">
              <Link
                href="#qanday-ishlaydi"
                className="inline-flex items-center gap-1.5 font-medium text-brand-700 underline decoration-brand-200 underline-offset-4 transition-colors hover:decoration-brand-600"
              >
                Markab qanday ishlaydi?
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </p>

            <dl className="mt-10 grid max-w-lg grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-400">Muddat</dt>
                <dd className="mt-1 text-sm font-semibold text-ink-900">2 oydan 36 oygacha</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-400">Shartnoma</dt>
                <dd className="mt-1 text-sm font-semibold text-ink-900">Taqsit yoki murabaha</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-400">Ofis</dt>
                <dd className="mt-1 text-sm font-semibold text-ink-900">Toshkent, Yunusobod</dd>
              </div>
            </dl>
          </div>

          {/* Composition: real catalogue data — never stock imagery. */}
          <div className="relative pb-2 sm:pb-10">
            <div className="relative overflow-hidden rounded-2xl border border-line bg-ink-900 shadow-lift">
              {image ? (
                <div className="relative aspect-[4/3] sm:aspect-[16/11]">
                  <Image
                    src={image}
                    alt={vehicle ? vehicle.title : 'Markab katalogidagi avtomobil'}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 46vw"
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/25 to-transparent"
                    aria-hidden="true"
                  />

                  {vehicle ? (
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                      <p className="text-xs uppercase tracking-[0.12em] text-white/60">
                        {vehicle.year} · {vehicle.location}
                      </p>
                      <p className="mt-1.5 truncate text-lg font-semibold text-white sm:text-xl">
                        {vehicle.title}
                      </p>
                      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-base font-semibold text-white sm:text-lg">
                          {formatUzs(vehicle.priceUzs)}
                        </span>
                        {vehicle.financing.monthlyPaymentUzs ? (
                          <span className="text-sm text-brand-200">
                            {formatUzs(vehicle.financing.monthlyPaymentUzs)} / oy
                          </span>
                        ) : (
                          <span className="text-sm text-white/60">
                            Oylik to‘lov: hisob-kitob tayyorlanmoqda
                          </span>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center text-sm text-white/60 sm:aspect-[16/11]">
                  Ma’lumot tayyorlanmoqda
                </div>
              )}
            </div>

            {/* Financing card — floating on tablet and up, inline on mobile. */}
            {vehicle ? (
              <div className="mt-3 sm:absolute sm:-bottom-4 sm:left-6 sm:mt-0 sm:w-[19rem]">
                <div className="rounded-xl border border-line bg-surface p-4 shadow-lift">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
                    Muddatli to‘lov
                  </p>
                  <dl className="mt-3 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-sm text-ink-500">Boshlang‘ich to‘lov</dt>
                      <dd className="text-sm font-medium text-ink-900">
                        {vehicle.financing.initialPaymentUzs ? (
                          formatUzs(vehicle.financing.initialPaymentUzs)
                        ) : (
                          <PendingValue />
                        )}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-sm text-ink-500">Muddat</dt>
                      <dd className="text-sm font-medium text-ink-900">
                        {vehicle.financing.termMonths ? (
                          `${vehicle.financing.termMonths} oy`
                        ) : (
                          <PendingValue />
                        )}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t border-line pt-2">
                      <dt className="text-sm text-ink-500">Oylik to‘lov</dt>
                      <dd className="text-sm font-semibold text-brand-700">
                        {vehicle.financing.monthlyPaymentUzs ? (
                          formatUzs(vehicle.financing.monthlyPaymentUzs)
                        ) : (
                          <PendingValue label="Hisob-kitob tayyorlanmoqda" />
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            ) : null}

            {product ? (
              <div className="absolute -right-1 top-4 hidden w-44 rounded-xl border border-line bg-surface/95 p-3 shadow-lift backdrop-blur lg:block">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-sunken">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-ink-900">{product.name}</p>
                    <p className="mt-0.5 text-xs text-ink-500">Elektronika</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <p className="mt-10 text-xs text-ink-400">
          Ko‘rsatilgan e’lonlar markab.uz ochiq sahifalaridan olingan namuna ma’lumotlari.
        </p>
      </Container>
    </section>
  );
}
