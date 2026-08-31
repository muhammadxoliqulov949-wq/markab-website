import Image from 'next/image';
import Link from 'next/link';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { homepageGoals } from '@/lib/site';

/**
 * "Sizga nima kerak?" — four major navigation choices, not four feature cards.
 *
 * The two catalogue goals are backed by real catalogue photography from the
 * adapter; the two service goals use typographic cards with line art, so the
 * grid reads as a designed composition rather than a repeated card pattern.
 */
export function GoalChooser({
  vehicleImage,
  productImage,
}: {
  vehicleImage: string | null;
  productImage: string | null;
}) {
  const [car, electronics, financing, invest] = homepageGoals;

  return (
    <section
      aria-labelledby="goals-heading"
      className="bg-surface-muted py-20 sm:py-24 lg:py-28"
    >
      <Container>
        <SectionHeading
          id="goals-heading"
          eyebrow="Yo‘nalish tanlang"
          title="Sizga nima kerak?"
          description="To‘rtta asosiy yo‘nalish — har biri aniq keyingi qadam bilan."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {/* Avtomobil — photography-led */}
          <Reveal>
            <Link
              href={car.href}
              className="group relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-2xl bg-ink-900 p-7 transition-transform duration-500 ease-smooth hover:-translate-y-1 lg:min-h-[340px]"
            >
              {vehicleImage ? (
                <>
                  <Image
                    src={vehicleImage}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover opacity-80 transition-transform duration-[900ms] ease-smooth group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/70 to-ink-900/10" aria-hidden="true" />
                </>
              ) : null}

              <div className="relative">
                <h3 className="text-2xl font-semibold text-white sm:text-3xl">{car.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/70">
                  {car.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
                  {car.cta}
                  <svg
                    className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </Link>
          </Reveal>

          {/* Elektronika — photography-led */}
          <Reveal delay={70}>
            <Link
              href={electronics.href}
              className="group relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-2xl bg-ink-900 p-7 transition-transform duration-500 ease-smooth hover:-translate-y-1 lg:min-h-[340px]"
            >
              {productImage ? (
                <>
                  <Image
                    src={productImage}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover opacity-80 transition-transform duration-[900ms] ease-smooth group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/70 to-ink-900/10" aria-hidden="true" />
                </>
              ) : null}

              <div className="relative">
                <h3 className="text-2xl font-semibold text-white sm:text-3xl">
                  {electronics.title}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/70">
                  {electronics.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
                  {electronics.cta}
                  <svg
                    className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </Link>
          </Reveal>

          {/* Moliyalashtirish — typographic */}
          <Reveal delay={140}>
            <Link
              href={financing.href}
              className="group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-7 transition-all duration-500 ease-smooth hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover"
            >
              <svg
                className="h-24 w-auto self-end text-surface-sunken transition-colors duration-500 group-hover:text-brand-50"
                viewBox="0 0 96 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                aria-hidden="true"
              >
                <rect x="1" y="1" width="94" height="62" rx="8" />
                <path d="M14 20h30M14 30h20M14 40h14M60 20v24M54 32h12" strokeLinecap="round" />
              </svg>

              <div>
                <h3 className="text-2xl font-semibold text-ink-900">{financing.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-500">
                  {financing.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
                  {financing.cta}
                  <svg
                    className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </Link>
          </Reveal>

          {/* Sarmoya — typographic */}
          <Reveal delay={210}>
            <Link
              href={invest.href}
              className="group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-7 transition-all duration-500 ease-smooth hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover"
            >
              <svg
                className="h-24 w-auto self-end text-surface-sunken transition-colors duration-500 group-hover:text-brand-50"
                viewBox="0 0 96 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                aria-hidden="true"
              >
                <path d="M6 6v52h84" strokeLinecap="round" />
                <path d="M14 46l18-16 14 10 22-26" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M62 18h10v10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              <div>
                <h3 className="text-2xl font-semibold text-ink-900">{invest.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-500">
                  {invest.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
                  {invest.cta}
                  <svg
                    className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </Link>
          </Reveal>
        </div>

        <p className="mt-8 text-sm text-ink-500">
          O‘rganishni xohlaysizmi?{' '}
          <Link
            href="/academy"
            className="font-medium text-brand-700 underline underline-offset-4 transition-colors hover:text-brand-800"
          >
            Markab Academy
          </Link>
        </p>
      </Container>
    </section>
  );
}
