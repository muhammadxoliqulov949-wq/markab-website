import { Container, SectionHeading } from '@/components/ui/Section';
import { valueProps } from '@/lib/data/fixtures/content';

export function WhyMarkab() {
  return (
    <section className="bg-surface-muted py-16 sm:py-20 lg:py-24" aria-labelledby="why-heading">
      <Container>
        <SectionHeading
          eyebrow="Nima uchun Markab?"
          title="Qadriyatlarga asoslangan moliya tamoyillari"
          description="Saytda e’lon qilingan to‘rtta asosiy tamoyil. Har biri rasmiy hujjatlar bilan to‘ldiriladi."
        />
        <h2 id="why-heading" className="sr-only">
          Nima uchun Markab?
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map((prop, index) => (
            <div
              key={prop.id}
              className="flex h-full flex-col rounded-xl border border-line bg-surface p-6 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <span className="text-xs font-semibold text-brand-600">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink-900">{prop.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">{prop.description}</p>
              {prop.note ? (
                <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-ink-400">
                  {prop.note}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
