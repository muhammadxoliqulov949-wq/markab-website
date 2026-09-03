import { Badge } from '@/components/ui/Badge';

/**
 * Markab 2.0 dashboard CONCEPT — visual only.
 *
 * Every value area is a placeholder with its reason. No invented balances,
 * orders, payment amounts or investment figures: the mock communicates the shape
 * of the future ecosystem, not fake data.
 */
const menu = [
  { label: 'Umumiy', active: true },
  { label: 'Buyurtmalar', active: false },
  { label: 'To‘lovlar', active: false },
];

const tiles = ['Faol arizalar', 'Keyingi to‘lov', 'Sarmoya'];

export function DashboardMock() {
  return (
    <div className="relative">
      {/* Frame */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-800 shadow-lift">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" aria-hidden="true" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" aria-hidden="true" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" aria-hidden="true" />
            <span className="ml-2 text-xs font-medium text-white/60">Mening Markabim</span>
          </div>
          <Badge tone="pending" className="border-white/20 bg-white/5 text-white/60">
            Kontsept
          </Badge>
        </div>

        <div className="grid grid-cols-[88px_1fr] sm:grid-cols-[132px_1fr]">
          <aside className="border-r border-white/10 bg-white/[0.02] p-3">
            <ul className="space-y-1">
              {menu.map((item) => (
                <li
                  key={item.label}
                  className={[
                    'truncate rounded-md px-2.5 py-2 text-[11px] sm:text-xs',
                    item.active ? 'bg-brand-500/15 font-medium text-brand-100' : 'text-white/55',
                  ].join(' ')}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </aside>

          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {tiles.map((label) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                  <p className="truncate text-[10px] uppercase tracking-wide text-white/70 sm:text-[11px]">
                    {label}
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-white/60" aria-hidden="true">
                    —
                  </p>
                  <p className="sr-only">Ma’lumot kutilmoqda</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-dashed border-white/15 px-3 py-3 text-[11px] leading-relaxed text-white/60">
              Buyurtmalar, to‘lovlar, shartnomalar, sarmoya va bildirishnomalar shu ko‘rinishda
              kabinetga ulanadi.
            </div>
          </div>
        </div>
      </div>

      {/* Floating concept card — pure CSS, no image assets. */}
      <div className="absolute -bottom-6 -left-2 hidden w-52 rounded-xl border border-line bg-surface p-4 shadow-lift sm:block">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" />
            </svg>
          </span>
          <p className="text-xs font-semibold text-ink-900">Bildirishnomalar</p>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-ink-500">
          To‘lov sanasi va ariza holati haqida eslatma.
        </p>
        <p className="mt-2 text-[10px] text-ink-400">Kontsept — prototip</p>
      </div>
    </div>
  );
}
