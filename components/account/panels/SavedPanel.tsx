'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { Panel } from './Panel';
import { useSavedItems } from '@/components/account/SavedItemsProvider';
import { formatUzs } from '@/lib/format';

/**
 * Saved products.
 *
 * The only panel with real content, because the visitor really did save these.
 * It still states plainly that the list lives in this browser and is not an
 * account feature — the list is the one thing here that could otherwise be
 * mistaken for synced account data.
 */
export function SavedPanel() {
  const { items, ready, remove, clear } = useSavedItems();

  return (
    <Panel
      title="Saqlangan mahsulotlar"
      description="Katalogdan saqlagan avtomobil va elektronika mahsulotlari. Bu ro‘yxat faqat shu brauzerda saqlanadi."
      action={
        items.length > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="text-xs font-medium text-ink-500 underline underline-offset-4 hover:text-ink-800"
          >
            Barchasini tozalash
          </button>
        ) : null
      }
    >
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-dashed border-line-strong bg-surface-muted px-4 py-3">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <path d="M7 11V8a5 5 0 0 1 10 0v3" strokeLinecap="round" />
        </svg>
        <p className="text-xs leading-relaxed text-ink-500">
          Bu mahalliy prototip holati: saqlangan mahsulotlar Markab hisobiga yuborilmaydi,
          boshqa qurilmaga ko‘chmaydi va brauzer ma’lumotlari tozalanganda yo‘qoladi.
        </p>
      </div>

      {!ready ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-surface-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line-strong bg-surface-muted px-4 py-8 text-center">
          <p className="text-sm font-medium text-ink-700">Saqlangan mahsulot yo‘q</p>
          <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-ink-400">
            Avtomobil yoki elektronika kartochkasidagi “Saqlash” tugmasi orqali mahsulotni shu
            ro‘yxatga qo‘shishingiz mumkin.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <ButtonLink href="/cars" variant="secondary" size="sm">
              Avtomobillar
            </ButtonLink>
            <ButtonLink href="/electronics" variant="secondary" size="sm">
              Elektronika
            </ButtonLink>
          </div>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <li
              key={item.ref}
              className="flex gap-3 rounded-lg border border-line bg-surface p-3"
            >
              <Link
                href={item.href}
                className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md bg-surface-muted"
              >
                <RemoteImage
                  src={item.image ?? null}
                  alt={item.title}
                  fill
                  sizes="96px"
                  className="object-cover object-center"
                  fallbackLabel="Rasm yo‘q"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link href={item.href} className="min-w-0 text-sm font-medium text-ink-900 hover:underline">
                    <span className="line-clamp-2">{item.title}</span>
                  </Link>
                  <Badge tone="neutral">{item.kind === 'car' ? 'Avto' : 'Elektronika'}</Badge>
                </div>
                <p className="mt-auto text-sm font-semibold text-ink-900">
                  {formatUzs(item.priceUzs)}
                </p>
                <button
                  type="button"
                  onClick={() => remove(item.ref)}
                  className="mt-1 self-start text-xs font-medium text-ink-500 underline underline-offset-4 hover:text-rose-700"
                >
                  Olib tashlash
                  <span className="sr-only"> — {item.title}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
