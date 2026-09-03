'use client';

import { Select } from '@/components/ui/Field';
import type { VehicleFacets } from '@/lib/data/types';
import { compactUzs, priceBounds, type VehicleFilterValues } from '@/lib/vehicles/filters';
import { fuelLabels, transmissionLabels } from '@/lib/labels';

/**
 * Filter controls for the /cars marketplace.
 *
 * Every option comes from `VehicleFacets`, which the repository derives from
 * the data source. Nothing here is hard-coded and no option is offered that the
 * catalogue cannot answer — if the source has no diesel cars, "Dizel" never
 * appears.
 *
 * Counts are intentionally NOT printed next to each option: they would be
 * catalogue-wide figures while the list reflects every active filter at once,
 * which would promise results that a combination cannot deliver.
 */
export function VehicleFilterControls({
  facets,
  values,
  onChange,
}: {
  facets: VehicleFacets;
  values: VehicleFilterValues;
  onChange: (patch: Partial<Record<keyof VehicleFilterValues | 'page', string | number | boolean | null>>) => void;
}) {
  const price = priceBounds(facets);

  return (
    <div className="flex flex-col gap-6">
      <FilterGroup label="Brend">
        <Chips
          options={[
            { value: '', label: 'Barchasi' },
            ...facets.brands.map((brand) => ({ value: brand.value, label: brand.value })),
          ]}
          selected={values.brand ?? ''}
          onSelect={(value) => onChange({ brand: value || null })}
        />
      </FilterGroup>

      <FilterGroup label="Yil">
        <Chips
          options={[
            { value: '', label: 'Barchasi' },
            ...facets.years.map((year) => ({ value: String(year.value), label: String(year.value) })),
          ]}
          selected={values.year ? String(values.year) : ''}
          onSelect={(value) => onChange({ year: value || null })}
        />
      </FilterGroup>

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
                  {compactUzs(value)}
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
                  {compactUzs(value)}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </FilterGroup>

      {facets.condition.length > 0 ? (
        <FilterGroup label="Holati">
          <Chips
            options={[
              { value: '', label: 'Barchasi' },
              ...facets.condition.map((item) => ({
                value: item.value,
                label: item.value === 'new' ? 'Yangi' : 'Foydalanilgan',
              })),
            ]}
            selected={values.cond ?? ''}
            onSelect={(value) =>
              onChange({ cond: value === 'new' || value === 'used' ? value : null })
            }
          />
        </FilterGroup>
      ) : null}

      <FilterGroup label="Uzatma">
        <Chips
          options={[
            { value: '', label: 'Barchasi' },
            ...facets.transmissions.map((item) => ({
              value: item.value,
              label: transmissionLabels[item.value] ?? item.value,
            })),
          ]}
          selected={values.trans ?? ''}
          onSelect={(value) => onChange({ trans: value || null })}
        />
      </FilterGroup>

      <FilterGroup label="Yoqilg‘i">
        <Chips
          options={[
            { value: '', label: 'Barchasi' },
            ...facets.fuelTypes.map((item) => ({
              value: item.value,
              label: fuelLabels[item.value] ?? item.value,
            })),
          ]}
          selected={values.fuel ?? ''}
          onSelect={(value) => onChange({ fuel: value || null })}
        />
      </FilterGroup>

      {facets.withFinancing > 0 ? (
        <FilterGroup label="Moliyalashtirish">
          <button
            type="button"
            onClick={() => onChange({ fin: values.fin ? null : true })}
            aria-pressed={Boolean(values.fin)}
            className={[
              'flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition-colors',
              values.fin
                ? 'border-brand-600 bg-brand-50 text-brand-800'
                : 'border-line text-ink-700 hover:border-line-strong hover:bg-surface-muted',
            ].join(' ')}
          >
            <span>Faqat oylik to‘lov ko‘rsatilgan</span>
            <span
              className={[
                'relative h-5 w-9 shrink-0 rounded-full transition-colors',
                values.fin ? 'bg-brand-600' : 'bg-line-strong',
              ].join(' ')}
              aria-hidden="true"
            >
              <span
                className={[
                  'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200',
                  values.fin ? 'translate-x-[1.125rem]' : 'translate-x-0.5',
                ].join(' ')}
              />
            </span>
          </button>
          <p className="mt-2 text-xs leading-relaxed text-ink-400">
            Bu filtr rasmiy hisob-kitobi e’lon qilingan avtomobillarni ajratadi. U moliyalashtirish
            kafolatini anglatmaydi.
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
