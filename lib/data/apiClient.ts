import 'server-only';

import { serverEnv } from '@/lib/env/server';

/**
 * Low-level HTTP client for the Markab API (server-side only).
 *
 * RESPONSIBILITIES
 *
 *   1. Build the authenticated request: `Authorization: Bearer <token>` on every
 *      call. The token never leaves this module, never reaches client code.
 *   2. Enforce a finite per-request timeout (default 8s).
 *   3. Classify responses into a small, explicit set the provider can map onto
 *      the `Result<T>` envelope without leaking internals.
 *   4. Log structured server-side diagnostics (event, endpoint, status) but
 *      NEVER the Authorization header or token.
 *   5. Bounded retry on transient failures with a short delay; never retry on
 *      401/403/validation errors.
 *
 * WHAT IT DOES NOT DO
 *
 *   • It does not parse JSON into domain models (that's the mapper layer in
 *     httpProvider).
 *   • It does not guess endpoints — callers pass an explicit path.
 *   • It does not follow user-controlled URLs. The base URL comes only from
 *     server env, and paths must begin with `/`.
 *   • It does not silently return [] on failure. That is the caller's decision.
 */

export type ApiOutcome =
  | { kind: 'ok'; status: number; body: unknown }
  | { kind: 'empty'; status: number }
  | { kind: 'not_found' }
  | { kind: 'unauthenticated' }
  | { kind: 'forbidden' }
  | { kind: 'rate_limited'; retryAfterMs: number | null }
  | { kind: 'server_error'; status: number }
  | { kind: 'timeout' }
  | { kind: 'network_error'; cause: string }
  | { kind: 'bad_response'; reason: string };

export interface ApiRequestOptions {
  /** Path appended to apiBaseUrl, MUST start with `/`. No query string — use `params`. */
  path: string;
  /** Query parameters (values are stringified; null/undefined skipped). */
  params?: Record<string, string | number | boolean | null | undefined>;
  /** HTTP method. Default GET. */
  method?: 'GET';
  /** Abort signal (for outer cancellation). Internal timeout is still applied. */
  signal?: AbortSignal;
  /** Diagnostic label for server logs. Never reaches the visitor. */
  context: string;
}

/**
 * Build a URL-safe query string from validated params. Does NOT forward arbitrary
 * user input — callers map validated internal queries onto an explicit whitelist
 * of parameters before calling.
 */
export function buildQueryString(params: ApiRequestOptions['params']): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string | number | boolean] =>
      entry[1] !== undefined && entry[1] !== null,
  );
  if (entries.length === 0) return '';
  const search = new URLSearchParams();
  for (const [key, value] of entries) {
    search.append(key, String(value));
  }
  return `?${search.toString()}`;
}

function buildUrl(baseUrl: string, path: string, query: string): string {
  // Normalise trailing slash on base so concat is predictable.
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  // DRF uses APPEND_SLASH; keep the slash on the path. If the caller omitted it
  // we append it. This is a convenience, not a redirect-follower, because a
  // redirect would strip the Authorization header on cross-origin redirects in
  // some fetch implementations.
  const normalised = path.startsWith('/') ? path : `/${path}`;
  const withSlash = normalised.endsWith('/') ? normalised : `${normalised}/`;
  return `${base}${withSlash}${query}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logEvent(event: string, fields: Record<string, unknown>): void {
  // Structured single-line log — same shape as the rest of the server logs in
  // lib/errors.ts and instrumentation.ts. Never includes the token.
  console.error(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: event === 'api_timeout' || event === 'api_rate_limited' || event === 'api_malformed_response'
        ? 'warn'
        : 'info',
      event,
      ...fields,
    }),
  );
}

async function fetchOnce(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    if (init.signal) {
      // Chain the caller's signal to our internal one.
      init.signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number.parseInt(header, 10);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, 30_000);
  return null;
}

/**
 * Execute one authenticated API call with bounded timeout and no retries.
 * Exposed for testing — use `callApi` for production flows.
 */
export async function callApiOnce(opts: ApiRequestOptions): Promise<ApiOutcome> {
  const env = serverEnv();

  if (!opts.path.startsWith('/')) {
    return { kind: 'bad_response', reason: 'path_must_be_absolute' };
  }

  const token = env.apiToken.trim();
  if (!token) {
    // Caller guards against this; belt and braces — never fire an unauthenticated
    // request against a protected service.
    logEvent('api_unauthorized_call', { context: opts.context });
    return { kind: 'unauthenticated' };
  }

  const query = buildQueryString(opts.params);
  const url = buildUrl(env.apiBaseUrl, opts.path, query);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  let response: Response;
  try {
    response = await fetchOnce(url, { method: opts.method ?? 'GET', headers }, env.apiTimeoutMs);
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') {
      logEvent('api_timeout', { context: opts.context, timeoutMs: env.apiTimeoutMs });
      return { kind: 'timeout' };
    }
    const message = err instanceof Error ? err.message : String(err);
    logEvent('api_network_error', { context: opts.context, message });
    return { kind: 'network_error', cause: message };
  }

  if (response.status === 401) return { kind: 'unauthenticated' };
  if (response.status === 403) return { kind: 'forbidden' };
  if (response.status === 404) return { kind: 'not_found' };
  if (response.status === 429) {
    const retryAfter = parseRetryAfter(response.headers.get('retry-after'));
    logEvent('api_rate_limited', { context: opts.context, retryAfter });
    return { kind: 'rate_limited', retryAfterMs: retryAfter };
  }
  if (response.status === 204) return { kind: 'empty', status: response.status };
  if (response.status >= 500 && response.status < 600) {
    logEvent('api_server_error', { context: opts.context, status: response.status });
    return { kind: 'server_error', status: response.status };
  }

  if (!response.ok) {
    // Unexpected 4xx (e.g. 400 validation failure from API). Treat as a
    // server-visible malformed-response event and surface as bad_response; the
    // caller decides between `error` and quarantine.
    let bodyPreview = '';
    try {
      bodyPreview = (await response.text()).slice(0, 400);
    } catch {
      /* ignore */
    }
    logEvent('api_unexpected_status', {
      context: opts.context,
      status: response.status,
      body: bodyPreview,
    });
    return { kind: 'bad_response', reason: `http_${response.status}` };
  }

  // 2xx — try to parse JSON.
  let body: unknown;
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    const bodyPreview = (await response.text().catch(() => '')).slice(0, 200);
    logEvent('api_malformed_response', {
      context: opts.context,
      reason: 'not_json',
      contentType,
      body: bodyPreview,
    });
    return { kind: 'bad_response', reason: 'not_json' };
  }

  try {
    body = await response.json();
  } catch (err) {
    logEvent('api_malformed_response', {
      context: opts.context,
      reason: 'invalid_json',
      message: err instanceof Error ? err.message : String(err),
    });
    return { kind: 'bad_response', reason: 'invalid_json' };
  }

  if (response.status === 200) {
    // DRF pagination returns an object; single-object endpoints return an object;
    // list endpoints without pagination return an array. Distinguish "empty" by
    // the caller, not here — an empty list is a valid `success` of [].
    return { kind: 'ok', status: response.status, body };
  }

  return { kind: 'ok', status: response.status, body };
}

/**
 * Call the API with bounded retries for transient failures.
 *
 * Retry policy:
 *   • NEVER retry 401, 403, 404, malformed responses or validation-class errors.
 *   • Retry network errors, timeouts and 5xx responses at most `apiMaxRetries`
 *     times (default 1) with a short delay (300ms base, exponential 2x capped at
 *     2s), to avoid thundering-herding a failing upstream.
 *   • On 429, respect the Retry-After header if present (capped), but only retry
 *     once; otherwise degrade to unavailable so the UI does not loop.
 */
export async function callApi(opts: ApiRequestOptions): Promise<ApiOutcome> {
  const env = serverEnv();
  let attempt = 0;
  let outcome: ApiOutcome = await callApiOnce(opts);
  while (attempt < env.apiMaxRetries) {
    const transient =
      outcome.kind === 'network_error' ||
      outcome.kind === 'timeout' ||
      outcome.kind === 'server_error';
    const retryableRateLimit = outcome.kind === 'rate_limited' && attempt === 0;
    if (!transient && !retryableRateLimit) break;
    attempt += 1;
    const waitMs =
      outcome.kind === 'rate_limited' && outcome.retryAfterMs != null
        ? Math.min(outcome.retryAfterMs, 2000)
        : Math.min(300 * Math.pow(2, attempt - 1), 2000);
    await delay(waitMs);
    outcome = await callApiOnce(opts);
  }
  return outcome;
}
