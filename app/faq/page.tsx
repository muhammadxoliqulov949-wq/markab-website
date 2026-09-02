import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Accordion } from '@/components/ui/Accordion';
import { StateBlock } from '@/components/ui/StateBlock';
import { ButtonLink } from '@/components/ui/Button';
import { repository } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';

/** Rendered per request so Next.js can stamp the CSP nonce on its scripts (C1). */
export const dynamic = 'force-dynamic';


export const metadata: Metadata = buildMetadata({
  title: 'Savol-javoblar',
  description:
    'Markab bo‘yicha tez-tez so‘raladigan savollar: tasdiqlash muddati, hujjatlar, yetkazib berish, erta to‘lash va sarmoya.',
  path: '/faq',
});

export default async function FaqPage() {
  const result = await repository.listFaq();
  const items = result.status === 'success' ? result.data : [];

  return (
    <Container className="section-y-sm">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-display-sm sm:text-display-md">Savol-javoblar</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-500">
          Savollar markab.uz bosh sahifasidagi tez-tez so‘raladigan savollar blokidan olingan.
          Rasmiy javoblar tasdiqlangach shu yerda paydo bo‘ladi.
        </p>
      </header>

      <div className="max-w-3xl">
        {/* The accordion headings are h3, so the list needs an h2 above them
            or the outline jumps straight from the page h1. */}
        <h2 className="sr-only">Savollar ro‘yxati</h2>
        {items.length > 0 ? (
          <Accordion
            items={items.map((item) => ({
              id: item.id,
              title: item.question,
              content: item.answer ? (
                <p className="text-sm leading-relaxed text-ink-600">{item.answer}</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-ink-500">
                    Bu savol bo‘yicha rasmiy javob hali e’lon qilinmagan. Javob tasdiqlangach shu
                    yerda ko‘rsatiladi — taxminiy javob yozilmaydi.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <ButtonLink href="/contact" size="sm">
                      Menejerga savol berish
                    </ButtonLink>
                    <ButtonLink href="/financing" variant="secondary" size="sm">
                      Moliyalashtirish shartlari
                    </ButtonLink>
                  </div>
                </div>
              ),
            }))}
          />
        ) : (
          <StateBlock
            variant="empty"
            title="Hozircha savol-javoblar mavjud emas"
            description="Katalog ulangandan so‘ng savollar shu yerda ko‘rsatiladi."
            actions={<ButtonLink href="/contact" variant="secondary">Savol yuborish</ButtonLink>}
          />
        )}
      </div>

      <div className="mt-10 max-w-3xl rounded-xl border border-dashed border-line-strong bg-surface-muted p-6">
        <h2 className="text-sm font-semibold text-ink-900">Javob topilmadimi?</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          Savolingizni yuboring yoki ofisga murojaat qiling. Shuningdek{' '}
          <Link href="/academy" className="text-brand-700 underline underline-offset-2">
            Academy
          </Link>{' '}
          bo‘limida moliyalashtirish asoslari bor.
        </p>
        <div className="mt-4">
          <ButtonLink href="/contact" size="sm">
            Bog‘lanish
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
