import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { StateBlock, PendingValue } from '@/components/ui/StateBlock';
import { ButtonLink } from '@/components/ui/Button';
import { ProductGallery } from '@/components/products/ProductGallery';
import { AddToCartButton } from '@/components/products/AddToCartButton';
import { ProductCard } from '@/components/products/ProductCard';
import { FinancingPanel } from '@/components/vehicles/FinancingPanel';
import { formatUzs, formatViews } from '@/lib/format';
import { stockLabels } from '@/lib/labels';
import { repository } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const result = await repository.getProductById(id);

  if (result.status !== 'success') {
    // Product detail is a known defect on the live site (P0-5). A missing record
    // is a real 404 — never a fabricated product page.
    return buildMetadata({
      title: 'Mahsulot topilmadi',
      description: 'So‘ralgan mahsulot mavjud emas yoki o‘chirilgan.',
      path: `/electronics/${id}`,
      noindex: true,
    });
  }

  const product = result.data;
  return buildMetadata({
    title: product.name,
    description: `${product.name} — ${formatUzs(product.priceUzs)}.${
      product.financing.monthlyPaymentUzs
        ? ` Oylik to‘lov ${formatUzs(product.financing.monthlyPaymentUzs)}.`
        : ''
    }`,
    path: `/electronics/${product.id}`,
    ogImage: product.images[0],
  });
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const result = await repository.getProductById(id);

  if (result.status !== 'success') {
    notFound();
  }

  const product = result.data;
  const relatedResult = await repository.listProducts({ pageSize: 5 });
  const related = (relatedResult.status === 'success' ? relatedResult.data.items : [])
    .filter((item) => item.id !== product.id)
    .slice(0, 4);

  const stock = stockLabels[product.stockStatus];

  return (
    <Container className="py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-ink-400">
          <li>
            <Link href="/" className="hover:text-ink-700">
              Bosh sahifa
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/electronics" className="hover:text-ink-700">
              Elektronika
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="truncate text-ink-700">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
        <ProductGallery images={product.images} name={product.name} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={stock.tone}>{stock.label}</Badge>
            <span className="text-xs text-ink-400">{formatViews(product.views)}</span>
          </div>

          <h1 className="mt-3 text-2xl font-semibold text-ink-900 sm:text-3xl">{product.name}</h1>

          <p className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-ink-900">
            {formatUzs(product.priceUzs)}
          </p>
          {product.financing.monthlyPaymentUzs ? (
            <p className="mt-1 text-sm text-brand-700">
              {formatUzs(product.financing.monthlyPaymentUzs)} / oy
            </p>
          ) : (
            <p className="mt-1">
              <PendingValue label="Oylik to‘lov: hisob-kitob tayyorlanmoqda" />
            </p>
          )}

          <div className="mt-6">
            <AddToCartButton product={product} />
          </div>

          <div className="mt-8">
            <h2 className="text-base font-semibold text-ink-900">Texnik xususiyatlar</h2>
            <dl className="mt-4 divide-y divide-line rounded-xl border border-line">
              {product.specs.map((spec) => (
                <div key={spec.label} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <dt className="text-sm text-ink-500">{spec.label}</dt>
                  <dd className="text-sm text-ink-900">
                    {spec.value ?? <PendingValue />}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-ink-400">
              Faqat ochiq e’londa ko‘rsatilgan xususiyatlar keltirilgan. To‘liq texnik ma’lumot
              rasmiy manba ulangandan so‘ng qo‘shiladi.
            </p>
          </div>

          <div className="mt-6">
            <FinancingPanel
              financing={product.financing}
              priceUzs={product.priceUzs}
              href="/financing/calculator"
              applyHref={`/financing/apply?type=electronics&ref=${product.id}`}
            />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <ButtonLink href={`/financing/apply?type=electronics&ref=${product.id}`} size="lg">
              Ariza yuborish
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary" size="lg">
              Savol berish
            </ButtonLink>
          </div>

          <StateBlock
            compact
            className="mt-4"
            variant="pending"
            title="Kafolat va yetkazib berish"
            description="Bu ma’lumotlar rasmiy manba tomonidan to‘ldiriladi."
            actions={
              <ButtonLink href="/faq" variant="secondary" size="sm">
                Savol-javoblar
              </ButtonLink>
            }
          />
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-16 border-t border-line pt-10" aria-labelledby="related-products">
          <h2 id="related-products" className="text-xl font-semibold text-ink-900">
            O‘xshash mahsulotlar
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  );
}
