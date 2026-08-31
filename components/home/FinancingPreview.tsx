import { ButtonLink } from '@/components/ui/Button';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { PendingValue } from '@/components/ui/StateBlock';
import { formatUzs } from '@/lib/format';

/** Sample values for the static preview — clearly labelled as a sample. */
const SAMPLE = {
  price: 120_000_000,
  downPercent: 20,
  termMonths: 24,
};

/**
 * Financing / calculator preview.
 *
 * The homepage answers "qancha to‘layman?" without pretending to answer it:
 * the panel shows the real interface shape with sample inputs, while the result
 * area states plainly that the official calculation is not connected yet.
 *
 * Deliberately static (no client-side JS): the interactive calculator lives on
 * /financing/calculator, where it belongs.
 */
export function FinancingPreview() {
  const downPayment = Math.round((SAMPLE.price * SAMPLE.downPercent) / 100);

  return (
    <section
      aria-labelledby="financing-preview-heading"
      className="bg-ink-900 py-16 text-white sm:py-20 lg:py-24"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <div>
            <SectionHeading
              id="financing-preview-heading"
              eyebrow="Moliyalashtirish"
              title="Qancha to‘layman?"
              description="Narx, boshlang‘ich to‘lov va muddatni tanlang — qulay variantni shu yerda ko‘rib chiqing."
              tone="dark"
            />

            <ul className="mt-8 space-y-3">
              {[
                'Muddat: 2 oydan 36 oygacha',
                'Shartnoma: taqsit yoki murabaha',
                'Boshlang‘ich to‘lov va muddat o‘zingizga qulay holda tanlanadi',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/75">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-brand-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href="/financing/calculator"
                size="lg"
                className="bg-white text-ink-900 hover:bg-white/90"
              >
                Hisob-kitobni ko‘rish
              </ButtonLink>
              <ButtonLink
                href="/financing"
                variant="secondary"
                size="lg"
                className="border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/5"
              >
                Moliyalashtirish qanday ishlaydi?
              </ButtonLink>
            </div>
          </div>

          {/* Static preview of the calculator interface. */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-semibold text-white">To‘lov kalkulyatori</h3>
              <Badge tone="pending" className="border-white/20 bg-white/5 text-white/60">
                Namuna
              </Badge>
            </div>

            <dl className="mt-6 space-y-5">
              <div>
                <dt className="text-xs uppercase tracking-wide text-white/50">Mahsulot narxi</dt>
                <dd className="mt-2 rounded-lg border border-white/10 bg-ink-800/60 px-4 py-3 text-sm font-semibold text-white">
                  {formatUzs(SAMPLE.price)}
                </dd>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <dt className="text-xs uppercase tracking-wide text-white/50">
                    Boshlang‘ich to‘lov
                  </dt>
                  <span className="text-xs font-semibold text-brand-200">
                    {SAMPLE.downPercent}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/10" aria-hidden="true">
                  <div className="h-1.5 rounded-full bg-brand-400" style={{ width: `${(SAMPLE.downPercent / 60) * 100}%` }} />
                </div>
                <dd className="mt-2 text-sm font-semibold text-white">{formatUzs(downPayment)}</dd>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <dt className="text-xs uppercase tracking-wide text-white/50">Muddat</dt>
                  <span className="text-xs font-semibold text-brand-200">{SAMPLE.termMonths} oy</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/10" aria-hidden="true">
                  <div
                    className="h-1.5 rounded-full bg-brand-400"
                    style={{ width: `${((SAMPLE.termMonths - 2) / 34) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-xl bg-ink-900/60 p-4">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/50">Oylik to‘lov</dt>
                  <dd className="mt-1.5">
                    <PendingValue label="Hisob-kitob ma’lumoti tayyorlanmoqda" />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/50">Jami to‘lov</dt>
                  <dd className="mt-1.5">
                    <PendingValue label="Hisob-kitob ma’lumoti tayyorlanmoqda" />
                  </dd>
                </div>
              </div>
            </dl>

            <p className="mt-5 text-xs leading-relaxed text-white/50">
              Hisob-kitob funksiyasi rasmiy formula ulangach faollashadi. Bu yerda hech qanday
              oylik to‘lov hisoblanmaydi — shartlar rasmiy hujjatlar asosida shakllanadi.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
