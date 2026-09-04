import Link from 'next/link';
import { footerNav, site } from '@/lib/site';
import { legalFlags } from '@/lib/legal';
import { MarkabStar, MarkabDivider } from '@/components/ui/MarkabStar';

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-surface-muted">
      {/* Subtle warm wash at top for depth, no neon. */}
      <div
        className="pointer-events-none absolute -top-20 left-1/2 h-40 w-[50rem] -translate-x-1/2 rounded-full bg-brand-50/60 blur-3xl"
        aria-hidden="true"
      />

      {/*
        Below md the mobile tab bar is fixed to the bottom of the viewport, so
        the footer needs its own clearance — #main's padding only protects the
        page content, not the footer that follows it.
      */}
      <div className="container-page relative pb-[calc(3rem+var(--tabbar-h)+env(safe-area-inset-bottom))] pt-16 sm:pb-20 sm:pt-20">
        {/* Wordmark row */}
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-glow"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M12 2.6l2.2 5.6 6 .5-4.6 3.9 1.4 5.9L12 15.2l-5 3.3 1.4-5.9L3.8 8.7l6-.5L12 2.6z" />
              </svg>
            </span>
            <span className="text-[18px] font-semibold tracking-[-0.02em] text-ink-900">
              Markab
            </span>
          </div>
          <p className="text-sm text-ink-500">{site.tagline}</p>
        </div>

        <MarkabDivider className="py-6" />

        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(4,1fr)] lg:gap-10">
          <div className="max-w-sm">
            <p className="text-[15px] leading-relaxed text-ink-700">
              Avtomobil va elektronikani muddatli to‘lovga taqdim etuvchi, qadriyatlarga asoslangan
              moliya platformasi.
            </p>

            <dl className="mt-7 space-y-3 text-sm">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">
                  Manzil
                </dt>
                <dd className="mt-1 text-ink-700">{site.office.address}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">
                  Ish vaqti
                </dt>
                <dd className="mt-1 text-ink-700">{site.office.hours}</dd>
              </div>
            </dl>
          </div>

          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">
                {group.title}
              </h2>
              <ul className="mt-5 space-y-3">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex min-h-[40px] items-center py-1 text-sm text-ink-600 transition-colors hover:text-brand-700 sm:min-h-[28px] sm:py-0.5"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Trust: fields awaiting official verification are visible, not hidden. */}
        <div className="mt-14 rounded-panel border border-line bg-surface p-6 shadow-subtle">
          <div className="flex items-start gap-3">
            <MarkabStar size={18} tone="muted" className="mt-0.5" />
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-ink-900">
                Rasmiy tekshiruv kutilayotgan ma’lumotlar
              </h2>
              <p className="mt-1 max-w-2xl text-caption leading-relaxed text-ink-500">
                Quyidagi maydonlar turli manbalarda farqli ko‘rsatilgan. Yagona rasmiy qiymat
                tasdiqlanguncha ular ko‘rsatilmaydi.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {legalFlags.map((flag) => (
                  <li
                    key={flag.id}
                    className="rounded-pill border border-line bg-surface-muted px-2.5 py-1 text-[11px] text-ink-600"
                  >
                    {flag.field}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-8 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
<<<<<<< HEAD
          <p>© {new Date().getFullYear()} Markab. Barcha huquqlar himoyalangan.</p>
=======
          <p className="flex items-center gap-2">
            <MarkabStar size={10} tone="muted" className="opacity-70" />© {new Date().getFullYear()} Markab. Barcha huquqlar himoyalangan.
          </p>
>>>>>>> 8f654f2 (feat(design): phase 2 premium push — editorial hero, 16px body, refined tokens, 9-section home, upgraded CTAs)
          <p className="max-w-md sm:text-right">
            Narxlar va shartlar oldindan ogohlantirmasdan o‘zgartirilishi mumkin. Moliyaviy xizmatlar litsenziya asosida taqdim etiladi.
          </p>
        </div>
      </div>
    </footer>
  );
}
