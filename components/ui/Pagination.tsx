import Link from 'next/link';

export function Pagination({
  basePath,
  page,
  pageSize,
  total,
  query,
}: {
  basePath: string;
  page: number;
  pageSize: number;
  total: number;
  query?: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => {
    const params = new URLSearchParams();
    Object.entries(query ?? {}).forEach(([key, value]) => {
      if (value && key !== 'page') params.set(key, value);
    });
    if (target > 1) params.set('page', String(target));
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ''}`;
  };

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (item) => item === 1 || item === totalPages || Math.abs(item - page) <= 1,
  );

  return (
    <nav aria-label="Sahifalar" className="mt-10 flex items-center justify-between gap-4">
      <p className="text-sm text-ink-500">
        Jami: <span className="font-medium text-ink-900">{total}</span> ta
      </p>

      <ul className="flex items-center gap-1">
        {page > 1 ? (
          <li>
            <Link
              href={hrefFor(page - 1)}
              className="rounded-lg border border-line px-3 py-2 text-sm text-ink-700 transition-colors hover:bg-surface-muted"
            >
              Oldingi
            </Link>
          </li>
        ) : null}

        {pages.map((item, index) => (
          <li key={item} className="flex items-center gap-1">
            {index > 0 && item - pages[index - 1] > 1 ? (
              <span className="px-1 text-sm text-ink-400">…</span>
            ) : null}
            <Link
              href={hrefFor(item)}
              aria-current={item === page ? 'page' : undefined}
              className={[
                'min-w-9 rounded-lg border px-3 py-2 text-center text-sm transition-colors',
                item === page
                  ? 'border-brand-600 bg-brand-700 text-white'
                  : 'border-line text-ink-700 hover:bg-surface-muted',
              ].join(' ')}
            >
              {item}
            </Link>
          </li>
        ))}

        {page < totalPages ? (
          <li>
            <Link
              href={hrefFor(page + 1)}
              className="rounded-lg border border-line px-3 py-2 text-sm text-ink-700 transition-colors hover:bg-surface-muted"
            >
              Keyingi
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
