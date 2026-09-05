import Link from 'next/link';
import { Panel } from './Panel';
import { site } from '@/lib/site';
import { PendingValue } from '@/components/ui/StateBlock';

/**
 * Support — fast access to real, existing routes.
 *
 * Everything here links to a page that exists today, so this is the one panel
 * that is fully live rather than pending. Phone and email render as pending
 * because the published values conflict (see docs/LEGAL-TRUST-REGISTER.md);
 * inventing one would be worse than showing nothing.
 */
export function SupportPanel() {
  const links = [
    { href: '/contact', label: 'Aloqa formasi', hint: 'Savol yuborish' },
    { href: '/faq', label: 'Savol-javoblar', hint: 'Ko‘p so‘raladigan holatlar' },
    { href: '/financing', label: 'Moliyalashtirish shartlari', hint: 'Nima aniq, nima emas' },
    { href: '/invest', label: 'Sarmoya', hint: 'Model va kutilayotgan ma’lumotlar' },
  ];

  return (
    <Panel
      title="Yordam"
      description="Markab bilan bog‘lanish va tez-tez kerak bo‘ladigan bo‘limlar."
    >
      <ul className="grid gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3 transition-colors hover:border-line-strong hover:bg-surface-muted"
            >
              <span>
                <span className="block text-sm font-medium text-ink-900">{link.label}</span>
                <span className="block text-xs text-ink-400">{link.hint}</span>
              </span>
              <svg className="h-4 w-4 shrink-0 text-ink-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>

      <dl className="mt-5 border-t border-line pt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
          <dt className="text-sm text-ink-500">Ofis manzili</dt>
          <dd className="text-sm text-ink-900 sm:text-right">{site.office.address}</dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
          <dt className="text-sm text-ink-500">Ish vaqti</dt>
          <dd className="text-sm text-ink-900 sm:text-right">{site.office.hours}</dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
          <dt className="text-sm text-ink-500">Telefon</dt>
          <dd className="sm:text-right">
            {site.contacts.phone ?? <PendingValue label="saytda e’lon qilinmagan" />}
          </dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
          <dt className="text-sm text-ink-500">Email</dt>
          <dd className="sm:text-right">
            {site.contacts.email ?? <PendingValue label="saytda e’lon qilinmagan" />}
          </dd>
        </div>
      </dl>
    </Panel>
  );
}
