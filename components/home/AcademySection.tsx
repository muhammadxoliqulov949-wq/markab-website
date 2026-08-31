import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Container, SectionHeading } from '@/components/ui/Section';
import { academyCategories } from '@/lib/data/fixtures/academy';
import { lessons } from '@/lib/data/fixtures/academy';

export function AcademySection() {
  return (
    <section className="bg-surface py-16 sm:py-20 lg:py-24" aria-labelledby="academy-heading">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Markab Academy"
            title="Moliyaviy savodxonlik bo‘limi"
            description="Muddatli to‘lov, murabaha va sarmoya asoslari bo‘yicha qisqa darslar."
          />
          <ButtonLink href="/academy" variant="secondary" className="shrink-0">
            Barcha darslar
          </ButtonLink>
        </div>
        <h2 id="academy-heading" className="sr-only">
          Markab Academy
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <Link
              key={lesson.slug}
              href={`/academy/${lesson.slug}`}
              className="group flex h-full flex-col rounded-xl border border-line bg-surface p-6 shadow-card transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-md bg-surface-sunken px-2.5 py-1 text-xs font-medium text-ink-600">
                  {academyCategories.find((category) => category.id === lesson.category)?.name ??
                    'Umumiy'}
                </span>
                <span className="text-xs text-ink-400">{lesson.durationLabel}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink-900">{lesson.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">
                Dars mazmuni rasmiy manba bilan to‘ldiriladi.
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
                Darsni ochish
                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
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
          ))}
        </div>

        <p className="mt-6 text-xs text-ink-400">
          Darslar soni oshiriladi. Sertifikat yoki rasmiy malaka ma’lumotlari ko‘rsatilmaydi —
          ular tasdiqlanmagan.
        </p>
      </Container>
    </section>
  );
}
