'use client';

import { formatUzs } from '@/lib/format';
import type { AdvisorMatch } from '@/lib/advisor/types';
import { PendingValue } from '@/components/ui/StateBlock';

/**
 * Side-by-side comparison of up to three advisor results.
 *
 * Session-only: nothing is persisted and no route is added. Every cell is a
 * published field; an unpublished one renders as a pending marker rather than
 * a dash that could be read as "zero" or "not applicable".
 */
export function CompareTray({
  matches,
  onRemove,
  onClear,
}: {
  matches: AdvisorMatch[];
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  if (matches.length < 2) return null;

  // Union of spec labels across the selection, in first-seen order.
  const labels: string[] = [];
  for (const match of matches) {
    for (const spec of match.specs) {
      if (!labels.includes(spec.label)) labels.push(spec.label);
    }
  }

  return (
    <section
      aria-label="Tanlangan e’lonlarni solishtirish"
      className="rounded-xl border border-line bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink-900">
          Solishtirish ({matches.length})
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-9 items-center rounded-lg border border-line-strong bg-white px-3.5 text-sm font-medium text-ink-900 transition-colors hover:bg-surface-muted"
        >
          Tanlovni tozalash
        </button>
      </div>

      <div className="mt-4 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[540px] border-collapse text-left text-sm">
          <caption className="sr-only">
            Tanlangan e’lonlarning e’lon qilingan xususiyatlari
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-32 pb-3 pr-4 align-bottom text-xs font-semibold uppercase tracking-wide text-ink-400">
                Xususiyat
              </th>
              {matches.map((match) => (
                <th key={match.id} scope="col" className="pb-3 pr-4 align-bottom">
                  <span className="block text-sm font-semibold text-ink-900">{match.title}</span>
                  <span className="mt-0.5 block text-xs font-normal text-ink-500">
                    {formatUzs(match.priceUzs)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(match.id)}
                    className="mt-1.5 text-xs font-medium text-ink-500 underline decoration-line-strong underline-offset-2 hover:text-ink-900"
                  >
                    Olib tashlash
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((label) => (
              <tr key={label} className="border-t border-line">
                <th scope="row" className="py-2.5 pr-4 text-xs font-medium text-ink-500">
                  {label}
                </th>
                {matches.map((match) => {
                  const spec = match.specs.find((s) => s.label === label);
                  return (
                    <td key={match.id} className="py-2.5 pr-4 text-sm text-ink-900">
                      {spec?.value ? spec.value : <PendingValue />}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-ink-400">
        Faqat e’londa ko‘rsatilgan qiymatlar solishtiriladi. Ko‘rsatilmagan maydonlar
        “ma’lumot tayyorlanmoqda” sifatida belgilanadi — ular o‘rniga taxminiy qiymat
        qo‘yilmaydi.
      </p>
    </section>
  );
}
