import { Container, SectionHeading } from '@/components/ui/Section';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { repository } from '@/lib/data';
import {
  Package,
  FileText,
  PenLine,
  BadgeCheck,
  FileSignature,
  KeyRound,
  type LucideIcon,
} from 'lucide-react';

/**
 * Step icon emblems — one coherent family, one size, one palette.
 * lucide-react (ISC, tree-shakeable) is the only source: no custom raster
 * or unlicensed assets. Order follows the six published steps in the
 * content fixture (select → terms → application → approval → contract →
 * handover), so a shorter list keeps correct semantics per index.
 */
const stepIcons: LucideIcon[] = [Package, FileText, PenLine, BadgeCheck, FileSignature, KeyRound];

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
          {/* Connector — desktop only: soft line, not a harsh hairline.
              Centered on the 64px icon emblem (top-8 = 32px). */}
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-line to-transparent lg:block"
          />

          {financingSteps.map((step, index) => {
            const isLast = index === financingSteps.length - 1;
            const StepIcon = stepIcons[index % stepIcons.length] ?? Package;
            return (
              <li key={step.step} className="relative flex gap-4 lg:flex-col lg:gap-0">
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-[28px] top-16 -bottom-10 w-px bg-line lg:hidden"
                  />
                ) : null}

                {/* Step emblem — the primary visual of each step: a 56px (64px on
                    desktop) brand-washed disc with a large glyph, lifted by the
                    brand glow token; the step number is now the small badge on
                    its bottom-right rim. */}
                <span className="relative z-10 inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 shadow-glow lg:mb-6 lg:h-16 lg:w-16">
                  <StepIcon aria-hidden="true" className="h-7 w-7 lg:h-8 lg:w-8" strokeWidth={2} />
                  <span className="absolute -bottom-1.5 -right-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface text-[10px] font-semibold text-ink-900 ring-1 ring-line shadow-subtle">
                    {step.step}
                  </span>
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
