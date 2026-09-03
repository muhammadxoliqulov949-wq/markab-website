import Link from 'next/link';
import { Container } from '@/components/ui/Section';
import { site } from '@/lib/site';

/**
 * Final CTA — one decision, two paths.
 *
 * Uses the same official Markab green (#00B878) as the app-download band
 * so the closing CTA visually pairs with the other big branded moment on
 * the page, keeping the closing moment confident rather than heavy.
 * White primary button and white-outline secondary button keep contrast
 * crisp on the bright green.
 *
 * Restrained by design: no countdown, no pressure language, no invented
 * urgency or invented numbers. Office details are the verified published
 * ones.
 */
export function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="relative overflow-hidden bg-brand-500 py-14 text-white sm:py-16 lg:py-20"
    >
      {/* Soft tonal green washes — same family, no multicolor, no neon. */}
      <div
        className="pointer-events-none absolute -left-40 -top-20 h-[28rem] w-[28rem] rounded-full bg-brand-400/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-[24rem] w-[24rem] rounded-full bg-brand-600/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="final-cta-heading" className="text-display-md text-white lg:text-display-lg">
            Markab bilan keyingi qadamingizni boshlang.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-white/85 sm:text-base">
            Avtomobil, elektronika, moliyalashtirish yoki sarmoya — istalgan yo‘nalishni tanlang,
            qolganini birga ko‘rib chiqamiz.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/cars"
              className="inline-flex h-[52px] items-center justify-center rounded-xl bg-black px-7 text-[0.9375rem] font-semibold text-white shadow-lg shadow-black/20 transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:bg-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-500"
            >
              Avtomobil tanlash
            </Link>
            <Link
              href="/financing"
              className="inline-flex h-[52px] items-center justify-center rounded-xl border border-white/35 bg-white/5 px-7 text-[0.9375rem] font-semibold text-white backdrop-blur-sm transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/10"
            >
              Moliyalashtirishni ko‘rish
            </Link>
          </div>
        </div>

        <dl className="mx-auto mt-14 grid max-w-3xl gap-6 border-t border-white/20 pt-8 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-white/70">Manzil</dt>
            <dd className="mt-1.5 text-white/90">{site.office.address}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-white/70">Ish vaqti</dt>
            <dd className="mt-1.5 text-white/90">{site.office.hours}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-white/70">Yordam</dt>
            <dd className="mt-1.5">
              <Link
                href="/contact"
                className="inline-flex min-h-[24px] items-center text-white underline-offset-4 transition-colors hover:text-accent-500"
              >
                Biz bilan bog‘lanish
              </Link>
            </dd>
          </div>
        </dl>
      </Container>
    </section>
  );
}
