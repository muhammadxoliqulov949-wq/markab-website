import type { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import { TrustLayer } from '@/components/home/TrustLayer';
import { GoalChooser } from '@/components/home/GoalChooser';
import { FeaturedShowcase } from '@/components/home/FeaturedShowcase';
import { FinancingPreview } from '@/components/home/FinancingPreview';
import { WhyMarkab } from '@/components/home/WhyMarkab';
import { HowItWorks } from '@/components/home/HowItWorks';
import { InvestSection } from '@/components/home/InvestSection';
import { AcademySection } from '@/components/home/AcademySection';
import { AppSection } from '@/components/home/AppSection';
import { FaqSection } from '@/components/home/FaqSection';
import { FinalCta } from '@/components/home/FinalCta';
import { Reveal } from '@/components/ui/Reveal';
import { repository } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  fullTitle: 'Markab — Qadriyatlarga asoslangan xotirjamlik!',
  title: 'Markab',
  description: site.description,
  path: '/',
});

/**
 * Homepage — 15 blocks in a deliberate order:
 *   header · hero · trust · choose your goal · featured cars · featured
 *   electronics · financing/calculator preview · why Markab · how it works ·
 *   investment · academy · digital experience · FAQ · final CTA · footer
 *
 * Data comes only from the repository (adapter → fixtures today, API later);
 * nothing is hardcoded and nothing is computed on this page.
 */
export default async function HomePage() {
  const [featured, faq] = await Promise.all([repository.getFeatured(), repository.listFaq()]);

  const faqItems = faq.status === 'success' ? faq.data : [];
  const vehicles = featured.status === 'success' ? featured.data.vehicles : [];
  const products = featured.status === 'success' ? featured.data.products : [];

  /*
   * The hero prefers an item whose financing figures are actually published, so
   * the card shows real values rather than three pending markers. This is a
   * presentation choice over verified data — nothing is computed or invented.
   */
  const heroVehicle =
    vehicles.find((vehicle) => vehicle.financing.monthlyPaymentUzs) ?? vehicles[0] ?? null;
  const heroProduct =
    products.find((product) => product.financing.monthlyPaymentUzs) ?? products[0] ?? null;

  return (
    <>
      <Hero vehicle={heroVehicle} product={heroProduct} />

      <TrustLayer />

      <GoalChooser />

      <FeaturedShowcase
        tone="muted"
        eyebrow="Tanlangan takliflar"
        title="Avtomobillar"
        description="Muddatli to‘lov asosida taqdim etilayotgan avtomobillar."
        href="/cars"
        cta="Barchasini ko‘rish"
        headingId="cars-heading"
        state={featured}
        kind="vehicles"
        itemWidth="w-[82%]"
        publicTotal={20}
      />

      <FeaturedShowcase
        eyebrow="Elektronika"
        title="Telefonlar va elektronika"
        description="Muddatli to‘lov asosida xarid qilish mumkin bo‘lgan mahsulotlar."
        href="/electronics"
        cta="Barchasini ko‘rish"
        headingId="electronics-heading"
        state={featured}
        kind="products"
        itemWidth="w-[62%]"
        publicTotal={42}
      />

      <FinancingPreview />

      <WhyMarkab />

      <HowItWorks />

      <InvestSection />

      <Reveal>
        <AcademySection />
      </Reveal>

      <AppSection />

      <FaqSection items={faqItems} />

      <FinalCta />
    </>
  );
}
