'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';
import { Button, ButtonLink } from '@/components/ui/Button';
import { StateBlock, PendingValue } from '@/components/ui/StateBlock';
import { formatUzs } from '@/lib/format';

/**
 * Cart — prototype.
 *
 * Real prices come from the fixtures, but checkout, delivery and installment
 * totals have no data source, so they render as explicit pending states instead
 * of computed estimates.
 */
export function CartView() {
  const { items, removeItem, clear } = useCart();
  const total = items.reduce((sum, item) => sum + item.priceUzs, 0);

  if (items.length === 0) {
    return (
      <StateBlock
        variant="empty"
        title="Savatchada mahsulot yo‘q"
        description="Elektronika mahsulotlarini savatchaga qo‘shib, shu yerda ko‘rib chiqishingiz mumkin."
        actions={
          <>
            <ButtonLink href="/electronics">Elektronikani ko‘rish</ButtonLink>
            <ButtonLink href="/cars" variant="secondary">
              Avtomobillar
            </ButtonLink>
          </>
        }
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:gap-10">
      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {items.map((item) => (
          <li key={item.id} className="flex gap-4 p-4">
            <Link
              href={item.href}
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-sunken"
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs text-ink-300">
                  Rasm yo‘q
                </span>
              )}
            </Link>

            <div className="min-w-0 flex-1">
              <Link href={item.href} className="line-clamp-2 text-sm font-medium text-ink-900 hover:text-brand-800">
                {item.name}
              </Link>
              <p className="mt-1 text-sm font-semibold text-ink-900">{formatUzs(item.priceUzs)}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 h-8 px-0 text-xs text-ink-400 hover:text-rose-600"
                onClick={() => removeItem(item.id)}
              >
                O‘chirish
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="text-base font-semibold text-ink-900">Buyurtma</h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-ink-500">Mahsulotlar ({items.length})</dt>
              <dd className="font-semibold text-ink-900">{formatUzs(total)}</dd>
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
              description="To‘lov va ariza bosqichi real tizim ulangandan so‘ng ishga tushadi."
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
            Narxlar ochiq katalog ma’lumotlariga asoslangan. Yakuniy summa rasmiy shartnomada
            ko‘rsatiladi.
          </p>
        </div>
      </aside>
    </div>
  );
}
