import { Container, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { valueProps } from '@/lib/data/fixtures/content';

/**
 * Why Markab — calm, editorial, four items.
 *
 * No cards, no boxes: a large statement on the left and a numbered hairline list
 * on the right. Each item is a published Markab value proposition; none is a
 * superlative ("eng yaxshi", "eng tez"), and where supporting documentation is
 * missing (AAOIFI) the gap is stated on the item itself.
 */
export function WhyMarkab() {
  return (
    <section aria-labelledby="why-heading" className="bg-surface py-20 sm:py-24 lg:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <SectionHeading
            id="why-heading"
            eyebrow="Nima uchun Markab?"
            title="Shaffof shartlar, tushunarli jarayon"
            description="Saytda e’lon qilingan asosiy tamoyillar. Har biri rasmiy hujjatlar bilan to‘ldiriladi."
          />

          <div className="lg:pt-2">
            {valueProps.map((prop, index) => (
              <Reveal key={prop.id} delay={index * 60}>
                <div className="border-t border-line py-6 first:border-t-0 first:pt-0">
                  <div className="flex gap-5">
                    <span className="mt-0.5 text-xs font-semibold tracking-[0.14em] text-brand-600">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="max-w-lg">
                      <h3 className="text-lg font-semibold text-ink-900">{prop.title}</h3>
                      <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-600">
                        {prop.description}
                      </p>
                      {prop.note ? (
                        <p className="mt-2.5 text-xs leading-relaxed text-ink-400">{prop.note}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
