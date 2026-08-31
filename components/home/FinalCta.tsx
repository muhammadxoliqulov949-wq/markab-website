import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Section';
import { site } from '@/lib/site';

/**
 * Final CTA — one decision, two paths.
 *
 * Deliberately calm: no countdown, no pressure language, no invented urgency or
 * invented numbers. Office details are the verified published ones.
 */
export function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="bg-ink-900 py-16 text-white sm:py-20 lg:py-24"
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
          <div>
            <h2
              id="final-cta-heading"
              className="max-w-xl text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl lg:text-[2.35rem] lg:leading-[1.1]"
            >
              Markab bilan keyingi qadamingizni boshlang.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/65">
              Avtomobil, elektronika, moliyalashtirish yoki sarmoya — istalgan yo‘nalishni
              tanlang, qolganini birga ko‘rib chiqamiz.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href="/cars"
                size="lg"
                className="bg-white text-ink-900 hover:bg-white/90"
              >
                Avtomobil tanlash
              </ButtonLink>
              <ButtonLink
                href="/financing"
                variant="secondary"
                size="lg"
                className="border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/5"
              >
                Moliyalashtirishni ko‘rish
              </ButtonLink>
            </div>
          </div>

          <dl className="grid gap-6 border-t border-white/10 pt-6 text-sm sm:grid-cols-2 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <div>
              <dt className="text-xs uppercase tracking-wide text-white/45">Manzil</dt>
              <dd className="mt-1.5 text-white/80">{site.office.address}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-white/45">Ish vaqti</dt>
              <dd className="mt-1.5 text-white/80">{site.office.hours}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-white/45">Boshlash</dt>
              <dd className="mt-1.5 text-white/80">
                Avtomobil va elektronika katalogi, muddatli to‘lov shartlari, sarmoya modeli.
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-white/45">Yordam</dt>
              <dd className="mt-1.5">
                <a
                  href="/contact"
                  className="text-brand-200 underline underline-offset-4 transition-colors hover:text-white"
                >
                  Biz bilan bog‘lanish
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </Container>
    </section>
  );
}
