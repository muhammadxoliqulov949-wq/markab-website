import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { StateBlock } from '@/components/ui/StateBlock';
import { ButtonLink } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { academyCategories, lessons } from '@/lib/data/fixtures/academy';
import { repository } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Markab Academy',
  description:
    'Moliyaviy savodxonlik bo‘limi: avtomobil tanlash, moliyalashtirish, murabaha va sarmoya asoslari bo‘yicha darslar.',
  path: '/academy',
});

export default async function AcademyPage() {
  const result = await repository.listLessons();
  const items = result.status === 'success' ? result.data : [];

  const tabItems = [
    {
      id: 'all',
      label: 'Barchasi',
      content: <LessonGrid lessons={items} />,
    },
    ...academyCategories.map((category) => ({
      id: category.id,
      label: category.name,
      content: <LessonGrid lessons={items.filter((lesson) => lesson.category === category.id)} categoryName={category.name} />,
    })),
  ];

  return (
    <>
      <section className="border-b border-line bg-surface-muted py-12 sm:py-16">
        <Container>
          <div className="max-w-3xl">
            <Badge tone="brand" className="mb-4">
              Markab Academy
            </Badge>
            <h1 className="text-display-sm sm:text-display-md">Moliyaviy savodxonlik</h1>
            <p className="mt-4 text-base leading-relaxed text-ink-500 sm:text-lg">
              Muddatli to‘lov, murabaha va sarmoya asoslari bo‘yicha qisqa darslar. Darslar
              mazmuni rasmiy manba tomonidan to‘ldiriladi.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-10 sm:py-14">
        <Container>
          {items.length > 0 ? (
            <Tabs items={tabItems} initialId="all" />
          ) : (
            <StateBlock
              variant="unavailable"
              title="Darslar yuklanmadi"
              description="Ma’lumotlar manbasi ulanmaganda bu bo‘lim shunday ko‘rinadi."
            />
          )}

          <div className="mt-14">
            <SectionHeading
              eyebrow="Kategoriyalar"
              title="Yo‘nalishlar"
              description="Har bir yo‘nalish bo‘yicha darslar kengaytiriladi."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {academyCategories.map((category) => {
                const count = items.filter((lesson) => lesson.category === category.id).length;
                return (
                  <div
                    key={category.id}
                    className="rounded-xl border border-line bg-surface p-6 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:shadow-card-hover"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-ink-900">{category.name}</h3>
                      <span className="rounded-md bg-surface-sunken px-2 py-1 text-xs text-ink-600">
                        {count} dars
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-500">
                      {category.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="mt-10 text-xs leading-relaxed text-ink-400">
            Academy bo‘limida sertifikat, rasmiy malaka yoki ta’lim litsenziyasi haqida
            ma’lumot ko‘rsatilmaydi — ular tasdiqlanmagan.
          </p>
        </Container>
      </section>
    </>
  );
}

function LessonGrid({
  lessons: items,
  categoryName,
}: {
  lessons: typeof lessons;
  categoryName?: string;
}) {
  if (items.length === 0) {
    return (
      <StateBlock
        variant="empty"
        title={categoryName ? `${categoryName}: darslar tayyorlanmoqda` : 'Darslar mavjud emas'}
        description="Bu yo‘nalishdagi darslar rasmiy manba tomonidan qo‘shiladi. Boshqa yo‘nalishlarni ko‘rib chiqishingiz mumkin."
        actions={
          <ButtonLink href="/financing" variant="secondary" size="sm">
            Moliyalashtirish bo‘limi
          </ButtonLink>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((lesson) => (
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
  );
}
