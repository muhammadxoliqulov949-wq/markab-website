import { Container, SectionHeading } from '@/components/ui/Section';
import { StateBlock } from '@/components/ui/StateBlock';
import { Reveal } from '@/components/ui/Reveal';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { ProductCard } from '@/components/products/ProductCard';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { dataSourceNote } from '@/lib/data';
import type { Product, Vehicle, Result } from '@/lib/data/types';

type Props = {
  tone?: 'default' | 'muted';
  /**
   * Editorial weight. Cars carry more air than electronics so the two
   * catalogue blocks do not read as equals.
   */
  weight?: 'high' | 'medium';
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  headingId: string;
  state: Result<{ vehicles: Vehicle[]; products: Product[] }>;
  kind: 'vehicles' | 'products';
  /** Publicly published total (verified from the live listing pages). */
  publicTotal?: number;
};

/**
 * Homepage marketplace showcase.
 *
 * Two deliberate layouts, both with a controlled 4:3 image frame:
 *  • vehicles   — one wide editorial feature card, then a two-up row.
 *  • products   — a dense commerce grid (rail on phones).
 *
 * Data always arrives through the repository — never hardcoded — and every
 * state is handled: success → real cards, empty → Empty state with a route to
 * the catalogue, error → Error state, unavailable → Pending integration.
 */
export function FeaturedShowcase({
  tone = 'default',
  weight = 'medium',
  eyebrow,
  title,
  description,
  href,
  cta,
  headingId,
  state,
  kind,
  publicTotal,
}: Props) {
  const isVehicles = kind === 'vehicles';

  return (
    <section
      aria-labelledby={headingId}
      className={`${tone === 'muted' ? 'bg-surface-sunken' : 'bg-surface'} ${
        weight === 'high' ? 'py-16 sm:py-20 lg:py-24' : 'section-y'
      }`}
    >
      <Container>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id={headingId}
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
          <ArrowLink href={href} className="shrink-0">
            {cta}
          </ArrowLink>
        </div>

        <div className="mt-7 sm:mt-9 lg:mt-11">
          {state.status === 'success' ? (
            <>
              {/*
                One grid on sm+. On phones, a horizontal snap rail with
                peeked next-card (78vw card → 11% gap → the next card peeks on
                the right to signal horizontal scroll, iOS App Store style).
                Desktop grid geometry, sizes and image ratios are untouched.
              */}
              {isVehicles ? (
                <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3">
                  {state.data.vehicles.map((vehicle, index) => (
                    <li key={vehicle.id} className="w-[78vw] shrink-0 snap-start sm:w-auto">
                      <Reveal delay={index * 70}>
                        <VehicleCard
                          vehicle={vehicle}
                          priority={index === 0}
                          highlight={index === 0}
                        />
                      </Reveal>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3">
                  {state.data.products.map((product, index) => (
                    <li
                      key={product.id}
                      className="w-[78vw] shrink-0 snap-start sm:w-auto"
                    >
                      <Reveal delay={index * 60}>
                        <ProductCard product={product} priority={index === 0} />
                      </Reveal>
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-5 text-[11px] leading-relaxed text-ink-400 sm:mt-7 sm:text-xs">
                {dataSourceNote() ? `${dataSourceNote()} ` : ''}
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
              title="Katalog vaqtincha ulanmagan"
              description="Real API ulanganda bu bo‘lim avtomatik ravishda jonli e’lonlar bilan to‘ladi."
              actions={<ArrowLink href={href}>{cta}</ArrowLink>}
            />
          )}
        </div>
      </Container>
    </section>
  );
}
