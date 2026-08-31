import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { PendingValue } from '@/components/ui/StateBlock';
import { repository } from '@/lib/data';
import { academyCategories } from '@/lib/data/fixtures/academy';

/**
 * Academy preview — three featured lessons.
 *
 * Titles, categories and the "5–10 daqiqa" duration are verbatim from the public
 * homepage block. Lesson bodies were never published, so each card states that
 * the content is pending instead of showing fabricated educational text.
 * No certificate or qualification claim appears anywhere.
 */
export async function AcademySection() {
  const result = await repository.listLessons();
  const items = result.status === 'success' ? result.data : [];

  return (
    <section
      aria-labelledby="academy-heading"
      className="bg-surface py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="academy-heading"
            eyebrow="Markab Academy"
            title="Moliyaviy savodxonlik"
            description="Muddatli to‘lov, murabaha va sarmoya asoslari bo‘yicha qisqa darslar."
          />
          <ButtonLink href="/academy" variant="secondary" className="shrink-0">
            Barcha darslar
          </ButtonLink>
        </div>

        {items.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((lesson, index) => {
              const category = academyCategories.find((item) => item.id === lesson.category);
              return (
                <Reveal key={lesson.slug} delay={index * 60}>
                  <Link
                    href={`/academy/${lesson.slug}`}
                    className="group flex h-full flex-col rounded-xl border border-line bg-surface p-6 shadow-card transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-md bg-surface-sunken px-2.5 py-1 text-xs font-medium text-ink-600">
                        {category?.name ?? 'Umumiy'}
                      </span>
                      <span className="text-xs text-ink-400">{lesson.durationLabel}</span>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-ink-900">{lesson.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">
                      {category?.description ?? 'Dars tavsifi rasmiy manba bilan to‘ldiriladi.'}
                    </p>

                    <div className="mt-4 border-t border-line pt-3">
                      <PendingValue label="Dars mazmuni tayyorlanmoqda" />
                    </div>

                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
                      Darsni ochish
                      <svg
                        className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:translate-x-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-xl border border-dashed border-line-strong bg-surface-muted p-10 text-center text-sm text-ink-500">
            Darslar rasmiy manba ulangandan so‘ng shu yerda ko‘rsatiladi.
          </div>
        )}

        <p className="mt-6 text-xs text-ink-400">
          Darslar soni oshiriladi. Sertifikat yoki rasmiy malaka ma’lumotlari ko‘rsatilmaydi —
          ular tasdiqlanmagan.
        </p>
      </Container>
    </section>
  );
}
