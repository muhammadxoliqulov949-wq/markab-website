import Link from 'next/link';
import { Container, SectionHeading } from '@/components/ui/Section';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { financingSteps } from '@/lib/data/fixtures/content';

/**
 * How it works — six steps, horizontal flow on desktop, vertical timeline on
 * mobile. The steps are the published Markab customer journey (the homepage's
 * four public steps, expanded with the two official stages published on the
 * financing flow). Nothing is invented here.
 */
export function HowItWorks() {
  return (
    <section
      id="qanday-ishlaydi"
      aria-labelledby="how-heading"
      className="bg-surface-muted py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="how-heading"
            eyebrow="Jarayon"
            title="Muddatli to‘lov qanday ishlaydi"
            description="Mahsulot tanlashdan tortib, uni qabul qilib olishgacha — olti bosqich."
          />
          <ButtonLink href="/financing" variant="secondary" className="shrink-0">
            Batafsil yo‘l xaritasi
          </ButtonLink>
        </div>

        <ol className="relative mt-12 grid gap-8 lg:grid-cols-6 lg:gap-5">
          {/* Connector — desktop only. */}
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-5 hidden h-px bg-line lg:block"
          />

          {financingSteps.map((step, index) => {
            const isLast = index === financingSteps.length - 1;
            return (
              <li key={step.step} className="relative flex gap-4 lg:flex-col lg:gap-0">
                {/* Connector — mobile timeline only. */}
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-5 top-12 -bottom-8 w-px bg-line lg:hidden"
                  />
                ) : null}

                <span className="relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-sm font-semibold text-ink-900 lg:mb-5">
                  {step.step}
                </span>

                <div className="min-w-0 pt-1.5 lg:pt-0">
                  <h3 className="text-base font-semibold text-ink-900">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <Reveal>
          <p className="mt-10 text-xs leading-relaxed text-ink-400">
            Shartnoma turi bo‘yicha batafsil ma’lumot Academy bo‘limida paydo bo‘ladi:{' '}
            <Link href="/academy" className="text-brand-700 underline underline-offset-2">
              Murabaha darslari
            </Link>
            . Rasmiy shartlar tasdiqlangach shu yerda ko‘rsatiladi.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
