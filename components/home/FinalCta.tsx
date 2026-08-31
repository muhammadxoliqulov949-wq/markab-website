import Link from 'next/link';
import { Container } from '@/components/ui/Section';
import { site } from '@/lib/site';

/**
 * Final CTA — one decision, two paths.
 *
 * The only full-bleed dark band left on the page, and it uses the brand's deep
 * green rather than black: dark-green is the Markab accent, and reserving it
 * for the closing moment is what makes the closing moment land.
 *
 * Restrained by design: no countdown, no pressure language, no invented urgency
 * or invented numbers. Office details are the verified published ones.
 */
export function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="relative overflow-hidden bg-brand-900 py-14 text-white sm:py-16 lg:py-20"
    >
      {/* One soft radial lift, no glow, no colour cast. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(90% 120% at 50% 0%, rgba(255,255,255,0.07), transparent 62%)',
        }}
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="final-cta-heading" className="text-display-md text-white lg:text-display-lg">
            Markab bilan keyingi qadamingizni boshlang.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-white/70 sm:text-base">
            Avtomobil, elektronika, moliyalashtirish yoki sarmoya — istalgan yo‘nalishni tanlang,
            qolganini birga ko‘rib chiqamiz.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/cars"
              className="inline-flex h-[52px] items-center justify-center rounded-xl bg-white px-7 text-[0.9375rem] font-semibold text-brand-900 transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:bg-white/90"
            >
              Avtomobil tanlash
            </Link>
            <Link
              href="/financing"
              className="inline-flex h-[52px] items-center justify-center rounded-xl border border-white/30 px-7 text-[0.9375rem] font-semibold text-white transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/10"
            >
              Moliyalashtirishni ko‘rish
            </Link>
          </div>
        </div>

        <dl className="mx-auto mt-14 grid max-w-3xl gap-6 border-t border-white/15 pt-8 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-white/45">Manzil</dt>
            <dd className="mt-1.5 text-white/75">{site.office.address}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-white/45">Ish vaqti</dt>
            <dd className="mt-1.5 text-white/75">{site.office.hours}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.14em] text-white/45">Yordam</dt>
            <dd className="mt-1.5">
              <Link
                href="/contact"
                className="inline-flex min-h-[24px] items-center text-brand-100 underline underline-offset-4 transition-colors hover:text-white"
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
