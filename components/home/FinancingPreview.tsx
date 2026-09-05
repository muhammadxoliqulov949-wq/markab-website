'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { MarkabStar } from '@/components/ui/MarkabStar';
import { formatUzs } from '@/lib/format';

/**
 * Home-page payment calculator — interactive but honest.
 *
 * IMPORTANT — what it computes, what it does NOT compute:
 *
 *   ✅ price − initial payment = remaining (ordinary subtraction, labelled)
 *   ✅ remaining / term = simple illustrative monthly split, with an EXPLICIT
 *      label that this is plain division and NOT Markab's official payment,
 *      NOT a financing quote, and includes no markup/commission/insurance.
 *   ✅ responsive, keyboard-accessible sliders & preset chips.
 *   ✅ CSS 3D animated "card" presentation (no WebGL/Three.js — pure CSS
 *      transforms / perspective) that respects prefers-reduced-motion.
 *
 *   ❌ Does NOT invent interest rates, markup, Murabaha profit, insurance,
 *      processing fees, or any other Markab financing term. Those are still
 *      shown as "rasmiy formula kutilmoqda" until Markab provides them.
 */

const SAMPLE_PRICE = 120_000_000;
const DOWN_PRESETS = [0, 10, 20, 30, 40];
const TERM_PRESETS = [12, 18, 24, 30, 36];

const MIN_PRICE = 10_000_000;
const MAX_PRICE = 800_000_000;
const PRICE_STEP = 5_000_000;
const MIN_TERM = 3;
const MAX_TERM = 48;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function FinancingPreview() {
  const [price, setPrice] = useState<number>(SAMPLE_PRICE);
  const [downPercent, setDownPercent] = useState<number>(20);
  const [term, setTerm] = useState<number>(24);

  // Tilt controlled by pointer; disabled when reduced motion requested.
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);
    const onChange = () => setReducedMotion(mql.matches);
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);

  const downPayment = useMemo(
    () => Math.round((price * clamp(downPercent, 0, 90)) / 100),
    [price, downPercent],
  );
  const remaining = useMemo(() => Math.max(price - downPayment, 0), [price, downPayment]);
  // Illustrative even split — NOT a financing quote. Labelled clearly below.
  const simpleMonthly = useMemo(
    () => (term > 0 ? Math.round(remaining / term) : 0),
    [remaining, term],
  );

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height; // 0..1
    // Max rotation ±8deg, inverse so moving up tilts the top towards viewer.
    setTilt({ rx: (0.5 - y) * 16, ry: (x - 0.5) * 16 });
  };
  const onPointerLeave = () => setTilt({ rx: 0, ry: 0 });

  return (
    <section
      aria-labelledby="financing-preview-heading"
      className="relative overflow-hidden bg-surface section-y"
    >
              <div
                className="pointer-events-none absolute -right-40 top-20 h-[26rem] w-[26rem] rounded-full bg-brand-50/50 blur-3xl sm:h-[30rem] sm:w-[30rem]"
                aria-hidden="true"
              />
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-[1.25fr_0.95fr] lg:gap-10 xl:gap-12">
          {/* LEFT — explanation. */}
          <div>
            <SectionHeading
              id="financing-preview-heading"
              eyebrow="Moliyalashtirish"
              title="Qancha to‘layman?"
              description="Narx, boshlang‘ich to‘lov va muddatni o‘zingiz belgilang — oddiy arifmetika asosida bo‘linma shu yerda ko‘rinadi. Rasmiy foiz/ustama Markab formulasi tasdiqlangach qo‘shiladi."
            />

            <ul className="mt-7 space-y-3">
              {[
                'Shartnoma: taqsit yoki murabaha (rasmiy hujjat asosida)',
                'Boshlang‘ich to‘lov miqdori o‘zingizga qulay holda tanlanadi',
                'Sliderlar faqat hisob-kitob tajribasi uchun — yakuniy shartlar shartnomada belgilanadi',
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
                To‘liq hisob-kitob
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

          {/* RIGHT — animated 3D calculator card. */}
          <div
            className="perspective-[1200px]"
            style={{ perspective: '1200px' }}
          >
            <div
              ref={cardRef}
              onPointerMove={onPointerMove}
              onPointerLeave={onPointerLeave}
              className={[
                'relative mx-auto w-full max-w-[360px] overflow-hidden rounded-[22px] bg-gradient-to-br from-ink-800 to-ink-900 p-5 shadow-lift ring-1 ring-white/10 sm:rounded-panel sm:p-6',
                'transition-transform duration-200 ease-out will-change-transform',
                reducedMotion ? '' : 'hover:shadow-2xl',
              ].join(' ')}
              style={
                reducedMotion
                  ? undefined
                  : {
                      transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(0)`,
                      transformStyle: 'preserve-3d',
                    }
              }
            >
              {/* Glossy overlay that shifts with tilt — 3D depth cue. */}
              <div
                className="pointer-events-none absolute inset-0 rounded-panel opacity-40 mix-blend-overlay transition-opacity"
                aria-hidden="true"
                style={{
                  background: reducedMotion
                    ? 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15), transparent 55%)'
                    : `radial-gradient(circle at ${50 + tilt.ry * 2}% ${50 - tilt.rx * 2}%, rgba(255,255,255,0.22), transparent 55%)`,
                }}
              />
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-brand-500/25 blur-3xl"
                aria-hidden="true"
                style={reducedMotion ? undefined : { transform: 'translateZ(30px)' }}
              />

              {/* Header */}
              <div
                className="relative flex items-center justify-between gap-3"
                style={reducedMotion ? undefined : { transform: 'translateZ(36px)' }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-inset ring-white/10">
                    <MarkabStar size={14} tone="white" />
                  </span>
                  <h3 className="text-[0.95rem] font-semibold text-white">To‘lov kalkulyatori</h3>
                </div>
                <Badge tone="pending" className="border-white/20 bg-white/5 text-white/65 text-[10px]">
                  Interaktiv
                </Badge>
              </div>

              <div className="relative mt-5 space-y-4">
                {/* Price */}
                <label className="block" style={reducedMotion ? undefined : { transform: 'translateZ(22px)' }}>
                  <span className="flex items-baseline justify-between">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-white/60">
                      Mahsulot narxi
                    </span>
                    <span className="text-sm font-semibold text-brand-200">{formatUzs(price)}</span>
                  </span>
                  <input
                    type="range"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    step={PRICE_STEP}
                    value={price}
                    onChange={(e) => setPrice(clamp(Number(e.target.value), MIN_PRICE, MAX_PRICE))}
                    className="ios-range mt-3"
                    aria-label="Mahsulot narxi"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-white/40">
                    <span>{formatUzs(MIN_PRICE)}</span>
                    <span>{formatUzs(MAX_PRICE)}</span>
                  </div>
                </label>

                {/* Down payment */}
                <div style={reducedMotion ? undefined : { transform: 'translateZ(28px)' }}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-white/60">
                      Boshlang‘ich to‘lov
                    </span>
                    <span className="text-sm font-semibold text-brand-200">
                      {downPercent}% · {formatUzs(downPayment)}
                    </span>
                  </div>
                  <div className="mt-2.5 h-1.5 w-full rounded-full bg-white/10" aria-hidden="true">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-brand-400 to-brand-300 transition-[width] duration-200"
                      style={{ width: `${(downPercent / 50) * 100}%` }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {DOWN_PRESETS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setDownPercent(p)}
                        className={[
                          'min-h-[32px] rounded-full px-3 py-1.5 text-[11px] font-medium transition-all active:scale-[0.95]',
                          p === downPercent
                            ? 'bg-brand-500 text-white shadow-[0_4px_10px_-4px_rgba(0,184,120,0.7)]'
                            : 'bg-white/[0.08] text-white/65 hover:bg-white/[0.14] hover:text-white/85',
                        ].join(' ')}
                        aria-pressed={p === downPercent}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Term */}
                <div style={reducedMotion ? undefined : { transform: 'translateZ(22px)' }}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-white/60">Muddat</span>
                    <span className="text-sm font-semibold text-brand-200">{term} oy</span>
                  </div>
                  <input
                    type="range"
                    min={MIN_TERM}
                    max={MAX_TERM}
                    step={1}
                    value={term}
                    onChange={(e) => setTerm(clamp(Number(e.target.value), MIN_TERM, MAX_TERM))}
                    className="ios-range mt-3"
                    aria-label="Muddat"
                  />
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {TERM_PRESETS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTerm(m)}
                        className={[
                          'min-h-[32px] rounded-full px-3 py-1.5 text-[11px] font-medium transition-all active:scale-[0.95]',
                          m === term
                            ? 'bg-brand-500 text-white shadow-[0_4px_10px_-4px_rgba(0,184,120,0.7)]'
                            : 'bg-white/[0.08] text-white/65 hover:bg-white/[0.14] hover:text-white/85',
                        ].join(' ')}
                        aria-pressed={m === term}
                      >
                        {m} oy
                      </button>
                    ))}
                  </div>
                </div>

                {/* Result panel — floated forward on the Z axis. */}
                <div
                  className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md"
                  style={reducedMotion ? undefined : { transform: 'translateZ(48px)' }}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-white/60">
                      Qolgan summa
                    </span>
                    <span className="text-base font-semibold text-white tabular-nums">
                      {formatUzs(remaining)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-t border-white/10 pt-3">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-white/60">
                      Teng bo‘linma <span className="normal-case tracking-normal text-white/40">(misol)</span>
                    </span>
                    <span className="text-xl font-bold text-brand-200 tabular-nums">
                      {formatUzs(simpleMonthly)}
                      <span className="ml-1 text-xs font-medium text-white/50">/ oy</span>
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-white/55">
                    Bu shunchaki qoldiqni muddatga bo‘lish — foiz, ustama va komissiyalar kiritilmagan.
                    Yakuniy oylik to‘lov rasmiy formula asosida shartnomada belgilanadi.
                  </p>
                </div>
              </div>

              <p
                className="relative mt-5 text-xs leading-relaxed text-white/55"
                style={reducedMotion ? undefined : { transform: 'translateZ(18px)' }}
              >
                Hisob-kitob faqat tushuncha uchun. Rasmiy taklif emas — aniq shartlar Markab bilan
                tuziladigan shartnomada ko‘rsatiladi.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
