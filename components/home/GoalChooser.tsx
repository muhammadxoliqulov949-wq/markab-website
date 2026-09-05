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
 * Desktop: four columns (280-300px cards). Tablet: two. Phone: a tight iOS-
 * style snap rail with peek-previews (72% card width so the next card shows
 * at the edge, signalling horizontal scroll), tighter radius, smaller
 * padding, and aspect ratio tuned for thumb-friendly scanning.
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
      strokeWidth="2"
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
    <section aria-labelledby="goals-heading" className="bg-surface-muted section-y-sm">
      <Container>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-5">
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

        {/*
          Mobile rail — iOS App-Store-style peeking cards.
          Tighter card (72vw), reduced radius (card token, not panel), tighter
          internal padding, and the chevron CTA sits inline at the bottom so
          cards read as tappable destinations not articles. sm+ revert to the
          original 2/4-up grid untouched.
        */}
        <ul
          className="no-scrollbar -mx-4 mt-7 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2
                     sm:mx-0 sm:mt-9 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0
                     lg:mt-11 lg:grid-cols-4"
        >
          {cards.map((card, index) => {
            const art = GOAL_ART[card.id];
            return (
              <li
                key={card.id}
                className="w-[72vw] shrink-0 snap-start sm:w-auto"
              >
                <Reveal delay={index * 70}>
                  <Link
                    href={card.href}
                    className="group flex h-full flex-col overflow-hidden rounded-[16px] border border-line-hairline bg-surface shadow-[0_2px_10px_-4px_rgba(11,18,32,0.08)] transition-card active:scale-[0.98]
                               sm:rounded-card sm:border-line sm:shadow-none
                               hover-only:-translate-y-1 hover-only:border-brand-200/70 hover-only:shadow-card-hover"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted sm:aspect-[4/3]">
                      {card.image ? (
                        <>
                          <RemoteImage
                            src={card.image}
                            alt={card.alt}
                            fill
                            sizes="(max-width: 640px) 72vw, (max-width: 1024px) 45vw, 24vw"
                            className="object-cover object-center transition-transform duration-[900ms] ease-smooth group-hover:scale-[1.04]"
                            fallbackLabel=""
                          />
                          <div
                            className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                            aria-hidden="true"
                          />
                        </>
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 bg-gradient-to-br from-brand-50 via-brand-50 to-brand-100/70 px-4">
                          <svg
                            viewBox="0 0 48 48"
                            className="h-12 w-12 text-brand-600/70 sm:h-16 sm:w-16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d={art?.path ?? ''} />
                          </svg>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-700/80 sm:text-[11px]">
                            {art?.caption}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <h3 className="text-[15px] font-semibold leading-snug text-ink-900 sm:text-base">
                        {card.title}
                      </h3>
                      <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-ink-500 sm:mt-2 sm:text-sm">
                        {card.description}
                      </p>
                      <span
                        className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 transition-colors duration-200 group-hover:text-brand-800
                                   sm:mt-5 sm:gap-1.5 sm:text-sm"
                      >
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

        <p className="mt-5 text-sm text-ink-500 lg:hidden">
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
