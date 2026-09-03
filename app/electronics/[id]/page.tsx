import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { StateBlock, PendingValue } from '@/components/ui/StateBlock';
import { ButtonLink } from '@/components/ui/Button';
import { SaveButton } from '@/components/account/SaveButton';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { ProductGallery } from '@/components/products/ProductGallery';
import { AddToCartButton } from '@/components/products/AddToCartButton';
import { ProductCard } from '@/components/products/ProductCard';
import { FinancingPanel } from '@/components/vehicles/FinancingPanel';
import { JsonLd } from '@/components/seo/JsonLd';
import { formatUzs, formatViews } from '@/lib/format';
import { repository } from '@/lib/data';
import { breadcrumbJsonLd, buildMetadata, productJsonLd } from '@/lib/seo';
import { availabilityNote, stockMeta } from '@/lib/products/stock';
import { relatedProductReason, selectRelatedProducts } from '@/lib/products/related';
import { applyHref, calculatorHref } from '@/lib/financing/handoff';

// Catalogue pages are rendered per request:
//  (1) nonce-based CSP stamps scripts at render time (see docs/PHASE-12-DEPLOYMENT-SECURITY.md);
//  (2) prices / stock / availability can change at any time in HTTP mode;
//  (3) searchParams must be resolved server-side.
export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

async function loadProduct(id: string) {
  return repository.getProductById(id);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const result = await loadProduct(id);

  if (result.status !== 'success') {
    // Product detail is a known defect on the live site (P0-5). A missing
    // record is a real 404 — never a fabricated product page.
    return buildMetadata({
      title: 'Mahsulot topilmadi',
      description: 'So‘ralgan mahsulot mavjud emas yoki o‘chirilgan.',
      path: `/electronics/${id}`,
      noindex: true,
    });
  }

  const product = result.data;
  const monthly = product.financing.monthlyPaymentUzs;
  return buildMetadata({
    title: product.name,
    description: `${product.name} — ${formatUzs(product.priceUzs)}.${
      monthly ? ` Oylik to‘lov ${formatUzs(monthly)}.` : ''
    }`,
    path: `/electronics/${product.id}`,
    ogImage: product.images[0],
  });
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const result = await loadProduct(id);

  if (result.status !== 'success') {
    notFound();
  }

  const product = result.data;

  // Editorial blocks arrive through the repository, not a direct fixture import.
  // Candidates come from the repository, never from fixtures directly. The
  // selection is deterministic — see lib/products/related.ts.
  const [relatedResult, facetsResult, contentResult] = await Promise.all([
    repository.listProducts({ pageSize: 50, sort: 'default' }),
    repository.getProductFacets(),
    repository.getSiteContent(),
  ]);
  const trustBadges = contentResult.status === 'success' ? contentResult.data.trustBadges : [];
  const related =
    relatedResult.status === 'success'
      ? selectRelatedProducts(
          product,
          relatedResult.data.items.filter((item) => item.id !== product.id),
          4,
        )
      : [];

  const categoryLabel =
    facetsResult.status === 'success'
      ? (facetsResult.data.categories.find((entry) => entry.value === product.category)?.label ??
        product.category)
      : product.category;

  const stock = stockMeta(product);
  const monthly = product.financing.monthlyPaymentUzs;

  /**
   * Key specifications — only fields the source actually publishes. There is
   * no separate "model" field, and splitting it out of the display name would
   * be guesswork, so it is not shown as one.
   */
  const keySpecs: { label: string; value: string }[] = [
    { label: 'Brend', value: product.brand },
    { label: 'Kategoriya', value: categoryLabel },
    ...(product.storageGb ? [{ label: 'Xotira', value: `${product.storageGb} GB` }] : []),
    ...(product.batteryHealthPercent
      ? [{ label: 'Batareya holati', value: `${product.batteryHealthPercent}%` }]
      : []),
  ];

  // Detailed specs: null values are dropped rather than printed as "N/A".
  const detailedSpecs = product.specs.filter((spec) => spec.value !== null);

  return (
    <>
      {/*
        Structured data. Availability is mapped from the stock state the source
        publishes, and omitted entirely when that state is 'unknown' — claiming
        InStock for an unconfirmed listing would be a false statement dressed up
        as mark-up.
      */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Bosh sahifa', path: '/' },
          { name: 'Elektronika', path: '/electronics' },
          { name: product.name, path: `/electronics/${product.id}` },
        ])}
      />
      <JsonLd
        data={productJsonLd({
          name: product.name,
          path: `/electronics/${product.id}`,
          brand: product.brand,
          sku: product.id,
          priceUzs: product.priceUzs,
          images: product.images,
          // The name is the cleaned public one; no separate description field
          // exists, so none is claimed.
          availability: product.stockStatus,
        })}
      />
      {/*
        Extra bottom padding so the sticky action bar — and, below md, the
        mobile tab bar underneath it — never covers the end of the page.
      */}
      <Container className="pb-40 pt-8 sm:pt-12 md:pb-28 lg:pb-12">
        {/* 1 — Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm">
          <ol className="flex flex-wrap items-center gap-x-2 text-ink-400">
            <li>
              <Link
                href="/"
                className="inline-flex items-center py-1 transition-colors hover:text-ink-700"
              >
                Bosh sahifa
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/electronics"
                className="inline-flex items-center py-1 transition-colors hover:text-ink-700"
              >
                Elektronika
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="truncate py-1 text-ink-700">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
          {/* 2 — Gallery */}
          <div className="min-w-0">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          {/* ---------- Purchase column ---------- */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {/* 5 — Availability/status, above the title so it is never missed */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={stock.tone}>{stock.label}</Badge>
              <span className="text-xs text-ink-400">{formatViews(product.views)}</span>
            </div>

            {/* 3 — Title */}
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
              {product.brand}
            </p>
            <h1 className="mt-1.5 text-display-sm sm:text-display-md">
              {product.name}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{availabilityNote(product)}</p>

            {/* 4 — Price */}
            <div className="mt-6 border-y border-line py-5">
              <p className="text-[0.8125rem] text-ink-500">Narx</p>
              <p className="mt-1 text-[1.75rem] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[2rem]">
                {formatUzs(product.priceUzs)}
              </p>
              <p className="mt-2 flex h-5 items-center text-sm">
                {monthly ? (
                  <span className="text-brand-700">
                    Oylik to‘lov: <span className="font-semibold">{formatUzs(monthly)}</span>
                  </span>
                ) : (
                  <PendingValue label="Oylik to‘lov: hisob-kitob tayyorlanmoqda" />
                )}
              </p>
              <p className="mt-1 text-xs text-ink-400">
                Oylik to‘lov (agar ko‘rsatilgan bo‘lsa) ochiq e’londan olingan. Yakuniy shartlar
                Markab tomonidan tasdiqlanadi.
              </p>
            </div>

            {/* 6 — Key specifications */}
            <div className="mt-6">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                Asosiy ko‘rsatkichlar
              </h2>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4 rounded-xl border border-line bg-surface-muted p-5">
                {keySpecs.map((spec) => (
                  <div key={spec.label}>
                    <dt className="text-xs uppercase tracking-wide text-ink-400">{spec.label}</dt>
                    <dd className="mt-1 truncate text-sm font-medium text-ink-900">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* 7 — Financing information */}
            <div className="mt-6">
              <FinancingPanel
                financing={product.financing}
                priceUzs={product.priceUzs}
                href={calculatorHref('electronics', product.id)}
                applyHref={applyHref('electronics', product.id)}
              />
            </div>

            {/*
              8 — Main actions. On phones and tablets the same controls are
              also pinned to a sticky bar at the bottom of the viewport.
            */}
            <div className="mt-5 flex flex-col gap-2">
              <AddToCartButton product={product} size="lg" showHint />
              <ButtonLink
                href={applyHref('electronics', product.id)}
                variant="secondary"
                size="lg"
                fullWidth
              >
                Muddatli to‘lov uchun ariza
              </ButtonLink>
              <ButtonLink href="/contact" variant="ghost" size="lg" fullWidth>
                Savol berish
              </ButtonLink>
              <SaveButton
                item={{
                  kind: 'electronics',
                  ref: product.id,
                  title: product.name,
                  priceUzs: product.priceUzs,
                  image: product.images[0] ?? null,
                  href: `/electronics/${product.id}`,
                }}
              />
            </div>
          </div>
        </div>

        {/* 9 — Detailed specifications */}
        <section className="mt-14 border-t border-line pt-10" aria-labelledby="detailed-specs">
          <h2 id="detailed-specs" className="text-xl font-semibold tracking-tight text-ink-900">
            Batafsil xususiyatlar
          </h2>

          {detailedSpecs.length > 0 ? (
            <>
              <dl className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface sm:grid sm:grid-cols-2 sm:divide-y-0">
                {detailedSpecs.map((spec, index) => (
                  <div
                    key={spec.label}
                    className={[
                      'flex items-center justify-between gap-6 px-5 py-3.5',
                      // Two columns from sm: a bottom border on every row but
                      // the last two keeps the grid reading as a table.
                      index < detailedSpecs.length - 2 ? 'sm:border-b sm:border-line' : '',
                      index % 2 === 0 ? 'sm:border-r sm:border-line' : '',
                    ].join(' ')}
                  >
                    <dt className="text-sm text-ink-500">{spec.label}</dt>
                    <dd className="text-right text-sm font-medium text-ink-900">{spec.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs leading-relaxed text-ink-400">
                Faqat ochiq e’londa ko‘rsatilgan xususiyatlar keltirilgan. E’lon qilinmagan
                maydonlar chiqarib tashlangan — ular “N/A” bilan to‘ldirilmaydi. To‘liq texnik
                ma’lumot katalog ulangandan so‘ng qo‘shiladi.
              </p>
            </>
          ) : (
            <div className="mt-6 max-w-2xl">
              <StateBlock
                compact
                variant="empty"
                title="Qo‘shimcha xususiyatlar e’lon qilinmagan"
                description="Bu mahsulot uchun ochiq e’londa faqat narx va asosiy ko‘rsatkichlar ko‘rsatilgan. Batafsil ma’lumotni menejerdan olishingiz mumkin."
                actions={
                  <ButtonLink href="/contact" variant="secondary" size="sm">
                    Menejerga murojaat
                  </ButtonLink>
                }
              />
            </div>
          )}
        </section>

        {/* 10 — Related products */}
        <section className="mt-14 border-t border-line pt-10" aria-labelledby="related-products">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="related-products" className="text-xl font-semibold tracking-tight text-ink-900">
                O‘xshash mahsulotlar
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
                Kategoriya, brend, narx va xotira yaqinligi bo‘yicha saralangan — bu tayyor
                qoidalar asosidagi tanlov, shaxsiy tavsiya emas.
              </p>
            </div>
            <ArrowLink href="/electronics" className="text-sm font-medium text-brand-700">
              Barcha mahsulotlar
            </ArrowLink>
          </div>

          {related.length > 0 ? (
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((item) => (
                <li key={item.id} className="flex flex-col">
                  <ProductCard product={item} />
                  <p className="mt-2 text-xs text-ink-400">{relatedProductReason(product, item)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6">
              <StateBlock
                variant="empty"
                title="O‘xshash mahsulotlar topilmadi"
                description="Hozircha katalogda bu mahsulotga yaqin boshqa e’lon yo‘q."
                actions={
                  <ButtonLink href="/electronics" variant="secondary">
                    Katalogga qaytish
                  </ButtonLink>
                }
              />
            </div>
          )}
        </section>

        {/* 11 — Trust / support */}
        <section className="mt-14 border-t border-line pt-10" aria-labelledby="product-support">
          <h2 id="product-support" className="text-xl font-semibold tracking-tight text-ink-900">
            Kafolat, yetkazib berish va yordam
          </h2>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <StateBlock
              compact
              variant="pending"
              title="Kafolat shartlari"
              description="Kafolat muddati va shartlari Markab tomonidan to‘ldiriladi."
            />
            <StateBlock
              compact
              variant="pending"
              title="Yetkazib berish"
              description="Yetkazib berish muddati va narxi katalog ulangandan so‘ng ko‘rsatiladi."
            />
            <div className="rounded-xl border border-line bg-surface p-5">
              <h3 className="text-sm font-semibold text-ink-900">Qo‘llab-quvvatlash</h3>
              <ul className="mt-3 space-y-3">
                {trustBadges.map((badge) => (
                  <li key={badge.title} className="text-sm">
                    <p className="font-medium text-ink-900">{badge.title}</p>
                    <p className="mt-0.5 text-ink-500">{badge.description}</p>
                    {badge.note ? <p className="mt-1 text-xs text-ink-400">{badge.note}</p> : null}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-sm">
                <ArrowLink href="/faq" className="text-brand-700">
                  Savol-javoblar
                </ArrowLink>
                <ArrowLink href="/contact" className="text-brand-700">
                  Aloqa
                </ArrowLink>
              </div>
            </div>
          </div>
        </section>
      </Container>

      {/* Sticky purchase bar — phones and tablets only. */}
      <div className="sticky-action-bar fixed inset-x-0 z-40 border-t border-line bg-white px-4 py-3 shadow-[0_-1px_3px_rgba(12,17,22,0.06)] sm:px-6 lg:hidden">
        <div className="mx-auto flex max-w-container items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold leading-tight text-ink-900">
              {formatUzs(product.priceUzs)}
            </p>
            <p className="mt-0.5 flex h-4 items-center text-xs">
              {monthly ? (
                <span className="text-brand-700">{formatUzs(monthly)} / oy</span>
              ) : (
                <PendingValue label="Oylik to‘lov tayyorlanmoqda" />
              )}
            </p>
          </div>
          <div className="w-36 shrink-0 sm:w-44">
            <AddToCartButton product={product} size="sm" />
          </div>
        </div>
      </div>
    </>
  );
}
