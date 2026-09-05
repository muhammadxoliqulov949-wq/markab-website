/**
 * Route-handler helpers for API endpoints.
 *
 * These centralise:
 *   • method whitelisting
 *   • JSON body parsing with a hard size cap
 *   • CSRF checks for state-changing methods
 *   • Authentication gate
 *   • Safe responses (never leak internals)
 */
import 'server-only';

import { NextResponse } from 'next/server';
import type { RequestContext } from '@/lib/request/context';
import { errorResponse, jsonResponse } from '@/lib/request/context';
import { loadSession } from '@/lib/services/session';
import { validateCsrfHeader } from '@/lib/services/csrf';
import { checkRateLimit, type RateLimit } from '@/lib/rates/limiter';

/** Whitelisted methods. */
export type HttpMethod = 'GET' | 'POST' | 'DELETE';

const MAX_BODY_BYTES = 32 * 1024; // 32KB is generous for form submissions.

/**
 * Read and parse a JSON body, enforcing content-type and size.
 * Returns { ok: true, data } or { ok: false, response } — in the failure case
 * the caller should return the provided response verbatim.
 */
export async function readJsonBody(
  request: Request,
  ctx: RequestContext,
): Promise<{ ok: true; data: unknown } | { ok: false; response: NextResponse }> {
  const contentType = (request.headers.get('content-type') ?? '').split(';')[0].trim();
  if (contentType !== 'application/json') {
    return {
      ok: false,
      response: errorResponse(ctx, 415, 'unsupported_media_type', 'Content-Type application/json kutilmoqda.'),
    };
  }
  const declaredLen = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declaredLen) && declaredLen > MAX_BODY_BYTES) {
    return { ok: false, response: errorResponse(ctx, 413, 'payload_too_large', 'So‘rov juda katta.') };
  }
  let text: string;
  try {
    text = await request.text();
  } catch {
    return { ok: false, response: errorResponse(ctx, 400, 'bad_request', 'So‘rov o‘qib bo‘lmadi.') };
  }
  if (text.length > MAX_BODY_BYTES) {
    return { ok: false, response: errorResponse(ctx, 413, 'payload_too_large', 'So‘rov juda katta.') };
  }
  if (!text) return { ok: true, data: {} };
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: false, response: errorResponse(ctx, 400, 'invalid_json', 'JSON formati noto‘g‘ri.') };
  }
}

/**
 * Require a given method; returns a 405 response otherwise.
 */
export function requireMethod(
  request: Request,
  allowed: HttpMethod | HttpMethod[],
  ctx: RequestContext,
): NextResponse | null {
  const method = request.method.toUpperCase() as HttpMethod;
  const list = Array.isArray(allowed) ? allowed : [allowed];
  if (!list.includes(method)) {
    const headers = new Headers();
    headers.set('allow', list.join(', '));
    return errorResponse(ctx, 405, 'method_not_allowed', 'Metod qo‘llab-quvvatlanmaydi.');
  }
  return null;
}

/**
 * Enforce CSRF token on state-changing methods (non-GET).
 */
export async function requireCsrf(
  request: Request,
  ctx: RequestContext,
  pathname: string,
): Promise<NextResponse | null> {
  if (request.method === 'GET') return null;
  const ok = await validateCsrfHeader(request);
  if (!ok) {
    ctx.logger.warn('csrf.rejected', { path: pathname, method: request.method });
    return errorResponse(ctx, 403, 'csrf_invalid', 'CSRF tasdiqlash amalga oshmadi.');
  }
  return null;
}

/**
 * Apply rate limiting. Returns 429 response if over the limit.
 */
export function requireRateLimit(
  spec: RateLimit,
  ctx: RequestContext,
): NextResponse | null {
  const r = checkRateLimit(spec, ctx.ip, ctx.userId);
  if (r.allowed) return null;
  ctx.logger.warn('rate_limit.exceeded', { subject: r.subject, retryAfterSec: r.retryAfterSec });
  const headers = new Headers();
  headers.set('retry-after', String(r.retryAfterSec));
  return errorResponse(ctx, 429, 'rate_limited', 'Juda ko‘p so‘rov — keyinroq urinib ko‘ring.');
}

/**
 * Gate the route behind authentication. Populates ctx.userId on success.
 */
export async function requireAuth(ctx: RequestContext): Promise<NextResponse | null> {
  const session = await loadSession();
  if (!session) {
    return errorResponse(ctx, 401, 'unauthenticated', 'Kirish talab qilinadi.');
  }
  ctx.userId = session.user.id;
  return null;
}

/** Re-bind the logger with userId now that we know it. */
export function attachUserToLogger(ctx: RequestContext, userId: string | null) {
  if (userId) ctx.userId = userId;
}

/**
 * Safe origin/host check: the request's Origin header, if present, must be
 * one of our own origins. This defends against cross-origin submissions
 * that fall outside simple-form semantics. Forged requests that include an
 * Origin header from another host are rejected outright.
 */
export function assertOrigin(request: Request, ctx: RequestContext): NextResponse | null {
  const origin = request.headers.get('origin');
  if (!origin) return null; // Same-origin and simple top-level form posts omit it.
  let host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (!host) return null;
  // Trim port for comparison
  host = host.split(':')[0]!;
  let originHost: string;
  try {
    originHost = new URL(origin).host.split(':')[0]!;
  } catch {
    return errorResponse(ctx, 400, 'bad_origin', 'Origin header yaroqsiz.');
  }
  if (originHost !== host) {
    ctx.logger.warn('origin.mismatch', { origin, host });
    return errorResponse(ctx, 403, 'origin_mismatch', 'Tashqi origin taqiqlangan.');
  }
  return null;
}

export type Handler = (request: Request, ctx: RequestContext) => Promise<NextResponse>;

/**
 * Build a route handler with a small middleware chain.
 *
 * Usage:
 *   export const POST = route({
 *     method: 'POST',
 *     csrf: true,
 *     auth: true | false,
 *     rate: LIMITS.contact,
 *     handler: async (req, ctx) => { ... }
 *   });
 */
export function route(opts: {
  method: HttpMethod | HttpMethod[];
  csrf?: boolean;
  auth?: boolean;
  rate?: RateLimit;
  handler: Handler;
}) {
  return async (request: Request): Promise<NextResponse> => {
    const { makeRequestContext } = await import('@/lib/request/context');
    const pathname = new URL(request.url).pathname;
    const ctx = makeRequestContext(request, {
      method: request.method,
      path: pathname,
    });
    try {
      const methodErr = requireMethod(request, opts.method, ctx);
      if (methodErr) return methodErr;

      const originErr = assertOrigin(request, ctx);
      if (originErr) return originErr;

      if (opts.auth) {
        const authErr = await requireAuth(ctx);
        if (authErr) return authErr;
      } else {
        // Attach user for logging even if not required.
        const s = await loadSession();
        if (s) ctx.userId = s.user.id;
      }

      if (opts.csrf && request.method !== 'GET') {
        const csrfErr = await requireCsrf(request, ctx, pathname);
        if (csrfErr) return csrfErr;
      }

      if (opts.rate) {
        const rlErr = requireRateLimit(opts.rate, ctx);
        if (rlErr) return rlErr;
      }

      return await opts.handler(request, ctx);
    } catch (err) {
      ctx.logger.error('request.unhandled_error', {
        error: err instanceof Error ? { message: err.message, name: err.name } : String(err),
      });
      return errorResponse(ctx, 500, 'internal_error', 'Serverda xatolik yuz berdi.');
    }
  };
}

export { jsonResponse, errorResponse };
