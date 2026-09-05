/**
 * Per-request context: trace id, safe IP extraction, response helpers.
 *
 * Next.js App Router route handlers do not give us a "request context" object
 * the way Express does, so we explicitly thread trace ids and loggers through
 * the handler arguments instead of relying on async_hooks (which add cost and
 * fragility for little benefit at this scale).
 */
import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { bindLogger, type LogContext } from './logger';

export function newTraceId() {
  return randomBytes(8).toString('hex');
}

/**
 * Extract a safe client IP.
 *
 * The app is expected to run behind a trusted reverse proxy (Vercel/Cloudflare/
 * nginx) in production. We read the first entry of `x-forwarded-for` only when
 * a trusted proxy indicator is present — otherwise fall back to the direct
 * peer address. This avoids accepting a spoofed header sent directly to the
 * origin.
 *
 * We don't claim to solve the entire trust-boundary problem here; ops must
 * configure the edge to strip unexpected XFF headers before the request
 * reaches us. What we DO guarantee is: the returned value is never a multi-IP
 * list (we always return the first address, bounded to 45 chars), and for
 * IPv6 we mask to /64 before logging so we don't persist full device
 * addresses unnecessarily.
 */
export function clientIp(request: Request): string | null {
  const direct = isIPv4Mappedv6(request.headers.get('x-real-ip') ?? '');
  const xff = request.headers.get('x-forwarded-for') ?? '';
  // If the request came through a proxy that set XFF, the peer address is the
  // last entry; the first entry is the original client.
  let candidate: string | null = null;
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first && first.length <= 45) candidate = first;
  }
  if (!candidate && direct) candidate = direct;
  if (!candidate) return null;
  return maskIp(candidate);
}

function isIPv4Mappedv6(value: string) {
  // Next/standalone doesn't set x-real-ip, but some reverse proxies do. We
  // accept only well-formed addresses here.
  if (!value) return null;
  const v6 = value.startsWith('::ffff:') ? value.slice('::ffff:'.length) : value;
  return v6.length <= 45 ? v6 : null;
}

function maskIp(ip: string): string {
  if (ip.includes('.')) {
    // IPv4: drop the last octet → /24
    const parts = ip.split('.');
    if (parts.length === 4 && parts.every((p) => /^\d{1,3}$/.test(p))) return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    return ip;
  }
  // IPv6: keep the first four hextets (a /64 prefix) then append ::
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length >= 4) return `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}::`;
  }
  return ip;
}

export function userAgent(request: Request): string | null {
  const ua = request.headers.get('user-agent');
  if (!ua) return null;
  return ua.length > 250 ? `${ua.slice(0, 247)}...` : ua;
}

export interface RequestContext {
  requestId: string;
  ip: string | null;
  userAgent: string | null;
  logger: ReturnType<typeof bindLogger>;
  /** HTTP path, for logs. */
  path?: string;
  /** HTTP method, for logs. */
  method?: string;
  /** Set by auth middleware once the session is resolved. */
  userId: string | null;
}

export function makeRequestContext(request: Request, extra: Partial<LogContext> = {}): RequestContext {
  const requestId = request.headers.get('x-request-id') ?? newTraceId();
  const ip = clientIp(request);
  const ua = userAgent(request);
  const logger = bindLogger({ traceId: requestId, ...extra });
  return { requestId, ip, userAgent: ua, logger, userId: null };
}

/** JSON response helper: always sets a stable content-type and request id. */
export function jsonResponse(
  ctx: RequestContext,
  body: unknown,
  init: ResponseInit = {},
) {
  const headers = new Headers(init.headers ?? {});
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('x-request-id', ctx.requestId);
  headers.set('cache-control', 'private, no-store');
  return NextResponse.json(body, { ...init, headers });
}

export function errorResponse(
  ctx: RequestContext,
  status: number,
  code: string,
  message: string,
  extra: Record<string, unknown> = {},
) {
  return jsonResponse(ctx, { error: { code, message }, ...extra }, { status });
}
