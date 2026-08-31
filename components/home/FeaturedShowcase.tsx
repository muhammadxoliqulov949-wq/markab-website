import { ButtonLink } from '@/components/ui/Button';
import { Container, SectionHeading } from '@/components/ui/Section';
import { StateBlock } from '@/components/ui/StateBlock';
import { Reveal } from '@/components/ui/Reveal';
import { Showcase, ShowcaseItem } from '@/components/home/Showcase';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { ProductCard } from '@/components/products/ProductCard';
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
 * Data always comes from the repository — never hardcoded — and every state is
 * handled: success → real cards, empty → Empty state with a route to the
 * catalogue, error → Error state, unavailable → Pending integration.
 * The live site renders an empty module here while inventory exists (P0-3);
 * this component cannot reproduce that, because the fallbacks are explicit.
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
      className={`${tone === 'muted' ? 'bg-surface-muted' : 'bg-surface'} py-16 sm:py-20 lg:py-24`}
    >
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id={headingId}
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
          <ButtonLink href={href} variant="secondary" className="shrink-0">
            {cta}
          </ButtonLink>
        </div>

        <div className="mt-10">
          {state.status === 'success' ? (
            <>
              <Showcase columns={isVehicles ? 3 : 4}>
                {isVehicles
                  ? state.data.vehicles.map((vehicle, index) => (
                      <ShowcaseItem key={vehicle.id} className={itemWidth ?? 'w-[80%]'}>
                        <Reveal delay={index * 60}>
                          <VehicleCard vehicle={vehicle} priority={index === 0} />
                        </Reveal>
                      </ShowcaseItem>
                    ))
                  : state.data.products.map((product, index) => (
                      <ShowcaseItem key={product.id} className={itemWidth ?? 'w-[62%]'}>
                        <Reveal delay={index * 60}>
                          <ProductCard product={product} priority={index === 0} />
                        </Reveal>
                      </ShowcaseItem>
                    ))}
              </Showcase>

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
              title={
                isVehicles ? 'Hozircha avtomobillar mavjud emas' : 'Hozircha mahsulotlar mavjud emas'
              }
              description="Tanlangan bo‘lim bo‘yicha e’lonlar topilmadi. Katalogdan to‘liq ro‘yxatni ko‘rishingiz mumkin."
              actions={
                <ButtonLink href={href} variant="secondary">
                  {cta}
                </ButtonLink>
              }
            />
          ) : state.status === 'error' ? (
            <StateBlock
              variant="error"
              actions={
                <ButtonLink href={href} variant="secondary">
                  {cta}
                </ButtonLink>
              }
            />
          ) : (
            <StateBlock
              variant="unavailable"
              title="Ma’lumotlar manbasi ulanmagan"
              description="Real API ulanganda bu bo‘lim avtomatik ravishda jonli e’lonlar bilan to‘ladi."
              actions={
                <ButtonLink href={href} variant="secondary">
                  {cta}
                </ButtonLink>
              }
            />
          )}
        </div>
      </Container>
    </section>
  );
}
