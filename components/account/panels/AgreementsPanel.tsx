import { Badge } from '@/components/ui/Badge';
import { PendingValue } from '@/components/ui/StateBlock';
import { Panel, PendingIntegration, DetailRow } from './Panel';
import type { AccountSnapshot } from '@/lib/account/types';
import { formatUzs } from '@/lib/format';

/**
 * My financing — future active agreements.
 *
 * The only monetary field here is `monthlyPaymentUzs`, and it is rendered
 * exclusively as a value the source published on the agreement. Nothing is
 * derived: no outstanding balance, no total remaining, no paid-so-far figure.
 * A dashboard that computes those would be inventing contract state.
 */
export function AgreementsPanel({
  snapshot,
  demo,
}: {
  snapshot: AccountSnapshot | null;
  demo: boolean;
}) {
  void demo;
  return (
    <Panel
      title="Mening moliyalashtirishim"
      description="Faol shartnomalar shu yerda ko‘rsatiladi. Shartnoma qiymatlari faqat rasmiy manbadan olinadi — hisoblanmaydi."
      action={<Badge tone="pending">Struktura tayyor</Badge>}
    >
      {!snapshot || snapshot.agreements.length === 0 ? (
        <PendingIntegration what="Shartnomalar ro‘yxati rasmiy hisob manbasi ulangach ko‘rsatiladi. Hech qanday qoldiq summa, to‘langan qism yoki jami qarz bu prototipda hisoblanmaydi." />
      ) : (
        <ul className="space-y-3">
          {snapshot.agreements.map((agreement) => (
            <li key={agreement.id} className="rounded-lg border border-line bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900">
                    {agreement.productTitle ?? 'Mahsulot ko‘rsatilmagan'}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">{agreement.reference}</p>
                </div>
                <Badge tone="pending">Namuna</Badge>
              </div>
              <dl className="mt-3">
                <DetailRow label="Shartnoma turi">
                  {agreement.contractType ?? <PendingValue label="Rasmiy ma’lumot kutilmoqda" />}
                </DetailRow>
                <DetailRow label="Oylik to‘lov">
                  {agreement.monthlyPaymentUzs !== null ? (
                    formatUzs(agreement.monthlyPaymentUzs)
                  ) : (
                    <PendingValue label="Rasmiy ma’lumot kutilmoqda" />
                  )}
                </DetailRow>
                <DetailRow label="Muddat">
                  {agreement.termMonths !== null ? (
                    `${agreement.termMonths} oy`
                  ) : (
                    <PendingValue label="Rasmiy ma’lumot kutilmoqda" />
                  )}
                </DetailRow>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
