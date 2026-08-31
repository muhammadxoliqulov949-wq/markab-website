import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { StateBlock, PendingValue } from '@/components/ui/StateBlock';
import { Accordion } from '@/components/ui/Accordion';
import { financingSteps } from '@/lib/data/fixtures/content';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Moliyalashtirish',
  description:
    'Muddatli to‘lov qanday ishlaydi: mahsulot tanlash, shartlar, ariza, tasdiqlash, shartnoma va mahsulotni olish.',
  path: '/financing',
});

const requirements = [
  { label: 'Minimal boshlang‘ich to‘lov', value: null },
  { label: 'Muddat oralig‘i', value: '2 oydan 36 oygacha' },
  { label: 'Kerakli hujjatlar', value: null },
  { label: 'Tasdiqlash muddati', value: null },
  { label: 'Erta to‘lash shartlari', value: null },
  { label: 'Shartnoma turi', value: 'Taqsit yoki murabaha' },
];

export default function FinancingPage() {
  return (
    <>
      <section className="border-b border-line bg-surface-muted py-12 sm:py-16">
        <Container>
          <div className="max-w-3xl">
            <Badge tone="brand" className="mb-4">
              Moliyalashtirish
            </Badge>
            <h1 className="text-display-sm sm:text-display-md">Muddatli to‘lov qanday ishlaydi</h1>
            <p className="mt-4 text-base leading-relaxed text-ink-500 sm:text-lg">
              Jarayon olti bosqichdan iborat. Har bir bosqichda nima sodir bo‘lishi va sizdan nima
              talab qilinishi aniq ko‘rsatiladi.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/financing/apply" size="lg">
                Ariza yuborish
              </ButtonLink>
              <ButtonLink href="/financing/calculator" variant="secondary" size="lg">
                Kalkulyatorni ochish
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-14 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Yo‘l xaritasi"
            title="Olti bosqich"
            description="Mahsulot tanlashdan tortib, uni qabul qilib olishgacha."
          />

          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {financingSteps.map((step) => {
              const body = (
                <>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">
                      {step.step}
                    </span>
                    <h3 className="text-base font-semibold text-ink-900">{step.title}</h3>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">
                    {step.description}
                  </p>
                  {step.href ? (
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
                      Ochish
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ) : (
                    <span className="mt-4 text-xs text-ink-400">Rasmiy jarayon tasdiqlanadi</span>
                  )}
                </>
              );

              return (
                <li
                  key={step.step}
                  className="flex h-full flex-col rounded-xl border border-line bg-surface p-6 shadow-card transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:shadow-card-hover"
                >
                  {step.href ? (
                    <Link href={step.href} className="flex h-full flex-col">
                      {body}
                    </Link>
                  ) : (
                    body
                  )}
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      <section className="bg-surface-muted py-14 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Shartlar"
              title="Asosiy shartlar"
              description="Ochiq e’lon qilingan ma’lumotlar. Aniq ko‘rsatkichlar rasmiy manba bilan to‘ldiriladi."
            />

            <dl className="mt-8 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
              {requirements.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 px-5 py-4">
                  <dt className="text-sm text-ink-500">{item.label}</dt>
                  <dd className="text-right text-sm text-ink-900">
                    {item.value ?? <PendingValue />}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 text-xs leading-relaxed text-ink-400">
              Bu yerda hech qanday foiz stavkasi yoki to‘lov miqdori ko‘rsatilmagan — ular rasmiy
              hisob-kitob asosida shakllanadi.
            </p>
          </div>

          <div>
            <SectionHeading
              eyebrow="Savollar"
              title="Ko‘p so‘raladigan holatlar"
              description="Rasmiy javoblar tasdiqlangach shu yerda paydo bo‘ladi."
            />
            <div className="mt-8">
              <Accordion
                items={[
                  {
                    id: 'docs',
                    title: 'Qanday hujjatlar kerak?',
                    content: (
                      <div className="space-y-3">
                        <PendingValue label="Rasmiy javob tayyorlanmoqda" />
                        <p className="text-xs text-ink-400">
                          Hujjatlar ro‘yxati tasdiqlangach ko‘rsatiladi.{' '}
                          <Link href="/contact" className="text-brand-700 underline underline-offset-2">
                            Menejerdan so‘rash
                          </Link>
                        </p>
                      </div>
                    ),
                  },
                  {
                    id: 'early',
                    title: 'Erta to‘lashga imkoniyat bormi?',
                    content: (
                      <div className="space-y-3">
                        <PendingValue label="Rasmiy javob tayyorlanmoqda" />
                        <p className="text-xs text-ink-400">
                          Erta to‘lash shartlari shartnomada ko‘rsatiladi.
                        </p>
                      </div>
                    ),
                  },
                  {
                    id: 'approval',
                    title: 'Tasdiqlash qancha vaqt oladi?',
                    content: (
                      <div className="space-y-3">
                        <PendingValue label="Rasmiy javob tayyorlanmoqda" />
                      </div>
                    ),
                  },
                  {
                    id: 'contract',
                    title: 'Qaysi shartnoma turi qo‘llaniladi?',
                    content: (
                      <div className="space-y-3">
                        <p className="text-sm text-ink-600">
                          Ochiq ma’lumotga ko‘ra, oldi-sotdi shartnomasi{' '}
                          <strong>taqsit</strong> yoki <strong>murabaha</strong> asosida
                          rasmiylashtiriladi.
                        </p>
                        <p className="text-xs text-ink-400">
                          Har bir shartnoma turi bo‘yicha batafsil ta’rif Academy bo‘limida
                          beriladi.
                        </p>
                        <Link
                          href="/academy/murabaha"
                          className="inline-block text-sm font-medium text-brand-700 underline underline-offset-2"
                        >
                          Murabaha bo‘limi
                        </Link>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-14 sm:py-20">
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            <StateBlock
              variant="pending"
              title="Ariza onlayn qabul qilinishi"
              description="Ariza yuborish oqimi rasmiy jarayon tasdiqlangach ishga tushadi. Hozirda menejer orqali bog‘lanish mumkin."
              actions={
                <ButtonLink href="/contact" variant="secondary" size="sm">
                  Bog‘lanish
                </ButtonLink>
              }
            />
            <div className="rounded-xl border border-line bg-surface p-6">
              <h2 className="text-base font-semibold text-ink-900">Ofisda maslahat</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                {site.office.address}
                <br />
                {site.office.hours}
              </p>
              <ButtonLink href="/contact" variant="secondary" size="sm" className="mt-4">
                Manzilni ochish
              </ButtonLink>
            </div>
            <div className="rounded-xl border border-line bg-surface p-6">
              <h2 className="text-base font-semibold text-ink-900">Academy</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                Muddatli to‘lov, murabaha va sarmoya asoslari bo‘yicha qisqa darslar.
              </p>
              <ButtonLink href="/academy" variant="secondary" size="sm" className="mt-4">
                Darslarni ko‘rish
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
