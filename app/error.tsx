'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Section';

/**
 * Route-level error boundary.
 *
 * Users never see raw technical errors: the digest is logged server-side and only
 * a correlation reference is available here.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[markab] route error', { digest: error.digest, message: error.message });
    } else {
      console.error('[markab] route error', { digest: error.digest });
    }
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col justify-center py-16 sm:py-24">
      <div className="mx-auto max-w-lg text-center">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
          Xatolik
        </p>
        <h1 className="text-display-sm text-ink-900 sm:text-display-md">Nimadir noto‘g‘ri bajarildi</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-500 sm:text-base">
          Sahifani yuklashda kutilmagan xato ro‘y berdi. Quyidagi tugma orqali qayta urinib
          ko‘ring — agar xatolik takrorlansa, bosh sahifaga qaytishingiz mumkin.
        </p>

        {error.digest ? (
          <p className="mt-4 font-mono text-xs text-ink-400">
            Xato kodi: <span className="font-semibold">{error.digest}</span>
          </p>
        ) : null}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={reset} size="lg">
            Qayta urinish
          </Button>
          {/* After a route error the router may be unusable; use a plain anchor
              to force a real document load rather than a client navigation that
              could fail the same way. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className="tap-target inline-flex h-[46px] items-center justify-center rounded-btn border border-line bg-white px-6 text-[0.9375rem] font-semibold text-ink-900 shadow-card transition-ctrl hover:border-brand-200 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Bosh sahifa
          </a>
        </div>
      </div>
    </Container>
  );
}
