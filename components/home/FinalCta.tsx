import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Section';
import { site } from '@/lib/site';
import { MarkabStar, MarkabDivider } from '@/components/ui/MarkabStar';

/**
 * Final CTA — the closing moment. One decision, two paths.
 *
<<<<<<< HEAD
 * Uses the same official Markab green (#00B878) as the app-download band
 * so the closing CTA visually pairs with the other big branded moment on
 * the page, keeping the closing moment confident rather than heavy.
 * White primary button and white-outline secondary button keep contrast
 * crisp on the bright green.
 *
 * Restrained by design: no countdown, no pressure language, no invented
 * urgency or invented numbers. Office details are the verified published
 * ones.
=======
 * Uses the official Markab brand gradient (600 → 800, deep at the bottom for
 * confidence), with:
 *  - large brand star watermark centered low (tone-on-tone, 96px, subtle)
 *  - .brand-radial-glow top highlight
 *  - soft dot-pattern texture (low opacity)
 *  - 48px primary white CTA + secondary outlined
 *  - address/hours/support under a MarkabDivider
>>>>>>> 8f654f2 (feat(design): phase 2 premium push — editorial hero, 16px body, refined tokens, 9-section home, upgraded CTAs)
 */
export function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-heading"
<<<<<<< HEAD
      className="brand-radial-glow relative overflow-hidden bg-gradient-to-b from-brand-600 to-brand-700 text-white section-y"
    >
      {/* Soft tonal green washes — same family, no multicolor, no neon. */}
      <div
        className="pointer-events-none absolute -left-40 -top-20 h-[32rem] w-[32rem] rounded-full bg-brand-300/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-brand-800/35 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20"
=======
      className="brand-radial-glow dot-pattern-dark relative overflow-hidden bg-gradient-to-b from-brand-600 via-brand-700 to-brand-800 text-white section-y"
    >
      {/* Large watermark star — centered bottom, low opacity. */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4 opacity-[0.08]"
        aria-hidden="true"
      >
        <MarkabStar size={220} tone="white" />
      </div>

      {/* Soft tonal green washes */}
      <div
        className="pointer-events-none absolute -left-40 -top-24 h-[36rem] w-[36rem] rounded-full bg-brand-300/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-0 h-[32rem] w-[32rem] rounded-full bg-brand-900/40 blur-3xl"
>>>>>>> 8f654f2 (feat(design): phase 2 premium push — editorial hero, 16px body, refined tokens, 9-section home, upgraded CTAs)
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
<<<<<<< HEAD
          <p className="mx-auto mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-white/85 sm:text-base">
=======
          <p className="mx-auto mt-5 max-w-xl text-lead text-white/80">
>>>>>>> 8f654f2 (feat(design): phase 2 premium push — editorial hero, 16px body, refined tokens, 9-section home, upgraded CTAs)
            Avtomobil, elektronika, moliyalashtirish yoki sarmoya — istalgan yo‘nalishni tanlang,
            qolganini birga ko‘rib chiqamiz.
          </p>

<<<<<<< HEAD
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/cars" variant="onDark" size="lg" className="hover-only:-translate-y-0.5">
              Avtomobil tanlash
            </ButtonLink>
            <ButtonLink href="/financing" variant="onDarkOutline" size="lg" className="hover-only:-translate-y-0.5 backdrop-blur-sm">
=======
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
>>>>>>> 8f654f2 (feat(design): phase 2 premium push — editorial hero, 16px body, refined tokens, 9-section home, upgraded CTAs)
              Moliyalashtirishni ko‘rish
            </ButtonLink>
          </div>
        </div>

<<<<<<< HEAD
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
=======
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
>>>>>>> 8f654f2 (feat(design): phase 2 premium push — editorial hero, 16px body, refined tokens, 9-section home, upgraded CTAs)
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
