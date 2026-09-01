import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Container, SectionHeading } from '@/components/ui/Section';
import { PendingValue } from '@/components/ui/StateBlock';
import { investorFlow } from '@/lib/data/fixtures/content';
import { PENDING_LABEL } from '@/lib/investment/status';

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
export function InvestSection() {
  return (
    <section
      aria-labelledby="invest-heading"
      className="bg-surface-muted section-y"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div>
            <SectionHeading
              id="invest-heading"
              eyebrow="Sarmoya"
              title="Sarmoya imkoniyatlari"
              description="Markab’ning sarmoya yo‘nalishi haqida ma’lumot oling: model qanday tavsiflanadi, qaysi shartlar e’lon qilingan va qaysi ma’lumotlar hali rasmiy tasdiqlanishi kerak."
            />

            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                  Markab tomonidan e’lon qilingan model tavsifi
                </p>
                <Badge tone="pending">Tasdiqlanmagan</Badge>
              </div>

              <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                {investorFlow.steps.map((step, index) => (
                  <li
                    key={step}
                    className="relative rounded-xl border border-line bg-surface p-5"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">
                      {index + 1}
                    </span>
                    <p className="mt-3 text-sm font-medium text-ink-900">{step}</p>
                    {index < investorFlow.steps.length - 1 ? (
                      <svg
                        className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-ink-300 sm:block"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 12h14M13 6l6 6-6 6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </li>
                ))}
              </ol>

              <p className="mt-4 text-xs leading-relaxed text-ink-500">
                Bu sxema markab.uz’da e’lon qilingan tavsifdir. Modelning aniq mexanikasi,
                shartnoma turi va to‘lov tartibi rasmiy hujjatlar bilan tasdiqlanadi.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/invest"
                className="inline-flex h-[52px] items-center justify-center rounded-xl bg-brand-700 px-7 text-[0.9375rem] font-semibold text-white transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:bg-brand-800"
              >
                Sarmoya modeli bilan tanishish
              </Link>
              <Link
                href="/contact?type=sarmoya"
                className="inline-flex h-[52px] items-center justify-center rounded-xl border border-line-strong bg-surface px-7 text-[0.9375rem] font-semibold text-ink-900 transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:border-ink-300 hover:bg-surface-muted"
              >
                Mutaxassis bilan bog‘lanish
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-semibold text-ink-900">Asosiy shartlar</h3>
              <Badge tone="pending">Rasmiy ma’lumot bilan to‘ldiriladi</Badge>
            </div>

            <dl className="mt-5 divide-y divide-line">
              {publishedFacts.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 py-3.5">
                  <dt className="text-sm text-ink-500">
                    {item.label}
                    <span className="ml-2 text-[11px] uppercase tracking-[0.12em] text-brand-600">
                      e’lon qilingan
                    </span>
                  </dt>
                  <dd className="text-sm font-semibold text-ink-900">{item.value}</dd>
                </div>
              ))}
              {pendingTerms.map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-3.5">
                  <dt className="text-sm text-ink-500">{label}</dt>
                  <dd className="max-w-[60%] text-right">
                    <PendingValue label={PENDING_LABEL} />
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-xs leading-relaxed text-ink-400">
              Ushbu bo‘limda hech qanday daromad, foiz, foyda miqdori, muddat, kafolat, xavf
              darajasi yoki investitsiya tavsiyasi ko‘rsatilmagan. Barcha moliyaviy
              ko‘rsatkichlar rasmiy hujjatlar asosida to‘ldiriladi.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
