import Link from 'next/link';

/**
 * Academy search + category filter.
 *
 * A plain GET form: filtering happens through URL params and is resolved by
 * the repository on the server, so it works without JavaScript, is shareable,
 * and survives a reload. There is no client-side filter state to fall out of
 * sync with the URL.
 *
 * Categories come from the repository with counts, and a category is only
 * rendered when it actually has lessons — a filter that returns nothing is
 * worse than no filter.
 */
export function AcademyFilters({
  categories,
  activeCategory,
  query,
  totalCount,
}: {
  categories: { id: string; name: string; count: number }[];
  activeCategory: string | null;
  query: string;
  totalCount: number;
}) {
  const hasFilters = Boolean(activeCategory) || Boolean(query);
  const isActive = (id: string | null) => (activeCategory ?? null) === id;

  const hrefFor = (id: string | null) => {
    const params = new URLSearchParams();
    if (id) params.set('category', id);
    if (query) params.set('q', query);
    const suffix = params.toString();
    return suffix ? `/academy?${suffix}` : '/academy';
  };

  // Only offer the category row when there is a real choice to make.
  const showCategories = categories.length > 1;

  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <form action="/academy" method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="academy-search" className="text-sm font-medium text-ink-700">
            Qidirish
          </label>
          <input
            id="academy-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Dars nomi yoki yo‘nalish"
            className="mt-2 w-full rounded-lg border border-line-strong bg-white px-3.5 py-2.5 text-[0.9375rem] text-ink-900 placeholder:text-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        {/* Preserved so a search does not silently drop the active category. */}
        {activeCategory ? <input type="hidden" name="category" value={activeCategory} /> : null}
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-brand-700 px-5 text-[0.9375rem] font-medium text-white transition-colors hover:bg-brand-800"
        >
          Qidirish
        </button>
      </form>

      {showCategories ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Chip href={hrefFor(null)} active={isActive(null)}>
            Barchasi
            <span className="text-xs font-normal text-ink-400">{totalCount}</span>
          </Chip>
          {categories.map((category) => (
            <Chip key={category.id} href={hrefFor(category.id)} active={isActive(category.id)}>
              {category.name}
              <span className="text-xs font-normal text-ink-400">{category.count}</span>
            </Chip>
          ))}
        </div>
      ) : null}

      {hasFilters ? (
        <p className="mt-3 text-xs text-ink-400">
          <Link href="/academy" className="underline decoration-line-strong underline-offset-2 hover:text-ink-700">
            Filterlarni tozalash
          </Link>
        </p>
      ) : null}
    </div>
  );
}

function Chip({
  children,
  href,
  active,
}: {
  children: React.ReactNode;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={[
        'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors',
        active
          ? 'border-brand-600 bg-brand-50 text-brand-800'
          : 'border-line bg-surface text-ink-700 hover:border-line-strong hover:bg-surface-muted',
      ].join(' ')}
    >
      {children}
    </Link>
  );
}
