import Link from 'next/link';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { PendingValue } from '@/components/ui/StateBlock';
import { formatUzs } from '@/lib/format';

/**
 * Sample INPUTS for the preview — labelled as a sample, never as a result.
 *
 * `TERM_OPTIONS` are placeholder chips that show what the control will look
 * like. They are NOT Markab's offered durations: the real range is not
 * published, and the note under the chips says so.
 */
const SAMPLE = { price: 120_000_000, downPercent: 20, termMonths: 24 };
const DOWN_OPTIONS = [0, 10, 20, 30, 40];
const TERM_OPTIONS = [12, 18, 24, 30, 36];

/**
 * Financing / calculator preview.
 *
 * Two columns on desktop: the explanation on the left, a calculator-style
 * interface on the right. The section itself stays light so the page keeps a
 * calm rhythm — the calculator earns its weight by being the only dark panel
 * in the block, not by darkening the whole band.
 *
 * Answers "qancha to‘layman?" honestly: the interface is real, the result is
 * not — Markab's calculation is not published, so the result area states
 * exactly what is missing instead of showing an invented monthly payment.
 *
 * Deliberately static: the interactive calculator belongs on
 * /financing/calculator, which keeps the homepage free of extra client JS.
 */
export function FinancingPreview() {
  const downPayment = Math.round((SAMPLE.price * SAMPLE.downPercent) / 100);

  return (
    <section
      aria-labelledby="financing-preview-heading"
      className="bg-surface py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          {/* LEFT — explanation and process. */}
          <div>
            <SectionHeading
              id="financing-preview-heading"
              eyebrow="Moliyalashtirish"
              title="Qancha to‘layman?"
              description="Narx, boshlang‘ich to‘lov va muddatni belgilang — to‘lov rejasi shu yerda shakllanadi."
            />

            <ul className="mt-7 space-y-3">
              {[
                'Shartnoma: taqsit yoki murabaha',
                'Boshlang‘ich to‘lov miqdori o‘zingizga qulay holda tanlanadi',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[0.9375rem] text-ink-600">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
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
              <Link
                href="/financing/calculator"
                className="inline-flex h-[52px] items-center justify-center rounded-xl bg-brand-700 px-7 text-[0.9375rem] font-semibold text-white transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:bg-brand-800"
              >
                Hisob-kitobni ko‘rish
              </Link>
              <Link
                href="/financing"
                className="inline-flex h-[52px] items-center justify-center rounded-xl border border-line-strong bg-surface px-7 text-[0.9375rem] font-semibold text-ink-900 transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:border-ink-300 hover:bg-surface-muted"
              >
                Moliyalashtirish qanday ishlaydi?
              </Link>
            </div>
          </div>

          {/* RIGHT — the calculator interface. */}
          <div className="overflow-hidden rounded-2xl bg-ink-900 p-6 shadow-lift sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-[0.9375rem] font-semibold text-white">To‘lov kalkulyatori</h3>
              <Badge tone="pending" className="border-white/20 bg-white/5 text-white/65">
                Namuna
              </Badge>
            </div>

            <dl className="mt-6 space-y-5">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                  Mahsulot narxi
                </dt>
                <dd className="mt-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[1.0625rem] font-semibold text-white">
                  {formatUzs(SAMPLE.price)}
                </dd>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                    Boshlang‘ich to‘lov
                  </dt>
                  <span className="text-sm font-semibold text-brand-200">{SAMPLE.downPercent}%</span>
                </div>
                <div className="mt-2.5 h-1.5 w-full rounded-full bg-white/10" aria-hidden="true">
                  <div
                    className="h-1.5 rounded-full bg-brand-400"
                    style={{ width: `${(SAMPLE.downPercent / 40) * 100}%` }}
                  />
                </div>
                <dd className="mt-2 text-[1.0625rem] font-semibold text-white">
                  {formatUzs(downPayment)}
                </dd>
                <div className="mt-3 flex flex-wrap gap-2">
                  {DOWN_OPTIONS.map((option) => (
                    <span
                      key={option}
                      className={[
                        'rounded-lg border px-3 py-1.5 text-xs',
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
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-white/45">Muddat</dt>
                  <span className="text-sm font-semibold text-brand-200">{SAMPLE.termMonths} oy</span>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
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
                <p className="mt-2 text-[11px] leading-relaxed text-white/60">
                  Namuna tanlovlar — Markab taklif qiladigan muddatlar emas.
                </p>
              </div>

              {/* Result area — honest: nothing is computed here. */}
              <div className="space-y-3 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                    Oylik to‘lov
                  </dt>
                  <dd className="text-right text-xs">
                    <PendingValue
                      label="Hisob-kitob ma’lumoti rasmiy formula ulangach ko‘rsatiladi"
                      className="text-white/70"
                    />
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-t border-white/10 pt-3">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                    Jami to‘lov
                  </dt>
                  <dd className="text-right text-xs">
                    <PendingValue
                      label="Hisob-kitob ma’lumoti rasmiy formula ulangach ko‘rsatiladi"
                      className="text-white/70"
                    />
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
