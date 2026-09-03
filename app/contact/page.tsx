import type { Metadata } from 'next';
import { Container } from '@/components/ui/Section';
import { ButtonLink } from '@/components/ui/Button';
import { OfficeInfo } from '@/components/contact/OfficeInfo';
import { OfficeMap } from '@/components/contact/OfficeMap';
import { ContactForm } from '@/components/contact/ContactForm';
import { site } from '@/lib/site';
import { buildMetadata } from '@/lib/seo';
import { describeSubject } from '@/lib/financing/subject';
import {
  investmentEnquiryMessage,
  isInvestmentEnquiry,
} from '@/lib/investment/status';

// Contact renders per request (nonce CSP; pre-filled subject can depend on
// searchParams). It does not need ISR — form landing is cheap and personal.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildMetadata({
  title: 'Aloqa',
  description:
    'Markab ofisi manzili, ish vaqti va bog‘lanish formasi. Toshkent shahri, Kukcha Aryk, Yunusobod tumani.',
  path: '/contact',
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  // Arriving from "Mavjudligini aniqlash": resolve the item through the
  // repository so the message names it.
  const ref = first(sp.ref);
  const type = first(sp.type);
  const subject = await describeSubject(type, ref);

  const enquiry = first(sp.about);
  const investmentEnquiry = type === 'sarmoya';

  const initialMessage = investmentEnquiry
    ? investmentEnquiryMessage(isInvestmentEnquiry(enquiry) ? enquiry : 'general')
    : subject
      ? `Salom! “${subject.title}” mahsulotining mavjudligini aniqlashda yordam bera olasizmi?`
      : '';
  const initialTopic = investmentEnquiry
    ? 'sarmoya'
    : type === 'electronics'
      ? 'elektronika'
      : type === 'car'
        ? 'avtomobil'
        : '';

  return (
    <Container className="section-y-sm">
      {/* ------ Page header ------ */}
      <header className="mb-8 max-w-2xl md:mb-10">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-brand-700">
          Aloqa
        </p>
        <h1 className="text-display-sm sm:text-display-md">Biz bilan bog‘laning</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-500">
          Ofisga tashrif buyuring yoki quyidagi forma orqali savol qoldiring.
          Javob rasmiy ish vaqtida taqdim etiladi.
        </p>
      </header>

      {/* ------ Two-column composition ------ */}
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        {/* LEFT: Bizning ofis — map + information */}
        <section aria-labelledby="office-heading" className="space-y-5">
          <div>
            <h2 id="office-heading" className="text-lg font-semibold text-ink-900">
              Bizning ofis
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Belgilangan manzilga ish vaqti davomida tashrif buyurishingiz mumkin.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
            <div className="p-4 sm:p-5">
              <OfficeMap />
            </div>
            <div className="px-4 pb-5 sm:px-5">
              <OfficeInfo />
            </div>
          </div>

          <p className="text-xs leading-relaxed text-ink-400">
            Xarita uchinchi tomon xizmati (OpenStreetMap) orqali ko‘rsatilmoqda.
            Ushbu xizmat faqat joylashuvni ko‘rsatish uchun ishlatiladi va shaxsiy
            ma’lumotlaringiz yuborilmaydi.
          </p>
        </section>

        {/* RIGHT: Biz bilan bog'laning — form */}
        <section aria-labelledby="form-heading" className="space-y-5">
          <div>
            <h2 id="form-heading" className="text-lg font-semibold text-ink-900">
              Biz bilan bog‘laning
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Shaklni to‘ldiring — rasmiy aloqa kanali ulangach so‘rovlar qabul
              qilinadi. Hozircha forma ma’lumotlari serverga yuborilmaydi.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-7">
            <ContactForm initialMessage={initialMessage} initialTopic={initialTopic} />
          </div>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/faq" variant="secondary" size="sm">
              Savol-javoblar
            </ButtonLink>
            <ButtonLink href={site.office.mapUrl} variant="ghost" size="sm" target="_blank" rel="noopener noreferrer">
              Yo‘nalish olish →
            </ButtonLink>
          </div>
        </section>
      </div>
    </Container>
  );
}
