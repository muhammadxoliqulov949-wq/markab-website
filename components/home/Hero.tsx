import Link from 'next/link';
import { Container } from '@/components/ui/Section';
import { ButtonLink } from '@/components/ui/Button';
import { PendingValue } from '@/components/ui/StateBlock';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { formatUzs } from '@/lib/format';
import { site } from '@/lib/site';
import type { Product, Vehicle } from '@/lib/data/types';

/**
 * Hero — an editorial two-column composition, not a full-screen photograph.
 *
 * Left: what Markab is and what to do next.
 * Right: the vehicle visual at a controlled 4:3 ratio, with a compact
 * financing card that overlaps its lower edge on desktop.
 *
 * Desktop height is bounded (content-driven, ≈560–640px) — the photograph is a
 * supporting column, never the page.
 *
 * Nothing here is computed. If the source does not publish a monthly payment,
 * the card says so instead of showing a number.
 */
export function Hero({ vehicle, product }: { vehicle: Vehicle | null; product: Product | null }) {
  const image = vehicle?.images[0] ?? null;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-surface pb-16 pt-10 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-20"
    >
      {/* Restrained wash: one soft brand tint behind the visual column. */}
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-brand-50/70 blur-3xl"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-8 lg:grid-cols-[1.02fr_1fr] lg:gap-14">
          {/* LEFT — content first, in DOM order and in reading order. */}
          <div className="md:max-w-none lg:max-w-xl">
            <p className="animate-rise-1 eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
              {site.positioning}
            </p>

            <h1 id="hero-heading" className="animate-rise-2 mt-5 text-display-xl text-ink-900">
              Qadriyatlarga asoslangan zamonaviy moliyaviy ekotizim
            </h1>

            <p className="animate-rise-3 mt-6 max-w-lg text-body text-ink-600 sm:text-lead">
              Avtomobil va elektronikani muddatli to‘lov asosida xarid qiling. Shartlar oldindan
              ko‘rinadi, sarmoya yo‘nalishi bilan tanishish mumkin — barchasi bitta ekotizimda.
            </p>

            <div className="animate-rise-4 mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
              <ButtonLink href="/cars" size="lg" className="hover-only:-translate-y-0.5">
                Avtomobillarni ko‘rish
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </ButtonLink>
              <ButtonLink href="/invest" variant="secondary" size="lg" className="hover-only:-translate-y-0.5">
                Sarmoya imkoniyatlari
              </ButtonLink>
            </div>

            <p className="animate-rise-5 mt-5 text-sm">
              <Link
                href="#qanday-ishlaydi"
                className="inline-flex min-h-[40px] items-center gap-2 py-1.5 font-medium text-brand-700 underline decoration-brand-200 underline-offset-4 transition-colors hover:text-brand-800 hover:decoration-brand-500"
              >
                Markab qanday ishlaydi?
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </p>
          </div>

          {/* RIGHT — the visual column. */}
          <div className="animate-rise-3 lg:pb-10">
            <div className="relative">
              {image ? (
                <div className="relative overflow-hidden rounded-2xl bg-surface-sunken shadow-card-hover ring-1 ring-black/[0.04]">
                  {/*
                    Bounded height below lg so the photograph never becomes the
                    page on a phone; 4:3 on desktop, inside the two-column grid.
                  */}
                  <div className="relative h-[210px] sm:h-[260px] md:aspect-[4/3] md:h-auto">
                    <RemoteImage
                      src={image}
                      alt={vehicle ? vehicle.title : ''}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 48vw"
                      className="object-cover object-center"
                      fallbackLabel=""
                    />
                  </div>
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-surface-sunken text-sm text-ink-400">
                  Rasm mavjud emas
                </div>
              )}

              {vehicle ? (
                <div className="mt-4 lg:absolute lg:-bottom-10 lg:-left-8 lg:mt-0 lg:w-[21.5rem]">
                  <div className="rounded-2xl border border-line bg-surface p-5 shadow-lift">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink-900">
                          {vehicle.title}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-500">
                          {vehicle.year} · {vehicle.location}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-ink-900">
                        {formatUzs(vehicle.priceUzs)}
                      </p>
                    </div>

                    <dl className="mt-4 space-y-2.5 border-t border-line pt-4">
                      <div className="hidden items-center justify-between gap-4 lg:flex">
                        <dt className="text-sm text-ink-500">Boshlang‘ich to‘lov</dt>
                        <dd className="text-sm font-medium text-ink-900">
                          {vehicle.financing.initialPaymentUzs ? (
                            formatUzs(vehicle.financing.initialPaymentUzs)
                          ) : (
                            <PendingValue />
                          )}
                        </dd>
                      </div>
                      <div className="hidden items-center justify-between gap-4 lg:flex">
                        <dt className="text-sm text-ink-500">Muddat</dt>
                        <dd className="text-sm font-medium text-ink-900">
                          {vehicle.financing.termMonths ? (
                            `${vehicle.financing.termMonths} oy`
                          ) : (
                            <PendingValue />
                          )}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4 border-t border-line pt-2.5">
                        <dt className="text-sm text-ink-500">Oylik to‘lov</dt>
                        <dd className="text-[0.9375rem] font-semibold text-brand-600">
                          {vehicle.financing.monthlyPaymentUzs ? (
                            formatUzs(vehicle.financing.monthlyPaymentUzs)
                          ) : (
                            <PendingValue label="Hisob-kitob tayyorlanmoqda" />
                          )}
                        </dd>
                      </div>
                    </dl>

                    <Link
                      href={`/cars/${vehicle.slug}`}
                      className="mt-4 inline-flex min-h-[40px] items-center gap-1.5 py-1.5 text-sm font-medium text-brand-700 underline-offset-4 transition-colors hover:underline"
                    >
                      E’lonni ochish
                      <svg
                        className="h-4 w-4"
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
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Container>

      {product ? (
        <p className="sr-only">
          Katalogda elektronika mahsulotlari ham mavjud: {product.name}.
        </p>
      ) : null}
    </section>
  );
}
