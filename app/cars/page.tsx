import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { VehicleBrowser } from '@/components/vehicles/VehicleBrowser';
import { Pagination } from '@/components/ui/Pagination';
import { StateBlock } from '@/components/ui/StateBlock';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { repository } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import {
  hasActiveFilters,
  parseVehicleFilters,
  toVehicleParams,
  toVehicleQuery,
  type VehicleFilterValues,
} from '@/lib/vehicles/filters';

const PAGE_SIZE = 9;

type SearchParams = Record<string, string | string[] | undefined>;

export function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  // Resolved in the page too — Next dedupes the promise for a single render.
  return searchParams.then((params) => {
    const values = parseVehicleFilters(params);
    const filtered = hasActiveFilters(values);
    return buildMetadata({
      title: filtered ? 'Tanlangan avtomobillar' : 'Avtomobillar',
      description:
        'Markab katalogidagi avtomobillar: brend, yil, narx, uzatma va yoqilg‘i turi bo‘yicha saralang. Rasmiy hisob-kitobga ega avtomobillar uchun oylik to‘lov ko‘rsatiladi.',
      path: '/cars',
      // Filtered permutations are infinite and near-duplicate; only the clean
      // catalogue is worth indexing.
      noindex: filtered,
    });
  });
}

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const values = parseVehicleFilters(params);
  const page = Math.max(1, Math.trunc(Number(Array.isArray(params.page) ? params.page[0] : params.page ?? '1')) || 1);

  // Facet options are read once, outside the Suspense boundary, so the filter
  // controls do not flicker while the result grid streams in.
  const facetsResult = await repository.getVehicleFacets();
  const facets = facetsResult.status === 'success' ? facetsResult.data : null;

  return (
    <div className="container-page section-y-sm">
      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
          Avtomobil katalogi
        </p>
        <h1 className="mt-3 text-display-sm sm:text-display-md">
          Sizga mos avtomobilni toping
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-600 sm:text-base">
          Katalogdagi har bir avtomobil tekshirilgan ma’lumotlar asosida ko‘rsatiladi. Rasmiy
          hisob-kitob e’lon qilingan avtomobillar uchun oylik to‘lov ham keltiriladi.
        </p>
      </header>

      <div className="mt-8 lg:mt-10">
        <VehicleBrowser facets={facets} values={values}>
          <Suspense
            key={`${page}|${JSON.stringify(values)}`}
            fallback={<ResultsSkeleton />}
          >
            <VehicleResults values={values} page={page} />
          </Suspense>
        </VehicleBrowser>
      </div>
    </div>
  );
}

/**
 * Result grid. A server component: every filter change is a navigation, so the
 * data fetch happens on the server through the repository — never in the
 * browser and never against fixtures directly.
 */
async function VehicleResults({
  values,
  page,
}: {
  values: VehicleFilterValues;
  page: number;
}) {
  const result = await repository.listVehicles(toVehicleQuery(values, page, PAGE_SIZE));
  const filtered = hasActiveFilters(values);

  if (result.status === 'error') {
    return (
      <StateBlock
        variant="error"
        title="Katalogni yuklab bo‘lmadi"
        description="Avtomobillar ro‘yxatini olishda xatolik yuz berdi. Iltimos, sahifani yangilab ko‘ring."
        actions={
          <Link
            href="/cars"
            className="inline-flex h-11 items-center rounded-lg bg-brand-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            Qaytadan urinish
          </Link>
        }
      />
    );
  }

  if (result.status === 'unavailable') {
    return <StateBlock variant="unavailable" />;
  }

  if (result.status === 'not_found' || result.status === 'empty') {
    return filtered ? <NoResults /> : <EmptyCatalogue />;
  }

  const vehicles = result.data.items;
  const total = result.data.total;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line pb-4">
        <p className="text-sm text-ink-600">
          <span className="font-semibold text-ink-900">{total}</span> ta avtomobil
          {filtered ? ' tanlov bo‘yicha topildi' : ' mavjud'}
        </p>
        <p className="text-xs text-ink-400">
          {`${(result.data.page - 1) * result.data.pageSize + 1}–${
            (result.data.page - 1) * result.data.pageSize + vehicles.length
          } / ${total}`}
        </p>
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((vehicle) => (
          <li key={vehicle.id} className="flex">
            <VehicleCard vehicle={vehicle} />
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <Pagination
          basePath="/cars"
          page={result.data.page}
          pageSize={result.data.pageSize}
          total={result.data.total}
          query={toVehicleParams(values)}
        />
      </div>
    </div>
  );
}

function NoResults() {
  return (
    <StateBlock
      variant="not-found"
      title="Bu tanlov bo‘yicha avtomobil topilmadi"
      description="Filtrlarni yumshatsangiz yoki qidiruv so‘rovini o‘zgartirsangiz, mos variantlar paydo bo‘lishi mumkin."
      actions={
        <>
          <Link
            href="/cars"
            className="inline-flex h-11 items-center rounded-lg bg-brand-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            Filtrlarni tozalash
          </Link>
          <Link
            href="/financing/calculator"
            className="inline-flex h-11 items-center rounded-lg border border-line-strong px-5 text-sm font-medium text-ink-900 transition-colors hover:bg-surface-muted"
          >
            To‘lovni hisoblash
          </Link>
        </>
      }
    />
  );
}

function EmptyCatalogue() {
  return (
    <StateBlock
      variant="empty"
      title="Katalog hozircha bo‘sh"
      description="Avtomobillar katalog ulangandan so‘ng shu yerda paydo bo‘ladi."
    />
  );
}

function ResultsSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Avtomobillar yuklanmoqda…</span>
      <div className="h-5 w-40 rounded bg-surface-sunken" />
      <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <li key={index}>
            <CardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}
