import Link from 'next/link';
import { Container } from '@/components/ui/Section';
import { site } from '@/lib/site';

/**
 * Final CTA — one decision, two paths.
 *
 * Restrained by design: no countdown, no pressure language, no invented urgency
 * or invented numbers. Office details are the verified published ones.
 */
export function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="relative overflow-hidden border-t border-white/10 bg-ink-900 py-20 text-white sm:py-24 lg:py-28"
    >
      <div className="vignette pointer-events-none absolute inset-0" aria-hidden="true" />

      <Container className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="final-cta-heading"
            className="text-display-md text-white lg:text-display-lg"
          >
            Markab bilan keyingi qadamingizni boshlang.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65">
            Avtomobil, elektronika, moliyalashtirish yoki sarmoya — istalgan yo‘nalishni tanlang,
            qolganini birga ko‘rib chiqamiz.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/cars"
              className="inline-flex h-[52px] items-center justify-center rounded-xl bg-white px-7 text-[0.9375rem] font-semibold text-ink-900 transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:bg-white/90"
            >
              Avtomobil tanlash
            </Link>
            <Link
              href="/financing"
              className="inline-flex h-[52px] items-center justify-center rounded-xl border border-white/25 px-7 text-[0.9375rem] font-semibold text-white transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/10"
            >
              Moliyalashtirishni ko‘rish
            </Link>
          </div>
        </div>

        <dl className="mx-auto mt-16 grid max-w-3xl gap-6 border-t border-white/10 pt-8 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-white/40">Manzil</dt>
            <dd className="mt-1.5 text-white/75">{site.office.address}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-white/40">Ish vaqti</dt>
            <dd className="mt-1.5 text-white/75">{site.office.hours}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-white/40">Yordam</dt>
            <dd className="mt-1.5">
              <Link
                href="/contact"
                className="text-brand-200 underline underline-offset-4 transition-colors hover:text-white"
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
