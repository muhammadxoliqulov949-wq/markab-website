'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatUzs } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import type { FinancingSubject } from '@/lib/financing/handoff';
import { subjectKindLabel } from '@/lib/financing/handoff';

/**
 * Interactive financing calculator — INTERFACE ONLY, BY DESIGN.
 *
 * Markab's official financing formula is not published, so this component
 * computes NOTHING financial. There is no interest rate, no markup, no
 * amortisation, no total repayment and no approval estimate anywhere in it.
 *
 * What it does compute is one piece of ordinary arithmetic the visitor asked
 * for:
 *
 *     remaining = product price − initial payment
 *
 * …and it is labelled as exactly that. Everything a visitor would recognise as
 * a financing result — monthly payment, total payment, contract type — renders
 * as an explicit pending state quoting the integration message.
 *
 * The result panel is already shaped for the official values: when a formula
 * is supplied, the pending rows are replaced with real ones and nothing else
 * about this layout needs to change.
 */

const MIN_TERM = 2;
const MAX_TERM = 36;
const DOWN_PRESETS = [0, 10, 20, 30, 50];

export function InstallmentCalculator({
  initialPrice = 120_000_000,
  subject = null,
}: {
  initialPrice?: number;
  /** Item handed over from /cars or /electronics, resolved by the repository. */
  subject?: FinancingSubject | null;
}) {
  const [price, setPrice] = useState(subject?.priceUzs ?? initialPrice);
  const [down, setDown] = useState(() => Math.round((subject?.priceUzs ?? initialPrice) * 0.2));
  const [term, setTerm] = useState(24);

  // ---- the only arithmetic in this component -------------------------------
  const remaining = useMemo(() => Math.max(price - down, 0), [price, down]);
  const downPercent = useMemo(() => (price > 0 ? Math.round((down / price) * 100) : 0), [down, price]);
  // -------------------------------------------------------------------------

  const downExceedsPrice = price > 0 && down > price;

  const applyPreset = (percent: number) => setDown(Math.round((price * percent) / 100));

  return (
    <div className="grid gap-6 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-8 lg:p-8">
      {/* ---------------------------- INPUTS ---------------------------- */}
      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-ink-900">Hisob-kitob parametrlari</h2>
          <Badge tone="pending">Rasmiy formula kutilmoqda</Badge>
        </div>

        {subject ? (
          <div className="rounded-xl border border-line bg-surface-muted p-4">
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                  {subjectKindLabel(subject.kind)}
                </p>
                <p className="mt-1 text-sm font-semibold leading-snug text-ink-900">{subject.title}</p>
                <p className="mt-0.5 text-sm text-ink-600">{formatUzs(subject.priceUzs)}</p>
              </div>
              <Link
                href="/financing/calculator"
                className="shrink-0 text-xs font-medium text-brand-700 underline underline-offset-4 hover:text-brand-800"
              >
                O‘zgartirish
              </Link>
            </div>
          </div>
        ) : null}

        <div>
          <label htmlFor="calc-price" className="text-sm font-medium text-ink-700">
            Mahsulot narxi
          </label>
          <input
            id="calc-price"
            type="number"
            min={0}
            step={1_000_000}
            value={price}
            onChange={(event) => setPrice(Math.max(0, Number(event.target.value) || 0))}
            aria-describedby="calc-price-hint"
            className="mt-1.5 w-full rounded-lg border border-line-strong bg-white px-3.5 py-2.5 text-[0.9375rem] text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            inputMode="numeric"
          />
          <p id="calc-price-hint" className="mt-1.5 text-xs text-ink-400">
            {subject
              ? 'Tanlangan e’lon narxi keltirildi — xohlasangiz o‘zgartiring.'
              : 'Narxni kiriting yoki katalogdan mahsulot tanlab keling.'}
          </p>
        </div>

        <div>
          <label htmlFor="calc-down" className="text-sm font-medium text-ink-700">
            Boshlang‘ich to‘lov
          </label>
          <input
            id="calc-down"
            type="number"
            min={0}
            step={1_000_000}
            value={down}
            onChange={(event) => setDown(Math.max(0, Number(event.target.value) || 0))}
            aria-describedby="calc-down-hint"
            className={`mt-1.5 w-full rounded-lg border bg-white px-3.5 py-2.5 text-[0.9375rem] text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
              downExceedsPrice ? 'border-rose-400 focus:border-rose-500' : 'border-line-strong focus:border-brand-500'
            }`}
            inputMode="numeric"
          />
          <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Boshlang‘ich to‘lov ulushi">
            {DOWN_PRESETS.map((percent) => (
              <button
                key={percent}
                type="button"
                onClick={() => applyPreset(percent)}
                className="inline-flex min-h-[36px] min-w-[44px] items-center justify-center rounded-lg border border-line bg-surface px-3 text-xs font-medium text-ink-700 transition-colors hover:border-line-strong hover:bg-surface-sunken"
              >
                {percent}%
              </button>
            ))}
          </div>
          <p id="calc-down-hint" className="mt-2 text-xs text-ink-400">
            {price > 0
              ? `Narxning ${downPercent}% ini tashkil qiladi.`
              : 'Narx kiritilgach ulush ko‘rsatiladi.'}
          </p>
          {downExceedsPrice ? (
            <p className="mt-1 text-xs text-rose-700">
              Boshlang‘ich to‘lov narxdan katta. Bu shunchaki kiritilgan qiymat — hech qanday moliyaviy
              natija hisoblanmaydi.
            </p>
          ) : null}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="calc-term" className="text-sm font-medium text-ink-700">
              So‘ralayotgan muddat
            </label>
            <span className="text-sm font-semibold text-brand-700">{term} oy</span>
          </div>
          <input
            id="calc-term"
            type="range"
            min={MIN_TERM}
            max={MAX_TERM}
            step={1}
            value={term}
            onChange={(event) => setTerm(Number(event.target.value))}
            aria-describedby="calc-term-hint"
            className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-sunken accent-brand-700"
          />
          <div className="mt-2 flex justify-between text-xs text-ink-400">
            <span>{MIN_TERM} oy</span>
            <span>{MAX_TERM} oy</span>
          </div>
          <p id="calc-term-hint" className="mt-2 text-xs leading-relaxed text-ink-400">
            Bu sizning so‘rovingiz, Markab taklif qiladigan muddatlar emas. Mavjud muddat oralig‘i
            rasmiy manbada e’lon qilingach ko‘rsatiladi.
          </p>
        </div>
      </div>

      {/* ---------------------------- RESULT ---------------------------- */}
      <div id="result-panel" className="flex min-w-0 flex-col rounded-xl bg-surface-muted p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-ink-900">Natija</h2>

        {/* Group 1 — what the visitor typed, plus one labelled subtraction */}
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
          Siz kiritgan ma’lumotlar
        </p>
        <dl className="mt-3 space-y-3">
          <ResultRow label="Mahsulot narxi" value={formatUzs(price)} />
          <ResultRow label="Boshlang‘ich to‘lov" value={formatUzs(down)} />
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-400">
              Moliyalashtiriladigan qoldiq
            </dt>
            <dd className="mt-1 text-lg font-semibold text-ink-900">{formatUzs(remaining)}</dd>
            <p className="mt-1 text-xs leading-relaxed text-ink-400">
              Oddiy arifmetika: narx − boshlang‘ich to‘lov. Bu rasmiy moliyalashtirish hisobi
              emas — ustama, komissiya va boshqa shartlar kiritilmagan.
            </p>
          </div>
          <ResultRow label="So‘ralayotgan muddat" value={`${term} oy`} />
        </dl>

        {/* Group 2 — the part only an official formula can fill */}
        <div className="mt-5 rounded-xl border border-dashed border-line-strong bg-surface p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
            Rasmiy hisob-kitob
          </p>
          <dl className="mt-3 space-y-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-400">Oylik to‘lov</dt>
              <dd className="mt-1 text-sm font-medium text-ink-500">
                Rasmiy hisoblash formulasi kutilmoqda.
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-400">Jami to‘lov</dt>
              <dd className="mt-1 text-sm font-medium text-ink-500">
                Rasmiy hisoblash formulasi kutilmoqda.
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-400">Shartnoma turi</dt>
              <dd className="mt-1 text-sm font-medium text-ink-500">
                Rasmiy ma’lumot kutilmoqda.
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-ink-400">
            Aniq oylik to‘lov Markabning rasmiy hisoblash formulasi integratsiya qilingach
            ko‘rsatiladi. Hech qanday foiz, ustama yoki komissiya bu yerda taxmin qilinmaydi.
          </p>
        </div>

        {/* Group 3 — the one financing figure that may be shown: the published one */}
        {subject?.publishedMonthlyUzs ? (
          <div className="mt-5 rounded-xl border border-line bg-surface p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
              E’londa ko‘rsatilgan qiymat
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink-900">
              {formatUzs(subject.publishedMonthlyUzs)}
              <span className="ml-1 text-sm font-normal text-ink-500">/ oy</span>
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-400">
              Bu hisoblab chiqarilgan natija emas — e’londa chop etilgan oylik to‘lov keltirildi.
              Muddat, boshlang‘ich to‘lov va shartnoma turi shu e’londa ko‘rsatilmagan.
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-2">
          <ButtonLink href={subject ? `/financing/apply?type=${subject.kind}&ref=${subject.ref}` : '/financing/apply'} fullWidth>
            Ariza yuborish
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary" fullWidth>
            Menejer bilan bog‘lanish
          </ButtonLink>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink-400">
          Bu prototip hisob-kitobi rasmiy taklif emas. Yakuniy shartlar shartnomada va rasmiy
          Markab jarayoni asosida belgilanadi.{' '}
          <Link href="/faq" className="text-brand-700 underline underline-offset-2">
            Savol-javoblar
          </Link>
        </p>
      </div>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-xs uppercase tracking-wide text-ink-400">{label}</dt>
      <dd className="text-sm font-semibold text-ink-900">{value}</dd>
    </div>
  );
}
