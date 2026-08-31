import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Container } from '@/components/ui/Section';
import { StateBlock } from '@/components/ui/StateBlock';
import { ButtonLink } from '@/components/ui/Button';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { VehicleFilters } from '@/components/vehicles/VehicleFilters';
import { Pagination } from '@/components/ui/Pagination';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { repository, vehicleBrands, dataSourceNote } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Avtomobillar',
  description:
    "Markab orqali muddatli to'lov asosida avtomobillar. Brend, narx, yoqilg'i turi va uzatma bo'yicha filtrlang.",
  path: '/cars',
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

type Values = {
  q?: string;
  brand?: string;
  fuelType?: string;
  transmission?: string;
  sort?: string;
};

/**
 * NOTE ON LOADING UX
 *
 * The skeleton lives in a <Suspense> boundary inside this page rather than in
 * `app/cars/loading.tsx`. A segment-level loading file is inherited by
 * `/cars/[slug]`, which made Next.js flush the shell (HTTP 200) before a missing
 * record could call notFound() — turning real 404s into soft 404s. Keeping the
 * boundary local preserves the loading state here while detail pages keep a
 * genuine 404 status.
 */
export default async function CarsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const values: Values = {
    q: first(sp.q),
    brand: first(sp.brand),
    fuelType: first(sp.fuelType),
    transmission: first(sp.transmission),
    sort: first(sp.sort),
  };
  const page = Number(first(sp.page) ?? '1') || 1;

  return (
    <Container className="py-10 sm:py-14">
      <header className="mb-8">
        <h1 className="text-display-sm sm:text-display-md">Avtomobillar</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-500">
          Muddatli to‘lov asosida taqdim etilayotgan avtomobillar. Oylik to‘lov ko‘rsatkichi
          mavjud e’lonlarda ko‘rsatiladi.
        </p>
      </header>

      <VehicleFilters brands={vehicleBrands} values={values} />

      <div className="mt-8">
        <Suspense key={JSON.stringify({ ...values, page })} fallback={<ListSkeleton count={6} />}>
          <VehicleResults values={values} page={page} />
        </Suspense>
      </div>
    </Container>
  );
}

async function VehicleResults({ values, page }: { values: Values; page: number }) {
  const result = await repository.listVehicles({
    q: values.q,
    brand: values.brand,
    fuelType: values.fuelType,
    transmission: values.transmission,
    sort: (values.sort as 'price-asc' | 'price-desc' | 'mileage-asc' | undefined) ?? undefined,
    page,
    pageSize: 9,
  });

  if (result.status === 'success') {
    return (
      <>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.items.map((vehicle, index) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} priority={index < 3} />
          ))}
        </div>
        <Pagination
          basePath="/cars"
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
        title="Qidiruv bo‘yicha hech narsa topilmadi"
        description="Filtrlarni o‘zgartirib ko‘ring yoki barcha avtomobillarni ko‘rib chiqing."
        actions={
          <>
            <ButtonLink href="/cars" variant="secondary">
              Filtrlarni tozalash
            </ButtonLink>
            <ButtonLink href="/financing/calculator">To‘lovni hisoblash</ButtonLink>
          </>
        }
      />
    );
  }

  if (result.status === 'error') return <StateBlock variant="error" />;
  if (result.status === 'not_found') return <StateBlock variant="not-found" />;

  // `unavailable`: no data source configured — never a blank area.
  return <StateBlock variant="unavailable" />;
}
