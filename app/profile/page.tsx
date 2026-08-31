import type { Metadata } from 'next';
import { Container } from '@/components/ui/Section';
import { ProfileDashboard } from '@/components/profile/ProfileDashboard';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Mening Markabim',
  description:
    'Shaxsiy kabinet: buyurtmalar, to‘lovlar, shartnomalar, sarmoya va bildirishnomalar. Kontsept holatida.',
  path: '/profile',
  noindex: true,
});

export default function ProfilePage() {
  return (
    <Container className="py-10 sm:py-14">
      {/*
        The h1 lives here, not in the client dashboard: the dashboard shows a
        skeleton until the demo session is read from storage, so a server-rendered
        heading keeps the document outline valid on first paint.
      */}
      <h1 className="sr-only">Mening Markabim</h1>
      <ProfileDashboard />
      <p className="mt-6 text-xs leading-relaxed text-ink-400">
        Eslatma: asl saytda <code className="rounded bg-surface-sunken px-1 py-0.5">/profile</code>{' '}
        manzili kirish sahifasiga yo‘naltirilmasdan bosh sahifani ko‘rsatardi (soft 404).
        Prototipda bu sahifa mavjud va holat aniq ko‘rsatiladi.
      </p>
    </Container>
  );
}
