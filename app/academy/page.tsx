import type { Metadata } from 'next';
import { Container, SectionHeading } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { StateBlock } from '@/components/ui/StateBlock';
import { ButtonLink } from '@/components/ui/Button';
import { LessonCard } from '@/components/academy/LessonCard';
import { AcademyFilters } from '@/components/academy/AcademyFilters';
import { EducationNotice } from '@/components/academy/EducationNotice';
import { repository } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Markab Academy',
  description:
    'Moliyaviy savodxonlik: avtomobil tanlash, moliyalashtirish va sarmoya asoslari bo‘yicha qisqa darslar. Darslar mazmuni Markab tomonidan to‘ldiriladi.',
  path: '/academy',
});

/**
 * Academy hub.
 *
 * Content comes from the repository, never from fixtures directly. Search and
 * category filters live in the URL, so every view is shareable, reloadable and
 * resolved server-side.
 *
 * There is no "featured" curation: the data source publishes no ranking, and
 * picking favourites to fill a row would be an invented editorial signal.
 */
export default async function AcademyPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const query = (q ?? '').trim();
  const activeCategory = category && category.trim() ? category.trim() : null;

  const [categoriesResult, lessonsResult, allResult] = await Promise.all([
    repository.getLessonCategories(),
    repository.listLessons({ q: query || undefined, category: activeCategory ?? undefined }),
    repository.listLessons(),
  ]);

  const categories = categoriesResult.status === 'success' ? categoriesResult.data : [];
  const lessons = lessonsResult.status === 'success' ? lessonsResult.data : [];
  const totalCount = allResult.status === 'success' ? allResult.data.length : 0;
  const filtered = Boolean(query) || Boolean(activeCategory);

  // Repository down, not merely empty: say so instead of showing a blank grid.
  if (lessonsResult.status === 'unavailable' || categoriesResult.status === 'unavailable') {
    return (
      <>
        <Hero total={null} />
        <section className="bg-surface section-y-sm">
          <Container>
            <StateBlock
              variant="unavailable"
              title="Darslar yuklanmadi"
              description="Academy ma’lumotlari Markab tomonidan to‘ldiriladi. Katalog ulangandan so‘ng darslar shu yerda ko‘rsatiladi."
            />
            <div className="mt-8">
              <EducationNotice />
            </div>
          </Container>
        </section>
      </>
    );
  }

  if (lessonsResult.status === 'error') {
    return (
      <>
        <Hero total={null} />
        <section className="bg-surface section-y-sm">
          <Container>
            <StateBlock
              variant="error"
              title="Darslarni o‘qib bo‘lmadi"
              description={lessonsResult.error.message}
            />
          </Container>
        </section>
      </>
    );
  }

  const categoryName = (id: string) =>
    categories.find((item) => item.id === id)?.name ?? undefined;

  return (
    <>
      <Hero total={totalCount} />

      <section className="bg-surface section-y-sm">
        <Container>
          <AcademyFilters
            categories={categories}
            activeCategory={activeCategory}
            query={query}
            totalCount={totalCount}
          />

          <div className="mt-8">
            {lessons.length === 0 ? (
              <StateBlock
                variant="empty"
                title={
                  filtered
                    ? 'Qidiruv bo‘yicha hech narsa topilmadi'
                    : 'Darslar hozircha mavjud emas'
                }
                description={
                  filtered
                    ? 'Bu filter bo‘yicha dars topilmadi. Boshqa so‘z yoki yo‘nalishni sinab ko‘ring.'
                    : 'Darslar Markab tomonidan qo‘shiladi.'
                }
                actions={
                  filtered ? (
                    <ButtonLink href="/academy" variant="secondary" size="sm">
                      Barcha darslar
                    </ButtonLink>
                  ) : (
                    <ButtonLink href="/financing" variant="secondary" size="sm">
                      Moliyalashtirish bo‘limi
                    </ButtonLink>
                  )
                }
              />
            ) : (
              <>
                <p className="mb-4 text-sm text-ink-500">
                  {filtered ? `${lessons.length} dars topildi` : `${lessons.length} dars`}
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {lessons.map((lesson) => (
                    <LessonCard
                      key={lesson.slug}
                      lesson={lesson}
                      categoryName={categoryName(lesson.category)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {categories.length > 0 ? (
            <div className="mt-16">
              <SectionHeading
                eyebrow="Yo‘nalishlar"
                title="Kategoriyalar"
                description="Faqat darslari mavjud yo‘nalishlar ko‘rsatiladi — bo‘sh bo‘limlar ro‘yxatga qo‘shilmaydi."
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-line bg-surface p-6 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:shadow-card-hover"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-ink-900">{item.name}</h3>
                      <span className="rounded-md bg-surface-sunken px-2 py-1 text-xs text-ink-600">
                        {item.count} dars
                      </span>
                    </div>
                    {item.description ? (
                      <p className="mt-2 text-sm leading-relaxed text-ink-500">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-12 space-y-4">
            <EducationNotice />

            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/faq" variant="secondary" size="sm">
                Savol-javoblar
              </ButtonLink>
              <ButtonLink href="/financing" variant="secondary" size="sm">
                Moliyalashtirish
              </ButtonLink>
              <ButtonLink href="/contact" variant="ghost" size="sm">
                Savol yuborish
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function Hero({ total }: { total: number | null }) {
  return (
    <section className="border-b border-line bg-surface-muted section-y">
      <Container>
        <div className="max-w-3xl">
          <Badge tone="brand" className="mb-4">
            Markab Academy
          </Badge>
          <h1 className="text-display-sm sm:text-display-md">Moliyaviy savodxonlik</h1>
          <p className="mt-4 text-base leading-relaxed text-ink-500 sm:text-lg">
            Muddatli to‘lov, moliyalashtirish va sarmoya asoslari bo‘yicha qisqa darslar. Bu
            umumiy o‘quv ma’lumoti — shaxsiy moliyaviy maslahat emas.
          </p>
          {total !== null ? (
            <p className="mt-5 text-sm text-ink-500">
              Hozirda katalogda <span className="font-semibold text-ink-900">{total} dars</span>{' '}
              mavjud. Darslar soni sun’iy ko‘paytirilmaydi — faqat Markab tomonidan e’lon qilinganlari
              ko‘rsatiladi.
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
