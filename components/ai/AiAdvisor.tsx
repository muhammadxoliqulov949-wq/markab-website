'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Product, Vehicle } from '@/lib/data/types';
import { advisorExamples, matchAdvisorQuery } from '@/lib/ai/match';
import { formatUzs } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';

/**
 * Markab AI — product advisor CONCEPT.
 *
 * Deterministic, rule-based matching over the real catalogue. No language model,
 * no generated claims. Sensitive questions are escalated to official sources and
 * human support rather than answered.
 */
export function AiAdvisor({
  vehicles,
  products,
}: {
  vehicles: Vehicle[];
  products: Product[];
}) {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);

  const answer = useMemo(
    () => (submitted ? matchAdvisorQuery(submitted, vehicles, products) : null),
    [submitted, vehicles, products],
  );

  function run(value: string) {
    setQuery(value);
    setSubmitted(value);
    setThinking(true);
    // Short deliberate delay so the loading state is part of the experience.
    window.setTimeout(() => setThinking(false), 420);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
      <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-ink-900">AI mahsulot maslahatchisi</h2>
          <Badge tone="pending">Kontsept</Badge>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          Ehtiyojingizni yozing — tizim katalogdagi mos e’lonlarni ko‘rsatadi. Moliyaviy va
          huquqiy savollarga javob bermaydi.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            run(query);
          }}
          className="mt-5"
        >
          <label htmlFor="advisor-input" className="text-sm font-medium text-ink-700">
            So‘rovingiz
          </label>
          <textarea
            id="advisor-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            rows={4}
            placeholder="Masalan: Menda 50 mln so‘m boshlang‘ich to‘lov bor…"
            className="mt-2 w-full rounded-lg border border-line-strong bg-white px-3.5 py-3 text-[0.9375rem] text-ink-900 placeholder:text-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <button
            type="submit"
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-lg bg-brand-700 px-5 text-[0.9375rem] font-medium text-white transition-colors hover:bg-brand-800"
          >
            Mos e’lonlarni topish
          </button>
        </form>

        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Namunalar</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {advisorExamples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => run(example)}
                className="rounded-lg border border-line bg-surface-muted px-3 py-2 text-left text-xs text-ink-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-400">
          Bu kontsept interfeys: qoida asosida ishlaydi, til modeli emas. Hech qanday foiz,
          tasdiqlash ehtimoli yoki huquqiy ma’lumat yaratilmaydi.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-surface-muted p-5 sm:p-6">
        {!submitted ? (
          <StateBlock
            variant="empty"
            title="So‘rov kiritilmagan"
            description="Chap tomondagi maydonga ehtiyojingizni yozing — mos e’lonlar shu yerda paydo bo‘ladi."
          />
        ) : thinking ? (
          <div className="space-y-3" role="status" aria-live="polite" aria-busy="true">
            <span className="sr-only">Hisoblanmoqda…</span>
            {[0, 1, 2].map((index) => (
              <div key={index} className="skeleton h-20 rounded-lg" />
            ))}
          </div>
        ) : answer?.kind === 'sensitive' ? (
          <StateBlock
            variant="pending"
            title="Bu savol bo‘yicha rasmiy ma’lumot kerak"
            description={answer.note}
            actions={
              <>
                <ButtonLink href="/financing" variant="secondary" size="sm">
                  Rasmiy shartlar
                </ButtonLink>
                <ButtonLink href="/contact" size="sm">
                  Mutaxassis bilan bog‘lanish
                </ButtonLink>
              </>
            }
          />
        ) : answer?.kind === 'unclear' ? (
          <StateBlock variant="empty" title="So‘rovni aniqlashtiring" description={answer.note} />
        ) : answer?.kind === 'empty' ? (
          <StateBlock
            variant="empty"
            title="Mos e’lon topilmadi"
            description={answer.note}
            actions={
              <ButtonLink href="/cars" variant="secondary" size="sm">
                Katalogga o‘tish
              </ButtonLink>
            }
          />
        ) : (
          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-ink-900">Natija</h3>
              {answer?.parsed.budget ? (
                <Badge tone="brand">Byudjet: {formatUzs(answer.parsed.budget)}</Badge>
              ) : null}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-500">{answer?.note}</p>

            <div className="mt-5 space-y-4">
              {answer?.vehicles.map((vehicle) => (
                <Link
                  key={vehicle.id}
                  href={`/car/${vehicle.slug}`}
                  className="flex items-center gap-4 rounded-lg border border-line bg-surface p-3 transition-all duration-200 hover:border-brand-200 hover:shadow-card"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">{vehicle.title}</p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {vehicle.year} · {vehicle.location}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-ink-900">
                    {formatUzs(vehicle.priceUzs)}
                  </p>
                </Link>
              ))}

              {answer?.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/electronics/${product.id}`}
                  className="flex items-center gap-4 rounded-lg border border-line bg-surface p-3 transition-all duration-200 hover:border-brand-200 hover:shadow-card"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">{product.name}</p>
                    <p className="mt-0.5 text-xs text-ink-500">{product.category}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-ink-900">
                    {formatUzs(product.priceUzs)}
                  </p>
                </Link>
              ))}
            </div>

            <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-400">
              Moliyalashtirish shartlari hisob-kitob formulasi rasmiy manba ulangandan so‘ng
              qo‘shiladi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
