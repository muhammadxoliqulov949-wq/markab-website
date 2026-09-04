import Link from 'next/link';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { homepageGoals } from '@/lib/site';

/**
 * "Sizga nima kerak?" — four balanced destination cards.
 *
 * Every card has the same anatomy (visual → title → one line → CTA), so the
 * four goals read as equal choices rather than a feature grid. The two
 * catalogue goals are backed by real catalogue photography from the adapter;
 * the two service goals use a brand-tinted line-art panel. Nothing decorative
 * is invented for the sake of symmetry.
 *
 * Desktop: four columns. Tablet: two. Phone: a snap-scrolling rail.
 */

const GOAL_ART: Record<string, { path: string; caption: string }> = {
  financing: {
    path: 'M8 4h34a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Zm2 12h26M6 24h30M6 32h18M30 22v12M24 28h12',
    caption: 'To‘lov rejasi va shartlar',
  },
  invest: {
    path: 'M6 6v34h34M12 32l9-8 7 5 12-15M34 14h6v6',
    caption: 'Ishtirok modeli',
  },
};

function ArrowIcon() {
  return (
    <svg
      className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:translate-x-1"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GoalChooser({
  vehicleImage,
  productImage,
}: {
  vehicleImage: string | null;
  productImage: string | null;
}) {
  const cards = [
    { ...homepageGoals[0], image: vehicleImage, alt: 'Muddatli to‘lovga taqdim etilayotgan avtomobil' },
    { ...homepageGoals[1], image: productImage, alt: 'Muddatli to‘lovga taqdim etilayotgan elektronika' },
    { ...homepageGoals[2], image: null, alt: '' },
    { ...homepageGoals[3], image: null, alt: '' },
  ];

  return (
    <section aria-labelledby="goals-heading" className="bg-surface-muted section-y">
      <Container>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="goals-heading"
            eyebrow="Yo‘nalish tanlang"
            title="Sizga nima kerak?"
            description="To‘rtta asosiy yo‘nalish — har biri aniq keyingi qadam bilan."
          />
          <p className="hidden shrink-0 text-sm text-ink-500 lg:block">
            O‘rganishni xohlaysizmi?{' '}
            <Link
              href="/academy"
              className="font-medium text-brand-700 underline underline-offset-4 transition-colors hover:text-brand-800"
            >
              Markab Academy
            </Link>
          </p>
        </div>

        {/* Mobile: snap rail. sm+: grid. */}
        <ul className="no-scrollbar -mx-5 mt-9 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:mt-11 lg:grid-cols-4">
          {cards.map((card, index) => {
            const art = GOAL_ART[card.id];
            return (
              <li
                key={card.id}
                className="w-[80%] shrink-0 snap-start sm:w-auto"
              >
                <Reveal delay={index * 70}>
                  <Link
                    href={card.href}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-500 ease-smooth hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
                      {card.image ? (
                        <>
                          <RemoteImage
                            src={card.image}
                            alt={card.alt}
                            fill
                            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 24vw"
                            className="object-cover object-center transition-transform duration-[900ms] ease-smooth group-hover:scale-[1.04]"
                            fallbackLabel=""
                          />
                          <div
                            className="absolute inset-0 bg-gradient-to-t from-ink-900/20 to-transparent"
                            aria-hidden="true"
                          />
                        </>
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-brand-50 via-brand-50 to-brand-100/70 px-4">
                          <svg
                            viewBox="0 0 48 48"
                            className="h-16 w-16 text-brand-600/70"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d={art?.path ?? ''} />
                          </svg>
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700/80">
                            {art?.caption}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-base font-semibold leading-snug text-ink-900">
                        {card.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">
                        {card.description}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors duration-200 group-hover:text-brand-800">
                        {card.cta}
                        <ArrowIcon />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>

        <p className="mt-7 text-sm text-ink-500 lg:hidden">
          O‘rganishni xohlaysizmi?{' '}
          <Link
            href="/academy"
            className="inline-flex min-h-[24px] items-center font-medium text-brand-700 underline underline-offset-4"
          >
            Markab Academy
          </Link>
        </p>
      </Container>
    </section>
  );
}
