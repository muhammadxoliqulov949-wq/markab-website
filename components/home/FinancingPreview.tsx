import Link from 'next/link';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { PendingValue } from '@/components/ui/StateBlock';
import { formatUzs } from '@/lib/format';

/** Sample values for the preview — labelled as a sample, never as a result. */
const SAMPLE = { price: 120_000_000, downPercent: 20, termMonths: 24 };
const DOWN_OPTIONS = [0, 10, 20, 30, 40];
const TERM_OPTIONS = [12, 18, 24, 30, 36];

/**
 * Financing / calculator preview.
 *
 * Answers "qancha to‘layman?" honestly: the interface is real, the result is not
 * — Markab's calculation is not published, so the result area states exactly
 * what is missing instead of showing an invented monthly payment.
 *
 * Deliberately static: the interactive calculator belongs on
 * /financing/calculator, which keeps the homepage free of extra client JS.
 */
export function FinancingPreview() {
  const downPayment = Math.round((SAMPLE.price * SAMPLE.downPercent) / 100);

  return (
    <section
      aria-labelledby="financing-preview-heading"
      className="relative overflow-hidden bg-ink-900 py-20 text-white sm:py-24 lg:py-28"
    >
      <div className="vignette pointer-events-none absolute inset-0" aria-hidden="true" />

      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
          <div>
            <SectionHeading
              id="financing-preview-heading"
              eyebrow="Moliyalashtirish"
              title="Qancha to‘layman?"
              description="Narx, boshlang‘ich to‘lov va muddatni belgilang — to‘lov rejasi shu yerda shakllanadi."
              tone="dark"
            />

            <ul className="mt-8 space-y-3.5">
              {[
                'Muddat: 2 oydan 36 oygacha',
                'Shartnoma: taqsit yoki murabaha',
                'Boshlang‘ich to‘lov miqdori o‘zingizga qulay holda tanlanadi',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/70">
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

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/financing/calculator"
                className="inline-flex h-[52px] items-center justify-center rounded-xl bg-white px-7 text-[0.9375rem] font-semibold text-ink-900 transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:bg-white/90"
              >
                Hisob-kitobni ko‘rish
              </Link>
              <Link
                href="/financing"
                className="inline-flex h-[52px] items-center justify-center rounded-xl border border-white/25 px-7 text-[0.9375rem] font-semibold text-white transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/10"
              >
                Moliyalashtirish qanday ishlaydi?
              </Link>
            </div>
          </div>

          {/* Calculator interface preview */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-semibold text-white">To‘lov kalkulyatori</h3>
              <Badge tone="pending" className="border-white/20 bg-white/5 text-white/60">
                Namuna
              </Badge>
            </div>

            <dl className="mt-7 space-y-6">
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-white/45">Mahsulot narxi</dt>
                <dd className="mt-2.5 rounded-xl border border-white/10 bg-ink-800/70 px-4 py-3.5 text-lg font-semibold text-white">
                  {formatUzs(SAMPLE.price)}
                </dd>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-xs uppercase tracking-[0.14em] text-white/45">
                    Boshlang‘ich to‘lov
                  </dt>
                  <span className="text-sm font-semibold text-brand-200">{SAMPLE.downPercent}%</span>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-white/10" aria-hidden="true">
                  <div
                    className="h-1.5 rounded-full bg-brand-400"
                    style={{ width: `${(SAMPLE.downPercent / 40) * 100}%` }}
                  />
                </div>
                <dd className="mt-2.5 text-lg font-semibold text-white">
                  {formatUzs(downPayment)}
                </dd>
                <div className="mt-3 flex flex-wrap gap-2">
                  {DOWN_OPTIONS.map((option) => (
                    <span
                      key={option}
                      className={[
                        'rounded-lg border px-2.5 py-1 text-xs',
                        option === SAMPLE.downPercent
                          ? 'border-brand-300/60 bg-brand-500/15 text-brand-100'
                          : 'border-white/10 text-white/50',
                      ].join(' ')}
                    >
                      {option}%
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-xs uppercase tracking-[0.14em] text-white/45">Muddat</dt>
                  <span className="text-sm font-semibold text-brand-200">{SAMPLE.termMonths} oy</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TERM_OPTIONS.map((months) => (
                    <span
                      key={months}
                      className={[
                        'rounded-lg border px-3 py-1.5 text-xs',
                        months === SAMPLE.termMonths
                          ? 'border-brand-300/60 bg-brand-500/15 text-brand-100'
                          : 'border-white/10 text-white/50',
                      ].join(' ')}
                    >
                      {months} oy
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-white/15 bg-ink-900/50 p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-xs uppercase tracking-[0.14em] text-white/45">Oylik to‘lov</dt>
                  <dd className="text-sm text-white/50">
                    <PendingValue label="Hisob-kitob ma’lumoti rasmiy formula ulangach ko‘rsatiladi" />
                  </dd>
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-white/10 pt-4">
                  <dt className="text-xs uppercase tracking-[0.14em] text-white/45">Jami to‘lov</dt>
                  <dd className="text-sm text-white/50">
                    <PendingValue label="Hisob-kitob ma’lumoti rasmiy formula ulangach ko‘rsatiladi" />
                  </dd>
                </div>
              </div>
            </dl>

            <p className="mt-5 text-xs leading-relaxed text-white/45">
              Bu yerda hech qanday oylik to‘lov hisoblanmaydi. Hisob-kitob funksiyasi rasmiy
              formula ulangach faollashadi — shartlar shartnomada belgilanadi.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
