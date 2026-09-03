import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { PendingValue } from '@/components/ui/StateBlock';
import { Panel, DetailRow, PendingIntegration } from './Panel';
import type { AccountSnapshot } from '@/lib/account/types';
import type { SavedItem } from '@/lib/account/types';

/**
 * Overview — the account area, quick actions and account status.
 *
 * There is deliberately no "Xush kelibsiz, <name>" greeting: the prototype has
 * no customer, and a greeting addressed to nobody is the fastest way to make a
 * demo dashboard read as a real one. The account area states its own status
 * instead.
 */
export function OverviewPanel({
  snapshot,
  saved,
  demo,
  hasAccountBackend,
}: {
  snapshot: AccountSnapshot | null;
  saved: SavedItem[];
  demo: boolean;
  hasAccountBackend: boolean;
}) {
  const quickActions = [
    { href: '/financing/apply', label: 'Ariza yuborish', hint: 'Moliyalashtirish arizasi' },
    { href: '/financing/calculator', label: 'Kalkulyator', hint: 'To‘lov parametrlari' },
    { href: '/cars', label: 'Avtomobillar', hint: 'Katalog' },
    { href: '/electronics', label: 'Elektronika', hint: 'Katalog' },
  ];

  return (
    <div className="space-y-4">
      <Panel
        title="Hisob holati"
        description="Bu bo‘lim real hisob ma’lumotlari ulanganda to‘ldiriladi. Hozircha hech qanday shaxsiy yoki moliyaviy ma’lumot ko‘rsatilmaydi."
        action={
          <Badge tone={hasAccountBackend ? 'brand' : 'pending'}>
            {hasAccountBackend ? 'Ulangan' : 'Integratsiya kutilmoqda'}
          </Badge>
        }
      >
        <dl>
          <DetailRow label="Kirish holati">
            {hasAccountBackend ? 'Faol sessiya' : <PendingValue label="Autentifikatsiya ulanmagan" />}
          </DetailRow>
          <DetailRow label="Shaxsiy ma’lumotlar">
            <PendingValue label="Rasmiy ma’lumot kutilmoqda" />
          </DetailRow>
          <DetailRow label="Arizalar">
            {snapshot ? String(snapshot.applications.length) : <PendingValue />}
          </DetailRow>
          <DetailRow label="Faol shartnomalar">
            {snapshot ? String(snapshot.agreements.length) : <PendingValue />}
          </DetailRow>
          <DetailRow label="Saqlangan mahsulotlar">
            {saved.length > 0 ? (
              <span className="font-medium">{saved.length} ta (shu brauzerda)</span>
            ) : (
              <span>Hozircha yo‘q</span>
            )}
          </DetailRow>
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-ink-400">
          Hech qanday balans, qarz, to‘lov tarixi yoki shaxsiy moliyaviy ko‘rsatkich
          ko‘rsatilmaydi — ular faqat rasmiy hisob manbasidan olinadi.
        </p>
      </Panel>

      <Panel title="Tezkor amallar" description="Kabinet ichidagi asosiy yo‘nalishlar.">
        <ul className="grid gap-2 sm:grid-cols-2">
          {quickActions.map((action) => (
            <li key={action.href}>
              <Link
                href={action.href}
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3 transition-colors hover:border-line-strong hover:bg-surface-muted"
              >
                <span>
                  <span className="block text-sm font-medium text-ink-900">{action.label}</span>
                  <span className="block text-xs text-ink-400">{action.hint}</span>
                </span>
                <svg className="h-4 w-4 shrink-0 text-ink-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>

      {!snapshot && !demo ? (
        <Panel title="Nima kutilmoqda" description="Kabinet real ma’lumot bilan qanday to‘ladi.">
          <PendingIntegration what="Arizalar, shartnomalar, to‘lov jadvali va bildirishnomalar rasmiy hisob manbasi ulangach ko‘rsatiladi. Ular taxminiy qiymat bilan almashtirilmaydi." />
        </Panel>
      ) : null}
    </div>
  );
}
