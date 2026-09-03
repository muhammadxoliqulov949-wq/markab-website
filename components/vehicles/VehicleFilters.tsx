'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Select, TextInput } from '@/components/ui/Field';
import { fuelLabels, transmissionLabels } from '@/lib/labels';
import type { FuelType, Transmission } from '@/lib/data/types';

export type VehicleFilterValues = {
  q?: string;
  brand?: string;
  fuelType?: string;
  transmission?: string;
  sort?: string;
};

export function VehicleFilters({
  brands,
  values,
}: {
  brands: string[];
  values: VehicleFilterValues;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(values.q ?? '');

  function apply(next: Partial<VehicleFilterValues>) {
    const params = new URLSearchParams();
    const merged = { ...values, ...next };
    Object.entries(merged).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    startTransition(() => {
      router.push(`/cars${params.toString() ? `?${params.toString()}` : ''}`);
    });
  }

  const hasFilters = Boolean(values.brand || values.fuelType || values.transmission || values.q);

  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-card sm:p-5">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          apply({ q });
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-400"
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
          <TextInput
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Avtomobil yoki brend qidirish"
            aria-label="Avtomobil qidirish"
            className="pl-11"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-800"
        >
          Qidirish
        </button>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="shrink-0 rounded-lg border border-line-strong px-4 text-sm font-medium text-ink-700 transition-colors hover:bg-surface-muted lg:hidden"
        >
          Filtr
        </button>
      </form>

      <div className={`${open ? 'block' : 'hidden'} mt-4 lg:block`}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-600">Brend</span>
            <Select value={values.brand ?? ''} onChange={(event) => apply({ brand: event.target.value })}>
              <option value="">Barchasi</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </Select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-600">Yoqilg‘i</span>
            <Select
              value={values.fuelType ?? ''}
              onChange={(event) => apply({ fuelType: event.target.value })}
            >
              <option value="">Barchasi</option>
              {Object.entries(fuelLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-600">Uzatma</span>
            <Select
              value={values.transmission ?? ''}
              onChange={(event) => apply({ transmission: event.target.value })}
            >
              <option value="">Barchasi</option>
              {Object.entries(transmissionLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-600">Saralash</span>
            <Select value={values.sort ?? ''} onChange={(event) => apply({ sort: event.target.value })}>
              <option value="">Standart</option>
              <option value="price-asc">Narx: arzon</option>
              <option value="price-desc">Narx: qimmat</option>
              <option value="mileage-asc">Yurgan masofa: kam</option>
            </Select>
          </label>
        </div>

        {hasFilters ? (
          <button
            type="button"
            onClick={() => startTransition(() => router.push('/cars'))}
            className="mt-4 text-sm font-medium text-brand-700 underline underline-offset-4 hover:text-brand-800"
          >
            Filtrlarni tozalash
          </button>
        ) : null}
      </div>

      {pending ? (
        <p className="mt-3 text-xs text-ink-400" role="status" aria-live="polite">
          Yangilanmoqda…
        </p>
      ) : null}
    </div>
  );
}
