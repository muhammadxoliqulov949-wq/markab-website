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
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this would be sent to the error-monitoring service.
    console.error('[markab] route error', { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col justify-center py-16">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-semibold text-ink-900">Nimadir xato ketdi</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-500">
          Sahifani yuklashda xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring — agar xatolik
          takrorlansa, qo‘llab-quvvatlash xizmatiga murojaat qiling.
        </p>

        {error.digest ? (
          <p className="mt-3 text-xs text-ink-400">Xatolik kodi: {error.digest}</p>
        ) : null}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset} size="lg">
            Qayta urinish
          </Button>
          <a
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-line-strong bg-white px-6 text-base font-medium text-ink-900 transition-colors hover:bg-surface-muted"
          >
            Bosh sahifa
          </a>
        </div>
      </div>
    </Container>
  );
}
