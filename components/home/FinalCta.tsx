import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Section';
import { site } from '@/lib/site';
import { MarkabStar, MarkabDivider } from '@/components/ui/MarkabStar';

/**
 * Final CTA — the closing moment. One decision, two paths.
 *
 * Uses the official Markab brand gradient (600 → 800, deep at the bottom for
 * confidence), with:
 *  - large brand star watermark centered low (tone-on-tone, 96px, subtle)
 *  - .brand-radial-glow top highlight
 *  - soft dot-pattern texture (low opacity)
 *  - 48px primary white CTA + secondary outlined
 *  - address/hours/support under a MarkabDivider
 */
export function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="brand-radial-glow relative overflow-hidden bg-gradient-to-b from-brand-600 to-brand-800 text-white section-y"
    >
      {/* One soft top light, one deep bottom green — no dots, no giant star. */}
      <div
        className="pointer-events-none absolute -left-32 -top-24 h-[32rem] w-[32rem] rounded-full bg-white/[0.08] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-brand-900/50 blur-3xl"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow-on-dark">
            <MarkabStar size={10} tone="white" />
            Keyingi qadam
          </p>
          <h2 id="final-cta-heading" className="mt-5 text-display-lg text-white sm:mt-6">
            Markab bilan keyingi qadamingizni boshlang.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lead text-white/80">
            Avtomobil, elektronika, moliyalashtirish yoki sarmoya — istalgan yo‘nalishni tanlang,
            qolganini birga ko‘rib chiqamiz.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:mt-12 sm:flex-row">
            <ButtonLink
              href="/cars"
              variant="onDark"
              size="xl"
              className="min-w-[220px] hover-only:-translate-y-0.5"
            >
              Avtomobil tanlash
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
            <ButtonLink
              href="/financing"
              variant="onDarkOutline"
              size="xl"
              className="min-w-[240px] hover-only:-translate-y-0.5"
            >
              Moliyalashtirishni ko‘rish
            </ButtonLink>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <MarkabDivider />
        </div>

        <dl className="mx-auto mt-10 grid max-w-3xl gap-6 text-center sm:grid-cols-3 sm:text-left">
          <div className="sm:border-r sm:border-white/15 sm:pr-6">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Manzil
            </dt>
            <dd className="mt-2 text-[15px] leading-relaxed text-white/90">
              {site.office.address}
            </dd>
          </div>
          <div className="sm:border-r sm:border-white/15 sm:px-6">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Ish vaqti
            </dt>
            <dd className="mt-2 text-[15px] leading-relaxed text-white/90">{site.office.hours}</dd>
          </div>
          <div className="sm:pl-6">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Yordam
            </dt>
            <dd className="mt-2">
              <Link
                href="/contact"
                className="inline-flex min-h-[44px] items-center text-[15px] font-medium text-white underline-offset-4 transition-colors hover:text-accent-500 hover:underline"
              >
                Biz bilan bog‘lanish →
              </Link>
            </dd>
          </div>
        </dl>
      </Container>
    </section>
  );
}
