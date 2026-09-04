import Link from 'next/link';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { PendingValue } from '@/components/ui/StateBlock';
import { formatUzs } from '@/lib/format';
import { MarkabStar } from '@/components/ui/MarkabStar';

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
      className="relative overflow-hidden bg-surface section-y"
    >
      <div
        className="pointer-events-none absolute -right-40 top-20 h-[30rem] w-[30rem] rounded-full bg-brand-50/60 blur-3xl"
        aria-hidden="true"
      />
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
                    strokeWidth="1.7"
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
              <ButtonLink
                href="/financing/calculator"
                size="lg"
                className="hover-only:-translate-y-0.5"
              >
                Hisob-kitobni ko‘rish
              </ButtonLink>
              <ButtonLink
                href="/financing"
                variant="secondary"
                size="lg"
                className="hover-only:-translate-y-0.5"
              >
                Jarayon bilan tanishish
              </ButtonLink>
            </div>
          </div>

          {/* RIGHT — the calculator interface. */}
          <div className="relative overflow-hidden rounded-panel bg-gradient-to-br from-ink-800 to-ink-900 p-7 shadow-lift ring-1 ring-white/10 sm:p-8">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/20 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-inset ring-white/10">
                  <MarkabStar size={16} tone="white" />
                </span>
                <h3 className="text-base font-semibold text-white">To‘lov kalkulyatori</h3>
              </div>
              <Badge tone="pending" className="border-white/20 bg-white/5 text-white/65">
                Namuna
              </Badge>
            </div>

            {/* One description list per pair, not one around the whole panel:
                a <div> inside a <dl> may hold only <dt>/<dd>, and these rows
                also carry a slider, sample chips and explanatory notes. */}
            <div className="mt-6 space-y-5">
              <dl>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-white/60">
                  Mahsulot narxi
                </dt>
                <dd className="mt-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[1.0625rem] font-semibold text-white">
                  {formatUzs(SAMPLE.price)}
                </dd>
              </dl>

              <div>
                <dl className="flex items-baseline justify-between">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-white/60">
                    Boshlang‘ich to‘lov
                  </dt>
                  <dd className="text-sm font-semibold text-brand-200">{SAMPLE.downPercent}%</dd>
                </dl>
                <div className="mt-2.5 h-1.5 w-full rounded-full bg-white/10" aria-hidden="true">
                  <div
                    className="h-1.5 rounded-full bg-brand-400"
                    style={{ width: `${(SAMPLE.downPercent / 40) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-[1.0625rem] font-semibold text-white">
                  {formatUzs(downPayment)}
                </p>
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
                <dl className="flex items-baseline justify-between">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-white/60">Muddat</dt>
                  <dd className="text-sm font-semibold text-brand-200">{SAMPLE.termMonths} oy</dd>
                </dl>
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
                <dl className="flex items-baseline justify-between gap-4">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-white/60">
                    Oylik to‘lov
                  </dt>
                  <dd className="text-right text-xs">
                    <PendingValue
                      label="Hisob-kitob ma’lumoti rasmiy formula ulangach ko‘rsatiladi"
                      className="text-white/70"
                    />
                  </dd>
                </dl>
                <dl className="flex items-baseline justify-between gap-4 border-t border-white/10 pt-3">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-white/60">
                    Jami to‘lov
                  </dt>
                  <dd className="text-right text-xs">
                    <PendingValue
                      label="Hisob-kitob ma’lumoti rasmiy formula ulangach ko‘rsatiladi"
                      className="text-white/70"
                    />
                  </dd>
                </dl>
              </div>
            </div>

            <p className="mt-5 text-xs leading-relaxed text-white/60">
              Bu yerda hech qanday oylik to‘lov hisoblanmaydi. Hisob-kitob funksiyasi rasmiy
              formula ulangach faollashadi — shartlar shartnomada belgilanadi.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
