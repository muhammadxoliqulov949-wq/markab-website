import Link from 'next/link';
import { Container } from '@/components/ui/Section';
import { InteractivePhone } from '@/components/home/InteractivePhone';
import { site } from '@/lib/site';

/**
 * Store badge — native anchor so clicks always open the store in a new tab.
 * Matches the existing StoreBadge in AppSection but renders a real <a> for
 * the external store URLs (consistent with our external-link convention).
 */
function StoreBadge({
  store,
  href,
  label,
  icon,
}: {
  store: string;
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={href}
      className="inline-flex h-[52px] items-center justify-start gap-3 rounded-xl border border-line bg-surface px-5 text-ink-900 shadow-card transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
    >
      <span className="text-ink-900" aria-hidden="true">
        {icon}
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[10px] font-medium uppercase tracking-wide text-ink-400">
          {label}
        </span>
        <span className="text-[0.95rem] font-semibold text-ink-900">{store}</span>
      </span>
    </a>
  );
}

const BENEFITS = [
  'Tez to‘lov',
  'Push bildirishnomalar',
  'Maxsus takliflar',
  'Bonus ballari',
] as const;

/**
 * App download — premium two-column section with a mouse-reactive 3D phone.
 *
 * PLACEMENT: on the homepage between FAQ and the final contact block
 * (see app/page.tsx). Light background (surface), balanced against the
 * darker DashboardMock shown earlier in AppSection. The phone is the
 * visual centerpiece; the left column is deliberately calm: headline,
 * one line of supporting copy, two store badges, four concise benefits.
 *
 * Store links use the verified public listings from site.apps (no invented
 * URLs). The phone UI is clearly a demo presentation (uses the same visual
 * language as the real app but does not assert real balances/figures —
 * the surrounding text in the section identifies it as app UI).
 */
export function AppDownloadSection() {
  return (
    <section
      aria-labelledby="app-download-heading"
      className="relative overflow-hidden bg-surface section-y"
    >
      {/* Decorative soft wash — stays within Markab emerald palette, no neon */}
      <div
        className="pointer-events-none absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full bg-brand-50/70 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-[24rem] w-[24rem] rounded-full bg-brand-50/40 blur-3xl"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          {/* LEFT: content */}
          <div className="order-2 lg:order-1">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-muted px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
              Mobil ilova
            </p>

            <h2
              id="app-download-heading"
              className="mt-5 text-display-lg text-ink-900 sm:text-display-xl"
            >
              Markab ilovasini yuklab oling
            </h2>

            <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-ink-500">
              To‘lovlar, eslatmalar va maxsus takliflar doimo yoningizda.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <StoreBadge
                store="App Store"
                href={site.apps.appStore}
                label="Download on the"
                icon={
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M16.4 12.7c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.3-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.8-.8-1.4 0-2.8.9-3.5 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7 1.3 0 1.6.7 2.7.7 1.1 0 1.9-1.1 2.6-2.1.8-1.2 1.1-2.3 1.1-2.4-.1 0-2.1-.8-2.1-3.3ZM14.3 5.9c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.7-.9 2.6 1 .1 2-.5 2.5-1.2Z" />
                  </svg>
                }
              />
              <StoreBadge
                store="Google Play"
                href={site.apps.googlePlay}
                label="Get it on"
                icon={
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3.6 2.5c-.3.3-.5.8-.5 1.4v16.2c0 .6.2 1.1.5 1.4l.1.1 9-9v-.2l-9.1-8.9Zm12 6.3L6.9 2.2l8 8 1.3-1.3 1.4.8-2 2 2 2-1.4.8-1.3-1.3-8 8 8.7-6.6 2.4 1.4c.7.4 1.3.2 1.3-.6V3.8c0-.8-.6-1-1.3-.6l-2.4 1.4-.3.1-.2.1Z" />
                  </svg>
                }
              />
            </div>

            <ul className="mt-10 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-ink-700">{benefit}</span>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-xs leading-relaxed text-ink-400">
              Ilova ichidagi ko‘rinish — namuna. To‘lov va bonus qiymatlari misol tariqasida
              keltirilgan.
            </p>

            <div className="mt-4">
              <Link
                href="/contact"
                className="text-sm font-medium text-brand-700 underline-offset-4 transition-colors hover:text-brand-800 hover:underline"
              >
                Savollaringiz bormi? Aloqa bo‘limi →
              </Link>
            </div>
          </div>

          {/* RIGHT: phone */}
          <div className="order-1 lg:order-2">
            <InteractivePhone />
          </div>
        </div>
      </Container>
    </section>
  );
}
