import type { Metadata } from 'next';
import { Container } from '@/components/ui/Section';
import { AiAdvisor } from '@/components/ai/AiAdvisor';
import { StateBlock } from '@/components/ui/StateBlock';
import { repository } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'AI mahsulot maslahatchisi',
  description:
    'Markab AI kontsepti: ehtiyojingizni yozing, katalogdagi mos e’lonlar ko‘rsatiladi. Moliyaviy va huquqiy savollarga javob bermaydi.',
  path: '/advisor',
});

export default async function AdvisorPage() {
  const [vehiclesResult, productsResult] = await Promise.all([
    repository.listVehicles({ pageSize: 50 }),
    repository.listProducts({ pageSize: 50 }),
  ]);

  const vehicles = vehiclesResult.status === 'success' ? vehiclesResult.data.items : [];
  const products = productsResult.status === 'success' ? productsResult.data.items : [];

  return (
    <Container className="py-10 sm:py-14">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-display-sm sm:text-display-md">AI mahsulot maslahatchisi</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-500">
          Kontsept interfeys. Qoida asosida ishlaydi: katalogdagi real e’lonlarni byudjet va
          toifa bo‘yicha saralaydi, moliyaviy va huquqiy savollarni esa rasmiy manbaga yo‘naltiradi.
        </p>
      </header>

      {vehicles.length === 0 && products.length === 0 ? (
        <StateBlock
          variant="unavailable"
          title="Katalog ma’lumotlari ulanmagan"
          description="AI maslahatchi katalog ma’lumotlari bilan ishlaydi. Ma’lumotlar manbasi ulangandan so‘ng ishga tushadi."
        />
      ) : (
        <AiAdvisor vehicles={vehicles} products={products} />
      )}
    </Container>
  );
}
