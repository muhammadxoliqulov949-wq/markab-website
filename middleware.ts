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
  // UUID → base64. The edge runtime provides btoa, and the result matches the
  // character set Next's nonce parser accepts.
  const nonce = btoa(crypto.randomUUID());
  const isProduction = process.env.NODE_ENV === 'production';
  const preview = allowPreviewFraming();

  const report = cspReportDirective();
  const csp = buildCsp({
    nonce,
    frameAncestors: frameAncestorsPolicy(),
    // Only meaningful on the canonical host; on a preview host it would
    // rewrite requests to a domain that does not host this build.
    upgradeInsecure: isProduction && !preview,
  });
  const cspValue = report ? `${csp}; ${report[0]} ${report[1]}` : csp;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('content-security-policy', cspValue);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('content-security-policy', cspValue);

  // HSTS: long-lived on the real host; short and subdomain-free on a shared
  // preview domain, where a two-year includeSubDomains entry would be recorded
  // against infrastructure that is not ours.
  response.headers.set(
    'strict-transport-security',
    preview ? 'max-age=86400' : 'max-age=63072000; includeSubDomains',
  );

  // X-Frame-Options is the legacy twin of `frame-ancestors`. It cannot express
  // an allow-list, so it is emitted only when framing is refused outright —
  // DENY alongside a permissive `frame-ancestors` would silently win in older
  // browsers and blank the preview.
  if (!preview) {
    response.headers.set('x-frame-options', 'DENY');
  }

  return response;
}

export const config = {
  /**
   * Everything except emitted static assets. Those are not documents, so a CSP
   * on them costs header bytes and protects nothing.
   */
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
