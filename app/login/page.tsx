import type { Metadata } from 'next';
import { Container } from '@/components/ui/Section';
import { LoginForm } from '@/components/auth/LoginForm';
import { Badge } from '@/components/ui/Badge';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Kirish',
  description: 'Telefon raqami orqali Markab hisobiga kiring yoki ro‘yxatdan o‘ting.',
  path: '/login',
  noindex: true,
});

export default function LoginPage() {
  return (
    <Container className="py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex justify-center">
          <Badge tone="pending">Demo rejim — real autentifikatsiya ulanmagan</Badge>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-xs leading-relaxed text-ink-400">
          Hisob ma’lumotlari faqat shu brauzerda saqlanadi va demo maqsadida ishlatiladi. Real
          tizimda kirish SMS kodi bilan tasdiqlanadi.
        </p>
      </div>
    </Container>
  );
}
