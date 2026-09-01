import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductBrowser } from '@/components/products/ProductBrowser';
import { Pagination } from '@/components/ui/Pagination';
import { StateBlock } from '@/components/ui/StateBlock';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { repository } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import {
  hasActiveProductFilters,
  parseProductFilters,
  toProductParams,
  toProductQuery,
  type ProductFilterValues,
} from '@/lib/products/filters';

const PAGE_SIZE = 9;

type SearchParams = Record<string, string | string[] | undefined>;

export function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  // Resolved in the page too — Next dedupes the promise for a single render.
  return searchParams.then((params) => {
    const values = parseProductFilters(params);
    const filtered = hasActiveProductFilters(values);
    return buildMetadata({
      title: filtered ? 'Tanlangan mahsulotlar' : 'Elektronika',
      description:
        'Telefonlar va boshqa elektronika muddatli to‘lov asosida. Xotira, narx, batareya holati va mavjudlik bo‘yicha saralang.',
      path: '/electronics',
      // Filtered permutations are infinite and near-duplicate; only the clean
      // catalogue is worth indexing.
      noindex: filtered,
    });
  });
}

/** First visible row on desktop, and the whole first screen on mobile. */
const ABOVE_FOLD_CARDS = 2;

export default async function ElectronicsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const values = parseProductFilters(params);
  const page = Math.max(
    1,
    Math.trunc(Number(Array.isArray(params.page) ? params.page[0] : params.page ?? '1')) || 1,
  );

  // Facet options are read once, outside the Suspense boundary, so the filter
  // controls do not flicker while the grid streams in.
  const facetsResult = await repository.getProductFacets();
  const facets = facetsResult.status === 'success' ? facetsResult.data : null;

  const categoryLabels: Record<string, string> = {};
  facets?.categories.forEach((entry) => {
    categoryLabels[entry.value] = entry.label;
  });

  return (
    <div className="container-page section-y-sm">
      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
          Elektronika katalogi
        </p>
        <h1 className="mt-3 text-display-sm sm:text-display-md">
          Muddatli to‘lov bilan elektronika
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-600 sm:text-base">
          Ochiq e’londagi ma’lumotlar asosida: xotira, batareya holati va narx bo‘yicha saralang.
          Oylik to‘lov faqat rasmiy hisob-kitobi e’lon qilingan mahsulotlarda ko‘rsatiladi.
        </p>
      </header>

      <div className="mt-8 lg:mt-10">
        <ProductBrowser facets={facets} values={values} categoryLabels={categoryLabels}>
          {/*
            The Suspense boundary is local to this page. A segment-level
            loading.tsx would flush a 200 shell before `notFound()` runs and
            /electronics/[id] would lose its real 404.
          */}
          <Suspense key={`${page}|${JSON.stringify(values)}`} fallback={<ResultsSkeleton />}>
            <ProductResults values={values} page={page} />
          </Suspense>
        </ProductBrowser>
      </div>
    </div>
  );
}

/**
 * Result grid. A server component: every filter change is a navigation, so the
 * fetch happens on the server through the repository — never in the browser and
 * never against fixtures directly.
 */
async function ProductResults({
  values,
  page,
}: {
  values: ProductFilterValues;
  page: number;
}) {
  const result = await repository.listProducts(toProductQuery(values, page, PAGE_SIZE));
  const filtered = hasActiveProductFilters(values);

  if (result.status === 'error') {
    return (
      <StateBlock
        variant="error"
        title="Katalogni yuklab bo‘lmadi"
        description="Mahsulotlar ro‘yxatini olishda xatolik yuz berdi. Iltimos, sahifani yangilab ko‘ring."
        actions={
          <Link
            href="/electronics"
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

  const products = result.data.items;
  const total = result.data.total;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line pb-4">
        <p className="text-sm text-ink-600">
          <span className="font-semibold text-ink-900">{total}</span> ta mahsulot
          {filtered ? ' tanlov bo‘yicha topildi' : ' mavjud'}
        </p>
        <p className="text-xs text-ink-400">
          {`${(result.data.page - 1) * result.data.pageSize + 1}–${
            (result.data.page - 1) * result.data.pageSize + products.length
          } / ${total}`}
        </p>
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product, index) => (
          <li key={product.id} className="flex">
            <ProductCard product={product} priority={index < ABOVE_FOLD_CARDS} />
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <Pagination
          basePath="/electronics"
          page={result.data.page}
          pageSize={result.data.pageSize}
          total={result.data.total}
          query={toProductParams(values)}
        />
      </div>
    </div>
  );
}

function NoResults() {
  return (
    <StateBlock
      variant="not-found"
      title="Bu tanlov bo‘yicha mahsulot topilmadi"
      description="Filtrlarni yumshatsangiz yoki qidiruv so‘rovini o‘zgartirsangiz, mos variantlar paydo bo‘lishi mumkin."
      actions={
        <>
          <Link
            href="/electronics"
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
      description="Mahsulotlar katalog ulangandan so‘ng shu yerda paydo bo‘ladi."
    />
  );
}

function ResultsSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Mahsulotlar yuklanmoqda…</span>
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
