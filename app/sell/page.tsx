import type { Metadata } from 'next';
import { Container, SectionHeading } from '@/components/ui/Section';
import { SellWizard } from '@/components/sell/SellWizard';
import { StateBlock } from '@/components/ui/StateBlock';
import { ButtonLink } from '@/components/ui/Button';
import { buildMetadata } from '@/lib/seo';
import { vehicleBrands } from '@/lib/data';

/** Rendered per request so Next.js can stamp the CSP nonce on its scripts (C1). */
export const dynamic = 'force-dynamic';


export const metadata: Metadata = buildMetadata({
  title: 'Avtomobil sotish',
  description:
    'Avtomobilingizni sotish uchun so‘rov qoldiring: avtomobil ma’lumotlari, rasmlar, aloqa va narx. 4 bosqichli forma.',
  path: '/sell',
});

const process = [
  { title: 'So‘rov yuborasiz', description: 'Avtomobil ma’lumotlari va rasmlarini yuborasiz.' },
  { title: 'Baholash', description: 'Menejer avtomobil holatini baholaydi.' },
  { title: 'Kelishuv', description: 'Narx va shartlar kelishiladi.' },
  { title: 'Joylashtirish', description: 'E’lon katalogga qo‘shiladi.' },
];

export default function SellPage() {
  return (
    <>
      <section className="border-b border-line bg-surface-muted section-y">
        <Container>
          <div className="max-w-2xl">
            <h1 className="text-display-sm sm:text-display-md">Avtomobil sotish</h1>
            <p className="mt-4 text-base leading-relaxed text-ink-500">
              Avtomobilingizni sotmoqchi bo‘lsangiz, so‘rov qoldiring. Menejer baholab, siz bilan
              bog‘lanadi.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-surface section-y-sm">
        <Container className="grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
          <SellWizard brands={vehicleBrands} />

          <aside className="space-y-6">
            <div className="rounded-xl border border-line bg-surface p-5">
              <h2 className="text-sm font-semibold text-ink-900">Jarayon</h2>
              <ol className="mt-4 space-y-3">
                {process.map((item, index) => (
                  <li key={item.title} className="flex gap-3">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-sunken text-xs font-semibold text-ink-600">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-medium text-ink-900">{item.title}</h3>
                      <p className="mt-0.5 text-sm text-ink-500">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <StateBlock
              variant="pending"
              title="Elektronika sotuvchilari uchun"
              description="Katalogda “Sotuvchi bo‘lish” yo‘nalishi bor, biroq shartlari e’lon qilinmagan. Bo‘lim rasmiy ma’lumot bilan to‘ldiriladi."
              actions={
                <ButtonLink href="/contact" variant="secondary" size="sm">
                  Savol berish
                </ButtonLink>
              }
            />
          </aside>
        </Container>
      </section>
    </>
  );
}
