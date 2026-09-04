import Link from 'next/link';
import { Container } from '@/components/ui/Section';
import { ButtonLink } from '@/components/ui/Button';
import { PendingValue } from '@/components/ui/StateBlock';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { formatUzs } from '@/lib/format';
import { site } from '@/lib/site';
import { MarkabStar } from '@/components/ui/MarkabStar';
import type { Product, Vehicle } from '@/lib/data/types';

/**
 * Hero — editorial two-column composition, premium tier.
 *
 * Left: eyebrow + star, large display headline (clamp 2.5–4rem), lead body at
 * 18px/1.65, two CTAs (primary + secondary), secondary trust micro-line.
 * Right: bounded 4:3 photograph with ring-1 hairline, floating financing card
 * offset left and below (lift shadow, 24px panel radius) with the Markab star
 * as a small punctuation mark.
 *
 * Height is content-driven; two background washes sit behind the left column
 * for editorial depth without being loud.
 */
export function Hero({ vehicle, product }: { vehicle: Vehicle | null; product: Product | null }) {
  const image = vehicle?.images[0] ?? null;

  return (
    <section
      aria-labelledby="hero-heading"
<<<<<<< HEAD
      className="relative overflow-hidden bg-surface pb-16 pt-10 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-20"
=======
      className="relative overflow-hidden bg-surface pt-20 sm:pt-24 lg:pt-28"
>>>>>>> 8f654f2 (feat(design): phase 2 premium push — editorial hero, 16px body, refined tokens, 9-section home, upgraded CTAs)
    >
      {/* Two restrained editorial washes — one warm-brand at top-left, one cool-slate bottom-right. */}
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[42rem] w-[42rem] rounded-full bg-brand-50/80 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-40 h-[36rem] w-[36rem] rounded-full bg-ink-900/[0.03] blur-3xl"
        aria-hidden="true"
      />

<<<<<<< HEAD
      <Container className="relative">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-8 lg:grid-cols-[1.02fr_1fr] lg:gap-14">
          {/* LEFT — content first, in DOM order and in reading order. */}
          <div className="md:max-w-none lg:max-w-xl">
            <p className="animate-rise-1 eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
=======
      <Container className="relative pb-20 sm:pb-28 lg:pb-32">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-10 lg:grid-cols-[1.02fr_1fr] lg:gap-20">
          {/* LEFT — content first, in DOM and reading order. */}
          <div className="md:max-w-none lg:max-w-[34rem]">
            <p className="animate-rise-1 eyebrow">
              <MarkabStar size={12} tone="brand" />
>>>>>>> 8f654f2 (feat(design): phase 2 premium push — editorial hero, 16px body, refined tokens, 9-section home, upgraded CTAs)
              {site.positioning}
            </p>

            <h1
              id="hero-heading"
              className="animate-rise-2 mt-6 text-display-xl text-ink-900 sm:mt-7"
            >
              Moliyaviy qarorlarni&nbsp;
              <span className="relative inline-block">
                <span className="text-brand-600">xotirjam</span>
                <svg
                  className="absolute -bottom-1 left-0 w-full text-brand-500/60"
                  viewBox="0 0 200 10"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 7c30-4 80-4 196-2"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              &nbsp;qabul qiling.
            </h1>

<<<<<<< HEAD
            <p className="animate-rise-3 mt-6 max-w-lg text-body text-ink-600 sm:text-lead">
=======
            <p className="animate-rise-3 mt-6 max-w-xl text-lead text-ink-500 sm:mt-7">
>>>>>>> 8f654f2 (feat(design): phase 2 premium push — editorial hero, 16px body, refined tokens, 9-section home, upgraded CTAs)
              Avtomobil va elektronikani muddatli to‘lov asosida xarid qiling. Shartlar oldindan
              ko‘rinadi, sarmoya yo‘nalishi bilan tanishish mumkin — barchasi bitta ekotizimda.
            </p>

<<<<<<< HEAD
            <div className="animate-rise-4 mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
              <ButtonLink href="/cars" size="lg" className="hover-only:-translate-y-0.5">
=======
            <div className="animate-rise-4 mt-9 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
              <ButtonLink href="/cars" size="xl" className="min-w-[220px] hover-only:-translate-y-0.5">
>>>>>>> 8f654f2 (feat(design): phase 2 premium push — editorial hero, 16px body, refined tokens, 9-section home, upgraded CTAs)
                Avtomobillarni ko‘rish
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </ButtonLink>
<<<<<<< HEAD
              <ButtonLink href="/invest" variant="secondary" size="lg" className="hover-only:-translate-y-0.5">
=======
              <ButtonLink
                href="/invest"
                variant="secondary"
                size="xl"
                className="min-w-[220px] hover-only:-translate-y-0.5"
              >
>>>>>>> 8f654f2 (feat(design): phase 2 premium push — editorial hero, 16px body, refined tokens, 9-section home, upgraded CTAs)
                Sarmoya imkoniyatlari
              </ButtonLink>
            </div>

            {/* Tiny micro-trust line: three small, factual chips, no invented stats. */}
            <ul className="animate-rise-5 mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-400 sm:mt-10">
              <li className="flex items-center gap-2">
                <svg
                  className="h-3.5 w-3.5 text-brand-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
<<<<<<< HEAD
                  strokeWidth="1.7"
=======
                  strokeWidth="2.4"
>>>>>>> 8f654f2 (feat(design): phase 2 premium push — editorial hero, 16px body, refined tokens, 9-section home, upgraded CTAs)
                  aria-hidden="true"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Shartnoma asosida
              </li>
              <li className="flex items-center gap-2">
                <svg
                  className="h-3.5 w-3.5 text-brand-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  aria-hidden="true"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Oldindan ma’lum oylik to‘lov
              </li>
              <li className="flex items-center gap-2">
                <svg
                  className="h-3.5 w-3.5 text-brand-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  aria-hidden="true"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Qadriyatlarga asoslangan
              </li>
            </ul>

            <p className="animate-rise-5 mt-7 text-sm">
              <Link
                href="#qanday-ishlaydi"
                className="group inline-flex min-h-[44px] items-center gap-2 font-medium text-ink-700 underline decoration-ink-200 underline-offset-4 transition-colors hover:text-brand-700 hover:decoration-brand-500"
              >
                Markab qanday ishlaydi?
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-y-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
              </Link>
            </p>
          </div>

          {/* RIGHT — visual column. */}
          <div className="animate-rise-3 lg:pb-16">
            <div className="relative">
              {image ? (
<<<<<<< HEAD
                <div className="relative overflow-hidden rounded-2xl bg-surface-sunken shadow-card-hover ring-1 ring-black/[0.04]">
                  {/*
                    Bounded height below lg so the photograph never becomes the
                    page on a phone; 4:3 on desktop, inside the two-column grid.
                  */}
                  <div className="relative h-[210px] sm:h-[260px] md:aspect-[4/3] md:h-auto">
=======
                <div className="relative overflow-hidden rounded-panel bg-surface-sunken shadow-panel ring-1 ring-black/[0.05]">
                  {/* Tiny navigation star in the top-right corner as an accent. */}
                  <div className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 shadow-subtle ring-1 ring-black/5 backdrop-blur-sm">
                    <MarkabStar size={14} tone="brand" />
                  </div>
                  <div className="relative aspect-[4/3] sm:aspect-[4/3]">
>>>>>>> 8f654f2 (feat(design): phase 2 premium push — editorial hero, 16px body, refined tokens, 9-section home, upgraded CTAs)
                    <RemoteImage
                      src={image}
                      alt={vehicle ? vehicle.title : ''}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 48vw"
                      className="object-cover object-center"
                      fallbackLabel=""
                    />
                    {/* Bottom gradient on the photo so the floating card reads cleanly. */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-panel bg-surface-sunken text-sm text-ink-400">
                  Rasm mavjud emas
                </div>
              )}

              {vehicle ? (
                <div className="mt-5 lg:animate-float lg:absolute lg:-bottom-14 lg:-left-10 lg:mt-0 lg:w-[22rem]">
                  <div className="rounded-panel border border-line bg-surface/95 p-6 shadow-lift backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                      <MarkabStar size={10} tone="brand" />
                      Tanlangan taklif
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-ink-900">
                          {vehicle.title}
                        </p>
                        <p className="mt-0.5 text-caption text-ink-500">
                          {vehicle.year} · {vehicle.location}
                        </p>
                      </div>
                      <p className="shrink-0 text-base font-semibold num text-ink-900">
                        {formatUzs(vehicle.priceUzs)}
                      </p>
                    </div>

                    <dl className="mt-5 space-y-3 border-t border-line pt-5">
                      <div className="hidden items-center justify-between gap-4 lg:flex">
                        <dt className="text-sm text-ink-500">Boshlang‘ich to‘lov</dt>
                        <dd className="text-sm font-medium num text-ink-900">
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
                      <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
                        <dt className="text-sm text-ink-500">Oylik to‘lov</dt>
<<<<<<< HEAD
                        <dd className="text-[0.9375rem] font-semibold text-brand-600">
=======
                        <dd className="text-base font-semibold num text-brand-700">
>>>>>>> 8f654f2 (feat(design): phase 2 premium push — editorial hero, 16px body, refined tokens, 9-section home, upgraded CTAs)
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
                      className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 py-2 text-sm font-medium text-brand-700 underline-offset-4 transition-colors hover:underline"
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
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Container>

      {/* Integrated trust strip inside the hero block — avoids a separate
          heavy strip and keeps the hero as one editorial moment. */}
      <div className="border-t border-line-faint">
        <Container>
          <ul className="grid grid-cols-2 gap-y-6 py-8 sm:grid-cols-4 sm:gap-y-0 sm:py-10">
            {[
              { t: 'Qadriyatli moliya', d: 'Shariat tamoyillariga asoslangan' },
              { t: 'Rasmiy kelishuv', d: 'Shartnoma + oylik hisobdorlik' },
              { t: 'Shaffof shartlar', d: 'Oylik to‘lov oldindan ma’lum' },
              { t: 'Qo‘llab-quvvatlash', d: `${site.office.hours}` },
            ].map((item, i) => (
              <li
                key={item.t}
                className={[
                  'flex items-start gap-3 sm:px-6',
                  i === 0 ? 'sm:pl-0' : 'sm:border-l sm:border-line-faint',
                ].join(' ')}
              >
                <MarkabStar size={16} tone="brand" className="mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink-900">{item.t}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-ink-400">{item.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </div>

      {product ? (
        <p className="sr-only">
          Katalogda elektronika mahsulotlari ham mavjud: {product.name}.
        </p>
      ) : null}
    </section>
  );
}
