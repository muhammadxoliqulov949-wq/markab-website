import Link from 'next/link';
import { footerNav, site } from '@/lib/site';
import { legalFlags } from '@/lib/legal';

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface-muted">
      <div className="container-page py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(4,1fr)] lg:gap-10">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M12 2.6l2.2 5.6 6 .5-4.6 3.9 1.4 5.9L12 15.2l-5 3.3 1.4-5.9L3.8 8.7l6-.5L12 2.6z" />
                </svg>
              </span>
              <span className="text-lg font-semibold tracking-[-0.02em] text-ink-900">Markab</span>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-ink-500">
              {site.tagline} Avtomobil va elektronikani muddatli to‘lovga taqdim etuvchi,
              qadriyatlarga asoslangan moliya platformasi.
            </p>

            <dl className="mt-6 space-y-2.5 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-ink-400">Manzil</dt>
                <dd className="mt-1 text-ink-600">{site.office.address}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-ink-400">Ish vaqti</dt>
                <dd className="mt-1 text-ink-600">{site.office.hours}</dd>
              </div>
            </dl>
          </div>

          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">
                {group.title}
              </h2>
              <ul className="mt-5 space-y-3">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex min-h-[24px] items-center py-0.5 text-sm text-ink-600 transition-colors duration-200 hover:text-brand-700"
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
        <div className="mt-14 border-t border-line pt-8">
          <h2 className="text-sm font-semibold text-ink-800">
            Rasmiy tekshiruv kutilayotgan ma’lumotlar
          </h2>
          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-ink-500">
            Quyidagi maydonlar turli manbalarda farqli ko‘rsatilgan. Yagona rasmiy qiymat
            tasdiqlanguncha ular ko‘rsatilmaydi.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {legalFlags.map((flag) => (
              <li
                key={flag.id}
                className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs text-ink-600"
              >
                {flag.field}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-8 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Markab. Kontsept-prototip — markab.uz ochiq ma’lumotlari
            asosida tayyorlangan.
          </p>
          <p className="max-w-md sm:text-right">
            Ushbu prototip moliyaviy, huquqiy yoki investitsiya tavsiyasi emas. Narxlar va shartlar
            rasmiy manba bilan tasdiqlanadi.
          </p>
        </div>
      </div>
    </footer>
  );
}
