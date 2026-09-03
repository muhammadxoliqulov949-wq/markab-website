'use client';

import { Select } from '@/components/ui/Field';
import type { ProductFacets } from '@/lib/data/types';
import { formatCompactUzs } from '@/lib/format';
import {
  batteryBucketCounts,
  productPriceBounds,
  worthShowing,
  type ProductFilterPatch,
  type ProductFilterValues,
} from '@/lib/products/filters';

/**
 * Filter controls for the /electronics catalogue.
 *
 * Every option is counted from `ProductFacets`, so the panel only ever offers
 * a value the source can return. Groups that cannot change the result set are
 * not rendered at all — a filter with a single option is a label, not a
 * choice, and showing it would promise a selection the data does not have.
 *
 * Counts are deliberately not printed next to each option: they would be
 * catalogue-wide figures while the grid reflects every active filter at once,
 * which would promise results a combination cannot deliver.
 */
export function ProductFilterControls({
  facets,
  values,
  onChange,
}: {
  facets: ProductFacets;
  values: ProductFilterValues;
  onChange: (patch: ProductFilterPatch) => void;
}) {
  const price = productPriceBounds(facets);
  const buckets = batteryBucketCounts(facets).filter((bucket) => bucket.count > 0);
  const hasSoldOut = facets.outOfStock > 0;

  return (
    <div className="flex flex-col gap-6">
      {facets.categories.length > 1 ? (
        <FilterGroup label="Kategoriya">
          <Chips
            options={[
              { value: '', label: 'Barchasi' },
              ...facets.categories.map((item) => ({ value: item.value, label: item.label })),
            ]}
            selected={values.cat ?? ''}
            onSelect={(value) => onChange({ cat: value || null })}
          />
        </FilterGroup>
      ) : null}

      {worthShowing(facets.brands.length, facets.total) ? (
        <FilterGroup label="Brend">
          <Chips
            options={[
              { value: '', label: 'Barchasi' },
              ...facets.brands.map((item) => ({ value: item.value, label: item.value })),
            ]}
            selected={values.brand ?? ''}
            onSelect={(value) => onChange({ brand: value || null })}
          />
        </FilterGroup>
      ) : null}

      {facets.storages.length > 1 ? (
        <FilterGroup label="Xotira">
          <Chips
            options={[
              { value: '', label: 'Barchasi' },
              ...facets.storages.map((item) => ({
                value: String(item.value),
                label: `${item.value} GB`,
              })),
            ]}
            selected={values.storage ? String(values.storage) : ''}
            onSelect={(value) => onChange({ storage: value || null })}
          />
        </FilterGroup>
      ) : null}

      {price.min.length > 0 ? (
        <FilterGroup label="Narx">
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-ink-500">Dan</span>
              <Select
                value={values.minp ? String(values.minp) : ''}
                onChange={(event) =>
                  onChange({ minp: event.target.value ? Number(event.target.value) : null })
                }
              >
                <option value="">Eng arzon</option>
                {price.min.map((value) => (
                  <option key={`min-${value}`} value={value}>
                    {formatCompactUzs(value)}
                  </option>
                ))}
              </Select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-ink-500">Gacha</span>
              <Select
                value={values.maxp ? String(values.maxp) : ''}
                onChange={(event) =>
                  onChange({ maxp: event.target.value ? Number(event.target.value) : null })
                }
              >
                <option value="">Eng qimmat</option>
                {price.max.map((value) => (
                  <option key={`max-${value}`} value={value}>
                    {formatCompactUzs(value)}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </FilterGroup>
      ) : null}

      {buckets.length > 1 ? (
        <FilterGroup label="Batareya holati">
          <Chips
            options={[
              { value: '', label: 'Barchasi' },
              ...buckets.map((item) => ({ value: item.value, label: item.label })),
            ]}
            selected={values.batt ?? ''}
            onSelect={(value) => onChange({ batt: value || null })}
          />
        </FilterGroup>
      ) : null}

      {hasSoldOut ? (
        <FilterGroup label="Mavjudlik">
          <button
            type="button"
            onClick={() => onChange({ avail: values.avail ? null : true })}
            aria-pressed={Boolean(values.avail)}
            className={[
              'flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition-colors',
              values.avail
                ? 'border-brand-600 bg-brand-50 text-brand-800'
                : 'border-line text-ink-700 hover:border-line-strong hover:bg-surface-muted',
            ].join(' ')}
          >
            <span>Qolmaganlarini yashirish</span>
            <span
              className={[
                'relative h-5 w-9 shrink-0 rounded-full transition-colors',
                values.avail ? 'bg-brand-600' : 'bg-line-strong',
              ].join(' ')}
              aria-hidden="true"
            >
              <span
                className={[
                  'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200',
                  values.avail ? 'translate-x-[1.125rem]' : 'translate-x-0.5',
                ].join(' ')}
              />
            </span>
          </button>
          <p className="mt-2 text-xs leading-relaxed text-ink-400">
            Faqat ochiq e’londa “Qolmadi” deb belgilangan mahsulotlar yashiriladi. Qolganlarning
            mavjudligi Markab tomonidan tasdiqlanadi.
          </p>
        </FilterGroup>
      ) : null}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
        {label}
      </h3>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

function Chips({
  options,
  selected,
  onSelect,
}: {
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <button
            key={option.value || 'all'}
            type="button"
            onClick={() => onSelect(option.value)}
            aria-pressed={active}
            className={[
              'rounded-lg border px-3 py-1.5 text-[0.8125rem] font-medium transition-colors duration-150',
              active
                ? 'border-brand-600 bg-brand-700 text-white'
                : 'border-line bg-surface text-ink-700 hover:border-line-strong hover:bg-surface-muted',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
