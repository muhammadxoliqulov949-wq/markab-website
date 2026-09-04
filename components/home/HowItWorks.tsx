import { Container, SectionHeading } from '@/components/ui/Section';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { repository } from '@/lib/data';

/**
 * How it works — six published steps.
 *
 * Desktop: a horizontal flow on a single hairline. Mobile: a vertical timeline
 * with a hairline rail. Only steps supported by existing Markab information are
 * used (the public four-step flow plus the two stages published on the financing
 * journey); nothing is added for visual symmetry.
 */
export async function HowItWorks() {
  const content = await repository.getSiteContent();
  const financingSteps = content.status === 'success' ? content.data.financingSteps : [];

  return (
    <section
      id="qanday-ishlaydi"
      aria-labelledby="how-heading"
      className="scroll-mt-24 bg-surface section-y"
    >
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="how-heading"
            eyebrow="Jarayon"
            title="Olti bosqichda yakunlanadi."
            description="Mahsulot tanlashdan tortib, uni qabul qilib olishgacha — har bir bosqich aniq va hujjatlashtirilgan."
          />
          <ArrowLink href="/financing" className="shrink-0">
            Batafsil yo‘l xaritasi
          </ArrowLink>
        </div>

        <ol className="relative mt-14 grid gap-10 lg:mt-16 lg:grid-cols-6 lg:gap-4">
          {/* Connector — desktop only: soft line, not a harsh hairline. */}
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-[20px] hidden h-px bg-gradient-to-r from-transparent via-line to-transparent lg:block"
          />

          {financingSteps.map((step, index) => {
            const isLast = index === financingSteps.length - 1;
            return (
              <li key={step.step} className="relative flex gap-4 lg:flex-col lg:gap-0">
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-[20px] top-12 -bottom-10 w-px bg-line lg:hidden"
                  />
                ) : null}

                <span className="relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold text-ink-900 ring-1 ring-line shadow-subtle lg:mb-6">
                  {step.step}
                </span>

                <div className="min-w-0 pt-1 lg:pt-0 lg:pr-3">
                  <h3 className="text-[15px] font-semibold text-ink-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
