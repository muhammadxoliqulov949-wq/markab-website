'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { StateBlock, PendingValue } from '@/components/ui/StateBlock';
import { CardSkeleton } from '@/components/ui/Skeleton';

type TabId =
  | 'overview'
  | 'orders'
  | 'payments'
  | 'contracts'
  | 'investments'
  | 'notifications'
  | 'saved'
  | 'profile';

const tabs: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Umumiy' },
  { id: 'orders', label: 'Buyurtmalar' },
  { id: 'payments', label: "To'lovlar" },
  { id: 'contracts', label: 'Shartnomalar' },
  { id: 'investments', label: 'Sarmoya' },
  { id: 'notifications', label: 'Bildirishnomalar' },
  { id: 'saved', label: 'Saqlanganlar' },
  { id: 'profile', label: 'Profil' },
];

/**
 * My Markab — dashboard CONCEPT.
 *
 * All panels are demo states: the prototype has no backend, so every data area
 * shows an explicit "pending integration" state instead of fabricated orders,
 * payments or balances.
 */
export function ProfileDashboard() {
  const { user, ready, signOut } = useAuth();
  const [active, setActive] = useState<TabId>('overview');

  if (!ready) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <StateBlock
        variant="not-found"
        title="Hisobga kirish talab qilinadi"
        description="Shaxsiy kabinet faqat hisobga kirgandan so‘ng ko‘rsatiladi. Prototipda demo kirish orqali ko‘rish mumkin."
        actions={<ButtonLink href="/login">Kirish</ButtonLink>}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-line bg-surface p-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-ink-900">Mening Markabim</h2>
            <Badge tone="pending">Demo</Badge>
          </div>
          <p className="mt-1 text-sm text-ink-500">{user.phone}</p>
        </div>
        <div className="flex items-center gap-2">
          <ButtonLink href="/cart" variant="secondary" size="sm">
            Savatcha
          </ButtonLink>
          <Button variant="ghost" size="sm" onClick={signOut}>
            Chiqish
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Kabinet bo‘limlari" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {tabs.map((tab) => {
            const selected = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                aria-current={selected ? 'page' : undefined}
                onClick={() => setActive(tab.id)}
                className={[
                  'whitespace-nowrap rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors',
                  selected ? 'bg-brand-50 text-brand-800' : 'text-ink-600 hover:bg-surface-sunken',
                ].join(' ')}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0">{renderPanel(active)}</div>
      </div>
    </div>
  );
}

function DemoPanel({
  title,
  description,
  rows,
  actions,
}: {
  title: string;
  description: string;
  rows?: { label: string; value: string; pending?: boolean }[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink-900">{title}</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-500">{description}</p>
        </div>
        <Badge tone="pending">Ma’lumot kutilmoqda</Badge>
      </div>

      {rows && rows.length > 0 ? (
        <dl className="mt-5 divide-y divide-line">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm text-ink-500">{row.label}</dt>
              <dd className="text-sm text-ink-800">
                {row.pending ? <PendingValue label={row.value} /> : row.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {actions ? <div className="mt-5 flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

function renderPanel(active: TabId) {
  switch (active) {
    case 'overview':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <DemoPanel
            title="Faol buyurtmalar"
            description="Hozircha real buyurtmalar yo‘q — ma’lumotlar manbasi ulanishi kutilmoqda."
            rows={[
              { label: 'Jarayondagi arizalar', value: 'Ulanish kutilmoqda', pending: true },
              { label: 'Keyingi to‘lov', value: 'Ulanish kutilmoqda', pending: true },
            ]}
            actions={
              <ButtonLink href="/cars" size="sm">
                Avtomobillarni ko‘rish
              </ButtonLink>
            }
          />
          <DemoPanel
            title="Sarmoya"
            description="Portfolio, oylik foyda va pul yechish so‘rovlari shu yerda ko‘rsatiladi."
            rows={[
              { label: 'Portfolio summasi', value: 'Rasmiy ma’lumot bilan to‘ldiriladi', pending: true },
              { label: 'Oylik foyda', value: 'Rasmiy ma’lumot bilan to‘ldiriladi', pending: true },
            ]}
            actions={
              <ButtonLink href="/invest" variant="secondary" size="sm">
                Sarmoya bo‘limi
              </ButtonLink>
            }
          />
          <div className="sm:col-span-2">
            <DemoPanel
              title="Nima keyin bo‘ladi?"
              description="Kontsept: ariza yuborilgandan keyin buyurtma holati shu yerda kuzatiladi — qabul qilindi, tekshirilmoqda, tasdiqlandi, shartnoma, yetkazib berish."
              rows={[
                { label: 'Hujjatlar', value: 'Ulanish kutilmoqda', pending: true },
                { label: 'Bildirishnomalar', value: 'Ulanish kutilmoqda', pending: true },
              ]}
            />
          </div>
        </div>
      );

    case 'orders':
      return (
        <StateBlock
          variant="unavailable"
          title="Buyurtmalar ulanishi kutilmoqda"
          description="Real buyurtmalar tarixi API ulangandan so‘ng shu yerda ko‘rsatiladi. Prototipda namunaviy buyurtmalar ko‘rsatilmaydi."
          actions={
            <>
              <ButtonLink href="/cars" size="sm">
                Avtomobillar
              </ButtonLink>
              <ButtonLink href="/electronics" variant="secondary" size="sm">
                Elektronika
              </ButtonLink>
            </>
          }
        />
      );

    case 'payments':
      return (
        <StateBlock
          variant="unavailable"
          title="To‘lov jadvali ulanishi kutilmoqda"
          description="Oylik to‘lov summasi, to‘langan/qolgan qoldiq va keyingi sana real tizimdan olinadi. Hech qanday to‘lov summasi bu yerda namuna sifatida ko‘rsatilmaydi."
          actions={
            <ButtonLink href="/financing/calculator" variant="secondary" size="sm">
              Kalkulyator
            </ButtonLink>
          }
        />
      );

    case 'contracts':
      return (
        <StateBlock
          variant="pending"
          title="Shartnomalar"
          description="Shartnoma namunalari va imzolangan hujjatlar rasmiy manba tomonidan taqdim etilgach shu yerda paydo bo‘ladi."
          actions={
            <>
              <ButtonLink href="/financing" size="sm">
                Moliyalashtirish shartlari
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary" size="sm">
                Savol berish
              </ButtonLink>
            </>
          }
        />
      );

    case 'investments':
      return (
        <StateBlock
          variant="pending"
          title="Sarmoya kabineti"
          description="Portfolio, oylik hisobot va pul yechish so‘rovlari — rasmiy ma’lumotlar ulanishi kutilmoqda."
          actions={
            <>
              <ButtonLink href="/invest" size="sm">
                Sarmoya
              </ButtonLink>
              <ButtonLink href="/academy/sarmoyadorlar-uchun-asoslar" variant="secondary" size="sm">
                Sarmoya asoslari
              </ButtonLink>
            </>
          }
        />
      );

    case 'notifications':
      return (
        <StateBlock
          variant="empty"
          title="Bildirishnomalar yo‘q"
          description="Holat o‘zgarganda (ariza qabul qilindi, to‘lov kuni, shartnoma tayyor) bildirishnomalar shu yerda paydo bo‘ladi."
        />
      );

    case 'saved':
      return (
        <StateBlock
          variant="empty"
          title="Saqlangan mahsulotlar yo‘q"
          description="Yoqqan avtomobil va elektronika mahsulotlarini shu yerda saqlashingiz mumkin bo‘ladi."
          actions={
            <>
              <ButtonLink href="/cars" size="sm">
                Avtomobillar
              </ButtonLink>
              <ButtonLink href="/electronics" variant="secondary" size="sm">
                Elektronika
              </ButtonLink>
            </>
          }
        />
      );

    case 'profile':
      return (
        <DemoPanel
          title="Profil ma’lumotlari"
          description="Telefon raqami tasdiqlangandan so‘ng qolgan maydonlar to‘ldiriladi."
          rows={[
            { label: 'Telefon', value: 'Demo sessiya' },
            { label: 'Ism', value: 'Kiritilmagan', pending: true },
            { label: 'Hujjatlar', value: 'Ulanish kutilmoqda', pending: true },
          ]}
          actions={
            <Link
              href="/contact"
              className="text-sm font-medium text-brand-700 underline underline-offset-2"
            >
              Ma’lumotlarni yangilash uchun murojaat
            </Link>
          }
        />
      );

    default:
      return null;
  }
}
