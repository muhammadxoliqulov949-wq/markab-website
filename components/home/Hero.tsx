import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Section';
import { PendingValue } from '@/components/ui/StateBlock';
import { formatUzs } from '@/lib/format';
import { site } from '@/lib/site';
import type { Product, Vehicle } from '@/lib/data/types';

/**
 * Premium hero — the visual centrepiece.
 *
 * Composition: a verified vehicle photograph bleeding off the right edge and
 * dissolved into the ink background with a scrim; editorial headline over it;
 * one compact financing card carrying ONLY published values.
 *
 * Nothing here is computed. If the source does not publish a monthly payment,
 * the card says so instead of showing a number.
 */
export function Hero({ vehicle, product }: { vehicle: Vehicle | null; product: Product | null }) {
  const image = vehicle?.images[0] ?? null;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate bg-ink-900 text-white"
    >
      {/* Layered background: photography → scrim → subtle grid. */}
      {image ? (
        <div className="absolute inset-y-0 right-0 hidden w-[60%] overflow-hidden lg:block" aria-hidden="true">
          <Image src={image} alt="" fill priority sizes="60vw" className="object-cover object-center" />
          <div className="hero-scrim-x absolute inset-0" />
          <div className="hero-scrim-y absolute inset-0" />
        </div>
      ) : null}
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />

      <Container className="relative">
        <div className="grid min-h-[80vh] items-center gap-10 py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:py-20">
          {/* Left: what Markab is, and the two primary goals. */}
          <div className="max-w-2xl">
            <p className="animate-rise-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-300">
              {site.positioning}
            </p>

            <h1 id="hero-heading" className="animate-rise-2 mt-5 text-display-xl text-white sm:mt-6">
              Qadriyatlarga asoslangan zamonaviy moliyaviy ekotizim
            </h1>

            <p className="animate-rise-3 mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Markab orqali avtomobil va elektronikani muddatli to‘lov asosida xarid qilish,
              moliyalashtirish shartlari bilan tanishish va sarmoya imkoniyatlarini o‘rganish
              mumkin — barchasi bitta ekotizimda, ochiq shartlar bilan.
            </p>

            <div className="animate-rise-4 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/cars"
                className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-white px-7 text-[0.9375rem] font-semibold text-ink-900 transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
              >
                Avtomobillarni ko‘rish
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/invest"
                className="inline-flex h-[52px] items-center justify-center rounded-xl border border-white/25 px-7 text-[0.9375rem] font-semibold text-white transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                Sarmoya imkoniyatlari
              </Link>
            </div>

            <p className="animate-rise-5 mt-6 text-sm">
              <Link
                href="#qanday-ishlaydi"
                className="inline-flex items-center gap-2 text-white/60 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white hover:decoration-white/60"
              >
                Markab qanday ishlaydi?
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </p>

            <dl className="animate-rise-5 mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {[
                { label: 'Muddat', value: '2 oydan 36 oygacha' },
                { label: 'Shartnoma', value: 'Taqsit yoki murabaha' },
                { label: 'Ofis', value: 'Toshkent, Yunusobod' },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-white/40">{item.label}</dt>
                  <dd className="mt-1.5 text-sm font-semibold text-white/90">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/*
            Right column: the photograph on mobile (in flow), the financing card on
            desktop (bottom-aligned over the bleeding photograph).
          */}
          <div className="lg:flex lg:h-full lg:flex-col lg:justify-end lg:pb-4">
            {image ? (
              <div className="relative overflow-hidden rounded-2xl border border-white/10 lg:hidden">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={image}
                    alt={vehicle ? vehicle.title : ''}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                  />
                  <div className="hero-scrim-y absolute inset-0" aria-hidden="true" />
                </div>
              </div>
            ) : null}

            {vehicle ? (
              <div className="animate-rise-5 mt-5 lg:mt-0 lg:w-[22rem] lg:self-end">
                <div className="rounded-2xl border border-line bg-surface p-5 shadow-lift">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-900">{vehicle.title}</p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {vehicle.year} · {vehicle.location}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-ink-900">
                      {formatUzs(vehicle.priceUzs)}
                    </p>
                  </div>

                  <dl className="mt-4 space-y-2.5 border-t border-line pt-4">
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
                    <div className="flex items-center justify-between gap-4 border-t border-line pt-2.5">
                      <dt className="text-sm text-ink-500">Oylik to‘lov</dt>
                      <dd className="text-[0.9375rem] font-semibold text-brand-700">
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
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 underline-offset-4 transition-colors hover:underline"
                  >
                    E’lonni ochish
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Container>

      {product ? (
        <p className="sr-only">Katalogda elektronika mahsulotlari ham mavjud: {product.name}.</p>
      ) : null}
    </section>
  );
}
