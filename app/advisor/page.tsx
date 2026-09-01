import type { Metadata } from 'next';
import { Container } from '@/components/ui/Section';
import { StateBlock } from '@/components/ui/StateBlock';
import { AdvisorFlow, type CategoryState } from '@/components/advisor/AdvisorFlow';
import { AdvisorDisclosure } from '@/components/advisor/AdvisorDisclosure';
import { repository } from '@/lib/data';
import type { Result } from '@/lib/data/types';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Tanlov yordamchisi',
  description:
    'Avtomobil va elektronika bo‘yicha yo‘naltirilgan tanlov: byudjet, brend va xususiyatlar bo‘yicha katalogdagi real e’lonlar saralanadi. Moliyaviy maslahat bermaydi.',
  path: '/advisor',
});

/**
 * /advisor — guided product advisor.
 *
 * Candidates always come from the repository (UI → Repository → Adapter →
 * Provider); the ranking itself is the pure engine in lib/advisor. Nothing on
 * this page can recommend a product the catalogue does not contain, because
 * the page never sees anything the repository did not return.
 */
export default async function AdvisorPage() {
  const [vehiclesResult, productsResult, carFacetsResult, productFacetsResult] = await Promise.all([
    repository.listVehicles({ pageSize: 100 }),
    repository.listProducts({ pageSize: 100 }),
    repository.getVehicleFacets(),
    repository.getProductFacets(),
  ]);

  const vehicles = vehiclesResult.status === 'success' ? vehiclesResult.data.items : [];
  const products = productsResult.status === 'success' ? productsResult.data.items : [];
  const carFacets = carFacetsResult.status === 'success' ? carFacetsResult.data : null;
  const productFacets = productFacetsResult.status === 'success' ? productFacetsResult.data : null;

  const carState = toCategoryState(vehiclesResult, vehicles.length);
  const productState = toCategoryState(productsResult, products.length);

  // Both sources down: there is nothing to recommend from, so say exactly that
  // rather than rendering an empty questionnaire.
  if (carState.status === 'unavailable' && productState.status === 'unavailable') {
    return (
      <Container className="py-10 sm:py-14">
        <Header />
        <AdvisorDisclosure />
        <StateBlock
          variant="unavailable"
          title="Katalog ma’lumotlari ulanmagan"
          description="Tanlov yordamchisi katalog ma’lumotlari bilan ishlaydi. Ma’lumotlar manbasi ulangandan so‘ng ishga tushadi."
        />
      </Container>
    );
  }

  if (carState.status === 'error' && productState.status === 'error') {
    return (
      <Container className="py-10 sm:py-14">
        <Header />
        <AdvisorDisclosure />
        <StateBlock
          variant="error"
          title="Katalogni o‘qib bo‘lmadi"
          description={
            vehiclesResult.status === 'error'
              ? vehiclesResult.error.message
              : 'Ma’lumotlarni yuklashda xatolik yuz berdi.'
          }
        />
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <Header />
      <AdvisorDisclosure />
      <AdvisorFlow
        vehicles={vehicles}
        products={products}
        carFacets={carFacets}
        productFacets={productFacets}
        carState={carState}
        productState={productState}
      />
    </Container>
  );
}

function toCategoryState<T>(result: Result<T>, itemCount: number): CategoryState {
  switch (result.status) {
    case 'success':
      // A successful request that returned nothing is "empty", not a failure —
      // the catalogue is reachable, it just has no records for this category.
      return { status: itemCount > 0 ? 'success' : 'empty' };
    case 'empty':
    case 'not_found':
      return { status: 'empty' };
    case 'error':
      return { status: 'error', message: result.error.message };
    default:
      return { status: 'unavailable' };
  }
}

function Header() {
  return (
    <header className="mb-8 max-w-2xl">
      <h1 className="text-display-sm sm:text-display-md">Tanlov yordamchisi</h1>
      <p className="mt-3 text-base leading-relaxed text-ink-500">
        Bir nechta savolga javob bering — katalogdagi real e’lonlar orasidan mos keladiganlari
        saralanadi. Har bir tavsiya qaysi talabga mos kelgani bilan izohlanadi. Yordamchi
        moliyaviy maslahat bermaydi va hech qanday to‘lovni hisoblamaydi.
      </p>
    </header>
  );
}
