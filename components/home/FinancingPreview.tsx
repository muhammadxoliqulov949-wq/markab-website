import { Container, SectionHeading } from '@/components/ui/Section';
import { ButtonLink } from '@/components/ui/Button';
import { InstallmentCalculator } from '@/components/calculator/InstallmentCalculator';

/**
 * Homepage calculator preview.
 * The calculator itself is the same component used on /financing/calculator.
 */
export function FinancingPreview() {
  return (
    <section className="bg-surface py-16 sm:py-20 lg:py-24" aria-labelledby="financing-preview-heading">
      <Container>
        <SectionHeading
          eyebrow="Moliyalashtirish"
          title="Oylik to‘lovni oldindan hisoblang"
          description="Narx, boshlang‘ich to‘lov va muddatni kiriting — qulay variantni tanlang."
        />
        <h2 id="financing-preview-heading" className="sr-only">
          To‘lov kalkulyatori
        </h2>

        <div className="mt-10">
          <InstallmentCalculator initialPrice={120_000_000} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/financing/calculator" variant="secondary">
            Kengaytirilgan kalkulyator
          </ButtonLink>
          <ButtonLink href="/financing" variant="ghost">
            Shartlar va hujjatlar
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
