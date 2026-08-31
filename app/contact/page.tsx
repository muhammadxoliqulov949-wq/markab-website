import type { Metadata } from 'next';
import { Container, SectionHeading } from '@/components/ui/Section';
import { ContactForm } from '@/components/contact/ContactForm';
import { StateBlock, PendingValue } from '@/components/ui/StateBlock';
import { ButtonLink } from '@/components/ui/Button';
import { site } from '@/lib/site';
import { buildMetadata } from '@/lib/seo';
import { describeSubject } from '@/lib/financing/subject';
import {
  investmentEnquiryMessage,
  isInvestmentEnquiry,
} from '@/lib/investment/status';

export const metadata: Metadata = buildMetadata({
  title: 'Aloqa',
  description:
    'Markab bilan bog‘lanish: ofis manzili, ish vaqti va so‘rov yuborish formasi. Toshkent shahri, Kukcha Aryk, Yunusobod tumani.',
  path: '/contact',
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  // Arriving from "Mavjudligini aniqlash": resolve the item through the
  // repository so the message names it, and fall back silently if the id is
  // unknown — a bad handoff must never break the page.
  const ref = first(sp.ref);
  const type = first(sp.type);
  const subject = await describeSubject(type, ref);

  // Investment interest from /invest. Every investment CTA ends here — there is
  // no invest-now flow, no balance and no deposit anywhere in the prototype.
  // An unrecognised `about` value falls back to the general enquiry, so a
  // hand-typed URL can never produce a broken or empty form.
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
    <Container className="py-10 sm:py-14">
      <header className="mb-10 max-w-2xl">
        <h1 className="text-display-sm sm:text-display-md">Biz bilan bog‘laning</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-500">
          Savolingizni qoldiring yoki ofisga tashrif buyuring. Javob rasmiy ish vaqtida taqdim
          etiladi.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
        <div className="rounded-xl border border-line bg-surface p-6 sm:p-8">
          <ContactForm initialMessage={initialMessage} initialTopic={initialTopic} />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-line bg-surface p-6">
            <h2 className="text-base font-semibold text-ink-900">Ofis</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-400">Manzil</dt>
                <dd className="mt-1 text-ink-700">{site.office.address}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-400">Ish vaqti</dt>
                <dd className="mt-1 text-ink-700">{site.office.hours}</dd>
              </div>
            </dl>
            <div className="mt-5">
              <ButtonLink href={site.office.mapUrl} variant="secondary" size="sm">
                Xaritada ochish
              </ButtonLink>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface p-6">
            <h2 className="text-base font-semibold text-ink-900">Aloqa kanallari</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-500">Telefon</dt>
                <dd>{site.contacts.phone ?? <PendingValue label="saytda e’lon qilinmagan" />}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-500">Email</dt>
                <dd>{site.contacts.email ?? <PendingValue label="saytda e’lon qilinmagan" />}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-500">Ilova</dt>
                <dd className="text-right">
                  <a
                    href={site.apps.googlePlay}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-700 underline underline-offset-2"
                  >
                    Google Play
                  </a>
                  {' · '}
                  <a
                    href={site.apps.appStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-700 underline underline-offset-2"
                  >
                    App Store
                  </a>
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-ink-400">
              Telefon va email manbalarda farqli ko‘rsatilganligi sababli bu yerda
              ko‘rsatilmagan — rasmiy tasdiqdan so‘ng qo‘shiladi.
            </p>
          </div>

          <StateBlock
            variant="pending"
            title="Qo‘llab-quvvatlash vaqti"
            description="Javob berish muddati rasmiy jarayon tasdiqlangach ko‘rsatiladi."
            actions={
              <ButtonLink href="/faq" variant="secondary" size="sm">
                Savol-javoblar
              </ButtonLink>
            }
          />
        </div>
      </div>

      <div className="mt-12">
        <SectionHeading
          eyebrow="Muqobil"
          title="O‘zingizga mos bo‘limni tanlang"
          description="Ko‘p hollarda savolga tegishli bo‘limda javob topish tezroq."
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/financing" variant="secondary">
            Moliyalashtirish shartlari
          </ButtonLink>
          <ButtonLink href="/academy" variant="secondary">
            Academy
          </ButtonLink>
          <ButtonLink href="/invest" variant="secondary">
            Sarmoya
          </ButtonLink>
          <ButtonLink href="/sell" variant="secondary">
            Avtomobil sotish
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
