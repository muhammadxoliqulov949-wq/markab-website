'use client';

import { useCallback, useEffect, useRef, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Select } from '@/components/ui/Field';
import { ProductFilterControls } from '@/components/products/ProductFilterControls';
import type { ProductFacets } from '@/lib/data/types';
import {
  activeProductFilterChips,
  buildProductHref,
  countActiveProductFilters,
  PRODUCT_SORT_OPTIONS,
  type ProductFilterPatch,
  type ProductFilterValues,
} from '@/lib/products/filters';

/**
 * Catalogue shell for /electronics.
 *
 * Search, filters and sort all live in the URL, so:
 *   • refreshing or sharing the page keeps the exact result set,
 *   • the product grid stays a server component (no client-side fetching),
 *   • the back button steps through filter history.
 *
 * The results themselves arrive as `children` from the server page; this
 * component only owns the controls.
 */
export function ProductBrowser({
  facets,
  values,
  categoryLabels,
  children,
}: {
  /** null when the source cannot count its own options → search + sort only. */
  facets: ProductFacets | null;
  values: ProductFilterValues;
  /** id → published name, built from the facets (plain data, not a function). */
  categoryLabels: Record<string, string>;
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);

  const apply = useCallback(
    (patch: ProductFilterPatch, mode: 'push' | 'replace' = 'push') => {
      const href = buildProductHref(values, patch);
      startTransition(() => {
        if (mode === 'replace') router.replace(href, { scroll: false });
        else router.push(href, { scroll: false });
      });
    },
    [router, values],
  );

  const activeCount = countActiveProductFilters(values);
  const chips = activeProductFilterChips(values, categoryLabels);

  const filterable =
    facets !== null &&
    (facets.categories.length > 1 ||
      facets.brands.length > 1 ||
      facets.storages.length > 1 ||
      facets.outOfStock > 0);

  return (
    <div className={filterable ? 'grid gap-8 lg:grid-cols-[248px_1fr] lg:gap-10' : 'grid gap-8'}>
      {/* ---------- Desktop sidebar ---------- */}
      {facets && filterable ? (
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-semibold text-ink-900">Filtrlar</h2>
              {activeCount > 0 ? (
                <button
                  type="button"
                  onClick={() => apply(CLEAR_ALL)}
                  className="-my-1 py-1 text-xs font-medium text-brand-700 underline underline-offset-4 transition-colors hover:text-brand-800"
                >
                  Tozalash
                </button>
              ) : null}
            </div>

            <div className="mt-4">
              <ProductFilterControls facets={facets} values={values} onChange={apply} />
            </div>
          </div>
        </aside>
      ) : null}

      {/* ---------- Results column ---------- */}
      <div className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchField values={values} onSearch={(q) => apply({ q }, 'replace')} />

          <div className="flex items-center gap-2">
            <div className="flex-1 sm:w-48 sm:flex-none">
              <label className="sr-only" htmlFor="product-sort">
                Saralash
              </label>
              <Select
                id="product-sort"
                value={values.sort ?? 'default'}
                onChange={(event) =>
                  apply({ sort: event.target.value === 'default' ? null : event.target.value })
                }
              >
                {PRODUCT_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {facets && filterable ? (
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-line-strong bg-white px-4 text-sm font-medium text-ink-900 transition-colors hover:bg-surface-muted lg:hidden"
                aria-haspopup="dialog"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
                </svg>
                Filtr
                {activeCount > 0 ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-700 px-1 text-[11px] font-semibold text-white">
                    {activeCount}
                  </span>
                ) : null}
              </button>
            ) : null}
          </div>
        </div>

        {/* Active filters — every chip removes exactly one filter. */}
        {chips.length > 0 || pending ? (
          <div className="mt-4 flex flex-wrap items-center gap-2" role="status" aria-live="polite">
            {pending ? <span className="text-xs text-ink-400">Yangilanmoqda…</span> : null}
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => apply(chip.clear)}
                className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-muted py-1.5 pl-3 pr-2 text-xs font-medium text-ink-700 transition-colors hover:border-line-strong hover:bg-surface-sunken"
              >
                {chip.label}
                <svg
                  className="h-3.5 w-3.5 text-ink-400 transition-colors group-hover:text-ink-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                </svg>
                <span className="sr-only">— filtrni olib tashlash</span>
              </button>
            ))}
            {chips.length > 1 ? (
              <button
                type="button"
                onClick={() => apply(CLEAR_ALL)}
                className="-my-1.5 ml-1 inline-flex items-center py-1.5 text-xs font-medium text-brand-700 underline underline-offset-4 transition-colors hover:text-brand-800"
              >
                Barchasini tozalash
              </button>
            ) : null}
          </div>
        ) : null}

        <div className={pending ? 'mt-6 opacity-60 transition-opacity' : 'mt-6'}>{children}</div>
      </div>

      {sheetOpen && facets ? (
        <FilterSheet
          facets={facets}
          values={values}
          activeCount={activeCount}
          onApply={apply}
          onClose={() => setSheetOpen(false)}
        />
      ) : null}
    </div>
  );
}

/** Every filter key, removed in one patch. */
const CLEAR_ALL: ProductFilterPatch = {
  q: null,
  brand: null,
  cat: null,
  storage: null,
  batt: null,
  avail: null,
  minp: null,
  maxp: null,
};

/** Debounced search: typing updates the URL without flooding history. */
function SearchField({
  values,
  onSearch,
}: {
  values: ProductFilterValues;
  onSearch: (q: string | null) => void;
}) {
  const [text, setText] = useState(values.q ?? '');
  const lastPushed = useRef(values.q ?? '');

  // Adopt the URL value when it changes for a reason other than our own typing
  // (back/forward, a cleared chip, a fresh navigation).
  useEffect(() => {
    if ((values.q ?? '') !== lastPushed.current) {
      lastPushed.current = values.q ?? '';
      setText(values.q ?? '');
    }
  }, [values.q]);

  useEffect(() => {
    if (text === (values.q ?? '')) return;
    const timer = setTimeout(() => {
      lastPushed.current = text;
      onSearch(text.trim() || null);
    }, 400);
    return () => clearTimeout(timer);
  }, [text, values.q, onSearch]);

  return (
    <div className="relative flex-1">
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-400"
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
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Model, brend yoki xotira bo‘yicha qidirish"
        aria-label="Mahsulot qidirish"
        className="h-11 w-full rounded-lg border border-line-strong bg-white pl-11 pr-3.5 text-[0.9375rem] text-ink-900 placeholder:text-ink-300 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
    </div>
  );
}

/** Mobile / tablet filter sheet. */
function FilterSheet({
  facets,
  values,
  activeCount,
  onApply,
  onClose,
}: {
  facets: ProductFacets;
  values: ProductFilterValues;
  activeCount: number;
  onApply: (patch: ProductFilterPatch) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Filtrlar"
    >
      <button
        type="button"
        aria-label="Filtrlarni yopish"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-ink-900/40"
      />

      <div className="absolute inset-x-0 bottom-0 flex max-h-[86vh] flex-col rounded-t-2xl bg-white shadow-lift">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold text-ink-900">
            Filtrlar
            {activeCount > 0 ? (
              <span className="ml-2 text-sm font-normal text-ink-400">{activeCount} ta</span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-surface-muted hover:text-ink-900"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <ProductFilterControls facets={facets} values={values} onChange={onApply} />
        </div>

        <div className="flex items-center gap-3 border-t border-line px-5 py-4">
          <button
            type="button"
            onClick={() => onApply(CLEAR_ALL)}
            disabled={activeCount === 0}
            className="h-11 rounded-lg border border-line-strong px-4 text-sm font-medium text-ink-700 transition-colors hover:bg-surface-muted disabled:opacity-40"
          >
            Tozalash
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-lg bg-brand-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            Natijalarni ko‘rish
          </button>
        </div>
      </div>
    </div>
  );
}
