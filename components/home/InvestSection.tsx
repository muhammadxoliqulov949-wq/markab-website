import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Container, SectionHeading } from '@/components/ui/Section';
import { PendingValue } from '@/components/ui/StateBlock';
import { investorFlow } from '@/lib/data/fixtures/content';

/**
 * Verified from markab.uz and shown as published — nothing else.
 * Even this single row is attributed, because "e'lon qilingan" is not the same
 * thing as "contractually confirmed".
 */
const publishedTerms = [{ label: 'Muddat', value: '2 oydan 36 oygacha' }];

/**
 * Everything a person would need before putting money in. None of it is
 * published, so none of it is guessed — each row states that it is pending.
 */
const pendingTerms = [
  'Minimal miqdor',
  'Foyda mexanikasi',
  'Shartnoma turi',
  'Hisobdorlik tartibi',
  'Pul yechish shartlari',
  'Xavf haqida ogohlantirish',
];

/**
 * Investment section — deliberately understated.
 *
 * TRUST RULES ENFORCED HERE (Phase 1 visual pass):
 *  • no return, ROI, rate, percentage or "oylik foyda" is stated or implied;
 *  • no guaranteed profit, fixed income, risk rating or recommendation;
 *  • the three-step diagram is presented as Markab's *published description*
 *    of the model, with that attribution visible next to it;
 *  • anything not published renders as an explicit pending row.
 *
 * The only confirmed figure on this block is the published 2–36 month range.
 */
export function InvestSection() {
  return (
    <section
      aria-labelledby="invest-heading"
      className="bg-surface-muted py-12 sm:py-14 lg:py-16"
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
                href="/contact"
                className="inline-flex h-[52px] items-center justify-center rounded-xl border border-line-strong bg-surface px-7 text-[0.9375rem] font-semibold text-ink-900 transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:border-ink-300 hover:bg-surface-muted"
              >
                Menejer bilan bog‘lanish
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-[0.9375rem] font-semibold text-ink-900">Asosiy shartlar</h3>
              <Badge tone="pending">Rasmiy ma’lumot bilan to‘ldiriladi</Badge>
            </div>

            <dl className="mt-5 divide-y divide-line">
              {publishedTerms.map((item) => (
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
                    <PendingValue />
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-xs leading-relaxed text-ink-400">
              Ushbu bo‘limda hech qanday daromad, foiz, foyda miqdori, kafolat, xavf darajasi
              yoki investitsiya tavsiyasi ko‘rsatilmagan. Barcha moliyaviy ko‘rsatkichlar rasmiy
              hujjatlar asosida to‘ldiriladi.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
