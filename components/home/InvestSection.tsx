import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Container, SectionHeading } from '@/components/ui/Section';
import { PendingValue } from '@/components/ui/StateBlock';
import { repository } from '@/lib/data';
import { PENDING_LABEL } from '@/lib/investment/status';
import { MarkabStar } from '@/components/ui/MarkabStar';

/**
 * Verified from markab.uz and shown as published — nothing else.
 *
 * REMOVED IN PHASE 5: this block previously advertised
 * `Muddat — 2 oydan 36 oygacha` as a published term. That range could not be
 * substantiated for the investment product, so it was deleted and the row moved
 * into the pending list. It was NOT replaced with another guessed duration:
 * the row now renders the same pending marker as every other unpublished field.
 *
 * The three-step diagram is Markab's *published description* of the model, with
 * that attribution visible next to it — it is not a description of mechanics.
 */
const publishedFacts = [
  {
    label: 'Foyda taqsimoti',
    value: 'Rasmiy kelishuv asosida',
  },
  {
    label: 'Hisobdorlik',
    value: 'Oylik',
  },
];

/** Everything a person needs before putting money in. None of it is published. */
const pendingTerms = [
  'Minimal miqdor',
  'Sarmoya muddati',
  'Foyda mexanizmi',
  'Shartnoma turi',
  'To‘lov va komissiyalar',
  'Pul yechish shartlari',
  'Risk haqida ogohlantirish',
];

/**
 * Investment section — deliberately understated.
 *
 * TRUST RULES ENFORCED HERE:
 *  • no return, ROI, rate, percentage or "oylik foyda" is stated or implied;
 *  • no guaranteed profit, fixed income, risk rating or recommendation;
 *  • the three-step diagram is presented as Markab's *published description*
 *    of the model, with that attribution visible next to it;
 *  • anything not published renders as an explicit pending row;
 *  • there is no duration, minimum or term claim of any kind.
 */
export async function InvestSection() {
  const content = await repository.getSiteContent();
  const investorFlow =
    content.status === 'success'
      ? content.data.investorFlow
      : { title: '', steps: [] as string[], cta: '' };

  return (
    <section
      aria-labelledby="invest-heading"
      className="bg-surface-sunken section-y dot-pattern"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            <SectionHeading
              id="invest-heading"
              eyebrow="Sarmoya"
              title="Shaffof tamoyillarga asoslangan sarmoya."
              description="Markab’ning sarmoya yo‘nalishi — e’lon qilingan model, ochiq hisobdorlik va rasmiy hujjatlar bilan."
            />

            <div className="mt-9">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">
                  E’lon qilingan uch bosqich
                </p>
                <Badge tone="pending">Tasdiqlanmagan</Badge>
              </div>

              <ol className="mt-5 grid gap-4 sm:grid-cols-3">
                {investorFlow.steps.map((step, index) => (
                  <li
                    key={step}
                    className="relative rounded-card border border-line bg-surface p-5 shadow-subtle"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700 ring-1 ring-inset ring-brand-100">
                      {index + 1}
                    </span>
                    <p className="mt-3 text-[15px] font-medium leading-snug text-ink-900">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>

              <p className="mt-4 text-caption leading-relaxed text-ink-500">
                Bu sxema markab.uz’da e’lon qilingan tavsifdir. Modelning aniq mexanikasi,
                shartnoma turi va to‘lov tartibi rasmiy hujjatlar bilan tasdiqlanadi.
              </p>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink
                href="/invest"
                size="lg"
                className="hover-only:-translate-y-0.5"
              >
                Sarmoya modeli bilan tanishish
              </ButtonLink>
              <ButtonLink
                href="/contact?type=sarmoya"
                variant="secondary"
                size="lg"
                className="hover-only:-translate-y-0.5"
              >
                Mutaxassis bilan bog‘lanish
              </ButtonLink>
            </div>
          </div>

          <div className="rounded-panel border border-line bg-surface p-7 shadow-panel sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 ring-1 ring-inset ring-brand-100">
                <MarkabStar size={16} tone="brand" />
              </span>
              <h3 className="text-base font-semibold text-ink-900">Asosiy shartlar</h3>
              <Badge tone="pending" className="ml-auto">
                Rasmiy ma’lumot bilan to‘ldiriladi
              </Badge>
            </div>

            <dl className="mt-6 divide-y divide-line">
              {publishedFacts.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 py-4">
                  <dt className="flex items-center gap-2 text-sm text-ink-500">
                    <svg
                      className="h-3.5 w-3.5 text-brand-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.8"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item.label}
                  </dt>
                  <dd className="text-sm font-semibold num text-ink-900">{item.value}</dd>
                </div>
              ))}
              {pendingTerms.map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-4">
                  <dt className="text-sm text-ink-500">{label}</dt>
                  <dd className="max-w-[60%] text-right">
                    <PendingValue label={PENDING_LABEL} />
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-caption leading-relaxed text-ink-400">
              Ushbu bo‘limda hech qanday daromad, foiz, foyda miqdori, muddat, kafolat yoki
              investitsiya tavsiyasi ko‘rsatilmagan. Barcha shartlar rasmiy hujjatlar asosida
              taqdim etiladi.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
