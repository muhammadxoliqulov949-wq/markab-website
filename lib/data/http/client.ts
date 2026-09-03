import 'server-only';

import { apiConfig, type ApiConfig } from '@/lib/env/server';

/**
 * Server-only HTTP client for the Markab API.
 *
 * THE BOUNDARY
 *
 * This module is the only place in the application that talks to
 * api.markab.uz, and it can only run on the server:
 *
 *   browser → Next.js server → Markab API
 *
 * Never the other shape. The Bearer token is read from
 * `lib/env/server.ts`, which is `server-only`, so reaching this code from a
 * client component is a build/runtime error rather than a leak.
 *
 * WHAT IT GUARANTEES
 *
 *   • the origin comes from configuration, never from a request (SSRF);
 *   • query parameters are built from validated internal values only;
 *   • every request has a finite timeout;
 *   • retries are bounded, jittered, and only for failures that can succeed;
 *   • 401/403 are never retried and never surface auth detail to a visitor;
 *   • 429 is respected rather than hammered;
 *   • logs are structured and carry no credentials.
 *
 * WHAT IT DOES NOT DO
 *
 *   • no silent fallback to fixtures — the caller decides what a failure means;
 *   • no invented schema — the caller validates and maps the payload.
 */

/** Endpoints are internal constants. No request may choose one. */
export const API_PATHS = {
  vehicles: '/vehicles/',
  products: '/products/',
} as const;

export type ApiPath = (typeof API_PATHS)[keyof typeof API_PATHS];

/** Values allowed in a query string. Anything else is dropped, not encoded. */
export type ApiQueryValue = string | number | boolean | undefined;
export type ApiQuery = Record<string, ApiQueryValue>;

/**
 * Why a call ended the way it did.
 *
 * Distinct outcomes on purpose: collapsing them would force the caller to
 * guess whether "no data" means "none exists", "we are not allowed to know"
 * or "the request failed" — and guessing is how a 429 turns into an empty
 * catalogue that looks intentional.
 */
export type ApiOutcome<T> =
  | { kind: 'ok'; data: T }
  | { kind: 'not_found' }
  | { kind: 'unauthorized' }
  | { kind: 'forbidden' }
  | { kind: 'rate_limited'; retryAfterMs: number | null }
  | { kind: 'server_error'; status: number }
  | { kind: 'timeout' }
  | { kind: 'network' }
  | { kind: 'malformed'; detail: string }
  | { kind: 'misconfigured'; reason: string };

type OutcomeKind = ApiOutcome<unknown>['kind'];

/** Log one structured line. Never the URL query, never a header, never a token. */
function log(event: string, fields: Record<string, unknown>): void {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: event.startsWith('api.error') || event === 'api.unauthorized' ? 'warn' : 'info',
      event,
      provider: 'http',
      ...fields,
    }),
  );
}

/** Sleep with jitter so parallel renders do not retry in lockstep. */
function delay(ms: number): Promise<void> {
  const jittered = Math.round(ms * (0.5 + Math.random() * 0.5));
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, jittered)));
}

function parseRetryAfter(headers: Headers, fallbackMs: number): number {
  const raw = headers.get('retry-after');
  if (!raw) return fallbackMs;
  const seconds = Number(raw);
  if (Number.isFinite(seconds)) return Math.min(30_000, Math.max(0, seconds * 1000));
  const date = Date.parse(raw);
  if (Number.isFinite(date)) return Math.min(30_000, Math.max(0, date - Date.now()));
  return fallbackMs;
}

/**
 * Build a URL from the configured origin and an internal path.
 *
 * The origin is never taken from input — this is the SSRF boundary. The path
 * is a constant from `API_PATHS`, and the query is assembled from values the
 * repository has already validated.
 */
function buildUrl(config: ApiConfig, path: ApiPath, query?: ApiQuery): string {
  /**
   * The base must end in a slash before a relative path is resolved against
   * it. `new URL('vehicles/', 'https://host/api/v1')` yields
   * `/api/vehicles/` — URL resolution replaces everything after the last
   * slash — which silently drops the `/v1` segment and 404s against the real
   * API. Trailing slash first, then resolve.
   */
  const base = config.baseUrl.toString();
  const url = new URL(path.replace(/^\//, ''), base.endsWith('/') ? base : `${base}/`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/** A single attempt. Maps every failure mode to an outcome; never throws. */
async function attempt<T>(
  config: ApiConfig,
  path: ApiPath,
  query?: ApiQuery,
  revalidate = 0,
): Promise<ApiOutcome<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  const startedAt = Date.now();

  try {
    const response = await fetch(buildUrl(config, path, query), {
      /**
       * Reuse window for a successful response.
       *
       * Routes render per request (the nonce CSP needs a render), so this is
       * the only caching in the path: it stops a busy listing page from
       * hammering the upstream API without making the page stale for long.
       * Failures are never cached — only `ok` responses are stored.
       */
      ...(revalidate > 0 ? { next: { revalidate } } : { cache: 'no-store' as const }),
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${config.token}`,
      },
    });

    const durationMs = Date.now() - startedAt;

    if (response.status === 404) {
      log('api.not_found', { path, status: 404, durationMs });
      return { kind: 'not_found' };
    }
    if (response.status === 401) {
      // Never retried, and never explained to a visitor: whether the token is
      // missing, malformed or revoked is an operations matter.
      log('api.unauthorized', { path, status: 401, durationMs });
      return { kind: 'unauthorized' };
    }
    if (response.status === 403) {
      log('api.forbidden', { path, status: 403, durationMs });
      return { kind: 'forbidden' };
    }
    if (response.status === 429) {
      const retryAfterMs = parseRetryAfter(response.headers, config.retryBaseDelayMs * 4);
      log('api.rate_limited', { path, status: 429, durationMs, retryAfterMs });
      return { kind: 'rate_limited', retryAfterMs };
    }
    if (response.status >= 500) {
      log('api.server_error', { path, status: response.status, durationMs });
      return { kind: 'server_error', status: response.status };
    }
    if (!response.ok) {
      log('api.error', { path, status: response.status, durationMs });
      return { kind: 'server_error', status: response.status };
    }

    const text = await response.text();
    try {
      log('api.ok', { path, status: response.status, durationMs, bytes: text.length });
      return { kind: 'ok', data: JSON.parse(text) as T };
    } catch {
      log('api.malformed', { path, status: response.status, durationMs, detail: 'invalid JSON' });
      return { kind: 'malformed', detail: 'invalid JSON' };
    }
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    log(aborted ? 'api.timeout' : 'api.network', {
      path,
      durationMs: Date.now() - startedAt,
      // Message only for network failures: an abort carries no useful detail
      // and a DNS error may echo internal resolver configuration.
      detail: aborted ? undefined : error instanceof Error ? error.message.slice(0, 120) : undefined,
    });
    return aborted ? { kind: 'timeout' } : { kind: 'network' };
  } finally {
    clearTimeout(timer);
  }
}

/** Outcomes worth a second attempt. Everything else is final. */
function isRetryable(kind: OutcomeKind): boolean {
  return kind === 'timeout' || kind === 'network' || kind === 'server_error' || kind === 'rate_limited';
}

/**
 * Perform a GET with bounded retries.
 *
 * Retry policy, kept deliberately conservative (Phase 13 §11):
 *   • 401 / 403 — never retried. Retrying an auth failure is how you turn a
 *     misconfiguration into a lockout or an alert storm.
 *   • 404 — never retried. A missing record is an answer.
 *   • 4xx otherwise — never retried. The request is wrong; resending it does
 *     not make it right.
 *   • timeout / network / 5xx / 429 — retried at most `maxRetries` times,
 *     with jittered backoff and `Retry-After` respected when the server sends
 *     it. No retry storms, no global backoff infrastructure.
 */
export async function apiGet<T>(
  path: ApiPath,
  query?: ApiQuery,
  options?: { revalidate?: number },
): Promise<ApiOutcome<T>> {
  const resolved = apiConfig();
  if (!resolved.ok) return { kind: 'misconfigured', reason: resolved.reason };

  const { config } = resolved;
  let last: ApiOutcome<T> = { kind: 'network' };

  for (let tryIndex = 0; tryIndex <= config.maxRetries; tryIndex += 1) {
    last = await attempt<T>(config, path, query, options?.revalidate ?? config.revalidateSeconds);
    if (last.kind === 'ok' || !isRetryable(last.kind)) return last;

    if (tryIndex === config.maxRetries) break;
    const waitMs =
      last.kind === 'rate_limited' && last.retryAfterMs !== null
        ? last.retryAfterMs
        : config.retryBaseDelayMs * 2 ** tryIndex;
    log('api.retry', { path, attempt: tryIndex + 1, waitMs, previous: last.kind });
    await delay(waitMs);
  }

  return last;
}
