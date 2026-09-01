import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import type { Lesson } from '@/lib/data/types';

/**
 * Academy lesson card.
 *
 * Only real metadata is shown: title, category and the duration the public
 * source publishes. There is no author, no publish date and no read count,
 * because none of those exist in the data — inventing them would be exactly
 * the "fabricated educational metadata" this phase must avoid.
 */
export function LessonCard({
  lesson,
  categoryName,
}: {
  lesson: Lesson;
  categoryName?: string;
}) {
  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-line bg-surface p-6 shadow-card transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover">
      <div className="flex flex-wrap items-center gap-2">
        {categoryName ? (
          <span className="rounded-md bg-surface-sunken px-2.5 py-1 text-xs font-medium text-ink-600">
            {categoryName}
          </span>
        ) : null}
        {lesson.durationLabel ? (
          <span className="text-xs text-ink-400">{lesson.durationLabel}</span>
        ) : null}
        {!lesson.hasContent ? <Badge tone="pending">Mazmun kutilmoqda</Badge> : null}
      </div>

      <h3 className="mt-4 text-base font-semibold leading-snug text-ink-900">
        {/*
          Stretched link: the entire card is the tap target, so the target is
          never just the 19px-tall title text. The anchor stays in the heading
          so keyboard order and the accessible name are unchanged.
        */}
        <Link
          href={`/academy/${lesson.slug}`}
          className="hover:text-brand-700 after:absolute after:inset-0 after:content-['']"
        >
          {lesson.title}
        </Link>
      </h3>

      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">
        {lesson.summary ??
          'Dars mazmuni Markab tomonidan to‘ldiriladi. Taxminiy o‘quv matni ko‘rsatilmaydi.'}
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
    </article>
  );
}
