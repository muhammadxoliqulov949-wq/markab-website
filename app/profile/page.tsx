import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Container } from '@/components/ui/Section';
import { AccountDashboard } from '@/components/account/AccountDashboard';
import { buildMetadata } from '@/lib/seo';

/** Rendered per request so Next.js can stamp the CSP nonce on its scripts (C1). */
export const dynamic = 'force-dynamic';


export const metadata: Metadata = buildMetadata({
  title: 'Mening Markabim',
  description:
    'Shaxsiy kabinet: arizalar, moliyalashtirish, to‘lovlar, saqlangan mahsulotlar va bildirishnomalar. Real hisob manbasi ulanmagani uchun shaxsiy ma’lumotlar ko‘rsatilmaydi.',
  path: '/profile',
  noindex: true,
});

/**
 * /profile — My Markab.
 *
 * Direct navigation is safe by construction: the dashboard reads its state from
 * the auth service, which is `unavailable`, so there is no path by which this
 * page could show a name, a phone number, a balance, a contract or a payment.
 * The one thing it can show unprompted is saved products, because those are
 * real visitor actions held in this browser — and they are disclosed as such.
 */
export default function ProfilePage() {
  return (
    <Container className="section-y-sm">
      {/*
        The h1 lives here rather than in the client dashboard: the dashboard
        renders a skeleton until the session state is known, and a
        server-rendered heading keeps the document outline valid on first paint.
      */}
      <h1 className="sr-only">Mening Markabim</h1>
      {/*
        The dashboard reads the prototype account state from the URL
        (`?holat=`), so it needs a Suspense boundary: this route is statically
        prerendered and `useSearchParams` opts the subtree into client
        rendering. The fallback is the same skeleton the dashboard shows while
        the session state is unknown.
      */}
      <Suspense
        fallback={
          <div className="space-y-4" aria-busy="true" aria-live="polite">
            <span className="sr-only">Hisob holati yuklanmoqda</span>
            <div className="h-28 animate-pulse rounded-xl bg-surface-muted" />
            <div className="h-10 animate-pulse rounded-lg bg-surface-muted" />
            <div className="h-64 animate-pulse rounded-xl bg-surface-muted" />
          </div>
        }
      >
        <AccountDashboard />
      </Suspense>
      <p className="mt-6 text-xs leading-relaxed text-ink-400">
        Eslatma: asl saytda <code className="rounded bg-surface-sunken px-1 py-0.5">/profile</code>{' '}
        manzili kirish sahifasiga yo‘naltirilmasdan bosh sahifani ko‘rsatardi (soft 404).
        Prototipda bu sahifa mavjud va holat aniq ko‘rsatiladi.
      </p>
    </Container>
  );
}
