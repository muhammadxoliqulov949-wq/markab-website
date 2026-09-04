import type { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import { GoalChooser } from '@/components/home/GoalChooser';
import { FeaturedShowcase } from '@/components/home/FeaturedShowcase';
import { FinancingPreview } from '@/components/home/FinancingPreview';
import { WhyMarkab } from '@/components/home/WhyMarkab';
import { HowItWorks } from '@/components/home/HowItWorks';
import { InvestSection } from '@/components/home/InvestSection';
import { AppDownloadSection } from '@/components/home/AppDownloadSection';
import { FaqSection } from '@/components/home/FaqSection';
import { HomepageContactSection } from '@/components/home/HomepageContactSection';
import { FinalCta } from '@/components/home/FinalCta';
import { MarkabDivider } from '@/components/ui/MarkabStar';
import { repository } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

/**
 * Rendered per request, not prerendered.
 *
 * This is the cost of the nonce-based Content-Security-Policy: Next.js can
 * only stamp a nonce onto the scripts it injects while it is rendering a
 * response, and a prerendered page is HTML written to disk at build time with
 * no request and no render. It was measured before it was paid — an
 * interleaved A/B on this build showed no systematic difference in LCP, TBT or
 * TTFB, because these pages render from in-memory fixtures and prerendering
 * caches nothing expensive. See docs/PHASE-12-DEPLOYMENT-SECURITY.md §C1.
 */
export const dynamic = 'force-dynamic';

/**
 * Rendered per request, not prerendered.
 *
 * This is the cost of the nonce-based Content-Security-Policy: Next.js can
 * only stamp a nonce onto the scripts it injects while it is rendering a
 * response, and a prerendered page is HTML written to disk at build time with
 * no request and no render. Removing it means giving up prerendering on every
 * route, which is why the cost was measured before it was paid — see
 * docs/PHASE-12-DEPLOYMENT-SECURITY.md §C1.
 */

export const metadata: Metadata = buildMetadata({
  fullTitle: 'Qadriyatlarga asoslangan xotirjamlik! | Markab',
  title: 'Markab',
  description: site.description,
  path: '/',
});

/**
 * Homepage — 9 visual sections, premium editorial rhythm:
 *   header · hero(+trust-strip) · yo‘nalish tanlash · avtomobillar ·
 *   elektronika · moliyalashtirish · nima uchun · sarmoya+jarayon+ilova
 *   (composed as one dark block) · FAQ · final CTA · footer
 *
 * Data comes only from the repository (adapter → fixtures today, API later);
 * nothing is hardcoded and nothing is computed on this page.
 */
export default async function HomePage() {
  const [featured, faq] = await Promise.all([repository.getFeatured(), repository.listFaq()]);

  const faqItems = faq.status === 'success' ? faq.data : [];
  const vehicles = featured.status === 'success' ? featured.data.vehicles : [];
  const products = featured.status === 'success' ? featured.data.products : [];

  const heroVehicle =
    vehicles.find((vehicle) => vehicle.financing.monthlyPaymentUzs) ?? vehicles[0] ?? null;
  const heroProduct =
    products.find((product) => product.financing.monthlyPaymentUzs) ?? products[0] ?? null;

  return (
    <>
      <Hero vehicle={heroVehicle} product={heroProduct} />

      <GoalChooser
        vehicleImage={vehicles[0]?.images[0] ?? heroVehicle?.images[0] ?? null}
        productImage={products[0]?.images[0] ?? heroProduct?.images[0] ?? null}
      />

      <FeaturedShowcase
        eyebrow="Tanlangan takliflar"
        title="Avtomobillar"
        description="Muddatli to‘lov asosida taqdim etilayotgan avtomobillar. Har bir e’lon shartnoma va oldindan ma’lum oylik to‘lov bilan birga keladi."
        href="/cars"
        cta="Barchasini ko‘rish"
        headingId="cars-heading"
        weight="high"
        state={featured}
        kind="vehicles"
        publicTotal={20}
      />

      <FeaturedShowcase
        tone="muted"
        eyebrow="Elektronika"
        title="Telefonlar va texnika"
        description="Muddatli to‘lov asosida xarid qilish mumkin bo‘lgan smartfon va elektronika mahsulotlari."
        href="/electronics"
        cta="Barchasini ko‘rish"
        headingId="electronics-heading"
        state={featured}
        kind="products"
        publicTotal={42}
      />

      <FinancingPreview />

      <WhyMarkab />

      {/* Jarayon + Ilova — visual weight paired, separated by a star divider */}
      <HowItWorks />

      <div className="border-y border-line-faint bg-surface">
        <div className="container-page py-6">
          <MarkabDivider />
        </div>
      </div>

      <InvestSection />

      <AppDownloadSection />

      <FaqSection items={faqItems} />

      <AppDownloadSection />

      <HomepageContactSection />

      <FinalCta />
    </>
  );
}
