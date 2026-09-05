/* eslint-disable @next/next/no-html-link-for-pages */
'use client';

/**
 * Global error boundary — catches errors thrown during rendering of the root
 * layout (the regular app/error.tsx cannot do that because it renders INSIDE
 * the layout it replaces). We must render a FULL html/body document here,
 * and we deliberately use a bare <a> for the "home" link because Link imports
 * and relies on Next.js router context, which may itself be the source of the
 * error we're trying to recover from. A native anchor gives the browser a
 * hard navigation, which is the most reliable recovery path at this layer.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="uz">
      <body className="min-h-dvh bg-surface font-sans text-ink-700">
        <main
          role="alert"
          className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 text-center"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-brand-700">
            Xatolik yuz berdi
          </p>
          <h1 className="text-display-sm text-ink-900">Nimadir noto‘g‘ri bajarildi</h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-500">
            Sahifani yuklashda kutilmagan xato ro‘y berdi. Quyidagi tugma orqali
            qayta urinib ko‘ring yoki bosh sahifaga qayting.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-[46px] items-center justify-center gap-2 rounded-btn bg-brand-600 px-6 text-[0.9375rem] font-semibold text-white shadow-glow transition-ctrl hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              Qayta urinish
            </button>
            <a
              href="/"
              className="inline-flex h-[46px] items-center justify-center rounded-btn border border-line bg-white px-6 text-[0.9375rem] font-semibold text-ink-900 shadow-card transition-ctrl hover:border-brand-200 hover:bg-brand-50"
            >
              Bosh sahifa
            </a>
          </div>
          {error.digest ? (
            <p className="mt-8 text-xs text-ink-400">Xato kodi: {error.digest}</p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
