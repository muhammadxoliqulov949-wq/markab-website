import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { StateBlock, PendingValue } from '@/components/ui/StateBlock';
import { ButtonLink } from '@/components/ui/Button';
import { LessonCard } from '@/components/academy/LessonCard';
import { EducationNotice } from '@/components/academy/EducationNotice';
import { JsonLd } from '@/components/seo/JsonLd';
import { repository } from '@/lib/data';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';

// Catalogue pages are rendered per request:
//  (1) nonce-based CSP stamps scripts at render time (see docs/PHASE-12-DEPLOYMENT-SECURITY.md);
//  (2) prices / stock / availability can change at any time in HTTP mode;
//  (3) searchParams must be resolved server-side.
export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const result = await repository.getLessonBySlug(slug);

  if (result.status !== 'success') {
    return buildMetadata({
      title: 'Dars topilmadi',
      description: 'So‘ralgan dars mavjud emas.',
      path: `/academy/${slug}`,
      noindex: true,
    });
  }

  return buildMetadata({
    title: result.data.title,
    description: `${result.data.title} — Markab Academy darsi. Dars mazmuni Markab tomonidan to‘ldiriladi.`,
    path: `/academy/${result.data.slug}`,
  });
}

/**
 * Deterministic next step per category. No model, no personalisation — the
 * same lesson always offers the same follow-up.
 */
const NEXT_STEP: Record<string, { href: string; label: string; hint: string }> = {
  avtomobil: {
    href: '/cars',
    label: 'Avtomobillar katalogi',
    hint: 'Katalogdagi mashinalar va ularning muddatli to‘lov shartlarini ko‘ring.',
  },
  moliyalashtirish: {
    href: '/financing/calculator',
    label: 'To‘lovni hisoblash',
    hint: 'Oylik to‘lovni hisoblab ko‘ring — natija Markab tomonidan tasdiqlanmagan ko‘rsatkich.',
  },
  moliyaviy_savodxonlik: {
    href: '/financing',
    label: 'Moliyalashtirish shartlari',
    hint: 'Muddatli to‘lov qanday ishlashi va qanday hujjatlar kerakligi.',
  },
  murabaha: {
    href: '/financing',
    label: 'Moliyalashtirish shartlari',
    hint: 'Shartnoma tuzilishi va to‘lov jadvali rasmiy hujjatlar bilan belgilanadi.',
  },
  sarmoya: {
    href: '/invest',
    label: 'Sarmoya bo‘limi',
    hint: 'Sarmoya materiallari e’lon qilingan hujjatlar asosida ko‘rsatiladi.',
  },
};

export default async function LessonPage({ params }: { params: Params }) {
  const { slug } = await params;

  const [result, categoriesResult, relatedResult] = await Promise.all([
    repository.getLessonBySlug(slug),
    repository.getLessonCategories(),
    repository.listRelatedLessons(slug, 3),
  ]);

  // An unknown slug is a real 404 — it must never fall back to the hub or the
  // homepage.
  if (result.status === 'not_found' || result.status === 'error') {
    notFound();
  }

  if (result.status === 'unavailable' || result.status === 'empty') {
    return (
      <Container className="section-y-sm">
        <StateBlock
          variant="unavailable"
          title="Dars yuklanmadi"
          description="Academy ma’lumotlari Markab tomonidan to‘ldiriladi. Katalog ulangandan so‘ng dars shu yerda ko‘rsatiladi."
          actions={
            <ButtonLink href="/academy" variant="secondary" size="sm">
              Academy ga qaytish
            </ButtonLink>
          }
        />
      </Container>
    );
  }

  const lesson = result.data;
  const categories = categoriesResult.status === 'success' ? categoriesResult.data : [];
  const category = categories.find((item) => item.id === lesson.category);
  const related = relatedResult.status === 'success' ? relatedResult.data : [];
  const nextStep = NEXT_STEP[lesson.category] ?? NEXT_STEP.moliyaviy_savodxonlik;

  return (
    <Container className="section-y-sm">
      {/*
        Breadcrumb only. No Article node: a lesson has no author, publish date
        or body yet — `hasContent` is false for all three — so an Article node
        would describe content that does not exist. Marking up nothing is the
        honest result here.
      */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Bosh sahifa', path: '/' },
          { name: 'Markab Academy', path: '/academy' },
          { name: lesson.title, path: `/academy/${lesson.slug}` },
        ])}
      />
      {/* 1. Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm">
        <ol className="flex flex-wrap items-center gap-2 text-ink-400">
          <li>
            <Link href="/" className="hover:text-ink-700">
              Bosh sahifa
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/academy" className="hover:text-ink-700">
              Academy
            </Link>
          </li>
          {category ? (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/academy?category=${category.id}`} className="hover:text-ink-700">
                  {category.name}
                </Link>
              </li>
            </>
          ) : null}
          <li aria-hidden="true">/</li>
          <li className="max-w-full truncate text-ink-700">{lesson.title}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
        <article className="min-w-0">
          {/* 3. Category / topic */}
          <div className="flex flex-wrap items-center gap-2">
            {category ? (
              <Link
                href={`/academy?category=${category.id}`}
                className="inline-flex min-h-[40px] items-center hover:opacity-80"
              >
                <Badge tone="brand">{category.name}</Badge>
              </Link>
            ) : null}
          </div>

          {/* 2. Title */}
          <h1 className="mt-3 text-display-sm sm:text-display-md">{lesson.title}</h1>

          {/* 4. Reading metadata. Only rendered when the source publishes a
              duration; no author, publish date or view counter is shown
              because none exists for these lessons. */}
          {lesson.durationLabel ? (
            <p className="mt-4 text-sm text-ink-400">
              O‘qish vaqti: <span className="text-ink-600">{lesson.durationLabel}</span>
            </p>
          ) : null}

          {/* 5. Main content */}
          <div className="mt-8">
            <StateBlock headingLevel={2}
              variant="pending"
              title="Dars mazmuni Markab tomonidan to‘ldiriladi"
              description="Ushbu dars matni, misollar va testlar Markab tomonidan tasdiqlangach shu yerda joylashtiriladi. Hech qanday taxminiy yoki yaratilgan o‘quv materiali ko‘rsatilmaydi."
            />
          </div>

          <section className="mt-10" aria-labelledby="lesson-outline">
            <h2 id="lesson-outline" className="text-lg font-semibold text-ink-900">
              Dars tuzilishi
            </h2>
            <p className="mt-1 text-sm text-ink-400">
              Bu qismlar umumiy dars shakli bo‘lib, mazmuni hali e’lon qilinmagan.
            </p>
            <ol className="mt-4 space-y-2">
              {[
                'Kirish',
                'Asosiy tushunchalar',
                'Amaliy misol',
                'Tez-tez uchraydigan xatolar',
                'Qisqa test',
              ].map((item, index) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink-600"
                >
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-sunken text-xs font-semibold text-ink-500">
                    {index + 1}
                  </span>
                  {item}
                  <span className="ml-auto text-xs text-ink-400">Tayyorlanmoqda</span>
                </li>
              ))}
            </ol>
          </section>

          {/* 6. Key takeaways */}
          <section className="mt-10" aria-labelledby="lesson-takeaways">
            <h2 id="lesson-takeaways" className="text-lg font-semibold text-ink-900">
              Asosiy xulosalar
            </h2>
            <div className="mt-4">
              <PendingValue label="Dars mazmuni e’lon qilingach, asosiy xulosalar shu yerda ko‘rsatiladi." />
            </div>
          </section>

          {/* 7. Related lessons — deterministic, never called a recommendation */}
          {related.length > 0 ? (
            <section className="mt-12" aria-labelledby="related-lessons">
              <h2 id="related-lessons" className="text-lg font-semibold text-ink-900">
                Yana darslar
              </h2>
              <p className="mt-1 text-sm text-ink-400">
                Bir xil yo‘nalishdagi va ketma-ket tartibdagi darslar.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {related.map((item) => (
                  <LessonCard
                    key={item.slug}
                    lesson={item}
                    categoryName={categories.find((c) => c.id === item.category)?.name}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-10">
            <EducationNotice />
          </div>
        </article>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* 8. Useful next action */}
          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink-900">Keyingi qadam</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{nextStep.hint}</p>
            <div className="mt-4">
              <ButtonLink href={nextStep.href} size="sm" className="w-full">
                {nextStep.label}
              </ButtonLink>
            </div>
          </div>

          {/* 9. Support / CTA */}
          <div className="rounded-xl border border-line bg-surface-muted p-5">
            <h2 className="text-sm font-semibold text-ink-900">Savol qoldi mi?</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              Bu dars umumiy ma’lumot beradi. Sizning holatingiz bo‘yicha shartlar va hisob-kitob
              faqat Markab bilan tuzilgan shartnomada belgilanadi.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <ButtonLink href="/contact" size="sm" variant="secondary" className="w-full">
                Bog‘lanish
              </ButtonLink>
              <ButtonLink href="/faq" size="sm" variant="ghost" className="w-full">
                Savol-javoblar
              </ButtonLink>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
