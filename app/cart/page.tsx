import type { Metadata } from 'next';
import { Container } from '@/components/ui/Section';
import { CartView } from '@/components/cart/CartView';
import { buildMetadata } from '@/lib/seo';

/** Rendered per request so Next.js can stamp the CSP nonce on its scripts (C1). */
export const dynamic = 'force-dynamic';


export const metadata: Metadata = buildMetadata({
  title: 'Savatcha',
  description: 'Tanlangan elektronika mahsulotlari va muddatli to‘lov hisob-kitobi.',
  path: '/cart',
  noindex: true,
});

export default function CartPage() {
  return (
    <Container className="section-y-sm">
      <header className="mb-8">
        <h1 className="text-display-sm sm:text-display-md">Savatcha</h1>
        <p className="mt-2 text-sm text-ink-500">
          Mahsulotlar shu brauzerda saqlanadi — prototip holati.
        </p>
      </header>
      <CartView />
    </Container>
  );
}
