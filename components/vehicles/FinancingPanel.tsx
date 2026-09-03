import Link from 'next/link';
import type { Financing } from '@/lib/data/types';
import { formatUzs } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { PendingValue } from '@/components/ui/StateBlock';
import { ButtonLink } from '@/components/ui/Button';

/**
 * Financing block for vehicle / product detail pages.
 *
 * Only publicly published values are rendered. Anything unavailable renders as
 * an explicit pending marker — no value is ever estimated or computed here.
 */
export function FinancingPanel({
  financing,
  priceUzs,
  href = '/financing/calculator',
  applyHref,
}: {
  financing: Financing;
  priceUzs: number;
  href?: string;
  /** Links the panel straight to the application step for this exact item. */
  applyHref?: string;
}) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: 'Narx', value: <span className="font-semibold">{formatUzs(priceUzs)}</span> },
    {
      label: 'Boshlang‘ich to‘lov',
      value: financing.initialPaymentUzs ? (
        formatUzs(financing.initialPaymentUzs)
      ) : (
        <PendingValue />
      ),
    },
    {
      label: 'Muddat',
      value: financing.termMonths ? `${financing.termMonths} oy` : <PendingValue />,
    },
    {
      label: 'Oylik to‘lov',
      value: financing.monthlyPaymentUzs ? (
        <span className="font-semibold text-brand-700">{formatUzs(financing.monthlyPaymentUzs)}</span>
      ) : (
        <PendingValue label="Hisob-kitob ma’lumoti tayyorlanmoqda" />
      ),
    },
    {
      label: 'Shartnoma turi',
      value: financing.contractType ? (
        <Badge tone="brand">{financing.contractType === 'murabaha' ? 'Murabaha' : 'Taqsit'}</Badge>
      ) : (
        <PendingValue />
      ),
    },
  ];

  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-ink-900">Muddatli to‘lov</h2>
          <p className="mt-1 text-sm text-ink-500">
            Shartlar rasmiy tasdiqlangach to‘liq ko‘rsatiladi.
          </p>
        </div>
        <Badge tone="pending">Prototip</Badge>
      </div>

      <dl className="mt-5 divide-y divide-line">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 py-3">
            <dt className="text-sm text-ink-500">{row.label}</dt>
            <dd className="text-right text-sm text-ink-900">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <ButtonLink href={href} fullWidth>
            Hisoblash
          </ButtonLink>
          <ButtonLink href="/financing" variant="secondary" fullWidth>
            Shartlar
          </ButtonLink>
        </div>
        {applyHref ? (
          <ButtonLink href={applyHref} variant="subtle" fullWidth>
            Shu mahsulot uchun ariza yuborish
          </ButtonLink>
        ) : null}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ink-400">
        Ko‘rsatilgan oylik to‘lov (agar mavjud bo‘lsa) markab.uz ochiq e’lonidan olingan.
        Boshlang‘ich to‘lov, muddat va shartnoma turi katalog ulangandan so‘ng
        ko‘rsatiladi.{' '}
        <Link href="/faq" className="text-brand-700 underline underline-offset-2">
          Savol-javoblar
        </Link>
      </p>
    </div>
  );
}
