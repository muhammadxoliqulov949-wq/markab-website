import Link from 'next/link';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { PendingValue } from '@/components/ui/StateBlock';
import { repository } from '@/lib/data';

/**
 * Academy preview — editorial, not another product grid.
 *
 * Titles, categories and the "5–10 daqiqa" duration are verbatim from the public
 * homepage block. Lesson bodies were never published, so each card states that
 * the content is pending instead of showing fabricated educational text. No
 * certificate or qualification claim appears anywhere.
 */
export async function AcademySection() {
  const [result, categoriesResult] = await Promise.all([
    repository.listLessons(),
    repository.getLessonCategories(),
  ]);
  const items = result.status === 'success' ? result.data : [];
  const categories = categoriesResult.status === 'success' ? categoriesResult.data : [];

  return (
    <section aria-labelledby="academy-heading" className="bg-surface py-12 sm:py-14 lg:py-16">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="academy-heading"
            eyebrow="Markab Academy"
            title="Moliyaviy savodxonlik"
            description="Muddatli to‘lov, murabaha va sarmoya asoslari bo‘yicha qisqa darslar."
            size="sm"
          />
          <ArrowLink href="/academy" className="shrink-0">
            Barcha darslar
          </ArrowLink>
        </div>

        {items.length > 0 ? (
          <div className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-8">
            {items.map((lesson, index) => {
              const category = categories.find((item) => item.id === lesson.category);
              return (
                <Reveal key={lesson.slug} delay={index * 70}>
                  <Link
                    href={`/academy/${lesson.slug}`}
                    className="group flex h-full flex-col border-t-2 border-line pt-6 transition-colors duration-300 ease-smooth hover:border-brand-600"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
                        {category?.name ?? 'Umumiy'}
                      </span>
                      <span className="text-xs text-ink-400">{lesson.durationLabel}</span>
                    </div>

                    <h3 className="mt-4 text-xl font-semibold leading-snug text-ink-900 sm:text-[1.375rem]">
                      {lesson.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">
                      {category?.description ?? 'Dars tavsifi rasmiy manba bilan to‘ldiriladi.'}
                    </p>

                    <div className="mt-5">
                      <PendingValue label="Dars mazmuni tayyorlanmoqda" />
                    </div>

                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 transition-colors group-hover:text-brand-800">
                      Darsni ochish
                      <svg
                        className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:translate-x-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.9"
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
          <div className="mt-12 rounded-xl border border-dashed border-line-strong bg-surface-muted p-12 text-center text-sm text-ink-500">
            Darslar rasmiy manba ulangandan so‘ng shu yerda ko‘rsatiladi.
          </div>
        )}

        <p className="mt-10 text-xs leading-relaxed text-ink-400">
          Darslar soni oshiriladi. Sertifikat yoki rasmiy malaka ma’lumotlari ko‘rsatilmaydi —
          ular tasdiqlanmagan.
        </p>
      </Container>
    </section>
  );
}
