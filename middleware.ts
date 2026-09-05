/**
 * Per-request security middleware.
 *
 * Runs BEFORE any route handler or server component. Must be self-contained
 * and use only Web-standard APIs — no Node built-ins, no server-only modules,
 * because middleware bundles for the Edge-runtime compatibility layer.
 *
 * Responsibilities:
 *   • Nonce-based CSP (per-response nonce + strict-dynamic).
 *   • HSTS / X-Frame-Options.
 *   • Attach an x-request-id for log correlation.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { buildCsp } from '@/lib/security/csp';
import {
  allowPreviewFraming,
  cspReportDirective,
  frameAncestorsPolicy,
  isProduction,
} from '@/lib/security/csp-preview';

/** Generate 16 random bytes as a base64url (url-safe) nonce using Web Crypto. */
async function generateNonce(): Promise<string> {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function middleware(request: NextRequest) {
  const nonce = await generateNonce();
  const preview = allowPreviewFraming();
  const upgradeInsecure = isProduction() && !preview;

  const report = cspReportDirective();
  const csp = buildCsp({
    nonce,
    frameAncestors: frameAncestorsPolicy(),
    upgradeInsecure,
    // `next dev` modules are evaluated via eval (webpack runtime +
    // react-refresh); the strict production CSP refuses them, which leaves
    // every client interaction dead under a dev preview. unsafe-eval is a
    // DEV-ONLY escape hatch — isProduction() is false only under `next dev`.
    scriptUnsafeEval: !isProduction(),
  });
  const cspValue = report ? `${csp}; ${report[0]} ${report[1]}` : csp;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('content-security-policy', cspValue);
  const requestId = request.headers.get('x-request-id') ?? randomId();
  requestHeaders.set('x-request-id', requestId);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('content-security-policy', cspValue);
  response.headers.set('x-request-id', requestId);

  response.headers.set(
    'strict-transport-security',
    preview ? 'max-age=86400' : 'max-age=63072000; includeSubDomains',
  );
  if (!preview) {
    response.headers.set('x-frame-options', 'DENY');
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
