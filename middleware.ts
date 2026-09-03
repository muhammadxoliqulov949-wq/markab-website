import { NextResponse, type NextRequest } from 'next/server';
import { buildCsp, frameAncestorsPolicy, allowPreviewFraming, cspReportDirective } from '@/lib/security/csp';

/**
 * Per-request security headers.
 *
 * This middleware exists for one reason: a Content-Security-Policy carrying a
 * nonce has to be different on every response, and `next.config.mjs` headers
 * are static. Everything that does not vary per response lives in the
 * `headers()` block in `next.config.mjs` instead.
 *
 * The nonce is also set on the *request* headers, because that is where
 * Next.js looks when it stamps its own injected scripts — without it, the
 * browser refuses every script Next emits and the page never hydrates.
 */
export function middleware(request: NextRequest) {
  const startedAt = Date.now();
  const nonce = btoa(crypto.randomUUID());
  const isProduction = process.env.NODE_ENV === 'production';
  const preview = allowPreviewFraming();

  const report = cspReportDirective();
  const csp = buildCsp({
    nonce,
    frameAncestors: frameAncestorsPolicy(),
    upgradeInsecure: isProduction && !preview,
  });
  const cspValue = report ? `${csp}; ${report[0]} ${report[1]}` : csp;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('content-security-policy', cspValue);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('content-security-policy', cspValue);

  response.headers.set(
    'strict-transport-security',
    preview ? 'max-age=86400' : 'max-age=63072000; includeSubDomains',
  );

  if (!preview) {
    response.headers.set('x-frame-options', 'DENY');
  }

  // Dev-only: attach debug echo headers so the client diagnostic panel can
  // see what Origin/Referer/Host the browser actually sent, and also log
  // every request to stdout so we can inspect hydration failures from the
  // server side even when client JS never boots.
  if (!isProduction) {
    const origin = request.headers.get('origin') || '-';
    const referer = request.headers.get('referer') || '-';
    const host = request.headers.get('host') || '-';
    const ua = (request.headers.get('user-agent') || '-').slice(0, 80);
    response.headers.set('x-debug-req-origin', origin);
    response.headers.set('x-debug-req-referer', referer.slice(0, 200));
    response.headers.set('x-debug-req-host', host);
    response.headers.set('access-control-expose-headers',
      'x-debug-req-origin,x-debug-req-referer,x-debug-req-host');

    // Capture status AFTER next handles the response (for static assets etc.)
    // by using response.headers — but for static assets that bypass middleware
    // in prod, this won't fire. In dev our matcher includes /_next/*, so we
    // see them.
    response.headers.set('x-debug-marker', 'mw-hit');

    const { pathname, search } = request.nextUrl;
    // Log after response is prepared (don't block).
    queueMicrotask(() => {
      const delta = Date.now() - startedAt;
      const status = response.status || '?';
      const isNextAsset = pathname.startsWith('/_next/');
      const tag = isNextAsset ? '\x1b[33m[ASSET]\x1b[0m' : '\x1b[36m[DOC]\x1b[0m';
      // eslint-disable-next-line no-console
      console.log(
        `${tag} ${request.method} ${pathname}${search} -> ${status} (${delta}ms)  host=${host} origin=${origin} referer=${referer.slice(0, 80)} ua=${ua.slice(0, 50)}`,
      );
    });
  }

  return response;
}

export const config = {
  /**
   * In dev, run on everything except image/favicons so we can observe both
   * document responses and _next/* asset requests. In prod, keep the tight
   * matcher because we don't pay the middleware cost on static assets.
   */
  matcher: process.env.NODE_ENV === 'production'
    ? ['/((?!_next/static|_next/image|favicon.ico).*)']
    : ['/((?!_next/image|favicon.ico).*)'],
};
