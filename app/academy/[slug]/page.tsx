import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { StateBlock } from '@/components/ui/StateBlock';
import { ButtonLink } from '@/components/ui/Button';
import { repository } from '@/lib/data';
import { academyCategories } from '@/lib/data/fixtures/academy';
import { buildMetadata } from '@/lib/seo';

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
    description: `${result.data.title} — Markab Academy darsi. Dars mazmuni rasmiy manba bilan to‘ldiriladi.`,
    path: `/academy/${result.data.slug}`,
  });
}

export default async function LessonPage({ params }: { params: Params }) {
  const { slug } = await params;
  const result = await repository.getLessonBySlug(slug);

  if (result.status !== 'success') {
    notFound();
  }

  const lesson = result.data;
  const category = academyCategories.find((item) => item.id === lesson.category);

  return (
    <Container className="py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-ink-400">
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
          <li aria-hidden="true">/</li>
          <li className="truncate text-ink-700">{lesson.title}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
        <article>
          <div className="flex flex-wrap items-center gap-2">
            {category ? <Badge tone="brand">{category.name}</Badge> : null}
            <span className="text-xs text-ink-400">{lesson.durationLabel}</span>
          </div>

          <h1 className="mt-3 text-display-sm sm:text-display-md">{lesson.title}</h1>

          <div className="mt-8">
            <StateBlock
              variant="pending"
              title="Dars mazmuni rasmiy manba bilan to‘ldiriladi"
              description="Ushbu dars matni, misollar va testlar Markab tomonidan tasdiqlangach shu yerda joylashtiriladi. Hech qanday taxminiy yoki yaratilgan o‘quv materiali ko‘rsatilmaydi."
              actions={
                <>
                  <ButtonLink href="/contact" size="sm">
                    Savol yuborish
                  </ButtonLink>
                  <ButtonLink href="/academy" variant="secondary" size="sm">
                    Boshqa darslar
                  </ButtonLink>
                </>
              }
            />
          </div>

          <section className="mt-10" aria-labelledby="lesson-outline">
            <h2 id="lesson-outline" className="text-lg font-semibold text-ink-900">
              Dars tuzilishi
            </h2>
            <ol className="mt-4 space-y-2">
              {['Kirish', 'Asosiy tushunchalar', 'Amaliy misol', 'Tez-tez uchraydigan xatolar', 'Qisqa test'].map(
                (item, index) => (
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
                ),
              )}
            </ol>
          </section>
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink-900">Keyingi qadam</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              Mavzuni o‘rgangach, shartlar va mahsulotlarni ko‘rib chiqishingiz mumkin.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <ButtonLink href="/financing" size="sm">
                Moliyalashtirish
              </ButtonLink>
              <ButtonLink href="/cars" variant="secondary" size="sm">
                Avtomobillar
              </ButtonLink>
              <ButtonLink href="/invest" variant="secondary" size="sm">
                Sarmoya
              </ButtonLink>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
