import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Container } from '@/components/ui/Section';
import { ButtonLink } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { Skeleton } from '@/components/ui/Skeleton';
import { SearchHitRow } from '@/components/search/SearchResults';
import { repository } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { reportServerError } from '@/lib/errors';

// Catalogue pages are rendered per request:
//  (1) nonce-based CSP stamps scripts at render time (see docs/PHASE-12-DEPLOYMENT-SECURITY.md);
//  (2) prices / stock / availability can change at any time in HTTP mode;
//  (3) searchParams must be resolved server-side.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildMetadata({
  title: 'Qidirish',
  description: 'Markab katalogida avtomobil va elektronika bo‘yicha qidirish.',
  path: '/search',
  // A search result page is not useful outside the site.
  noindex: true,
});

/**
 * Global catalogue search.
 *
 * Everything comes from `repository.searchCatalogue`, so results are real
 * catalogue records that deep-link to real detail pages. When the data source
 * cannot answer, the page says so — it never falls back to a local list,
 * because a result the catalogue does not contain is a fabricated product.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();

  return (
    <>
      <section className="border-b border-line bg-surface-muted py-8 sm:py-10">
        <Container>
          <h1 className="text-display-sm">Qidirish</h1>
          <p className="mt-2 text-sm text-ink-500">
            {query ? (
              <>
                <span className="font-semibold text-ink-900">“{query}”</span> bo‘yicha natijalar
              </>
            ) : (
              'Avtomobil yoki elektronika nomini kiriting.'
            )}
          </p>
        </Container>
      </section>

      <section className="bg-surface py-8 sm:py-12">
        <Container>
          {/* Suspense gives a real loading state while the provider answers. */}
          <Suspense key={query} fallback={<SearchSkeleton />}>
            <SearchResults query={query} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}

async function SearchResults({ query }: { query: string }) {
  if (!query) {
    return (
      <StateBlock headingLevel={2}
        variant="empty"
        title="So‘rov kiriting"
        description="Avtomobil brendi, modeli yoki elektronika nomini yozing."
        actions={
          <>
            <ButtonLink href="/cars" size="sm">
              Avtomobillar
            </ButtonLink>
            <ButtonLink href="/electronics" size="sm" variant="secondary">
              Elektronika
            </ButtonLink>
          </>
        }
      />
    );
  }

  const result = await repository.searchCatalogue(query);

  if (result.status === 'unavailable') {
    return (
      <StateBlock headingLevel={2}
        variant="unavailable"
        title="Qidiruv ishlamayapti"
        description="Katalog ma’lumotlari ulanmagani uchun qidiruv natija ko‘rsata olmaydi."
        actions={
          <ButtonLink href="/contact" size="sm" variant="secondary">
            Bog‘lanish
          </ButtonLink>
        }
      />
    );
  }

  if (result.status === 'error') {
    // The real error goes to the server log; the visitor gets a fixed sentence.
    // See lib/errors.ts — a message that varies with the failure is a channel
    // for internal detail.
    return (
      <StateBlock
        headingLevel={2}
        variant="error"
        description={reportServerError('search:searchCatalogue', result.error)}
      />
    );
  }

  if (result.status !== 'success') {
    return (
      <StateBlock headingLevel={2}
        variant="empty"
        title="Hech narsa topilmadi"
        description={`“${query}” bo‘yicha katalogda mos e’lon yo‘q.`}
        actions={
          <>
            <ButtonLink href="/cars" size="sm">
              Avtomobillar
            </ButtonLink>
            <ButtonLink href="/electronics" size="sm" variant="secondary">
              Elektronika
            </ButtonLink>
          </>
        }
      />
    );
  }

  const { vehicles, products, vehicleTotal, productTotal } = result.data;
  const total = vehicleTotal + productTotal;

  return (
    <div className="space-y-10">
      <p className="text-sm text-ink-500">
        <span className="font-semibold text-ink-900">{total}</span> ta e’lon topildi
      </p>

      {vehicles.length > 0 ? (
        <section aria-labelledby="search-cars">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="search-cars" className="text-base font-semibold text-ink-900">
              Avtomobil
              <span className="ml-2 text-sm font-normal text-ink-400">{vehicleTotal}</span>
            </h2>
            <Link
              href={`/cars?q=${encodeURIComponent(query)}`}
              className="inline-flex min-h-[40px] items-center text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              Barchasini ko‘rish
            </Link>
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {vehicles.map((hit) => (
              <SearchHitRow key={hit.id} hit={hit} />
            ))}
          </ul>
        </section>
      ) : null}

      {products.length > 0 ? (
        <section aria-labelledby="search-electronics">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="search-electronics" className="text-base font-semibold text-ink-900">
              Elektronika
              <span className="ml-2 text-sm font-normal text-ink-400">{productTotal}</span>
            </h2>
            <Link
              href={`/electronics?q=${encodeURIComponent(query)}`}
              className="inline-flex min-h-[40px] items-center text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              Barchasini ko‘rish
            </Link>
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {products.map((hit) => (
              <SearchHitRow key={hit.id} hit={hit} />
            ))}
          </ul>
        </section>
      ) : null}

      {vehicles.length === 0 && products.length === 0 ? (
        <StateBlock headingLevel={2}
          variant="empty"
          title="Hech narsa topilmadi"
          description={`“${query}” bo‘yicha katalogda mos e’lon yo‘q.`}
          actions={
            <>
              <ButtonLink href="/cars" size="sm">
                Avtomobillar
              </ButtonLink>
              <ButtonLink href="/electronics" size="sm" variant="secondary">
                Elektronika
              </ButtonLink>
            </>
          }
        />
      ) : null}
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <Skeleton className="h-4 w-32" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-line p-3">
          <Skeleton className="h-16 w-20 shrink-0 rounded-lg sm:h-20 sm:w-28" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
