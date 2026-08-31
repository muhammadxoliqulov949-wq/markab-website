import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, SectionHeading } from '@/components/ui/Section';
import { InstallmentCalculator } from '@/components/calculator/InstallmentCalculator';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { buildMetadata } from '@/lib/seo';
import { firstParam, subjectKindLabel } from '@/lib/financing/handoff';
import { resolveFinancingSubject } from '@/lib/financing/subject';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = buildMetadata({
  title: 'To‘lov kalkulyatori',
  description:
    'Muddatli to‘lov kalkulyatori: narx, boshlang‘ich to‘lov va muddat bo‘yicha interfeys. Rasmiy hisoblash formulasi integratsiya qilingach aniq oylik to‘lov ko‘rsatiladi.',
  path: '/financing/calculator',
});

export default async function CalculatorPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  // Product handoff from /cars or /electronics. Resolved through the
  // repository — never from fixtures, never hard-coded.
  const resolution = await resolveFinancingSubject(
    firstParam(sp.productType),
    firstParam(sp.productId),
  );

  const subject = resolution.status === 'resolved' ? resolution.subject : null;

  return (
    <Container className="py-10 sm:py-14">
      <header className="mb-8 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="pending">Prototip</Badge>
          <Badge tone="neutral">Rasmiy formula ulanmagan</Badge>
        </div>
        <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-tight text-ink-900 sm:text-[2.25rem]">
          To‘lov kalkulyatori
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-600">
          Narx, boshlang‘ich to‘lov va muddatni kiriting. Kalkulyator hisoblashni{' '}
          <strong className="font-semibold text-ink-900">bajarmaydi</strong> — Markab’ning rasmiy
          formulasi integratsiya qilinguniga qadar aniq oylik to‘lov o‘rniga kutish holati
          ko‘rsatiladi. Noto‘g‘ri raqam ko‘rsatishdan ko‘ra, hisoblamaslik to‘g‘riroq.
        </p>
      </header>

      {resolution.status === 'invalid' ? (
        <div className="mb-6">
          <StateBlock
            compact
            variant="not-found"
            title="Ko‘rsatilgan mahsulot topilmadi"
            description="Havoladagi mahsulot katalogda mavjud emas yoki o‘chirilgan. Kalkulyator shaxsiy narx bilan ishlashda davom etadi."
            actions={
              <>
                <ButtonLink href="/cars" variant="secondary" size="sm">
                  Avtomobillar
                </ButtonLink>
                <ButtonLink href="/electronics" variant="secondary" size="sm">
                  Elektronika
                </ButtonLink>
              </>
            }
          />
        </div>
      ) : null}

      {subject ? (
        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-line bg-surface-muted px-4 py-3 text-sm">
          <span className="text-ink-500">Tanlangan:</span>
          <Link href={subject.href} className="font-semibold text-ink-900 hover:text-brand-800">
            {subject.title}
          </Link>
          <span className="text-ink-400">·</span>
          <span className="text-ink-600">{subjectKindLabel(subject.kind)}</span>
          <span className="text-ink-400">·</span>
          <span className="text-ink-600">
            {subject.publishedMonthlyUzs
              ? 'E’londa oylik to‘lov ko‘rsatilgan'
              : 'E’londa oylik to‘lov ko‘rsatilmagan'}
          </span>
        </div>
      ) : null}

      <InstallmentCalculator subject={subject} />

      <section className="mt-12" aria-labelledby="calc-about">
        <SectionHeading
          eyebrow="Shaffoflik"
          title="Bu kalkulyator nima qiladi va nima qilmaydi"
          description="Rasmiy hisoblash formulasi mavjud bo‘lmaganda, interfeys taxminiy raqam ko‘rsatmaydi."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-ink-900">Nima qiladi</h3>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink-600">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                Narx, boshlang‘ich to‘lov va so‘ralayotgan muddatni qabul qiladi.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                Moliyalashtiriladigan qoldiqni ko‘rsatadi — oddiy ayirish (narx − boshlang‘ich
                to‘lov), alohida belgilangan.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                E’londa chop etilgan oylik to‘lovni (agar mavjud bo‘lsa) aynan keltiradi.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                Rasmiy formula ulanganda to‘ldiriladigan natija panelini oldindan ko‘rsatadi.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-ink-900">Nima qilmaydi</h3>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink-600">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-300" />
                Foiz, ustama yoki komissiya qo‘llamaydi.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-300" />
                Oylik to‘lov yoki jami to‘lovni hisoblab chiqarmaydi.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-300" />
                Tasdiqlash ehtimoli yoki shart shartlarini taxmin qilmaydi.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-300" />
                Rasmiy taklif yoki kvota hisoblanmaydi.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-line bg-surface-muted p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight text-ink-900">Keyingi qadam</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">
          Shartlar bilan tanishib, ariza yuboring yoki menejer bilan bog‘laning. Ariza hech qanday
          moliyaviy majburiyat tug‘dirmaydi — yakuniy shartlar shartnomada belgilanadi.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <ButtonLink href={subject ? `/financing/apply?type=${subject.kind}&ref=${subject.ref}` : '/financing/apply'}>
            Ariza yuborish
          </ButtonLink>
          <ButtonLink href="/financing" variant="secondary">
            Shartlar
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Bog‘lanish
          </ButtonLink>
        </div>
      </section>
    </Container>
  );
}
