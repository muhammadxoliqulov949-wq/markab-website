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
    /**
     * The digest is always safe to log: it is an opaque correlation id, and the
     * matching detail stays on the server.
     *
     * The message is a different matter. In production React replaces it with a
     * generic string, but a boundary can still hand us a real one — and in
     * development it always does — so it is logged only where that is useful
     * and harmless, i.e. locally. Shipping internal exception text to every
     * visitor's console is free reconnaissance for anyone who opens devtools.
     */
    if (process.env.NODE_ENV === 'development') {
      console.error('[markab] route error', { digest: error.digest, message: error.message });
    } else {
      // Production: this is where the error-monitoring service would go.
      console.error('[markab] route error', { digest: error.digest });
    }
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
          {/* A router-boundary escape hatch: after a route error the router may
              be unusable, so this stays a plain anchor and forces a real
              document load rather than a client navigation that could fail the
              same way again. The lint rule is disabled for this one link with
              the reason recorded, not silenced globally. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
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
