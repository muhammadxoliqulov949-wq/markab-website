import { Container, SectionHeading } from '@/components/ui/Section';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { financingSteps } from '@/lib/data/fixtures/content';

/**
 * How it works — six published steps.
 *
 * Desktop: a horizontal flow on a single hairline. Mobile: a vertical timeline
 * with a hairline rail. Only steps supported by existing Markab information are
 * used (the public four-step flow plus the two stages published on the financing
 * journey); nothing is added for visual symmetry.
 */
export function HowItWorks() {
  return (
    <section
      id="qanday-ishlaydi"
      aria-labelledby="how-heading"
      className="scroll-mt-24 bg-surface-muted py-20 sm:py-24 lg:py-28"
    >
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="how-heading"
            eyebrow="Jarayon"
            title="Muddatli to‘lov qanday ishlaydi"
            description="Mahsulot tanlashdan tortib, uni qabul qilib olishgacha — olti bosqich."
          />
          <ArrowLink href="/financing" className="shrink-0">
            Batafsil yo‘l xaritasi
          </ArrowLink>
        </div>

        <ol className="relative mt-14 grid gap-8 lg:grid-cols-6 lg:gap-6">
          {/* Connector — desktop only. */}
          <span aria-hidden="true" className="absolute left-0 right-0 top-[18px] hidden h-px bg-line lg:block" />

          {financingSteps.map((step, index) => {
            const isLast = index === financingSteps.length - 1;
            return (
              <li key={step.step} className="relative flex gap-4 lg:flex-col lg:gap-0">
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-[18px] top-12 -bottom-8 w-px bg-line lg:hidden"
                  />
                ) : null}

                <span className="relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-sm font-semibold text-ink-900 lg:mb-6">
                  {step.step}
                </span>

                <div className="min-w-0 pt-1 lg:pt-0">
                  <h3 className="text-base font-semibold text-ink-900">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
