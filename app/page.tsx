import type { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import { TrustLayer } from '@/components/home/TrustLayer';
import { GoalChooser } from '@/components/home/GoalChooser';
import { FeaturedRow } from '@/components/home/FeaturedRow';
import { FinancingPreview } from '@/components/home/FinancingPreview';
import { WhyMarkab } from '@/components/home/WhyMarkab';
import { HowItWorks } from '@/components/home/HowItWorks';
import { InvestSection } from '@/components/home/InvestSection';
import { AcademySection } from '@/components/home/AcademySection';
import { AppSection } from '@/components/home/AppSection';
import { FaqSection } from '@/components/home/FaqSection';
import { FinalCta } from '@/components/home/FinalCta';
import { repository } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  fullTitle: 'Markab — Qadriyatlarga asoslangan xotirjamlik!',
  title: 'Markab',
  description: site.description,
  path: '/',
});

export default async function HomePage() {
  const [featured, faq] = await Promise.all([repository.getFeatured(), repository.listFaq()]);

  const vehicles = featured.status === 'success' ? featured.data.vehicles : [];
  const products = featured.status === 'success' ? featured.data.products : [];

  return (
    <>
      <Hero vehicle={vehicles[0] ?? null} product={products[0] ?? null} />
      <TrustLayer />
      <GoalChooser />

      <FeaturedRow
        eyebrow="Tanlangan takliflar"
        title="Avtomobillar"
        description="Muddatli to‘lov asosida taqdim etilayotgan avtomobillar."
        href="/cars"
        cta="Barcha avtomobillar"
        state={featured}
        kind="vehicles"
        publicTotal={20}
      />

      <FeaturedRow
        tone="muted"
        eyebrow="Elektronika"
        title="Elektronika va maishiy texnika"
        description="Smartfonlar va boshqa mahsulotlar muddatli to‘lov asosida."
        href="/electronics"
        cta="Barcha mahsulotlar"
        state={featured}
        kind="products"
        publicTotal={42}
      />

      <FinancingPreview />
      <WhyMarkab />
      <HowItWorks />
      <InvestSection />
      <AcademySection />
      <AppSection />
      <FaqSection items={faq.status === 'success' ? faq.data : []} />
      <FinalCta />
    </>
  );
}
