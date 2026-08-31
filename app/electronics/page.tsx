import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Container } from '@/components/ui/Section';
import { StateBlock } from '@/components/ui/StateBlock';
import { ButtonLink } from '@/components/ui/Button';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';
import { Pagination } from '@/components/ui/Pagination';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { repository, productCategories, dataSourceNote } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Elektronika',
  description:
    "Markab orqali muddatli to'lov asosida elektronika va maishiy texnika. Smartfonlar, kompyuter va noutbuklar.",
  path: '/electronics',
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

type Values = { q?: string; category?: string; sort?: string };

/**
 * See the note in `app/cars/page.tsx`: the skeleton boundary is local to this
 * page so that `/electronics/[id]` keeps a real 404 status for missing records.
 */
export default async function ElectronicsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const values: Values = {
    q: first(sp.q),
    category: first(sp.category),
    sort: first(sp.sort),
  };
  const page = Number(first(sp.page) ?? '1') || 1;

  return (
    <Container className="py-10 sm:py-14">
      <header className="mb-8">
        <h1 className="text-display-sm sm:text-display-md">Elektronika</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-500">
          Telefonlar va boshqa elektronika mahsulotlari muddatli to‘lov asosida. Oylik to‘lov
          ko‘rsatkichi mavjud mahsulotlarda ko‘rsatiladi.
        </p>
      </header>

      <ProductFilters categories={productCategories} values={values} />

      <div className="mt-8">
        <Suspense key={JSON.stringify({ ...values, page })} fallback={<ListSkeleton count={8} />}>
          <ProductResults values={values} page={page} />
        </Suspense>
      </div>
    </Container>
  );
}

async function ProductResults({ values, page }: { values: Values; page: number }) {
  const result = await repository.listProducts({
    q: values.q,
    category: values.category,
    sort: (values.sort as 'price-asc' | 'price-desc' | undefined) ?? undefined,
    page,
    pageSize: 8,
  });

  if (result.status === 'success') {
    return (
      <>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {result.data.items.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
        <Pagination
          basePath="/electronics"
          page={result.data.page}
          pageSize={result.data.pageSize}
          total={result.data.total}
          query={values}
        />
        {dataSourceNote ? <p className="mt-6 text-xs text-ink-400">{dataSourceNote}</p> : null}
      </>
    );
  }

  if (result.status === 'empty') {
    return (
      <StateBlock
        variant="empty"
        title={
          values.category
            ? 'Bu kategoriyada hozircha mahsulot yo‘q'
            : 'Qidiruv bo‘yicha hech narsa topilmadi'
        }
        description="Boshqa kategoriyani tanlang yoki barcha mahsulotlarni ko‘rib chiqing."
        actions={
          <>
            <ButtonLink href="/electronics" variant="secondary">
              Barcha mahsulotlar
            </ButtonLink>
            <ButtonLink href="/financing/calculator">To‘lovni hisoblash</ButtonLink>
          </>
        }
      />
    );
  }

  if (result.status === 'error') return <StateBlock variant="error" />;
  if (result.status === 'not_found') return <StateBlock variant="not-found" />;

  return <StateBlock variant="unavailable" />;
}
