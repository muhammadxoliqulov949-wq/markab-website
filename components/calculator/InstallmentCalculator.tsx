'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatUzs } from '@/lib/format';
import { useAnimatedNumber } from '@/lib/hooks/useAnimatedNumber';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { PendingValue } from '@/components/ui/StateBlock';

const MIN_TERM = 2;
const MAX_TERM = 36;

/**
 * Interactive calculator — INTERFACE ONLY.
 *
 * Markab's financing formula is not published, so no monthly payment, total or
 * profit figure is computed. The calculator shows:
 *   • the financed remainder (plain arithmetic: price − down payment), clearly
 *     labelled as structural and excluding any markup/fees
 *   • explicit "pending integration" markers for monthly payment and total
 *
 * When the official calculation is supplied, only this component changes.
 */
export function InstallmentCalculator({
  initialPrice = 120_000_000,
  variant = 'full',
}: {
  initialPrice?: number;
  variant?: 'full' | 'compact';
}) {
  const [price, setPrice] = useState(initialPrice);
  const [downPercent, setDownPercent] = useState(20);
  const [term, setTerm] = useState(24);

  const downPayment = useMemo(() => Math.round((price * downPercent) / 100), [price, downPercent]);
  const financed = useMemo(() => Math.max(price - downPayment, 0), [price, downPayment]);

  const animatedDown = useAnimatedNumber(downPayment);
  const animatedFinanced = useAnimatedNumber(financed);

  return (
    <div
      className={
        variant === 'full'
          ? 'grid gap-8 rounded-2xl border border-line bg-surface p-6 shadow-card lg:grid-cols-[1fr_1fr] lg:p-8'
          : 'rounded-xl border border-line bg-surface p-5'
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-ink-900">To‘lov kalkulyatori</h3>
            <Badge tone="pending">Prototip</Badge>
          </div>
          <p className="mt-1 text-sm text-ink-500">
            Interfeys tayyor. Hisob-kitob formulasi rasmiy manba ulanganda ishga tushadi.
          </p>
        </div>

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
            className="mt-1.5 w-full rounded-lg border border-line-strong bg-white px-3.5 py-2.5 text-[0.9375rem] text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            inputMode="numeric"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="calc-down" className="text-sm font-medium text-ink-700">
              Boshlang‘ich to‘lov
            </label>
            <span className="text-sm font-semibold text-brand-700">{downPercent}%</span>
          </div>
          <input
            id="calc-down"
            type="range"
            min={0}
            max={60}
            step={5}
            value={downPercent}
            onChange={(event) => setDownPercent(Number(event.target.value))}
            className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-sunken accent-brand-700"
          />
          <p className="mt-2 text-sm text-ink-500">{formatUzs(animatedDown)}</p>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="calc-term" className="text-sm font-medium text-ink-700">
              Muddat
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
            className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-sunken accent-brand-700"
          />
          <div className="mt-2 flex justify-between text-xs text-ink-400">
            <span>{MIN_TERM} oy</span>
            <span>{MAX_TERM} oy</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col rounded-xl bg-surface-muted p-5 sm:p-6">
        <h4 className="text-sm font-semibold text-ink-900">Natija</h4>

        <dl className="mt-4 space-y-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-400">Narx</dt>
            <dd className="mt-1 text-lg font-semibold text-ink-900">{formatUzs(price)}</dd>
          </div>

          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-400">Boshlang‘ich to‘lov</dt>
            <dd className="mt-1 text-lg font-semibold text-ink-900">{formatUzs(animatedDown)}</dd>
          </div>

          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-400">
              Moliyalashtiriladigan qoldiq
            </dt>
            <dd className="mt-1 text-lg font-semibold text-ink-900">{formatUzs(animatedFinanced)}</dd>
            <p className="mt-1 text-xs text-ink-400">
              Strukturaviy hisob (narx − boshlang‘ich to‘lov). Ustama, komissiya va boshqa
              shartlar kiritilmagan.
            </p>
          </div>

          <div className="border-t border-line pt-4">
            <dt className="text-xs uppercase tracking-wide text-ink-400">Oylik to‘lov</dt>
            <dd className="mt-1.5">
              <PendingValue label="Hisob-kitob ma’lumoti tayyorlanmoqda" />
            </dd>
          </div>

          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-400">Jami to‘lov</dt>
            <dd className="mt-1.5">
              <PendingValue label="Hisob-kitob ma’lumoti tayyorlanmoqda" />
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-2">
          <ButtonLink href="/financing" fullWidth>
            Shartlar bilan tanishish
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary" fullWidth>
            Menejer bilan bog‘lanish
          </ButtonLink>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink-400">
          Bu prototip hisob-kitobi. Haqiqiy oylik to‘lov shartnoma shartlari va rasmiy
          hisob-kitob asosida shakllanadi.{' '}
          <Link href="/faq" className="text-brand-700 underline underline-offset-2">
            Batafsil
          </Link>
        </p>
      </div>
    </div>
  );
}
