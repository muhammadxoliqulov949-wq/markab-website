import type { Metadata } from 'next';
import { Container } from '@/components/ui/Section';
import { LoginForm } from '@/components/auth/LoginForm';
import { Badge } from '@/components/ui/Badge';
import { buildMetadata } from '@/lib/seo';

/** Rendered per request so Next.js can stamp the CSP nonce on its scripts (C1). */
export const dynamic = 'force-dynamic';


export const metadata: Metadata = buildMetadata({
  title: 'Kirish',
  description:
    'Markab hisobiga telefon raqami orqali kirish. Kirish tizimi kirish tizimi hali ishlamaydi.',
  path: '/login',
  noindex: true,
});

/**
 * /login — the authentication entry point.
 *
 * No OTP code is generated and no session is created anywhere in this flow:
 * there is no auth provider. Submitting the phone number asks the service for a
 * code and shows exactly what the service answered, which today is always
 * "unavailable".
 */
export default function LoginPage() {
  return (
    <Container className="py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex justify-center">
          <Badge tone="pending">Rasmiy autentifikatsiya xizmati ulanmagan</Badge>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-xs leading-relaxed text-ink-400">
          Bu prototipda hech qanday tasdiqlash kodi yaratilmaydi va hisob ochilmaydi. Real
          tizimda kirish SMS kod bilan tasdiqlanadi.
        </p>
      </div>
    </Container>
  );
}
