'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';
import { Button, ButtonLink } from '@/components/ui/Button';
import { StateBlock, PendingValue } from '@/components/ui/StateBlock';
import { formatUzs } from '@/lib/format';

/**
 * Cart — prototype, browser-local.
 *
 * Prices come from the catalogue, but checkout, delivery and instalment totals
 * have no data source, so they render as explicit pending states rather than
 * computed estimates. Nothing here submits an order and nothing confirms stock:
 * availability is verified only when the real system is connected.
 */
export function CartView() {
  const { items, count, subtotal, removeItem, clear } = useCart();

  if (items.length === 0) {
    return (
      <StateBlock headingLevel={2}
        variant="empty"
        title="Savatchangiz bo‘sh"
        description="Mahsulot qo‘shib, shu yerda ko‘rib chiqishingiz mumkin."
        actions={<ButtonLink href="/electronics">Mahsulotlarni ko‘rish</ButtonLink>}
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:gap-10">
      <div>
        <p className="mb-3 text-sm text-ink-500">
          <span className="font-medium text-ink-900">{count}</span> ta mahsulot tanlangan
        </p>

        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 p-4">
              <Link
                href={item.href}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-muted"
                tabIndex={-1}
                aria-hidden="true"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain p-1.5"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xs text-ink-400">
                    Rasm yo‘q
                  </span>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={item.href}
                  className="line-clamp-2 text-sm font-medium text-ink-900 hover:text-brand-800"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm font-semibold text-ink-900">
                  {formatUzs(item.priceUzs)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`${item.name} — savatchadan o‘chirish`}
                  className="mt-1 h-8 px-0 text-xs text-ink-400 hover:text-rose-600"
                  onClick={() => removeItem(item.id)}
                >
                  O‘chirish
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="text-base font-semibold text-ink-900">Buyurtma</h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-ink-500">Mahsulotlar ({count})</dt>
              <dd className="font-semibold text-ink-900">{formatUzs(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-ink-500">Yetkazib berish</dt>
              <dd>
                <PendingValue label="Ma’lumot tayyorlanmoqda" />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
              <dt className="text-ink-500">Muddatli to‘lov</dt>
              <dd>
                <PendingValue label="Hisob-kitob ma’lumoti tayyorlanmoqda" />
              </dd>
            </div>
          </dl>

          <div className="mt-5">
            <StateBlock
              compact
              variant="unavailable"
              title="Rasmiylashtirish ulanishi kutilmoqda"
              description="To‘lov va ariza bosqichi real tizim ulangandan so‘ng ishga tushadi. Hozircha buyurtma yuborilmaydi."
            />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <ButtonLink href="/financing/calculator" variant="secondary" fullWidth>
              Kalkulyator
            </ButtonLink>
            <Button variant="ghost" onClick={clear}>
              Savatchani tozalash
            </Button>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-ink-400">
            Narxlar ochiq katalog ma’lumotlariga asoslangan. Savatcha faqat shu brauzerda saqlanadi
            — bu prototip holati, hisob yoki serverda saqlanmaydi. Yakuniy summa va mahsulot
            mavjudligi rasmiy shartnomada tasdiqlanadi.
          </p>
        </div>
      </aside>
    </div>
  );
}
