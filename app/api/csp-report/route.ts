import { NextResponse } from 'next/server';

/**
 * CSP violation collector.
 *
 * A policy nobody watches is a policy that can fail silently: if a browser
 * starts refusing something real, the only signal is a visitor's broken page.
 * This receives what the browser sends and writes one structured line to the
 * server log, where the log aggregator can alert on it.
 *
 * HARDENING — this is an unauthenticated endpoint that accepts
 * attacker-controlled input, so it is built to be boring:
 *
 *   • POST only; everything else gets 405;
 *   • content-type allow-list — a plain HTML form cannot post here;
 *   • hard body cap, enforced while reading, not from Content-Length alone;
 *   • nothing is echoed back, so it cannot be used as a reflector;
 *   • only four short, truncated fields are logged; nothing is persisted;
 *   • rate limiting is deliberately NOT here — it belongs at the edge
 *     (Phase 12 A3), because an in-process counter does not survive more than
 *     one instance and gives a false sense of control.
 *
 * Enable by pointing `MARKAB_CSP_REPORT_ENDPOINT` at this path (or at any
 * external collector — the header is not tied to this route).
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 8 * 1024;
const ALLOWED_CONTENT_TYPES = [
  'application/csp-report',
  'application/reports+json',
  'application/json',
];

function rejection(status: number) {
  return new NextResponse(null, { status });
}

/**
 * Trim to length, collapse whitespace, and never log a new line.
 *
 * Numbers are accepted: `line-number` arrives as a number in the classic
 * report body, and dropping it silently made the log look complete when a
 * field was actually missing.
 */
function clean(value: unknown, max: number): string {
  if (typeof value === 'number') return String(value).slice(0, max);
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').slice(0, max);
}

export async function POST(request: Request) {
  const contentType = (request.headers.get('content-type') ?? '').split(';')[0].trim();
  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) return rejection(415);

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

  // Both shapes exist in the wild: the classic { 'csp-report': {...} } envelope
  // and the newer Reporting API array-of-reports.
  const envelope = (parsed as Record<string, unknown>)?.['csp-report'];
  const report =
    (envelope && typeof envelope === 'object' ? envelope : null) ??
    (Array.isArray(parsed) ? (parsed[0] as Record<string, unknown> | undefined) : null) ??
    (typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null);

  if (!report) return rejection(400);

  const body = (report as Record<string, unknown>)?.body;
  const details = (body && typeof body === 'object' ? body : report) as Record<string, unknown>;

  /**
   * Two spellings exist in the wild and both arrive in production:
   * the classic CSP report body is hyphenated (`violated-directive`,
   * `blocked-uri`, `document-uri`, `line-number`) while the Reporting API
   * uses camelCase. Read both, or the log fills with empty fields and looks
   * like the collector is working when it is not.
   */
  const pick = (...keys: string[]) => {
    for (const key of keys) {
      if (typeof details[key] === 'string' || typeof details[key] === 'number') return details[key];
    }
    return null;
  };

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: 'warn',
      event: 'security.csp-violation',
      directive: clean(pick('violatedDirective', 'violated-directive', 'effectiveDirective'), 120),
      blockedUri: clean(pick('blockedURI', 'blocked-uri'), 200),
      documentUri: clean(pick('documentURI', 'document-uri'), 200),
      line: clean(pick('lineNumber', 'line-number'), 12),
    }),
  );

  return new NextResponse(null, { status: 204 });
}

export function GET() {
  return rejection(405);
}
