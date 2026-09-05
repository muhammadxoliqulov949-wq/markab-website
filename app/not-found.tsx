import Link from 'next/link';
import { Container } from '@/components/ui/Section';
import { ButtonLink } from '@/components/ui/Button';
import { MarkabStar } from '@/components/ui/MarkabStar';
import { site } from '@/lib/site';

const QUICK_LINKS = [
  { href: '/', label: 'Bosh sahifa', desc: "Markab ekotizimi" },
  { href: '/cars', label: 'Avtomobillar', desc: 'Muddatli to‘lov' },
  { href: '/electronics', label: 'Elektronika', desc: 'Telefon va texnika' },
  { href: '/invest', label: 'Sarmoya', desc: 'Investitsiya imkoniyatlari' },
  { href: '/financing', label: 'Moliyalashtirish', desc: 'Shartlar va kalkulyator' },
  { href: '/contact', label: 'Aloqa', desc: 'Biz bilan bog‘lanish' },
] as const;

export default function NotFound() {
  return (
    <Container className="py-20 sm:py-28">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-brand-50">
          <MarkabStar size={48} tone="muted" stroke pulse />
        </div>
        <p className="eyebrow">
          <span aria-hidden="true">404</span> · Manzil topilmadi
        </p>
        <h1 className="mt-5 text-display-md text-ink-900 sm:text-display-lg">
          Bu yo‘nalishda yulduz ko‘rinmayapti.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-body text-ink-600 sm:text-lead">
          Siz qidirgan sahifa manzili o‘zgargan, olib tashlangan yoki noto‘g‘ri yozilgan bo‘lishi
          mumkin. Quyidagi bo‘limlardan birini tanlang.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/" size="lg" className="min-w-[180px]">
            Bosh sahifaga qaytish
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary" size="lg" className="min-w-[180px]">
            Yordamga murojaat qilish
          </ButtonLink>
        </div>
      </div>

      <nav aria-label="Tezkor yo'nalishlar" className="mx-auto mt-16 max-w-3xl">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group flex items-center justify-between rounded-card border border-line bg-surface p-4 transition-card hover-only:border-brand-200 hover-only:shadow-card-hover"
              >
                <span>
                  <span className="block text-sm font-semibold text-ink-900 group-hover:text-brand-700">
                    {link.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-500">{link.desc}</span>
                </span>
                <svg
                  className="h-4 w-4 text-ink-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto mt-16 max-w-3xl border-t border-line pt-8 text-center text-xs text-ink-400">
        <p>
          {site.office.address} · {site.office.hours}
        </p>
      </div>
    </Container>
  );
}
