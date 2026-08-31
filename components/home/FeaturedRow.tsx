import { ButtonLink } from '@/components/ui/Button';
import { Container, SectionHeading } from '@/components/ui/Section';
import { StateBlock } from '@/components/ui/StateBlock';
import type { Result } from '@/lib/data/types';
import type { Product, Vehicle } from '@/lib/data/types';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { ProductCard } from '@/components/products/ProductCard';
import { dataSourceNote } from '@/lib/data';

type Props = {
  tone?: 'default' | 'muted';
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  state: Result<{ vehicles: Vehicle[]; products: Product[] }>;
  kind: 'vehicles' | 'products';
  /** Publicly published total (verified from the live listing pages). */
  publicTotal?: number;
};

/**
 * Featured row used by both marketplaces on the homepage.
 *
 * Every state is handled: success → real cards, empty → Empty state with a route
 * to the catalogue, error → Error state, unavailable → Pending integration.
 * The live site renders an empty module here while inventory exists (P0-3);
 * this component falls back to the newest/viewed items so that cannot happen.
 */
export function FeaturedRow({
  tone = 'default',
  eyebrow,
  title,
  description,
  href,
  cta,
  state,
  kind,
  publicTotal,
}: Props) {
  return (
    <section className={`${tone === 'muted' ? 'bg-surface-muted' : 'bg-surface'} py-16 sm:py-20`}>
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          <ButtonLink href={href} variant="secondary" className="shrink-0">
            {cta}
          </ButtonLink>
        </div>

        <div className="mt-10">
          {state.status === 'success' ? (
            <>
              <div className={
                kind === 'vehicles'
                  ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3'
              }>
                {kind === 'vehicles'
                  ? state.data.vehicles.map((vehicle) => (
                      <VehicleCard key={vehicle.id} vehicle={vehicle} />
                    ))
                  : state.data.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
              </div>
              <p className="mt-6 text-xs text-ink-400">
                {dataSourceNote ? `${dataSourceNote} ` : ''}
                {publicTotal
                  ? `Ochiq e’lonlar soni: ${publicTotal} ta (markab.uz bo‘yicha).`
                  : null}
              </p>
            </>
          ) : state.status === 'empty' ? (
            <StateBlock
              variant="empty"
              title={kind === 'vehicles' ? 'Hozircha avtomobillar mavjud emas' : 'Hozircha mahsulotlar mavjud emas'}
              description="Tanlangan bo‘lim bo‘yicha e’lonlar topilmadi. Katalogdan to‘liq ro‘yxatni ko‘rishingiz mumkin."
              actions={<ButtonLink href={href} variant="secondary">{cta}</ButtonLink>}
            />
          ) : state.status === 'error' ? (
            <StateBlock variant="error" actions={<ButtonLink href={href} variant="secondary">{cta}</ButtonLink>} />
          ) : (
            <StateBlock
              variant="unavailable"
              title="Ma’lumotlar manbasi ulanmagan"
              description="Real API ulanganda bu bo‘lim avtomatik ravishda jonli e’lonlar bilan to‘ladi."
              actions={<ButtonLink href={href} variant="secondary">{cta}</ButtonLink>}
            />
          )}
        </div>
      </Container>
    </section>
  );
}
