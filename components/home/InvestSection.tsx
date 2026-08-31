import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Container, SectionHeading } from '@/components/ui/Section';
import { investorFlow } from '@/lib/data/fixtures/content';

const publishedTerms = [
  { label: 'Muddat', value: '2 oydan 36 oygacha' },
  { label: 'Foydani yechish', value: 'Istalgan vaqt' },
  { label: 'Hisobdorlik', value: 'Oylik' },
];

const pendingTerms = ['Minimal miqdor', 'Foyda mexanizmi', 'Shartnoma turi'];

/**
 * Investment section — premium but conservative.
 *
 * Published: the model diagram (ulush → oylik foyda → pul yechish/qo‘shish) and
 * the 2–36 month range. Everything else (returns, risk level, contract name,
 * documentation) is NOT published, so it renders as pending official data.
 *
 * No ROI, no annual return, no percentage, no investor statistics, no risk
 * rating and no guarantee appears anywhere in this section.
 */
export function InvestSection() {
  return (
    <section
      aria-labelledby="invest-heading"
      className="relative overflow-hidden bg-surface py-20 sm:py-24 lg:py-28"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <SectionHeading
              id="invest-heading"
              eyebrow="Sarmoya"
              title="Biznesdagi ulush orqali ishtirok etish"
              description="Markab sarmoya modeli real savdo bitimlariga asoslanadi. Model uch bosqichli: biznesdagi ulush, oylik foyda, pul yechish yoki qo‘shish."
            />

            <ol className="mt-10 grid gap-3 sm:grid-cols-3">
              {investorFlow.steps.map((step, index) => (
                <li key={step} className="relative rounded-xl border border-line bg-surface-muted p-5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">
                    {index + 1}
                  </span>
                  <p className="mt-3.5 text-sm font-medium text-ink-900">{step}</p>
                  {index < investorFlow.steps.length - 1 ? (
                    <svg
                      className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-ink-300 sm:block"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </li>
              ))}
            </ol>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/invest"
                className="inline-flex h-[52px] items-center justify-center rounded-xl bg-ink-900 px-7 text-[0.9375rem] font-semibold text-white transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:bg-ink-800"
              >
                Sarmoya modeli bilan tanishish
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-[52px] items-center justify-center rounded-xl border border-line-strong px-7 text-[0.9375rem] font-semibold text-ink-900 transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:border-ink-300 hover:bg-surface-muted"
              >
                Menejer bilan bog‘lanish
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface-muted p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-semibold text-ink-900">Asosiy shartlar</h3>
              <Badge tone="pending">Rasmiy ma’lumot bilan to‘ldiriladi</Badge>
            </div>

            <dl className="mt-6 divide-y divide-line">
              {publishedTerms.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 py-3.5">
                  <dt className="text-sm text-ink-500">{item.label}</dt>
                  <dd className="text-sm font-semibold text-ink-900">{item.value}</dd>
                </div>
              ))}
              {pendingTerms.map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-3.5">
                  <dt className="text-sm text-ink-500">{label}</dt>
                  <dd className="text-right text-sm text-ink-400">
                    Rasmiy ma’lumot bilan to‘ldiriladi
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-xs leading-relaxed text-ink-400">
              Ushbu bo‘limda hech qanday daromad foizi, kafolat, xavf darajasi yoki investitsiya
              tavsiyasi ko‘rsatilmagan. Barcha moliyaviy ko‘rsatkichlar rasmiy hujjatlar asosida
              to‘ldiriladi.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
