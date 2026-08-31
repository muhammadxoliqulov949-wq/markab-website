import { Badge } from '@/components/ui/Badge';
import { Panel, PendingIntegration } from './Panel';
import type { AccountSnapshot } from '@/lib/account/types';

/**
 * Notifications.
 *
 * Demo rows are prefixed "Namuna bildirishnoma" so a sample alert can never be
 * read as a real message about a real account. There is no unread counter
 * badge on the tab, because counting imaginary unread messages is the sort of
 * meaningless statistic this dashboard is meant to avoid.
 */
export function NotificationsPanel({
  snapshot,
  demo,
}: {
  snapshot: AccountSnapshot | null;
  demo: boolean;
}) {
  void demo;
  return (
    <Panel
      title="Bildirishnomalar"
      description="Hisob bilan bog‘liq xabarlar shu yerda ko‘rsatiladi: ariza holati, to‘lov eslatmasi, hisobot."
      action={<Badge tone="pending">Integratsiya kutilmoqda</Badge>}
    >
      {!snapshot || snapshot.notifications.length === 0 ? (
        <PendingIntegration what="Bildirishnomalar rasmiy hisob manbasi ulangach ko‘rsatiladi. Prototipda hech qanday xabar yuborilmaydi va hech narsa o‘qilmagan deb belgilanmaydi." />
      ) : (
        <ul className="space-y-3">
          {snapshot.notifications.map((note) => (
            <li
              key={note.id}
              className={[
                'rounded-lg border p-4',
                note.read ? 'border-line bg-surface' : 'border-line bg-surface-muted',
              ].join(' ')}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-ink-900">{note.title}</p>
                {!note.read ? <Badge tone="brand">Yangi</Badge> : null}
              </div>
              {note.body ? (
                <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{note.body}</p>
              ) : null}
              <p className="mt-2 text-[11px] text-ink-400">
                {note.createdAt ?? 'Sana ko‘rsatilmagan (namuna)'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
