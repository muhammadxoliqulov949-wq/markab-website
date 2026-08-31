'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Select } from '@/components/ui/Field';

export type ProductFilterValues = {
  q?: string;
  category?: string;
  sort?: string;
};

export function ProductFilters({
  categories,
  values,
}: {
  categories: { id: string; name: string }[];
  values: ProductFilterValues;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(values.q ?? '');

  function apply(next: Partial<ProductFilterValues>) {
    const params = new URLSearchParams();
    const merged = { ...values, ...next };
    Object.entries(merged).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    startTransition(() => {
      router.push(`/electronics${params.toString() ? `?${params.toString()}` : ''}`);
    });
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-card sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            apply({ q });
          }}
          className="flex w-full gap-2 lg:max-w-sm"
        >
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
              style={{ height: 18, width: 18 }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Mahsulot qidirish"
              aria-label="Mahsulot qidirish"
              className="w-full rounded-lg border border-line-strong bg-white py-2.5 pl-11 pr-3.5 text-[0.9375rem] text-ink-900 placeholder:text-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-800"
          >
            Qidirish
          </button>
        </form>

        <label className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-600">Saralash</span>
          <Select
            value={values.sort ?? ''}
            onChange={(event) => apply({ sort: event.target.value })}
            className="w-44"
          >
            <option value="">Mashhur</option>
            <option value="price-asc">Narx: arzon</option>
            <option value="price-desc">Narx: qimmat</option>
          </Select>
        </label>
      </div>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto" role="tablist" aria-label="Kategoriyalar">
        <button
          type="button"
          role="tab"
          aria-selected={!values.category}
          onClick={() => apply({ category: '' })}
          className={[
            'whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
            !values.category
              ? 'border-brand-600 bg-brand-50 text-brand-800'
              : 'border-line text-ink-600 hover:bg-surface-muted',
          ].join(' ')}
        >
          Barchasi
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={values.category === category.id}
            onClick={() => apply({ category: category.id })}
            className={[
              'whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
              values.category === category.id
                ? 'border-brand-600 bg-brand-50 text-brand-800'
                : 'border-line text-ink-600 hover:bg-surface-muted',
            ].join(' ')}
          >
            {category.name}
          </button>
        ))}
      </div>

      {pending ? (
        <p className="mt-3 text-xs text-ink-400" role="status" aria-live="polite">
          Yangilanmoqda…
        </p>
      ) : null}
    </div>
  );
}
