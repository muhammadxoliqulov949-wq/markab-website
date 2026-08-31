import { Container, SectionHeading } from '@/components/ui/Section';
import { StateBlock } from '@/components/ui/StateBlock';
import { Reveal } from '@/components/ui/Reveal';
import { Showcase, ShowcaseItem } from '@/components/home/Showcase';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { ProductCard } from '@/components/products/ProductCard';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { dataSourceNote } from '@/lib/data';
import type { Product, Vehicle, Result } from '@/lib/data/types';

type Props = {
  tone?: 'default' | 'muted';
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  headingId: string;
  state: Result<{ vehicles: Vehicle[]; products: Product[] }>;
  kind: 'vehicles' | 'products';
  /** Mobile rail card width — electronics cards are narrower than car cards. */
  itemWidth?: string;
  /** Publicly published total (verified from the live listing pages). */
  publicTotal?: number;
};

/**
 * Homepage marketplace showcase.
 *
 * Data always arrives through the repository — never hardcoded — and every
 * state is handled: success → real cards, empty → Empty state with a route to
 * the catalogue, error → Error state, unavailable → Pending integration.
 *
 * Vehicles use an asymmetric grid (one wide feature card + supporting cards)
 * so imagery stays dominant; electronics use a denser commerce grid.
 */
export function FeaturedShowcase({
  tone = 'default',
  eyebrow,
  title,
  description,
  href,
  cta,
  headingId,
  state,
  kind,
  itemWidth,
  publicTotal,
}: Props) {
  const isVehicles = kind === 'vehicles';

  return (
    <section
      aria-labelledby={headingId}
      className={`${tone === 'muted' ? 'bg-surface-muted' : 'bg-surface'} py-20 sm:py-24 lg:py-28`}
    >
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading id={headingId} eyebrow={eyebrow} title={title} description={description} />
          <ArrowLink href={href} className="shrink-0">
            {cta}
          </ArrowLink>
        </div>

        <div className="mt-12">
          {state.status === 'success' ? (
            <>
              {isVehicles ? (
                <Showcase columns={3}>
                  {state.data.vehicles.map((vehicle, index) => (
                    <ShowcaseItem
                      key={vehicle.id}
                      className={index === 0 ? 'w-[86%] lg:col-span-2' : itemWidth ?? 'w-[80%]'}
                    >
                      <Reveal delay={index * 70}>
                        <VehicleCard vehicle={vehicle} priority={index === 0} featured={index === 0} />
                      </Reveal>
                    </ShowcaseItem>
                  ))}
                </Showcase>
              ) : (
                <Showcase columns={4}>
                  {state.data.products.map((product, index) => (
                    <ShowcaseItem key={product.id} className={itemWidth ?? 'w-[62%]'}>
                      <Reveal delay={index * 60}>
                        <ProductCard product={product} priority={index === 0} />
                      </Reveal>
                    </ShowcaseItem>
                  ))}
                </Showcase>
              )}

              <p className="mt-8 text-xs text-ink-400">
                {dataSourceNote ? `${dataSourceNote} ` : ''}
                {publicTotal
                  ? `Ochiq e’lonlar soni: ${publicTotal} ta (markab.uz bo‘yicha).`
                  : null}
              </p>
            </>
          ) : state.status === 'empty' ? (
            <StateBlock
              variant="empty"
              title={
                isVehicles ? 'Hozircha avtomobillar mavjud emas' : 'Hozircha mahsulotlar mavjud emas'
              }
              description="Tanlangan bo‘lim bo‘yicha e’lonlar topilmadi. Katalogdan to‘liq ro‘yxatni ko‘rishingiz mumkin."
              actions={<ArrowLink href={href}>{cta}</ArrowLink>}
            />
          ) : state.status === 'error' ? (
            <StateBlock variant="error" actions={<ArrowLink href={href}>{cta}</ArrowLink>} />
          ) : (
            <StateBlock
              variant="unavailable"
              title="Ma’lumotlar manbasi ulanmagan"
              description="Real API ulanganda bu bo‘lim avtomatik ravishda jonli e’lonlar bilan to‘ladi."
              actions={<ArrowLink href={href}>{cta}</ArrowLink>}
            />
          )}
        </div>
      </Container>
    </section>
  );
}
