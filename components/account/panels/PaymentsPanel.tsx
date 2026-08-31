import { Badge } from '@/components/ui/Badge';
import { PendingValue } from '@/components/ui/StateBlock';
import { Panel, PendingIntegration } from './Panel';
import type { AccountSnapshot } from '@/lib/account/types';

/**
 * Payments — schedule structure, no figures.
 *
 * Every amount in the demo schedule is null and renders as a pending marker.
 * That is a deliberate choice: an example instalment in a real-looking table is
 * indistinguishable from a real one, and this dashboard has no business
 * printing a number nobody authorised.
 */
export function PaymentsPanel({
  snapshot,
  demo,
}: {
  snapshot: AccountSnapshot | null;
  demo: boolean;
}) {
  void demo;
  return (
    <Panel
      title="To‘lovlar"
      description="To‘lov jadvali va tarixi shu yerda ko‘rsatiladi. Jadval tuzilishi tayyor, qiymatlar esa rasmiy manbadan keladi."
      action={<Badge tone="pending">Qiymatlar kutilmoqda</Badge>}
    >
      {!snapshot || snapshot.payments.length === 0 ? (
        <PendingIntegration what="To‘lov jadvali rasmiy hisob manbasi ulangach ko‘rsatiladi. Hech qanday summa, sana yoki qoldiq hisoblanmaydi." />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-line">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">To‘lov jadvali (namuna tuzilma)</caption>
              <thead className="bg-surface-muted text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">№</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Sana</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Summa</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {snapshot.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3 text-ink-900">{payment.sequence}</td>
                    <td className="px-4 py-3">
                      {payment.dueDate ?? <PendingValue label="Rasmiy ma’lumot kutilmoqda" />}
                    </td>
                    <td className="px-4 py-3">
                      {payment.amountUzs !== null ? (
                        payment.amountUzs
                      ) : (
                        <PendingValue label="Rasmiy ma’lumot kutilmoqda" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-500">
                      {payment.status === 'pending_data' ? 'Ma’lumot kutilmoqda' : payment.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-400">
            Namuna jadval atayin summasiz ko‘rsatilgan: misol summa real to‘lovdan farq
            qilmaydi.
          </p>
        </>
      )}
    </Panel>
  );
}
