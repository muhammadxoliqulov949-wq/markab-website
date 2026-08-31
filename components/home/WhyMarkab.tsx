import { Container, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { valueProps } from '@/lib/data/fixtures/content';

/**
 * Why Markab — calm, editorial, four items.
 *
 * Each item is a published Markab value proposition; none is a superlative
 * ("eng yaxshi", "eng tez"). Where supporting documentation is not published
 * (AAOIFI), the gap is stated on the item itself.
 */
export function WhyMarkab() {
  return (
    <section
      aria-labelledby="why-heading"
      className="bg-surface py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <SectionHeading
          id="why-heading"
          eyebrow="Nima uchun Markab?"
          title="Shaffof shartlar, aniq jarayon"
          description="Saytda e’lon qilingan to‘rtta asosiy tamoyil. Har biri rasmiy hujjatlar bilan to‘ldiriladi."
        />

        <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {valueProps.map((prop, index) => (
            <Reveal key={prop.id} delay={index * 60}>
              <div className="border-t border-line pt-5">
                <span className="text-xs font-semibold tracking-[0.12em] text-brand-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-ink-900">{prop.title}</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-600">
                  {prop.description}
                </p>
                {prop.note ? (
                  <p className="mt-3 text-xs leading-relaxed text-ink-400">{prop.note}</p>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
