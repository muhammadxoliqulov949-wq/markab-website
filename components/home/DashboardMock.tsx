import { Badge } from '@/components/ui/Badge';

/**
 * Prototype dashboard composition for the app section.
 *
 * Pure markup — no data, no invented balances, no invented orders. Every value
 * area shows a placeholder with the reason, so the visual reads as a product UI
 * without asserting production behaviour.
 */
const menu = [
  'Buyurtmalar',
  'To‘lovlar',
  'Bildirishnomalar',
  'Shartnomalar',
  'Sarmoya',
  'Saqlanganlar',
];

const stats = ['Faol arizalar', 'Keyingi to‘lov', 'Sarmoya'];

export function DashboardMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" aria-hidden="true" />
          <span className="ml-2 text-xs font-medium text-ink-500">Mening Markabim</span>
        </div>
        <Badge tone="pending">Kontsept</Badge>
      </div>

      <div className="grid grid-cols-[92px_1fr] sm:grid-cols-[128px_1fr]">
        <aside className="border-r border-line bg-surface-muted/70 p-3">
          <ul className="space-y-1">
            {menu.map((item, index) => (
              <li
                key={item}
                className={[
                  'truncate rounded-md px-2.5 py-2 text-[11px] sm:text-xs',
                  index === 0 ? 'bg-brand-50 font-medium text-brand-800' : 'text-ink-500',
                ].join(' ')}
              >
                {item}
              </li>
            ))}
          </ul>
        </aside>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {stats.map((label) => (
              <div key={label} className="rounded-lg border border-line bg-surface-muted/50 p-2.5">
                <p className="truncate text-[10px] uppercase tracking-wide text-ink-400 sm:text-[11px]">
                  {label}
                </p>
                <p className="mt-1 text-sm font-semibold text-ink-300" aria-hidden="true">
                  —
                </p>
                <p className="sr-only">Ma’lumot kutilmoqda</p>
              </div>
            ))}
          </div>

          <ul className="mt-4 space-y-2">
            {[0, 1, 2].map((row) => (
              <li
                key={row}
                className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5"
              >
                <span className="h-8 w-8 shrink-0 rounded-md bg-surface-sunken" aria-hidden="true" />
                <span className="flex-1">
                  <span className="block h-2 w-1/2 rounded-full bg-surface-sunken" aria-hidden="true" />
                  <span className="mt-1.5 block h-2 w-1/3 rounded-full bg-surface-sunken" aria-hidden="true" />
                </span>
                <span className="text-[10px] text-ink-400 sm:text-[11px]">Kutilmoqda</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[11px] leading-relaxed text-ink-400">
            Bu kontsept-interfeys: real ma’lumotlar ulangandan so‘ng buyurtmalar, to‘lovlar,
            shartnomalar va sarmoya shu ko‘rinishda ko‘rsatiladi.
          </p>
        </div>
      </div>
    </div>
  );
}
