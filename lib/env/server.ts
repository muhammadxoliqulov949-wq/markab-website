import 'server-only';

/**
 * Server-only environment access.
 *
 * THE BOUNDARY
 *
 * `import 'server-only'` makes this module a build-time and runtime error in any
 * client bundle. That is the point: it is the single door through which
 * configuration — including the production API token — enters the process, and
 * the door does not open towards the browser.
 *
 * Next.js only inlines `NEXT_PUBLIC_*` variables into client bundles, so a
 * stray `process.env.MARKAB_API_TOKEN` in a component would not by itself leak
 * the value. It would, however, leave the codebase one careless refactor away
 * from a leak, with nothing to catch it. This module turns that silent risk
 * into a loud failure.
 *
 * NOTHING HERE IS A SECRET TODAY. The prototype ships no credentials — the
 * token is empty and the HTTP provider is an unimplemented stub. The boundary
 * is being drawn now, while it is cheap, so that switching the data source on
 * in production is a configuration change and not a security review.
 */

export type ServerEnv = {
  /** 'mock' (default) or 'http'. Selects the data provider. */
  dataSource: 'mock' | 'http';
  /** Base URL of the production Markab API. */
  apiBaseUrl: string;
  /**
   * Bearer token for the production API.
   *
   * Empty in the prototype. When it is set, it must come from the platform's
   * secret store — never from a committed file, and never from a
   * `NEXT_PUBLIC_*` variable, which would publish it to every visitor.
   */
  apiToken: string;
  /** When true, `next/image` emits direct URLs instead of optimising. */
  unoptimizedImages: boolean;
};

const DEFAULT_API_BASE_URL = 'https://api.markab.uz/api/v1';

export function serverEnv(): ServerEnv {
  return {
    dataSource: process.env.MARKAB_DATA_SOURCE === 'http' ? 'http' : 'mock',
    apiBaseUrl: process.env.MARKAB_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL,
    apiToken: process.env.MARKAB_API_TOKEN ?? '',
    unoptimizedImages: process.env.MARKAB_IMAGE_UNOPTIMIZED === 'true',
  };
}

/**
 * Whether the real API can be called at all.
 *
 * Used as a guard rather than as a value: the HTTP provider refuses to run
 * without a token, so a missing secret can never degrade into an
 * unauthenticated call against a protected service.
 */
export function hasApiCredentials(): boolean {
  return serverEnv().apiToken.trim().length > 0;
}

/* ------------------------------------------------------------------------- */
/* Phase 13 — real API configuration                                          */
/* ------------------------------------------------------------------------- */

/**
 * Hosts the server is allowed to call.
 *
 * This is an SSRF control, not a convenience: the API base URL is the one
 * place where a configuration mistake (or a careless future feature) could
 * turn the server into a generic HTTP proxy for an attacker-chosen origin.
 * The host list is fixed in code; only the path and query are configurable.
 * No request parameter may ever influence the origin — see
 * `lib/data/http/client.ts`, which builds every URL from this value.
 */
export const ALLOWED_API_HOSTS: readonly string[] = ['api.markab.uz'];

export type ApiConfig = {
  /** Absolute base URL, e.g. https://api.markab.uz/api/v1 — always https. */
  baseUrl: URL;
  token: string;
  /** Per-attempt timeout. A hung request is worse than an honest failure. */
  timeoutMs: number;
  /** Additional attempts after the first. Bounded; never a retry storm. */
  maxRetries: number;
  /** Base delay for backoff; the actual delay is jittered. */
  retryBaseDelayMs: number;
  /**
   * How long a successful catalogue response may be reused, in seconds.
   *
   * The routes stay dynamic (the nonce CSP requires a render per request), so
   * this is the only cache in the path: it bounds how often a busy listing
   * page can hit the upstream API. 0 disables reuse entirely.
   */
  revalidateSeconds: number;
};

export type ApiConfigResult =
  | { ok: true; config: ApiConfig }
  | { ok: false; reason: 'disabled' | 'missing_token' | 'untrusted_base_url' };

function positiveIntEnv(name: string, fallback: number, min: number, max: number): number {
  const raw = Number(process.env[name]);
  if (!Number.isFinite(raw)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(raw)));
}

/**
 * Resolve the API configuration, or say precisely why it cannot be used.
 *
 * Returning a reason rather than throwing matters: a misconfiguration must
 * become an honest `unavailable` state in the UI, never a crashed render and
 * never a silent fall back to mock data (Phase 13 rule 5).
 */
export function apiConfig(): ApiConfigResult {
  const env = serverEnv();

  if (env.dataSource !== 'http') return { ok: false, reason: 'disabled' };
  if (!hasApiCredentials()) return { ok: false, reason: 'missing_token' };

  let baseUrl: URL;
  try {
    baseUrl = new URL(env.apiBaseUrl);
  } catch {
    return { ok: false, reason: 'untrusted_base_url' };
  }

  // https only, and only to a host we chose in code. A http:// base URL would
  // put a Bearer token on the wire in clear text.
  if (baseUrl.protocol !== 'https:' || !ALLOWED_API_HOSTS.includes(baseUrl.hostname)) {
    return { ok: false, reason: 'untrusted_base_url' };
  }

  return {
    ok: true,
    config: {
      baseUrl,
      token: env.apiToken,
      timeoutMs: positiveIntEnv('MARKAB_API_TIMEOUT_MS', 8000, 1000, 30000),
      maxRetries: positiveIntEnv('MARKAB_API_MAX_RETRIES', 1, 0, 3),
      retryBaseDelayMs: positiveIntEnv('MARKAB_API_RETRY_BASE_MS', 400, 100, 5000),
      revalidateSeconds: positiveIntEnv('MARKAB_API_REVALIDATE_SECONDS', 300, 0, 3600),
    },
  };
}
