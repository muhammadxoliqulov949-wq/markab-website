import Image from 'next/image';
import { ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Container } from '@/components/ui/Section';
import { formatUzs } from '@/lib/format';
import { site } from '@/lib/site';
import type { Product, Vehicle } from '@/lib/data/types';

/**
 * Premium hero.
 *
 * Left: value proposition (verbatim Markab positioning) + the two primary goals.
 * Right: a real product composition built from public listing data — the hero
 * shows the actual catalogue instead of an abstract illustration.
 */
export function Hero({ vehicle, product }: { vehicle: Vehicle | null; product: Product | null }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-surface">
      <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      <Container className="relative py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            <Badge tone="brand" className="mb-5">
              {site.positioning}
            </Badge>

            <h1 className="max-w-xl text-display-sm sm:text-display-md lg:text-display-lg">
              Qadriyatlarga asoslangan xotirjamlik!
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-500 sm:text-lg">
              Markab — avtomobil va elektronikani muddatli to‘lovga taqdim etuvchi,
              qadriyatlarga asoslangan moliya platformasi. Shartlar ochiq, jarayon shaffof.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/cars" size="lg">
                Avtomobillarni ko‘rish
              </ButtonLink>
              <ButtonLink href="/invest" variant="secondary" size="lg">
                Sarmoya imkoniyatlarini ko‘rish
              </ButtonLink>
            </div>

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

          <div className="relative">
            {/* Composition: real catalogue data, not stock imagery. */}
            <div className="relative rounded-2xl border border-line bg-surface p-3 shadow-lift">
              {vehicle ? (
                <div className="overflow-hidden rounded-xl bg-surface-sunken">
                  <div className="relative aspect-[16/10]">
                    {vehicle.images[0] ? (
                      <Image
                        src={vehicle.images[0]}
                        alt={vehicle.title}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 45vw"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-4 bg-white px-5 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-900">{vehicle.title}</p>
                      <p className="mt-0.5 text-xs text-ink-500">{vehicle.year} · Toshkent</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink-900">
                        {formatUzs(vehicle.priceUzs)}
                      </p>
                      {vehicle.financing.monthlyPaymentUzs ? (
                        <p className="mt-0.5 text-xs text-brand-700">
                          {formatUzs(vehicle.financing.monthlyPaymentUzs)} / oy
                        </p>
                      ) : (
                        <p className="mt-0.5 text-xs text-ink-400">Hisob-kitob tayyorlanmoqda</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center rounded-xl bg-surface-muted text-sm text-ink-400">
                  Ma’lumot tayyorlanmoqda
                </div>
              )}

              {product ? (
                <div className="absolute -bottom-6 -left-2 hidden w-52 rounded-xl border border-line bg-white p-3 shadow-lift sm:block">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-sunken">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-ink-900">{product.name}</p>
                      <p className="mt-0.5 text-xs text-brand-700">
                        {product.financing.monthlyPaymentUzs
                          ? `${formatUzs(product.financing.monthlyPaymentUzs)} / oy`
                          : 'Hisob-kitob tayyorlanmoqda'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <p className="mt-8 text-xs text-ink-400">
              Ko‘rsatilgan e’lonlar markab.uz ochiq sahifalaridan olingan namuna ma’lumotlari.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
