import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Container, SectionHeading } from '@/components/ui/Section';
import { investorFlow } from '@/lib/data/fixtures/content';

const publishedTerms = [
  { label: 'Muddat', value: '2 oydan 36 oygacha' },
  { label: 'Foydani yechish', value: 'Istalgan vaqt' },
  { label: 'Hisobdorlik', value: 'Oylik' },
];

const pendingTerms = ['Minimal miqdor', 'Foyda mexanizmi', 'Shartnoma turi'];

/**
 * Investment section — conservative by design.
 *
 * Published: the model diagram (ulush → oylik foyda → pul yechish/qo‘shish) and
 * the 2–36 month range. Everything else (returns, risk level, contract name,
 * documentation) is NOT published, so it renders as pending official data.
 * No ROI, no annual return, no percentage, no customer earnings, no risk rating
 * appears anywhere in this section.
 */
export function InvestSection() {
  return (
    <section
      aria-labelledby="invest-heading"
      className="bg-ink-900 py-16 text-white sm:py-20 lg:py-24"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <SectionHeading
              id="invest-heading"
              eyebrow="Sarmoya"
              title="Biznesdagi ulush orqali ishtirok etish"
              description="Markab sarmoya modeli real savdo bitimlariga asoslanadi. Model uch bosqichli: biznesdagi ulush, oylik foyda, pul yechish yoki qo‘shish."
              tone="dark"
            />

            <ol className="mt-8 space-y-3">
              {investorFlow.steps.map((step, index) => (
                <li
                  key={step}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-700/30 text-sm font-semibold text-brand-200">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-white/90">{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink
                href="/invest"
                size="lg"
                className="bg-white text-ink-900 hover:bg-white/90"
              >
                Sarmoya modeli bilan tanishish
              </ButtonLink>
              <ButtonLink
                href="/contact"
                variant="secondary"
                size="lg"
                className="border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/5"
              >
                Menejer bilan bog‘lanish
              </ButtonLink>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-semibold text-white">Asosiy shartlar</h3>
              <Badge tone="pending" className="border-white/20 bg-white/5 text-white/60">
                Rasmiy ma’lumot bilan to‘ldiriladi
              </Badge>
            </div>

            <dl className="mt-6 divide-y divide-white/10">
              {publishedTerms.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 py-3.5">
                  <dt className="text-sm text-white/60">{item.label}</dt>
                  <dd className="text-sm font-medium text-white">{item.value}</dd>
                </div>
              ))}
              {pendingTerms.map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-3.5">
                  <dt className="text-sm text-white/60">{label}</dt>
                  <dd className="text-right text-sm text-white/45">
                    Rasmiy ma’lumot bilan to‘ldiriladi
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-xs leading-relaxed text-white/45">
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
