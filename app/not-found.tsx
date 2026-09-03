import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Section';
import { primaryNav, site } from '@/lib/site';

/** Rendered per request so Next.js can stamp the CSP nonce on its scripts (C1). */
export const dynamic = 'force-dynamic';


/**
 * Custom 404.
 *
 * Unknown routes never silently render the homepage — this page is returned with
 * a real 404 status code by the App Router.
 */
export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col justify-center py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
          404
        </span>
        <h1 className="mt-4 text-display-sm sm:text-display-md">Bu sahifa topilmadi.</h1>
        <p className="mt-4 text-base leading-relaxed text-ink-500">
          Siz qidirayotgan sahifa mavjud emas yoki ko‘chirilgan bo‘lishi mumkin. Quyidagi
          bo‘limlar yordam berishi mumkin.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/" size="lg">
            Bosh sahifa
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary" size="lg">
            Yordam
          </ButtonLink>
        </div>

        <nav aria-label="Ommabop bo‘limlar" className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
            Ommabop bo‘limlar
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ...primaryNav,
              { href: '/academy', label: 'Academy' },
              { href: '/loyalty', label: 'Bonus dasturi' },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink-700 transition-all duration-200 hover:border-brand-200 hover:bg-brand-50/40 hover:text-brand-800"
                >
                  {item.label}
                  <svg
                    className="h-4 w-4 text-ink-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-10 text-xs leading-relaxed text-ink-400">
          {site.office.address} · {site.office.hours}
        </p>
      </div>
    </Container>
  );
}
