/**
 * POST /api/csp-report — collect Content-Security-Policy violations.
 *
 * Hardened against abuse: POST only, content-type allowlist, 8KB body cap,
 * four sanitised fields logged, no echo, no persistence, rate limited at the
 * edge (in-app limiter is a second line).
 */
import { NextResponse } from 'next/server';
import { checkRateLimit, LIMITS } from '@/lib/rates/limiter';
import { clientIp, userAgent, newTraceId } from '@/lib/request/context';
import { bindLogger } from '@/lib/request/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 8 * 1024;
const ALLOWED = [
  'application/csp-report',
  'application/reports+json',
  'application/json',
];

function rejection(status: number) {
  return new NextResponse(null, { status });
}

function clean(value: unknown, max: number): string {
  if (typeof value === 'number') return String(value).slice(0, max);
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').slice(0, max);
}

export async function POST(request: Request) {
  const traceId = newTraceId();
  const ip = clientIp(request);
  const ua = userAgent(request);
  const logger = bindLogger({ traceId, path: '/api/csp-report', method: 'POST' });

  const rl = checkRateLimit(LIMITS.cspReport, ip, null);
  if (!rl.allowed) return rejection(429);

  const contentType = (request.headers.get('content-type') ?? '').split(';')[0].trim();
  if (!ALLOWED.includes(contentType)) return rejection(415);

  const declared = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return rejection(413);

  let raw = '';
  try {
    raw = await request.text();
  } catch {
    return rejection(400);
  }
  if (raw.length > MAX_BODY_BYTES) return rejection(413);
  if (!raw) return rejection(400);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return rejection(400);
  }

  const envelope = (parsed as Record<string, unknown>)?.['csp-report'];
  const report =
    (envelope && typeof envelope === 'object' ? envelope : null) ??
    (Array.isArray(parsed) ? parsed[0] : null) ??
    (typeof parsed === 'object' && parsed !== null ? parsed : null);

  if (!report || typeof report !== 'object') return rejection(400);

  const body = (report as Record<string, unknown>)?.body;
  const details = (body && typeof body === 'object' ? body : report) as Record<string, unknown>;

  const pick = (...keys: string[]) => {
    for (const key of keys) {
      const v = details[key];
      if (typeof v === 'string' || typeof v === 'number') return v;
    }
    return null;
  };

  logger.warn('security.csp-violation', {
    directive: clean(pick('violatedDirective', 'violated-directive', 'effectiveDirective'), 120),
    blockedUri: clean(pick('blockedURI', 'blocked-uri'), 200),
    documentUri: clean(pick('documentURI', 'document-uri'), 200),
    line: clean(pick('lineNumber', 'line-number'), 12),
    userAgent: ua,
  });

  return new NextResponse(null, { status: 204 });
}

export function GET() {
  return rejection(405);
}
